/**
 * In-Memory Real-Time GPS Tracking & Delivery Store with globalThis persistence.
 * Holds active deliveries, GPS telemetry points, geofencing triggers, and OTP verifications.
 */

import { getDonationWithRelations } from "@/lib/service";
import {
  calculateDistanceKm,
  calculateDistanceMeters,
  calculateEtaMinutes,
  evaluateRescueRisk,
  isWithinGeofence,
} from "./geo";
import type {
  Delivery,
  DeliveryStatus,
  DriverLocation,
  TrackingEvent,
  TrackingState,
} from "../types";

interface TrackingStoreData {
  deliveries: Map<string, Delivery>;
  locations: Map<string, DriverLocation>;
  events: Map<string, TrackingEvent[]>;
}

const TRACKING_GLOBAL_KEY = Symbol.for("foodbridge.tracking.store.real");

function loadTrackingData(): TrackingStoreData {
  const holder = globalThis as unknown as Record<symbol, TrackingStoreData | undefined>;
  if (holder[TRACKING_GLOBAL_KEY]) return holder[TRACKING_GLOBAL_KEY]!;

  const data: TrackingStoreData = {
    deliveries: new Map(),
    locations: new Map(),
    events: new Map(),
  };

  holder[TRACKING_GLOBAL_KEY] = data;
  return data;
}

class TrackingStore {
  private get data(): TrackingStoreData {
    return loadTrackingData();
  }

