import StatsCards from "@/components/Dashboard/StatsCards";
import NetworkCharts from "@/components/Dashboard/NetworkCharts";
import RecentContacts from "@/components/Dashboard/RecentContacts";
import CRMReminders from "@/components/Dashboard/CRMReminders";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background pt-12">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* Header */}
        <div className="border-b border-border pb-6">
          <h1 className="font-serif text-3xl text-foreground">Network Overview</h1>
          <p className="text-muted-foreground text-sm mt-1">Your professional network at a glance</p>
        </div>

        <StatsCards />
        <NetworkCharts />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentContacts />
          <CRMReminders />
        </div>
      </div>
    </div>
  );
}
