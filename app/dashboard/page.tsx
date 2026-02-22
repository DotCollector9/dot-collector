import StatsCards from "@/components/Dashboard/StatsCards";
import NetworkCharts from "@/components/Dashboard/NetworkCharts";
import RecentContacts from "@/components/Dashboard/RecentContacts";
import CRMReminders from "@/components/Dashboard/CRMReminders";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-950 pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Network Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Your professional network at a glance</p>
        </div>

        <StatsCards />
        <NetworkCharts />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RecentContacts />
          <CRMReminders />
        </div>
      </div>
    </div>
  );
}
