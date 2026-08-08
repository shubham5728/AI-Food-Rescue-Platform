"use client";

import {
  AlertCircle,
  ArrowRight,
  Clock,
  Filter,
  MapPin,
  Navigation,
  Radio,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { DynamicFoodMap, type MapMarkerItem } from "@/components/map";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/client-api";
import type { TrackingState } from "@/lib/types";

export default function AdminTrackingCommandCenter() {
  const [trackingStates, setTrackingStates] = useState<TrackingState[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  useEffect(() => {
    let isMounted = true;

    const fetchDeliveries = async () => {
      try {
        const res = (await apiRequest("/api/tracking")) as { trackingStates: TrackingState[] };
        if (isMounted) {
          setTrackingStates(res.trackingStates);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load tracking states:", err);
        if (isMounted) setLoading(false);
      }
    };

    void fetchDeliveries();
    const interval = setInterval(() => void fetchDeliveries(), 4000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const filteredStates = trackingStates.filter((item) => {
    if (filterStatus === "ALL") return true;
    if (filterStatus === "ACTIVE") return item.delivery.status !== "DELIVERED" && item.delivery.status !== "CANCELLED";
    if (filterStatus === "IN_TRANSIT") return item.delivery.status === "IN_TRANSIT" || item.delivery.status === "FOOD_PICKED_UP";
    if (filterStatus === "HIGH_RISK") return item.rescue_risk_status === "HIGH_RISK" || item.rescue_risk_status === "CRITICAL";
    return true;
  });

  const allMarkers: MapMarkerItem[] = trackingStates.flatMap((item) => {
    const list: MapMarkerItem[] = [
      {
        id: item.delivery.donor_id,
        lat: item.delivery.donor_lat,
        lng: item.delivery.donor_lng,
        title: item.delivery.donor_name,
        type: "donor",
        subtitle: `Donor: ${item.delivery.food_name}`,
      },
      {
        id: item.delivery.recipient_id,
        lat: item.delivery.recipient_lat,
        lng: item.delivery.recipient_lng,
        title: item.delivery.recipient_name,
        type: "recipient",
        subtitle: `Recipient: ${item.delivery.food_name}`,
      },
    ];

    if (item.current_location) {
      list.push({
        id: `driver_${item.delivery.id}`,
        lat: item.current_location.latitude,
        lng: item.current_location.longitude,
        title: item.delivery.driver_name,
        type: "donation",
        riskLevel: item.rescue_risk_status === "HIGH_RISK" ? "HIGH" : "LOW",
        subtitle: `Driver ETA: ${item.eta_minutes} min · Distance: ${item.distance_remaining_km} km`,
      });
    }

    return list;
  });

  return (
    <div className="container space-y-8 py-8">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="outline" className="border-primary/40 text-primary bg-primary-soft/30 font-bold">
              <Sparkles className="size-3.5 mr-1" />
              CENTRAL DISPATCH COMMAND CENTER
            </Badge>
            <Badge variant="secondary" className="text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 font-bold">
              <Radio className="size-3 mr-1 text-emerald-600 animate-pulse" />
              Live Telemetry Stream
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            Live Food Rescue GPS Dispatch Command Center
          </h1>
          <p className="mt-1 text-sm sm:text-base text-muted-foreground">
            Real-time tracking of active volunteers, driver locations, food rescue deadlines, and AI delay warnings across Ahmedabad.
          </p>
        </div>
      </header>

      {/* Map Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="size-5 text-primary" />
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Ahmedabad Active Deliveries Map
            </h2>
          </div>
          <Badge variant="outline" className="text-xs text-primary">
            {trackingStates.length} Active Tracks
          </Badge>
        </div>

        <DynamicFoodMap
          markers={allMarkers}
          center={[23.0380, 72.5350]}
          zoom={12}
          height="440px"
        />
      </section>

      {/* Status Filter Tabs & Active Deliveries List */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="size-5 text-primary" />
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Active Rescue Trackings
            </h2>
          </div>

          <Tabs value={filterStatus} onValueChange={setFilterStatus} className="w-auto">
            <TabsList className="grid grid-cols-4 sm:flex">
              <TabsTrigger value="ALL" className="font-bold text-xs">All</TabsTrigger>
              <TabsTrigger value="ACTIVE" className="font-bold text-xs">Active</TabsTrigger>
              <TabsTrigger value="IN_TRANSIT" className="font-bold text-xs">In Transit</TabsTrigger>
              <TabsTrigger value="HIGH_RISK" className="font-bold text-xs text-rose-600">High Risk</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="space-y-4">
          {filteredStates.map((item) => {
            const { delivery, current_location, distance_remaining_km, eta_minutes, rescue_time_remaining_min, rescue_risk_status } = item;
            return (
              <Card key={delivery.id} className="p-5 shadow-sm border-border/80 hover:border-primary/40 transition-colors">
                <CardContent className="p-0 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/50 pb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-primary text-primary-foreground font-bold text-[10px]">
                          {delivery.status.replace(/_/g, " ")}
                        </Badge>
                        {rescue_risk_status === "SAFE" ? (
                          <Badge className="bg-emerald-600 text-white font-bold text-[10px]">
                            <ShieldCheck className="size-3 mr-1" /> ON TIME
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-600 text-white font-bold text-[10px]">
                            <ShieldAlert className="size-3 mr-1" /> HIGH RISK
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-lg font-extrabold text-foreground">{delivery.food_name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Driver: <strong>{delivery.driver_name}</strong> ({delivery.driver_phone})
                      </p>
                    </div>

                    <Button asChild size="sm" className="font-bold">
                      <Link href={`/tracking/${delivery.id}`}>
                        Track Driver Live →
                      </Link>
                    </Button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-4 text-xs">
                    <div className="space-y-1">
                      <span className="text-muted-foreground block font-medium">Donor (Pickup)</span>
                      <strong className="text-foreground block truncate">{delivery.donor_name}</strong>
                      <span className="text-[11px] text-muted-foreground block truncate">{delivery.donor_address}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-muted-foreground block font-medium">Recipient (Destination)</span>
                      <strong className="text-foreground block truncate">{delivery.recipient_name}</strong>
                      <span className="text-[11px] text-muted-foreground block truncate">{delivery.recipient_address}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-muted-foreground block font-medium">Distance & ETA</span>
                      <strong className="text-foreground block">{distance_remaining_km} km away</strong>
                      <span className="text-[11px] text-primary font-bold block">ETA: {eta_minutes} min</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-muted-foreground block font-medium">Rescue Time Remaining</span>
                      <strong className="text-foreground block">{rescue_time_remaining_min} min remaining</strong>
                      <span className="text-[11px] text-muted-foreground block">Accuracy: ±{current_location?.accuracy ?? 8}m</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
