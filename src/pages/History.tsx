import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { History as HistoryIcon, Shield, AlertTriangle, XCircle, Calendar, User } from "lucide-react";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface AnalysisRecord {
  id: string;
  email_snippet: string | null;
  classification: string;
  severity_score: number;
  detected_issues_count: number;
  created_at: string;
  user_email: string | null;
}

const getStatusIcon = (classification: string) => {
  switch (classification) {
    case "Safe":
    case "Low Risk":
      return <Shield className="h-5 w-5 text-success" />;
    case "Medium Risk":
      return <AlertTriangle className="h-5 w-5 text-warning" />;
    case "High Risk":
      return <XCircle className="h-5 w-5 text-destructive" />;
    default:
      return <Shield className="h-5 w-5 text-muted-foreground" />;
  }
};

const getStatusColor = (classification: string) => {
  switch (classification) {
    case "Safe":
    case "Low Risk":
      return "border-success/50 bg-success/10";
    case "Medium Risk":
      return "border-warning/50 bg-warning/10";
    case "High Risk":
      return "border-destructive/50 bg-destructive/10";
    default:
      return "border-border bg-muted/10";
  }
};

const History = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<AnalysisRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (!session?.user) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("analysis_history")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching history:", error);
      } else {
        setHistory(data || []);
      }
      setIsLoading(false);
    };

    if (user) {
      fetchHistory();
    }
  }, [user]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <HistoryIcon className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-3">Analysis History</h1>
            <p className="text-muted-foreground">
              View your past email security analyses
            </p>
          </div>

          {/* Stats Summary */}
          {history.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="cyber-card text-center">
                <p className="text-2xl font-bold">{history.length}</p>
                <p className="text-xs text-muted-foreground">Total Scans</p>
              </div>
              <div className="cyber-card text-center">
                <p className="text-2xl font-bold text-success">
                  {history.filter(h => h.classification === "Safe" || h.classification === "Low Risk").length}
                </p>
                <p className="text-xs text-muted-foreground">Safe Emails</p>
              </div>
              <div className="cyber-card text-center">
                <p className="text-2xl font-bold text-warning">
                  {history.filter(h => h.classification === "Medium Risk").length}
                </p>
                <p className="text-xs text-muted-foreground">Suspicious</p>
              </div>
              <div className="cyber-card text-center">
                <p className="text-2xl font-bold text-destructive">
                  {history.filter(h => h.classification === "High Risk").length}
                </p>
                <p className="text-xs text-muted-foreground">Phishing</p>
              </div>
            </div>
          )}

          {/* History List */}
          {history.length === 0 ? (
            <div className="cyber-card text-center py-12">
              <HistoryIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No Analysis History</h3>
              <p className="text-sm text-muted-foreground">
                Your email analysis results will appear here after you analyze your first email.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((record) => (
                <div
                  key={record.id}
                  className={`cyber-card flex items-center gap-4 border ${getStatusColor(record.classification)}`}
                >
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {getStatusIcon(record.classification)}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">
                        {record.classification}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        Score: {record.severity_score}/100
                      </span>
                    </div>
                    {record.email_snippet && (
                      <p className="text-xs text-muted-foreground truncate">
                        {record.email_snippet}...
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(record.created_at), "MMM d, yyyy h:mm a")}
                      </span>
                      {record.detected_issues_count > 0 && (
                        <span className="text-warning">
                          {record.detected_issues_count} issue{record.detected_issues_count > 1 ? "s" : ""} found
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default History;
