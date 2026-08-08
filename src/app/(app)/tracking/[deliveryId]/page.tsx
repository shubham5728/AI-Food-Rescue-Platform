"use client";

import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Compass,
  KeyRound,
  Loader2,
  MapPin,
  Navigation,
  Play,
  Radio,
  ShieldAlert,
  ShieldCheck,
  Square,
  Sparkles,
  Truck,
  Utensils,
} from "lucide-react";
import { use, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { DynamicFoodMap, type MapMarkerItem } from "@/components/map";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/client-api";
import type { DeliveryStatus, TrackingState } from "@/lib/types";

export default function DriverTrackingPage({
  params,
}: {
  params: Promise<{ deliveryId: string }>;
}) {
  const { deliveryId } = use(params);

  const [trackingState, setTrackingState] = useState<TrackingState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // GPS Tracking Watcher State
  const [isTrackingGps, setIsTrackingGps] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // OTP Verification Modal State
  const [showOtpModal, setShowOtpModal] = useState<"PICKUP" | "DELIVERY" | null>(null);
  const [otpInput, setOtpInput] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  // Initial Fetch & Polling for Real-Time Sync
  useEffect(() => {
    let isMounted = true;

    const fetchState = async () => {
      try {
        const data = (await apiRequest(`/api/tracking/${deliveryId}`)) as TrackingState;
        if (isMounted) {
          setTrackingState(data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load tracking data");
          setLoading(false);
        }
      }
    };

    void fetchState();
    const interval = setInterval(() => void fetchState(), 4000); // 4-second polling fallback

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [deliveryId]);

  // Start Device GPS Tracking (`navigator.geolocation.watchPosition`)
  const startGpsTracking = () => {
    if (!navigator.geolocation) {
      setPermissionError("Geolocation is not supported by your browser/device.");
      toast.error("Geolocation API not supported");
      return;
    }

    setPermissionError(null);

    const successCallback: PositionCallback = async (pos) => {
      const { latitude, longitude, accuracy, speed, heading } = pos.coords;

      try {
        const updated = (await apiRequest(`/api/tracking/${deliveryId}/location`, {
          method: "POST",
          body: JSON.stringify({
            latitude,
            longitude,
            accuracy: Math.round(accuracy),
            speed: speed ? Math.round(speed * 3.6) : null, // convert m/s to km/h
            heading: heading ? Math.round(heading) : null,
            timestamp: new Date(pos.timestamp).toISOString(),
          }),
        })) as TrackingState;

        setTrackingState(updated);
        setIsTrackingGps(true);
      } catch (err) {
        console.error("Failed to post GPS update:", err);
      }
    };

    const errorCallback: PositionErrorCallback = (err) => {
      let msg = "Could not access device GPS.";
      if (err.code === err.PERMISSION_DENIED) {
        msg = "Location permission was denied. Please allow location access in your browser settings to track live delivery.";
      } else if (err.code === err.POSITION_UNAVAILABLE) {
        msg = "GPS signal unavailable. Ensure your device location/GPS is switched on.";
      } else if (err.code === err.TIMEOUT) {
        msg = "GPS location request timed out. Retrying...";
      }
      setPermissionError(msg);
      setIsTrackingGps(false);
      toast.error(msg);
    };

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    };

    const id = navigator.geolocation.watchPosition(successCallback, errorCallback, options);
    watchIdRef.current = id;
    setIsTrackingGps(true);
    toast.success("📡 Real Device GPS Tracking Started");
  };

  // Stop Device GPS Tracking
  const stopGpsTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTrackingGps(false);
    toast.info("GPS Tracking Paused");
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Update Status API Helper
  const updateStatus = async (status: DeliveryStatus, note?: string) => {
    try {
      const res = (await apiRequest(`/api/tracking/${deliveryId}`, {
        method: "POST",
        body: JSON.stringify({ status, note }),
      })) as { trackingState: TrackingState };

      setTrackingState(res.trackingState);
      toast.success(`Status updated to ${status.replace(/_/g, " ")}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  // Verify Pickup or Delivery OTP
  const handleVerifyOtp = async () => {
    if (!showOtpModal || !otpInput.trim()) return;

    setVerifyingOtp(true);
    setOtpError(null);

    try {
      const res = (await apiRequest(`/api/tracking/${deliveryId}/verify`, {
        method: "POST",
        body: JSON.stringify({
          step: showOtpModal,
          otp: otpInput.trim(),
          latitude: trackingState?.current_location?.latitude,
          longitude: trackingState?.current_location?.longitude,
        }),
      })) as { success: boolean; message: string; trackingState: TrackingState };

      setTrackingState(res.trackingState);
      toast.success(`✅ ${res.message}`);
      setShowOtpModal(null);
      setOtpInput("");
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : "OTP Verification failed");
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Desktop Simulator Helper (For Dev/Testing only)
  const simulateStepPosition = async (type: "DONOR" | "HALFWAY" | "RECIPIENT") => {
    if (!trackingState) return;
    const { delivery } = trackingState;

    let lat = delivery.donor_lat;
    let lng = delivery.donor_lng;

    if (type === "HALFWAY") {
      lat = (delivery.donor_lat + delivery.recipient_lat) / 2;
      lng = (delivery.donor_lng + delivery.recipient_lng) / 2;
    } else if (type === "RECIPIENT") {
      lat = delivery.recipient_lat;
      lng = delivery.recipient_lng;
    }

    try {
      const updated = (await apiRequest(`/api/tracking/${deliveryId}/location`, {
        method: "POST",
        body: JSON.stringify({
          latitude: lat,
          longitude: lng,
          accuracy: 5,
          speed: 30,
          heading: 90,
          timestamp: new Date().toISOString(),
        }),
      })) as TrackingState;

      setTrackingState(updated);
      toast.info(`⚡ Demo Simulator: Moved to ${type}`);
    } catch (err) {
      console.error("Simulation error:", err);
    }
  };

  if (loading) {
    return (
      <div className="container flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">Connecting to Live GPS Dispatch...</p>
      </div>
    );
  }

  if (error || !trackingState) {
    return (
      <div className="container py-12 max-w-md text-center space-y-4">
        <AlertCircle className="size-10 text-destructive mx-auto" />
        <h1 className="text-xl font-bold">Delivery Record Not Found</h1>
        <p className="text-sm text-muted-foreground">{error ?? "Could not find tracking payload"}</p>
      </div>
    );
  }

  const { delivery, current_location, distance_remaining_km, eta_minutes, rescue_time_remaining_min, rescue_risk_status, geofence_status } = trackingState;

  // Map Markers
  const mapMarkers: MapMarkerItem[] = [
    {
      id: delivery.donor_id,
      lat: delivery.donor_lat,
      lng: delivery.donor_lng,
      title: delivery.donor_name,
      type: "donor",
      subtitle: "Pickup Location",
      address: delivery.donor_address,
    },
    {
      id: delivery.recipient_id,
      lat: delivery.recipient_lat,
      lng: delivery.recipient_lng,
      title: delivery.recipient_name,
      type: "recipient",
      subtitle: "Delivery Destination",
      address: delivery.recipient_address,
    },
  ];

  if (current_location) {
    mapMarkers.push({
      id: "live_driver_marker",
      lat: current_location.latitude,
      lng: current_location.longitude,
      title: delivery.driver_name,
      type: "donation",
      subtitle: `Speed: ${current_location.speed ?? 0} km/h · Accuracy: ±${current_location.accuracy}m`,
    });
  }

  const isPickedUp = delivery.status === "FOOD_PICKED_UP" || delivery.status === "IN_TRANSIT" || delivery.status === "ARRIVED_AT_RECIPIENT";

  return (
    <div className="container max-w-5xl space-y-6 py-6">
      {/* Top Title & Driver Action Bar */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="border-primary/40 text-primary bg-primary-soft/30 font-bold">
              <Truck className="size-3.5 mr-1" />
              DRIVER TRACKING MODE
            </Badge>
            <Badge
              className={
                delivery.status === "DELIVERED"
                  ? "bg-emerald-600 text-white font-bold"
                  : "bg-blue-600 text-white font-bold"
              }
            >
              {delivery.status.replace(/_/g, " ")}
            </Badge>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl text-foreground">
            {delivery.food_name}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Driver: <strong>{delivery.driver_name}</strong> ({delivery.driver_phone})
          </p>
        </div>

        {/* GPS Control Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {!isTrackingGps ? (
            <Button onClick={startGpsTracking} size="sm" className="bg-emerald-600 hover:bg-emerald-700 font-bold shadow">
              <Play className="size-4 mr-1.5" />
              Start GPS Tracking
            </Button>
          ) : (
            <Button onClick={stopGpsTracking} variant="outline" size="sm" className="border-rose-500/50 text-rose-600 font-bold">
              <Square className="size-4 mr-1.5 fill-rose-600" />
              Stop GPS Tracking
            </Button>
          )}

          {/* Status Progression Buttons */}
          {delivery.status === "ASSIGNED" && (
            <Button onClick={() => void updateStatus("GOING_TO_PICKUP", "Driver started journey to donor")} size="sm" className="font-bold">
              <Navigation className="size-4 mr-1.5" />
              Start Delivery
            </Button>
          )}

          {(delivery.status === "GOING_TO_PICKUP" || delivery.status === "ARRIVED_AT_DONOR") && (
            <Button onClick={() => setShowOtpModal("PICKUP")} size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-bold">
              <KeyRound className="size-4 mr-1.5" />
              Verify Donor Pickup (OTP)
            </Button>
          )}

          {(delivery.status === "FOOD_PICKED_UP" || delivery.status === "IN_TRANSIT" || delivery.status === "ARRIVED_AT_RECIPIENT") && (
            <Button onClick={() => setShowOtpModal("DELIVERY")} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
              <CheckCircle2 className="size-4 mr-1.5" />
              Verify Recipient Handover (OTP)
            </Button>
          )}
        </div>
      </header>

      {/* Permission Error Banner */}
      {permissionError && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs sm:text-sm text-rose-800 dark:text-rose-200 flex items-start gap-3">
          <ShieldAlert className="size-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Device Geolocation Access Notice</p>
            <p className="mt-0.5 leading-relaxed">{permissionError}</p>
          </div>
        </div>
      )}

      {/* AI Delay & Rescue Deadline Alert */}
      {rescue_risk_status === "HIGH_RISK" && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs sm:text-sm text-amber-900 dark:text-amber-200 flex items-start gap-3">
          <AlertCircle className="size-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">⚠️ DELIVERY RISK DETECTED</p>
            <p className="mt-0.5 leading-relaxed">
              Rescue time remaining: <strong>{rescue_time_remaining_min} min</strong> · Current ETA: <strong>{eta_minutes} min</strong>.
              Food may not be rescued within the recommended safety window. Recommendation: Assign another nearby volunteer if delayed further.
            </p>
          </div>
        </div>
      )}

      {/* Telemetry Summary Cards */}
      <section className="grid gap-4 sm:grid-cols-4">
        <Card className="p-4 shadow-sm border-border/80">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Distance Remaining</span>
            <Navigation className="size-4 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-foreground">{distance_remaining_km} km</p>
          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
            Heading to: <strong>{isPickedUp ? delivery.recipient_name : delivery.donor_name}</strong>
          </p>
        </Card>

        <Card className="p-4 shadow-sm border-border/80">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Driver ETA</span>
            <Clock className="size-4 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-foreground">{eta_minutes} min</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Avg speed: <strong>{current_location?.speed ?? 22} km/h</strong>
          </p>
        </Card>

        <Card className="p-4 shadow-sm border-border/80">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Rescue Time Window</span>
            <Utensils className="size-4 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-foreground">{rescue_time_remaining_min} min</p>
          <div className="mt-1">
            <Progress
              value={Math.min(100, Math.round((rescue_time_remaining_min / 60) * 100))}
              className="h-1.5"
            />
          </div>
        </Card>

        <Card className="p-4 shadow-sm border-border/80">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Rescue Risk Level</span>
            <ShieldCheck className="size-4 text-primary" />
          </div>
          <div className="mt-2">
            <Badge
              className={
                rescue_risk_status === "SAFE"
                  ? "bg-emerald-600 text-white font-bold"
                  : "bg-amber-600 text-white font-bold"
              }
            >
              {rescue_risk_status === "SAFE" ? "🟢 SAFE / ON TIME" : "🔴 HIGH RISK"}
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            GPS Accuracy: <strong>±{current_location?.accuracy ?? 8}m</strong>
          </p>
        </Card>
      </section>

      {/* Real Interactive Map */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="size-5 text-primary" />
            <h2 className="text-base font-bold tracking-tight text-foreground">
              Live Interactive Delivery Map
            </h2>
          </div>
          <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-500/30">
            <Radio className="size-3 mr-1 text-emerald-600 animate-pulse" />
            {isTrackingGps ? "Live GPS Connected" : "GPS Ready"}
          </Badge>
        </div>

        <DynamicFoodMap
          markers={mapMarkers}
          center={current_location ? [current_location.latitude, current_location.longitude] : [delivery.donor_lat, delivery.donor_lng]}
          zoom={13}
          height="420px"
        />
      </section>

      {/* Geofencing & Telemetry Details */}
      <section className="grid gap-6 md:grid-cols-2">
        {/* Geofence Status */}
        <Card className="p-5 border-border/80 shadow-sm space-y-3">
          <h3 className="font-bold text-base text-foreground flex items-center gap-2">
            <Compass className="size-4 text-primary" />
            50m Geofence Auto-Detection
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border/50">
              <span className="font-semibold text-foreground">Donor Geofence ({delivery.donor_name})</span>
              {geofence_status.near_donor ? (
                <Badge className="bg-emerald-600 text-white text-[10px]">Within 50m (Arrived)</Badge>
              ) : (
                <span className="text-muted-foreground font-mono">{geofence_status.distance_to_donor_m}m away</span>
              )}
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border/50">
              <span className="font-semibold text-foreground">Recipient Geofence ({delivery.recipient_name})</span>
              {geofence_status.near_recipient ? (
                <Badge className="bg-emerald-600 text-white text-[10px]">Within 50m (Arrived)</Badge>
              ) : (
                <span className="text-muted-foreground font-mono">{geofence_status.distance_to_recipient_m}m away</span>
              )}
            </div>
          </div>
        </Card>

        {/* Real Coordinates & Telemetry Box */}
        <Card className="p-5 border-border/80 shadow-sm space-y-3">
          <h3 className="font-bold text-base text-foreground flex items-center gap-2">
            <Radio className="size-4 text-primary" />
            Real Device GPS Coordinates
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded bg-muted/50">
              <span className="text-[10px] text-muted-foreground block">Latitude</span>
              <span className="font-mono font-bold text-foreground">{current_location?.latitude.toFixed(5) ?? delivery.donor_lat}</span>
            </div>
            <div className="p-2 rounded bg-muted/50">
              <span className="text-[10px] text-muted-foreground block">Longitude</span>
              <span className="font-mono font-bold text-foreground">{current_location?.longitude.toFixed(5) ?? delivery.donor_lng}</span>
            </div>
            <div className="p-2 rounded bg-muted/50">
              <span className="text-[10px] text-muted-foreground block">Heading</span>
              <span className="font-mono font-bold text-foreground">{current_location?.heading ?? 270}° W</span>
            </div>
            <div className="p-2 rounded bg-muted/50">
              <span className="text-[10px] text-muted-foreground block">Last Timestamp</span>
              <span className="font-mono font-bold text-foreground">{current_location ? new Date(current_location.timestamp).toLocaleTimeString() : "Live"}</span>
            </div>
          </div>
        </Card>
      </section>

      {/* Desktop Testing Simulator Box (Clearly Labelled) */}
      <section className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-primary flex items-center gap-1.5">
            <Sparkles className="size-4" />
            ⚡ Desktop Testing Simulator (Simulate GPS Locations)
          </span>
          <span className="text-[10px] text-muted-foreground">For Desktop Development Only</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => void simulateStepPosition("DONOR")} variant="outline" size="sm" className="text-xs">
            Simulate Position: Donor (Lal Darwaja)
          </Button>
          <Button onClick={() => void simulateStepPosition("HALFWAY")} variant="outline" size="sm" className="text-xs">
            Simulate Position: En Route (Midway)
          </Button>
          <Button onClick={() => void simulateStepPosition("RECIPIENT")} variant="outline" size="sm" className="text-xs">
            Simulate Position: Recipient (Bodakdev)
          </Button>
        </div>
      </section>

      {/* OTP Verification Modal */}
      <Dialog open={showOtpModal !== null} onOpenChange={(open) => !open && setShowOtpModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="size-5 text-primary" />
              {showOtpModal === "PICKUP" ? "Verify Donor Food Pickup" : "Verify Recipient Delivery Handover"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {showOtpModal === "PICKUP"
                ? `Enter the 4-digit code provided by ${delivery.donor_name}. (Demo OTP: ${delivery.pickup_otp})`
                : `Enter the 4-digit code provided by ${delivery.recipient_name}. (Demo OTP: ${delivery.delivery_otp})`}
            </p>

            <div className="space-y-2">
              <Label htmlFor="otp">4-Digit Security OTP</Label>
              <Input
                id="otp"
                type="text"
                maxLength={4}
                placeholder="4-Digit Code"
                value={otpInput}
                onChange={(e) => {
                  setOtpInput(e.target.value);
                  if (otpError) setOtpError(null);
                }}
                className="text-center font-mono text-lg tracking-widest"
              />
            </div>

            {otpError && <p className="text-xs font-bold text-destructive">{otpError}</p>}

            <Button onClick={handleVerifyOtp} className="w-full font-bold" size="lg" disabled={verifyingOtp}>
              {verifyingOtp ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
              {showOtpModal === "PICKUP" ? "Confirm Food Pickup" : "Confirm Delivery Handover"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