  public async getDelivery(deliveryId: string): Promise<Delivery | null> {
    const existing = this.data.deliveries.get(deliveryId);
    if (existing) return existing;

    // Backward compatibility for demo/pitch purposes
    if (deliveryId === "del_demo01") {
      const now = new Date();
      const deadline = new Date(now.getTime() + 40 * 60 * 1000).toISOString();
      const demoDelivery: Delivery = {
        id: "del_demo01",
        donation_id: "don_a01",
        driver_id: "drv_rahul",
        driver_name: "Rahul Patel (Volunteer #AHM-04)",
        driver_phone: "+91 98250 12345",
        donor_id: "org_green_leaf",
        donor_name: "Agashiye - House of MG",
        donor_address: "Lal Darwaja, Opposite Sidi Saiyyed Mosque, Ahmedabad",
        donor_lat: 23.0250,
        donor_lng: 72.5830,
        recipient_id: "org_robin_hood",
        recipient_name: "Robin Hood Army Ahmedabad",
        recipient_address: "SG Highway Circle, Bodakdev, Ahmedabad",
        recipient_lat: 23.0390,
        recipient_lng: 72.5110,
        food_name: "50 Gujarati Thali Surplus Meals",
        meals: 50,
        status: "GOING_TO_PICKUP",
        pickup_otp: "8492",
        delivery_otp: "3921",
        started_at: now.toISOString(),
        picked_up_at: null,
        delivered_at: null,
        food_rescue_deadline: deadline,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      };
      
      this.data.deliveries.set(demoDelivery.id, demoDelivery);

      const initialLocation: DriverLocation = {
        id: `loc_init_${Date.now()}`,
        delivery_id: demoDelivery.id,
        driver_id: demoDelivery.driver_id,
        latitude: 23.0265,
        longitude: 72.5780,
        accuracy: 8,
        speed: 24.5,
        heading: 270,
        timestamp: now.toISOString(),
      };
      this.data.locations.set(demoDelivery.id, initialLocation);
      this.addEvent(demoDelivery.id, "DELIVERY_ASSIGNED", initialLocation.latitude, initialLocation.longitude, "Delivery assigned to driver Rahul Patel");

      return demoDelivery;
    }

    // Attempt to build dynamically from real donation
    const donation = await getDonationWithRelations(deliveryId);
    if (!donation || !donation.matched_recipient) return null;

    const now = new Date();
    const pickupOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();

    let status: DeliveryStatus = "ASSIGNED";
    if (donation.status === "matched") status = "ASSIGNED";
    if (donation.status === "pickup_scheduled") status = "GOING_TO_PICKUP";
    if (donation.status === "picked_up") status = "IN_TRANSIT";
    if (donation.status === "delivered") status = "DELIVERED";

    const delivery: Delivery = {
      id: donation.id,
      donation_id: donation.id,
      driver_id: "drv_volunteer_01",
      driver_name: "Rahul Patel (Volunteer #AHM-04)",
      driver_phone: "+91 98250 12345",
      donor_id: donation.donor.id,
      donor_name: donation.donor.name,
      donor_address: donation.donor.address,
      donor_lat: donation.donor.latitude,
      donor_lng: donation.donor.longitude,
      recipient_id: donation.matched_recipient.id,
      recipient_name: donation.matched_recipient.name,
      recipient_address: donation.matched_recipient.address,
      recipient_lat: donation.matched_recipient.latitude,
      recipient_lng: donation.matched_recipient.longitude,
      food_name: `${donation.quantity} ${donation.quantity_unit} of ${donation.food_type}`,
      meals: donation.meals,
      status,
      pickup_otp: pickupOtp,
      delivery_otp: deliveryOtp,
      started_at: now.toISOString(),
      picked_up_at: status === "IN_TRANSIT" ? now.toISOString() : null,
      delivered_at: status === "DELIVERED" ? now.toISOString() : null,
      food_rescue_deadline: donation.pickup_deadline,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    this.data.deliveries.set(delivery.id, delivery);

    const initialLocation: DriverLocation = {
      id: `loc_init_${Date.now()}`,
      delivery_id: delivery.id,
      driver_id: delivery.driver_id,
      latitude: donation.donor.latitude + (Math.random() * 0.02 - 0.01),
      longitude: donation.donor.longitude + (Math.random() * 0.02 - 0.01),
      accuracy: 8,
      speed: 24.5,
      heading: 270,
      timestamp: now.toISOString(),
    };
    this.data.locations.set(delivery.id, initialLocation);

    this.addEvent(delivery.id, "DELIVERY_ASSIGNED", initialLocation.latitude, initialLocation.longitude, "Delivery assigned to volunteer driver.");

    return delivery;
  }

  public async listDeliveries(statusFilter?: string): Promise<Delivery[]> {
    const all = Array.from(this.data.deliveries.values());
    if (!statusFilter || statusFilter === "ALL") return all;
    return all.filter((d) => d.status === statusFilter);
  }

  public async updateDriverLocation(
    deliveryId: string,
    locationData: Omit<DriverLocation, "id" | "delivery_id">,
  ): Promise<TrackingState> {
    const delivery = await this.getDelivery(deliveryId);
    if (!delivery) throw new Error(`Delivery ${deliveryId} not found`);

    const location: DriverLocation = {
      id: `loc_${Date.now()}`,
      delivery_id: deliveryId,
      ...locationData,
    };
    this.data.locations.set(deliveryId, location);

    // Auto-Geofence Checks (50m Radius)
    const donorGeofence = isWithinGeofence(
      location.latitude,
      location.longitude,
      delivery.donor_lat,
      delivery.donor_lng,
      50,
    );

    const recipientGeofence = isWithinGeofence(
      location.latitude,
      location.longitude,
      delivery.recipient_lat,
      delivery.recipient_lng,
      50,
    );

    // Auto-Trigger Geofence Status Transitions
    if (delivery.status === "GOING_TO_PICKUP" && donorGeofence.isWithin) {
      delivery.status = "ARRIVED_AT_DONOR";
      delivery.updated_at = new Date().toISOString();
      this.addEvent(deliveryId, "ARRIVED_AT_DONOR", location.latitude, location.longitude, "Driver entered donor 50m geofence.");
    } else if (delivery.status === "IN_TRANSIT" && recipientGeofence.isWithin) {
      delivery.status = "ARRIVED_AT_RECIPIENT";
      delivery.updated_at = new Date().toISOString();
      this.addEvent(deliveryId, "ARRIVED_AT_RECIPIENT", location.latitude, location.longitude, "Driver entered recipient 50m geofence.");
    }

    return (await this.getTrackingState(deliveryId))!;
  }

  public async updateDeliveryStatus(
    deliveryId: string,
    status: DeliveryStatus,
    note?: string,
  ): Promise<Delivery> {
    const delivery = await this.getDelivery(deliveryId);
    if (!delivery) throw new Error(`Delivery ${deliveryId} not found`);

    const now = new Date().toISOString();
    delivery.status = status;
    delivery.updated_at = now;

    if (status === "FOOD_PICKED_UP") {
      delivery.picked_up_at = now;
    } else if (status === "DELIVERED") {
      delivery.delivered_at = now;
    }

    const currentLoc = this.data.locations.get(deliveryId);
    this.addEvent(
      deliveryId,
      status,
      currentLoc?.latitude ?? delivery.donor_lat,
      currentLoc?.longitude ?? delivery.donor_lng,
      note ?? `Status updated to ${status}`,
    );

    return delivery;
  }

  public async verifyOtp(
    deliveryId: string,
    step: "PICKUP" | "DELIVERY",
    inputOtp: string,
    currentLat?: number,
    currentLng?: number,
  ): Promise<{ success: boolean; message: string; delivery: Delivery }> {
    const delivery = await this.getDelivery(deliveryId);
    if (!delivery) throw new Error(`Delivery ${deliveryId} not found`);

    const targetOtp = step === "PICKUP" ? delivery.pickup_otp : delivery.delivery_otp;
    const targetLat = step === "PICKUP" ? delivery.donor_lat : delivery.recipient_lat;
    const targetLng = step === "PICKUP" ? delivery.donor_lng : delivery.recipient_lng;

    // Check OTP Match
    if (inputOtp.trim() !== targetOtp.trim()) {
      return { success: false, message: "Invalid 4-Digit OTP Code", delivery };
    }

    // Check GPS Proximity if coordinates are provided
    if (currentLat !== undefined && currentLng !== undefined) {
      const { isWithin, distanceMeters } = isWithinGeofence(currentLat, currentLng, targetLat, targetLng, 150);
      if (!isWithin) {
        return {
          success: false,
          message: `GPS Proximity Verification Failed. You are ${distanceMeters}m away from location (must be within 150m).`,
          delivery,
        };
      }
    }

    // Perform transition upon verification
    if (step === "PICKUP") {
      await this.updateDeliveryStatus(deliveryId, "FOOD_PICKED_UP", "Pickup verified via OTP & GPS Proximity.");
    } else {
      await this.updateDeliveryStatus(deliveryId, "DELIVERED", "Final delivery verified via OTP & GPS Proximity.");
    }

    return {
      success: true,
      message: step === "PICKUP" ? "Pickup Verified! Navigation switched to Recipient." : "Delivery Completed & Verified!",
      delivery,
    };
  }

  public async getTrackingState(deliveryId: string): Promise<TrackingState | null> {
    const delivery = await this.getDelivery(deliveryId);
    if (!delivery) return null;

    const currentLoc = this.data.locations.get(deliveryId);

    const isPickedUp = delivery.status === "FOOD_PICKED_UP" || delivery.status === "IN_TRANSIT" || delivery.status === "ARRIVED_AT_RECIPIENT";
    const targetLat = isPickedUp ? delivery.recipient_lat : delivery.donor_lat;
    const targetLng = isPickedUp ? delivery.recipient_lng : delivery.donor_lng;

    const curLat = currentLoc?.latitude ?? delivery.donor_lat;
    const curLng = currentLoc?.longitude ?? delivery.donor_lng;

    const distanceKm = calculateDistanceKm(curLat, curLng, targetLat, targetLng);
    const etaMin = calculateEtaMinutes(distanceKm, currentLoc?.speed ?? null);

    const now = new Date();
    const deadlineDate = new Date(delivery.food_rescue_deadline);
    const remainingRescueTimeMin = Math.max(0, Math.round((deadlineDate.getTime() - now.getTime()) / 60000));

    const riskStatus = evaluateRescueRisk(remainingRescueTimeMin, etaMin);

    const distToDonorM = calculateDistanceMeters(curLat, curLng, delivery.donor_lat, delivery.donor_lng);
    const distToRecipientM = calculateDistanceMeters(curLat, curLng, delivery.recipient_lat, delivery.recipient_lng);

    return {
      delivery,
      current_location: currentLoc ?? null,
      distance_remaining_km: distanceKm,
      eta_minutes: etaMin,
      rescue_time_remaining_min: remainingRescueTimeMin,
      rescue_risk_status: riskStatus,
      geofence_status: {
        near_donor: distToDonorM <= 50,
        near_recipient: distToRecipientM <= 50,
        distance_to_donor_m: distToDonorM,
        distance_to_recipient_m: distToRecipientM,
      },
      events: this.data.events.get(deliveryId) ?? [],
    };
  }

  private addEvent(deliveryId: string, eventType: string, lat: number, lng: number, note?: string) {
    const list = this.data.events.get(deliveryId) ?? [];
    list.push({
      id: `evt_${Date.now()}`,
      delivery_id: deliveryId,
      event_type: eventType,
      latitude: lat,
      longitude: lng,
      timestamp: new Date().toISOString(),
      note,
    });
    this.data.events.set(deliveryId, list);
  }
}

export const trackingStore = new TrackingStore();
