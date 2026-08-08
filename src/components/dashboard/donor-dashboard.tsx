import { DonorDashboardClient } from "@/components/dashboard/donor-dashboard-client";
import { getDb } from "@/lib/db";
import {
  getImpactStats,
  scoreDonations,
} from "@/lib/service";
import type { Organisation } from "@/lib/types";

export async function DonorDashboard({
  organisation,
}: {
  organisation: Organisation;
}) {
  const db = getDb();

  const [stats, mine, everythingActive] = await Promise.all([
    getImpactStats(),
    db.listDonations({ donor_id: organisation.id }),
    db.listDonations({ activeOnly: true }),
  ]);

  const [scoredMine, scoredActive] = await Promise.all([
    scoreDonations(mine),
    scoreDonations(everythingActive),
  ]);

  const myActive = scoredActive.filter(
    (s) => s.donation.donor_id === organisation.id,
  );
  const queue = [...myActive].sort(
    (a, b) => b.priority.score - a.priority.score,
  );

  const recent = scoredMine.slice(0, 6);

  return (
    <DonorDashboardClient
      organisation={organisation}
      stats={stats}
      myActive={myActive}
      queue={queue}
      recent={recent}
    />
  );
}
