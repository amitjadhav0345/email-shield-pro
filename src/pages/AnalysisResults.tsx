import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BarChart3, RefreshCw, Download, Shield, AlertTriangle, Link2, Globe, Brain, Lightbulb, Target, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import StatusBadge from "@/components/StatusBadge";
import AnalysisCheck from "@/components/AnalysisCheck";
import { Badge } from "@/components/ui/badge";

type Status = "safe" | "suspicious" | "phishing";
type CheckStatus = "pass" | "fail" | "warning" | "unknown";

interface DetectedIssue {
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  evidence?: string;
}

interface Check {
  label: string;
  status: CheckStatus;
  description: string;
  importance?: "critical" | "high" | "medium" | "low";
}

interface UrlAnalysis {
  url: string;
  risk: "safe" | "suspicious" | "malicious";
  reason: string;
}

interface SenderAnalysis {
  domain: string;
  legitimacyScore: number;
  redFlags: string[];
  displayNameMatch: boolean;
}

interface AIAnalysisResult {
  classification: "Safe" | "Low Risk" | "Medium Risk" | "High Risk";
  severityScore: number;
  confidence?: number;
  threatType?: string;
  detectedIssues: DetectedIssue[];
  checks: Check[];
  recommendations: string[];
  senderAnalysis?: SenderAnalysis;
  urlAnalysis?: UrlAnalysis[];
  educationalNotes?: string[];
  heuristicFlags?: string[];
  heuristicScore?: number;
  analysisTimestamp?: string;
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

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "critical":
      return "border-red-600/50 bg-red-600/10 text-red-500";
    case "high":
      return "border-destructive/50 bg-destructive/10 text-destructive";
    case "medium":
      return "border-warning/50 bg-warning/10 text-warning";
    default:
      return "border-muted bg-muted/10 text-muted-foreground";
  }
};

const getUrlRiskColor = (risk: string) => {
  switch (risk) {
    case "malicious":
      return "bg-red-600";
    case "suspicious":
      return "bg-warning";
    default:
      return "bg-success";
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-3">Analysis Results</h1>
            <p className="text-muted-foreground">
              Advanced AI-powered security analysis with heuristic detection
            </p>
            {results.analysisTimestamp && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1">
                <Clock className="h-3 w-3" />
                Analyzed: {new Date(results.analysisTimestamp).toLocaleString()}
              </p>
            )}
          </div>

          {/* Status Badge */}
          <div className="mb-8">
            <StatusBadge status={status} />
          </div>

          {/* Classification, Risk Score & Confidence */}
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
            <div className="h-3 bg-secondary rounded-full overflow-hidden mb-4">
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
            
            <div className="flex flex-wrap gap-4 text-sm">
              {results.confidence !== undefined && (
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">AI Confidence:</span>
                  <span className="font-semibold">{results.confidence}%</span>
                </div>
              )}
              {results.threatType && (
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-destructive" />
                  <span className="text-muted-foreground">Threat Type:</span>
                  <Badge variant="destructive">{results.threatType}</Badge>
                </div>
              )}
              {results.heuristicScore !== undefined && results.heuristicScore > 0 && (
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-warning" />
                  <span className="text-muted-foreground">Heuristic Score:</span>
                  <span className="font-semibold">{results.heuristicScore}</span>
                </div>
              )}
            </div>
          </div>

          {/* Heuristic Flags */}
          {results.heuristicFlags && results.heuristicFlags.length > 0 && (
            <div className="cyber-card mb-8 border-warning/30">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-warning" />
                Pattern Detection Flags
              </h3>
              <div className="flex flex-wrap gap-2">
                {results.heuristicFlags.map((flag, index) => (
                  <Badge key={index} variant="outline" className="border-warning/50 text-warning">
                    {flag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Sender Analysis */}
          {results.senderAnalysis && (
            <div className="cyber-card mb-8">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Sender Analysis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Domain</p>
                  <p className="font-mono text-sm">{results.senderAnalysis.domain || "Unknown"}</p>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Legitimacy Score</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${results.senderAnalysis.legitimacyScore > 70 ? 'bg-success' : results.senderAnalysis.legitimacyScore > 40 ? 'bg-warning' : 'bg-destructive'}`}
                        style={{ width: `${results.senderAnalysis.legitimacyScore}%` }}
                      />
                    </div>
                    <span className="font-semibold text-sm">{results.senderAnalysis.legitimacyScore}%</span>
                  </div>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Display Name Match</p>
                  <Badge variant={results.senderAnalysis.displayNameMatch ? "default" : "destructive"}>
                    {results.senderAnalysis.displayNameMatch ? "Matches" : "Mismatch Detected"}
                  </Badge>
                </div>
                {results.senderAnalysis.redFlags && results.senderAnalysis.redFlags.length > 0 && (
                  <div className="p-4 bg-secondary/30 rounded-lg md:col-span-2">
                    <p className="text-xs text-muted-foreground mb-2">Red Flags</p>
                    <div className="flex flex-wrap gap-2">
                      {results.senderAnalysis.redFlags.map((flag, i) => (
                        <Badge key={i} variant="destructive" className="text-xs">
                          {flag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* URL Analysis */}
          {results.urlAnalysis && results.urlAnalysis.length > 0 && (
            <div className="cyber-card mb-8">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Link2 className="h-5 w-5 text-primary" />
                URL Analysis ({results.urlAnalysis.length} URLs found)
              </h3>
              <div className="space-y-3">
                {results.urlAnalysis.map((urlItem, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      urlItem.risk === "malicious"
                        ? "border-red-600/50 bg-red-600/10"
                        : urlItem.risk === "suspicious"
                        ? "border-warning/50 bg-warning/10"
                        : "border-success/50 bg-success/10"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Badge className={`${getUrlRiskColor(urlItem.risk)} shrink-0`}>
                        {urlItem.risk.toUpperCase()}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-xs break-all mb-1">{urlItem.url}</p>
                        <p className="text-sm text-muted-foreground">{urlItem.reason}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detected Issues */}
          {results.detectedIssues && results.detectedIssues.length > 0 && (
            <div className="cyber-card mb-8">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Detected Issues ({results.detectedIssues.length})
              </h3>
              <div className="space-y-3">
                {results.detectedIssues.map((issue, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${getSeverityColor(issue.severity)}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs font-medium uppercase px-2 py-0.5 rounded ${
                          issue.severity === "critical"
                            ? "bg-red-600/20 text-red-500"
                            : issue.severity === "high"
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
                    <p className="text-sm text-muted-foreground mb-2">{issue.description}</p>
                    {issue.evidence && (
                      <div className="p-2 bg-background/50 rounded text-xs font-mono break-all">
                        <span className="text-muted-foreground">Evidence: </span>
                        {issue.evidence}
                      </div>
                    )}
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
              {results.checks && results.checks.map((check, index) => (
                <AnalysisCheck
                  key={index}
                  label={check.label || "Unknown Check"}
                  status={check.status || "unknown"}
                  description={check.description || ""}
                />
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="cyber-card mb-8">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-success" />
              Security Recommendations
            </h3>
            <ul className="space-y-2">
              {results.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary mt-0.5">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>

          {/* Educational Notes */}
          {results.educationalNotes && results.educationalNotes.length > 0 && (
            <div className="cyber-card mb-8 border-primary/30">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                Learn About This Attack
              </h3>
              <div className="space-y-3">
                {results.educationalNotes.map((note, index) => (
                  <div key={index} className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-sm">{note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

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
