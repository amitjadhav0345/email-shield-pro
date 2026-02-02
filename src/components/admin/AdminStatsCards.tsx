import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, AlertTriangle, CheckCircle, XCircle, TrendingUp, BarChart3 } from "lucide-react";

interface Stats {
  totalScans: number;
  uniqueUsers: number;
  safeCount: number;
  suspiciousCount: number;
  phishingCount: number;
  avgSeverity: number;
}

interface AdminStatsCardsProps {
  stats: Stats;
}

const AdminStatsCards = ({ stats }: AdminStatsCardsProps) => {
  const statCards = [
    {
      title: "Total Scans",
      value: stats.totalScans,
      icon: BarChart3,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Unique Users",
      value: stats.uniqueUsers,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Safe Emails",
      value: stats.safeCount,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Suspicious",
      value: stats.suspiciousCount,
      icon: AlertTriangle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Phishing",
      value: stats.phishingCount,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "Avg. Severity",
      value: `${stats.avgSeverity}%`,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <span className="text-2xl font-bold">{stat.value}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminStatsCards;
