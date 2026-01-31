import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BarChart3, RefreshCw, Download, Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import StatusBadge from "@/components/StatusBadge";
import AnalysisCheck from "@/components/AnalysisCheck";

type Status = "safe" | "suspicious" | "phishing";
type CheckStatus = "pass" | "fail" | "warning";

interface DetectedIssue {
  type: string;
  severity: "low" | "medium" | "high";
  description: string;
}

interface Check {
  label: string;
  status: CheckStatus;
  description: string;
}

interface AIAnalysisResult {
  classification: "Safe" | "Low Risk" | "Medium Risk" | "High Risk";
  severityScore: number;
  detectedIssues: DetectedIssue[];
  checks: Check[];
  recommendations: string[];
}

const mapClassificationToStatus = (classification: string): Status => {
  switch (classification) {
    case "Safe":
    case "Low Risk":
      return "safe";
    case "Medium Risk":
      return "suspicious";
    case "High Risk":
      return "phishing";
    default:
      return "suspicious";
  }
};

const AnalysisResults = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<AIAnalysisResult | null>(null);

  useEffect(() => {
    const storedResults = sessionStorage.getItem("analysisResults");
    if (!storedResults) {
      navigate("/analyze");
      return;
    }

    try {
      const parsedResults = JSON.parse(storedResults);
      setResults(parsedResults);
    } catch {
      navigate("/analyze");
    }
  }, [navigate]);

  if (!results) {
    return null;
  }

  const status = mapClassificationToStatus(results.classification);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-3">Analysis Results</h1>
            <p className="text-muted-foreground">
              AI-powered security analysis of your email.
            </p>
          </div>

          {/* Status Badge */}
          <div className="mb-8">
            <StatusBadge status={status} />
          </div>

          {/* Classification & Risk Score */}
          <div className="cyber-card mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Risk Assessment
              </h3>
              <div className="text-right">
                <span className="font-mono text-2xl font-bold">
                  {results.severityScore}/100
                </span>
                <p className="text-xs text-muted-foreground">{results.classification}</p>
              </div>
            </div>
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${
                  results.severityScore > 70
                    ? "bg-destructive"
                    : results.severityScore > 40
                    ? "bg-warning"
                    : "bg-success"
                }`}
                style={{ width: `${results.severityScore}%` }}
              />
            </div>
          </div>

          {/* Detected Issues */}
          {results.detectedIssues && results.detectedIssues.length > 0 && (
            <div className="cyber-card mb-8">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Detected Issues
              </h3>
              <div className="space-y-3">
                {results.detectedIssues.map((issue, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      issue.severity === "high"
                        ? "border-destructive/50 bg-destructive/10"
                        : issue.severity === "medium"
                        ? "border-warning/50 bg-warning/10"
                        : "border-muted bg-muted/10"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs font-medium uppercase px-2 py-0.5 rounded ${
                          issue.severity === "high"
                            ? "bg-destructive/20 text-destructive"
                            : issue.severity === "medium"
                            ? "bg-warning/20 text-warning"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {issue.severity}
                      </span>
                      <span className="font-medium text-sm">{issue.type}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{issue.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analysis Checks */}
          <div className="cyber-card mb-8">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Security Checks
            </h3>
            <div className="grid gap-3">
              {results.checks.map((check, index) => (
                <AnalysisCheck
                  key={index}
                  label={check.label}
                  status={check.status}
                  description={check.description}
                />
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="cyber-card mb-8">
            <h3 className="font-semibold mb-4">Security Recommendations</h3>
            <ul className="space-y-2">
              {results.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/analyze" className="flex-1">
              <Button variant="outline" className="w-full gap-2">
                <RefreshCw className="h-5 w-5" />
                Analyze Another Email
              </Button>
            </Link>
            <Button variant="outline" className="flex-1 gap-2">
              <Download className="h-5 w-5" />
              Download Report (PDF)
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AnalysisResults;
