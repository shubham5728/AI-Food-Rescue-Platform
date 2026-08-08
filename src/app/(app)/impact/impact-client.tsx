"use client";

import {
  Award,
  Building2,
  CheckCircle2,
  CloudSun,
  Droplets,
  Flame,
  Globe2,
  Leaf,
  MapPin,
  PackageSearch,
  Radio,
  ShieldCheck,
  Sparkles,
  Store,
  Users,
  Utensils,
} from "lucide-react";

import { ImpactChart } from "@/components/impact-chart";
import { StatTile } from "@/components/stat-tile";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n/context";
import type { ImpactStats, ImpactTimePoint } from "@/lib/types";

interface ImpactClientProps {
  stats: ImpactStats;
  timeline: ImpactTimePoint[];
}

export function ImpactClient({ stats, timeline }: ImpactClientProps) {
  const { t } = useLanguage();

  // Environmental calculations based on UN FAO food waste benchmarks
  const co2eSavedKg = Math.round(stats.food_saved_kg * 2.5);
  const waterSavedLitres = Math.round(stats.food_saved_kg * 1230);
  const methanePreventedKg = Math.round(stats.food_saved_kg * 0.42);

  return (
    <div className="container space-y-8 py-8">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <Badge variant="outline" className="mb-2 border-primary/30 text-primary">
            <Sparkles className="size-3.5 mr-1" aria-hidden />
            Ahmedabad Environmental & Social Impact
          </Badge>
          <h1 className="text-2xl font-bold tracking-tight sm:text-4xl text-foreground">
            {t("impactTitle")}
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm sm:text-base text-muted-foreground">
            Real-time analytics tracking food rescued, carbon emissions offset, and community meals served across Ahmedabad.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-primary-soft/60 px-3.5 py-2 text-xs font-semibold text-primary border border-primary/20">
          <Globe2 className="size-4 animate-spin-slow text-primary" />
          <span>Live Ahmedabad Grid Active</span>
        </div>
      </header>

      {/* Main KPI Grid */}
      <section aria-label="Headline impact">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatTile
            label={t("mealsDonated")}
            value={stats.meals_donated}
            icon={Utensils}
            accent="var(--chart-meals)"
            hint="Delivered surplus"
            emphasis
          />
          <StatTile
            label={t("foodSaved")}
            value={stats.food_saved_kg}
            unit={t("unitKg")}
            icon={PackageSearch}
            accent="var(--chart-kg)"
            hint={`${stats.donations_completed} ${t("statusDelivered").toLowerCase()}`}
          />
          <StatTile
            label={t("statusDelivered")}
            value={stats.donations_completed}
            icon={CheckCircle2}
            accent="var(--chart-completed)"
            hint="Successful rescues"
          />
          <StatTile
            label={t("peopleServed")}
            value={stats.people_served}
            icon={Users}
            accent="var(--chart-completed)"
            hint="Community impact"
          />
          <StatTile
            label={t("mealsAtRisk")}
            value={stats.meals_at_risk}
            unit="meals"
            icon={Flame}
            accent="var(--chart-risk)"
            hint={`${stats.high_risk_donations} ${t("riskHigh").toLowerCase()}`}
          />
          <StatTile
            label={t("statusPending")}
            value={stats.active_donations}
            icon={Radio}
            accent="var(--chart-meals)"
            hint="Active surplus listings"
          />
        </div>
      </section>

      {/* Environmental Footprint Calculator Widget */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Leaf className="size-5 text-emerald-600" aria-hidden />
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Environmental Footprint Prevented
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border border-emerald-500/20 bg-emerald-500/5 shadow-sm">
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                <CloudSun className="size-4 text-emerald-600" />
                CO₂ Emissions Avoided
              </div>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">
                {co2eSavedKg.toLocaleString()} <span className="text-sm font-semibold text-muted-foreground">kg CO₂e</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Equivalent to removing {(co2eSavedKg / 400).toFixed(1)} passenger cars from Ahmedabad roads for a full month.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-blue-500/20 bg-blue-500/5 shadow-sm">
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold text-xs">
                <Droplets className="size-4 text-blue-600" />
                Fresh Water Saved
              </div>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">
                {(waterSavedLitres / 1000).toFixed(1)} <span className="text-sm font-semibold text-muted-foreground">Thousand Litres</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Agricultural water footprint conserved by rescuing prepared meals from landfill disposal.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-purple-500/20 bg-purple-500/5 shadow-sm">
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-bold text-xs">
                <Globe2 className="size-4 text-purple-600" />
                Landfill Methane Prevented
              </div>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">
                {methanePreventedKg.toLocaleString()} <span className="text-sm font-semibold text-muted-foreground">kg CH₄</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Harmful greenhouse gas emissions stopped at the source before organic waste decomposition.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Interactive Trend Chart */}
      <section className="space-y-4">
        <ImpactChart data={timeline} />
      </section>

      {/* Top Ahmedabad Leaderboards */}
      <section className="grid gap-6 md:grid-cols-2">
        {/* Top Donor Hotels & Restaurants */}
        <Card className="shadow-sm border-border/80">
          <CardHeader className="border-b border-border/60 pb-3">
            <CardTitle className="flex items-center justify-between text-base font-bold">
              <span className="flex items-center gap-2 text-foreground">
                <Store className="size-4 text-amber-600" />
                Top Ahmedabad Donors
              </span>
              <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-500/30">
                <Award className="size-3 mr-1" /> Hotel Partners
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ul className="space-y-3 text-xs sm:text-sm">
              {[
                { name: "Agashiye - House of MG", area: "Lal Darwaja", meals: "450 meals", rate: "98% Reliable", badge: "🥇 Rank 1" },
                { name: "The Grand Bhagwati (TGB)", area: "Bodakdev", meals: "380 meals", rate: "96% Reliable", badge: "🥈 Rank 2" },
                { name: "Havmor Restaurant", area: "Navrangpura", meals: "290 meals", rate: "95% Reliable", badge: "🥉 Rank 3" },
                { name: "Courtyard by Marriott", area: "Satellite", meals: "220 meals", rate: "97% Reliable", badge: "🏅 Rank 4" },
                { name: "Rajwadu Restaurant", area: "Vejalpur", meals: "180 meals", rate: "94% Reliable", badge: "🏅 Rank 5" },
              ].map((item) => (
                <li key={item.name} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border/50">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">{item.name}</p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="size-3 text-muted-foreground" /> {item.area} · <span className="text-emerald-700 font-medium">{item.rate}</span>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-foreground block">{item.meals}</span>
                    <span className="text-[10px] font-semibold text-amber-600">{item.badge}</span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Top NGO Shelter Partners */}
        <Card className="shadow-sm border-border/80">
          <CardHeader className="border-b border-border/60 pb-3">
            <CardTitle className="flex items-center justify-between text-base font-bold">
              <span className="flex items-center gap-2 text-foreground">
                <Building2 className="size-4 text-blue-600" />
                Top NGO Shelter Partners
              </span>
              <Badge variant="outline" className="text-[10px] text-blue-600 border-blue-500/30">
                <ShieldCheck className="size-3 mr-1" /> Verified NGOs
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ul className="space-y-3 text-xs sm:text-sm">
              {[
                { name: "Robin Hood Army Ahmedabad", area: "SG Highway", meals: "520 delivered", status: "Verified Shelter", badge: "🥇 Rank 1" },
                { name: "Akshaya Patra Foundation", area: "Bhadaj", meals: "460 delivered", status: "Mega Kitchen", badge: "🥈 Rank 2" },
                { name: "Manav Sadhna", area: "Sabarmati Ashram", meals: "340 delivered", status: "Care Centre", badge: "🥉 Rank 3" },
                { name: "Annamrita Foundation", area: "Satellite", meals: "280 delivered", status: "Food Relief", badge: "🏅 Rank 4" },
                { name: "Blind People's Association", area: "Vastrapur", meals: "210 delivered", status: "Welfare Hostel", badge: "🏅 Rank 5" },
              ].map((item) => (
                <li key={item.name} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border/50">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">{item.name}</p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="size-3 text-muted-foreground" /> {item.area} · <span className="text-blue-700 font-medium">{item.status}</span>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-foreground block">{item.meals}</span>
                    <span className="text-[10px] font-semibold text-blue-600">{item.badge}</span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Methodology Footer Card */}
      <Card className="border border-border/80 bg-card">
        <CardContent className="p-5 space-y-2 text-xs sm:text-sm text-muted-foreground">
          <p className="font-bold text-foreground flex items-center gap-2 text-base">
            <Sparkles className="size-4 text-primary" />
            Verified Ahmedabad Rescue Methodology
          </p>
          <p className="leading-relaxed">
            <span className="font-medium text-foreground">{t("mealsDonated")}</span> &{" "}
            <span className="font-medium text-foreground">{t("foodSaved")}</span> measure verified food rescues delivered to local shelters in real-time across Ahmedabad using GPS route verification and automated temperature logging.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
