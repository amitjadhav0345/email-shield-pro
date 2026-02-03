import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

interface AnalysisRecord {
  id: string;
  user_email: string | null;
  email_snippet: string | null;
  classification: string;
  severity_score: number;
  detected_issues_count: number | null;
  created_at: string;
}

interface AdminAnalysisTableProps {
  analyses: AnalysisRecord[];
}

const AdminAnalysisTable = ({ analyses }: AdminAnalysisTableProps) => {
  const getClassificationBadge = (classification: string) => {
    const lowerClassification = classification?.toLowerCase() || '';
    if (lowerClassification === "safe" || classification === "Safe" || classification === "Low Risk") {
      return <Badge className="bg-green-500 hover:bg-green-600">Safe</Badge>;
    }
    if (lowerClassification === "suspicious" || classification === "Medium Risk") {
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Suspicious</Badge>;
    }
    if (lowerClassification === "phishing" || classification === "High Risk") {
      return <Badge className="bg-red-500 hover:bg-red-600">Phishing</Badge>;
    }
    return <Badge variant="secondary">{classification || "Unknown"}</Badge>;
  };

  const getSeverityColor = (score: number) => {
    if (score <= 30) return "text-green-600";
    if (score <= 60) return "text-yellow-600";
    return "text-red-600";
  };

  if (analyses.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No analysis history found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Email Snippet</TableHead>
            <TableHead>Classification</TableHead>
            <TableHead className="text-center">Severity</TableHead>
            <TableHead className="text-center">Issues</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {analyses.map((analysis) => (
            <TableRow key={analysis.id}>
              <TableCell className="whitespace-nowrap">
                {format(new Date(analysis.created_at), "MMM d, yyyy HH:mm")}
              </TableCell>
              <TableCell className="max-w-[200px] truncate">
                {analysis.user_email || "Anonymous"}
              </TableCell>
              <TableCell className="max-w-[300px] truncate">
                {analysis.email_snippet || "-"}
              </TableCell>
              <TableCell>
                {getClassificationBadge(analysis.classification)}
              </TableCell>
              <TableCell className="text-center">
                <span className={`font-semibold ${getSeverityColor(analysis.severity_score)}`}>
                  {analysis.severity_score}%
                </span>
              </TableCell>
              <TableCell className="text-center">
                {analysis.detected_issues_count ?? 0}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminAnalysisTable;
