import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, AlertTriangle, CheckCircle, XCircle, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AdminStatsCards from "@/components/admin/AdminStatsCards";
import AdminAnalysisTable from "@/components/admin/AdminAnalysisTable";

interface AnalysisRecord {
  id: string;
  user_email: string | null;
  email_snippet: string | null;
  classification: string;
  severity_score: number;
  detected_issues_count: number | null;
  created_at: string;
}

interface Stats {
  totalScans: number;
  uniqueUsers: number;
  safeCount: number;
  suspiciousCount: number;
  phishingCount: number;
  avgSeverity: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalScans: 0,
    uniqueUsers: 0,
    safeCount: 0,
    suspiciousCount: 0,
    phishingCount: 0,
    avgSeverity: 0,
  });

  useEffect(() => {
    checkAdminAndFetchData();
  }, []);

  const checkAdminAndFetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Access Denied",
          description: "Please sign in to access this page.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // Check if user has admin role
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (roleError || !roleData) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);

      // Fetch all analysis history
      const { data: analysisData, error: analysisError } = await supabase
        .from("analysis_history")
        .select("*")
        .order("created_at", { ascending: false });

      if (analysisError) {
        console.error("Error fetching analysis history:", analysisError);
        toast({
          title: "Error",
          description: "Failed to load analysis history.",
          variant: "destructive",
        });
        return;
      }

      setAnalyses(analysisData || []);

      // Calculate stats
      const records = analysisData || [];
      const uniqueEmails = new Set(records.map(r => r.user_email).filter(Boolean));
      const safeCount = records.filter(r => r.classification === "safe").length;
      const suspiciousCount = records.filter(r => r.classification === "suspicious").length;
      const phishingCount = records.filter(r => r.classification === "phishing").length;
      const avgSeverity = records.length > 0 
        ? records.reduce((sum, r) => sum + r.severity_score, 0) / records.length 
        : 0;

      setStats({
        totalScans: records.length,
        uniqueUsers: uniqueEmails.size,
        safeCount,
        suspiciousCount,
        phishingCount,
        avgSeverity: Math.round(avgSeverity),
      });

    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-10 w-64" />
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
            <Skeleton className="h-96" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>

        <AdminStatsCards stats={stats} />

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              All Analysis History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AdminAnalysisTable analyses={analyses} />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
