"use client";

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Compass,
  Gauge,
  KeyRound,
  Loader2,
  MapPin,
  Navigation,
  Phone,
  Play,
  Radio,
  ShieldAlert,
  ShieldCheck,
  Square,
  Sparkles,
  Truck,
  UserCheck,
  Utensils,
} from "lucide-react";
import { use, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { DynamicFoodMap, type MapMarkerItem } from "@/components/map";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/client-api";
import { useLanguage } from "@/lib/i18n/context";
import type { DeliveryStatus, TrackingState } from "@/lib/types";

export default function DriverTrackingPage({
  params,
}: {
  params: Promise<{ deliveryId: string }>;
}) {
  const { deliveryId } = use(params);
  const { t } = useLanguage();

  const [trackingState, setTrackingState] = useState<TrackingState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // GPS Tracking Watcher State
  const [isTrackingGps, setIsTrackingGps] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Live Auto-Simulation Ticker State
  const [isSimulatingLive, setIsSimulatingLive] = useState(false);
  const simStepRef = useRef<number>(0);

  // OTP Verification Modal State
  const [showOtpModal, setShowOtpModal] = useState<"PICKUP" | "DELIVERY" | null>(null);
  const [otpInput, setOtpInput] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  // Initial Fetch & Real-Time Telemetry Polling (Every 2.5 seconds)
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
    const interval = setInterval(() => void fetchState(), 2500); // 2.5s rapid telemetry refresh

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [deliveryId]);

  // Live Auto-Simulation Route Ticker (Animates Driver Position Step-by-Step across Ahmedabad)
  useEffect(() => {
    if (!isSimulatingLive) return;

    const routeWaypoints = [
      { lat: 23.0250, lng: 72.5830, label: "Agashiye (Lal Darwaja) - Pickup", status: "ARRIVED_AT_DONOR" as DeliveryStatus },
      { lat: 23.0270, lng: 72.5700, label: "Crossing Ashram Road", status: "FOOD_PICKED_UP" as DeliveryStatus },
      { lat: 23.0300, lng: 72.5500, label: "Navrangpura Underbridge", status: "IN_TRANSIT" as DeliveryStatus },
      { lat: 23.0340, lng: 72.5300, label: "Vastrapur Lake Circle", status: "IN_TRANSIT" as DeliveryStatus },
      { lat: 23.0380, lng: 72.5180, label: "Approaching Bodakdev Geofence", status: "IN_TRANSIT" as DeliveryStatus },
      { lat: 23.0390, lng: 72.5110, label: "Robin Hood Army Shelter - Handover", status: "ARRIVED_AT_RECIPIENT" as DeliveryStatus },
    ];

    const timer = setInterval(async () => {
      simStepRef.current = (simStepRef.current + 1) % routeWaypoints.length;
      const wp = routeWaypoints[simStepRef.current];

      try {
        const updated = (await apiRequest(`/api/tracking/${deliveryId}/location`, {
          method: "POST",
          body: JSON.stringify({
            latitude: wp.lat + (Math.random() - 0.5) * 0.0008,
            longitude: wp.lng + (Math.random() - 0.5) * 0.0008,
            accuracy: 6 + Math.floor(Math.random() * 4),
            speed: 28 + Math.floor(Math.random() * 12),
            heading: 270,
            timestamp: new Date().toISOString(),
          }),
        })) as TrackingState;

        setTrackingState(updated);
        toast.info(`🚚 Live GPS Update: ${wp.label}`);
      } catch (err) {
        console.error("Simulation ticker error:", err);
      }
    }, 4500);

    return () => clearInterval(timer);
  }, [isSimulatingLive, deliveryId]);

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
            speed: speed ? Math.round(speed * 3.6) : null,
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
        msg = "Location permission was denied. Please allow location access in your browser settings.";
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
    toast.success("📡 Real Device GPS Telemetry Live");
  };

  // Stop Device GPS Tracking
  const stopGpsTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTrackingGps(false);
    toast.info("GPS Telemetry Paused");
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
      toast.success(`Status updated: ${status.replace(/_/g, " ")}`);
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

  if (loading) {
    return (
      <div className="container flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm font-bold text-muted-foreground">{t("trackingLoading")}</p>
      </div>
    );
  }

  if (error || !trackingState) {
    return (
      <div className="container py-12 max-w-md text-center space-y-4">
        <AlertCircle className="size-10 text-destructive mx-auto" />
        <h1 className="text-xl font-bold">{t("trackingNotFound")}</h1>
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
      {/* YC-Style Startup Badge Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card border border-border/80 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow">
            <Radio className="size-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-foreground">{t("trackingEngine")}</span>
              <Badge className="bg-emerald-600 text-white font-bold text-[10px]">REAL-TIME ACTIVE</Badge>
            </div>
            <p className="text-xs text-muted-foreground">High-frequency GPS Telemetry · 50m Geofencing · AI Delay Alerts</p>
          </div>
        </div>

        {/* Live Auto-Simulation Toggle Button */}
        <Button
          onClick={() => setIsSimulatingLive(!isSimulatingLive)}
          variant={isSimulatingLive ? "destructive" : "outline"}
          size="sm"
          className="font-bold text-xs shadow-sm"
        >
          {isSimulatingLive ? (
            <>
              <Square className="size-3.5 mr-1.5 fill-white" /> Stop Auto-Simulation
            </>
          ) : (
            <>
              <Sparkles className="size-3.5 mr-1.5 text-primary" /> ⚡ Start Live GPS Auto-Simulation
            </>
          )}
        </Button>
      </div>

      {/* Top Title & Driver Action Bar */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="border-primary/40 text-primary bg-primary-soft/30 font-bold">
              <Truck className="size-3.5 mr-1" />
              {t("driverTelemetryConsole")}
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
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 flex items-center gap-2">
            <UserCheck className="size-4 text-emerald-600" />
            Driver: <strong>{delivery.driver_name}</strong>
            <span className="text-muted-foreground">({delivery.driver_phone})</span>
          </p>
        </div>

        {/* GPS Control Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {!isTrackingGps ? (
            <Button onClick={startGpsTracking} size="sm" className="bg-emerald-600 hover:bg-emerald-700 font-bold shadow">
              <Play className="size-4 mr-1.5" />
              {t("startDeviceGPS")}
            </Button>
          ) : (
            <Button onClick={stopGpsTracking} variant="outline" size="sm" className="border-rose-500/50 text-rose-600 font-bold">
              <Square className="size-4 mr-1.5 fill-rose-600" />
              {t("pauseDeviceGPS")}
            </Button>
          )}

          {/* Status Progression Buttons */}
          {delivery.status === "ASSIGNED" && (
            <Button onClick={() => void updateStatus("GOING_TO_PICKUP", "Driver started journey to donor")} size="sm" className="font-bold">
              <Navigation className="size-4 mr-1.5" />
              {t("startJourney")}
            </Button>
          )}

          {(delivery.status === "GOING_TO_PICKUP" || delivery.status === "ARRIVED_AT_DONOR") && (
            <Button onClick={() => setShowOtpModal("PICKUP")} size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-bold">
              <KeyRound className="size-4 mr-1.5" />
              {t("verifyDonorPickup")}
            </Button>
          )}

          {(delivery.status === "FOOD_PICKED_UP" || delivery.status === "IN_TRANSIT" || delivery.status === "ARRIVED_AT_RECIPIENT") && (
            <Button onClick={() => setShowOtpModal("DELIVERY")} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
              <CheckCircle2 className="size-4 mr-1.5" />
              {t("verifyDeliveryHandover")}
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
            <p className="font-bold">⚠️ DELIVERY RISK DETECTED BY AI ENGINE</p>
            <p className="mt-0.5 leading-relaxed">
              Rescue time remaining: <strong>{rescue_time_remaining_min} min</strong> · Current ETA: <strong>{eta_minutes} min</strong>.
              Food may not be rescued within the recommended safety window. Recommendation: Assign another nearby volunteer if delayed further.
            </p>
          </div>
        </div>
      )}

      {/* Real-Time Live Telemetry Dashboard Grid */}
      <section className="grid gap-4 sm:grid-cols-4">
        <Card className="p-4 shadow-sm border-border/80 bg-card">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>{t("distanceRemaining")}</span>
            <Navigation className="size-4 text-primary" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-foreground">{distance_remaining_km} <span className="text-sm font-semibold text-muted-foreground">km</span></p>
          <p className="text-[11px] text-muted-foreground mt-1 truncate">
            Destination: <strong>{isPickedUp ? delivery.recipient_name : delivery.donor_name}</strong>
          </p>
        </Card>

        <Card className="p-4 shadow-sm border-border/80 bg-card">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>{t("liveDriverSpeed")}</span>
            <Gauge className="size-4 text-primary" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-foreground">{current_location?.speed ?? 24} <span className="text-sm font-semibold text-muted-foreground">km/h</span></p>
          <p className="text-[11px] text-muted-foreground mt-1">
            ETA: <strong>{eta_minutes} minutes</strong>
          </p>
        </Card>

        <Card className="p-4 shadow-sm border-border/80 bg-card">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>{t("foodRescueDeadline")}</span>
            <Clock className="size-4 text-primary" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-foreground">{rescue_time_remaining_min} <span className="text-sm font-semibold text-muted-foreground">min</span></p>
          <div className="mt-1.5">
            <Progress
              value={Math.min(100, Math.round((rescue_time_remaining_min / 60) * 100))}
              className="h-1.5"
            />
          </div>
        </Card>

        <Card className="p-4 shadow-sm border-border/80 bg-card">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>{t("rescueRiskAssessment")}</span>
            <ShieldCheck className="size-4 text-primary" />
          </div>
          <div className="mt-2">
            <Badge
              className={
                rescue_risk_status === "SAFE"
                  ? "bg-emerald-600 text-white font-bold text-xs"
                  : "bg-amber-600 text-white font-bold text-xs"
              }
            >
              {rescue_risk_status === "SAFE" ? t("safeOnTime") : t("highRisk")}
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1.5">
            GPS Precision: <strong>±{current_location?.accuracy ?? 6}m</strong>
          </p>
        </Card>
      </section>

      {/* Real Interactive Map */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="size-5 text-primary" />
            <h2 className="text-base font-bold tracking-tight text-foreground">
              Ahmedabad Live GPS Navigation Map
            </h2>
          </div>
          <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-500/30 font-bold">
            <Radio className="size-3 mr-1 text-emerald-600 animate-pulse" />
            {isTrackingGps ? t("liveGPSConnected") : "GPS Streaming Active"}
          </Badge>
        </div>

        <div className="rounded-3xl border border-border shadow-xl overflow-hidden">
          <DynamicFoodMap
            markers={mapMarkers}
            center={current_location ? [current_location.latitude, current_location.longitude] : [delivery.donor_lat, delivery.donor_lng]}
            zoom={13}
            height="440px"
          />
        </div>
      </section>

      {/* Geofencing & Telemetry Details */}
      <section className="grid gap-6 md:grid-cols-2">
        {/* Geofence Status */}
        <Card className="p-5 border-border/80 shadow-sm space-y-3">
          <h3 className="font-bold text-base text-foreground flex items-center gap-2">
            <Compass className="size-4 text-primary" />
            {t("trackingGeofenceEngine")}
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/50">
              <div>
                <span className="font-bold text-foreground block">{t("donorGeofence")}</span>
                <span className="text-[11px] text-muted-foreground">{delivery.donor_name}</span>
              </div>
              {geofence_status.near_donor ? (
                <Badge className="bg-emerald-600 text-white font-bold text-[10px]">Within 50m (Arrived)</Badge>
              ) : (
                <span className="text-muted-foreground font-mono font-semibold">{geofence_status.distance_to_donor_m}m away</span>
              )}
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/50">
              <div>
                <span className="font-bold text-foreground block">{t("recipientGeofence")}</span>
                <span className="text-[11px] text-muted-foreground">{delivery.recipient_name}</span>
              </div>
              {geofence_status.near_recipient ? (
                <Badge className="bg-emerald-600 text-white font-bold text-[10px]">Within 50m (Arrived)</Badge>
              ) : (
                <span className="text-muted-foreground font-mono font-semibold">{geofence_status.distance_to_recipient_m}m away</span>
              )}
            </div>
          </div>
        </Card>

        {/* Real Coordinates & Telemetry Box */}
        <Card className="p-5 border-border/80 shadow-sm space-y-3">
          <h3 className="font-bold text-base text-foreground flex items-center gap-2">
            <Radio className="size-4 text-primary" />
            {t("trackingTelemetry")}
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-muted/50">
              <span className="text-[10px] text-muted-foreground block font-medium">Latitude</span>
              <span className="font-mono font-extrabold text-foreground text-sm">{current_location?.latitude.toFixed(5) ?? delivery.donor_lat}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-muted/50">
              <span className="text-[10px] text-muted-foreground block font-medium">Longitude</span>
              <span className="font-mono font-extrabold text-foreground text-sm">{current_location?.longitude.toFixed(5) ?? delivery.donor_lng}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-muted/50">
              <span className="text-[10px] text-muted-foreground block font-medium">Heading</span>
              <span className="font-mono font-extrabold text-foreground text-sm">{current_location?.heading ?? 270}° West</span>
            </div>
            <div className="p-2.5 rounded-lg bg-muted/50">
              <span className="text-[10px] text-muted-foreground block font-medium">Last Timestamp</span>
              <span className="font-mono font-extrabold text-foreground text-sm">{current_location ? new Date(current_location.timestamp).toLocaleTimeString() : "Live"}</span>
            </div>
          </div>
        </Card>
      </section>

      {/* OTP Verification Modal */}
      <Dialog open={showOtpModal !== null} onOpenChange={(open: boolean) => !open && setShowOtpModal(null)}>
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
              <Label htmlFor="otp">{t("enterOTP")}</Label>
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
              {showOtpModal === "PICKUP" ? t("confirmFoodPickup") : t("confirmDeliveryHandover")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
