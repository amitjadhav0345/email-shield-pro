import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BarChart3, RefreshCw, Download, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import StatusBadge from "@/components/StatusBadge";
import AnalysisCheck from "@/components/AnalysisCheck";

type Status = "safe" | "suspicious" | "phishing";
type CheckStatus = "pass" | "fail" | "warning";

interface AnalysisResult {
  status: Status;
  riskScore: number;
  checks: {
    label: string;
    status: CheckStatus;
    description: string;
  }[];
  recommendations: string[];
}

const generateMockResults = (emailContent: string, emailHeader: string): AnalysisResult => {
  // Simple mock analysis based on content
  const hasUrgentLanguage = /urgent|immediately|action required|verify|suspended/i.test(emailContent);
  const hasSuspiciousLinks = /bit\.ly|tinyurl|click here|verify your account/i.test(emailContent);
  const hasPasswordRequest = /password|otp|pin|ssn|credit card/i.test(emailContent);
  const hasHeader = emailHeader.length > 0;
  
  let status: Status = "safe";
  let riskScore = 15;

  if (hasPasswordRequest && hasSuspiciousLinks) {
    status = "phishing";
    riskScore = 85;
  } else if (hasUrgentLanguage || hasSuspiciousLinks) {
    status = "suspicious";
    riskScore = 55;
  }

  const checks = [
    {
      label: "Sender Domain Verification",
      status: (hasHeader ? "pass" : "warning") as CheckStatus,
      description: hasHeader ? "Domain appears legitimate" : "Unable to verify without headers",
    },
    {
      label: "SPF Record Check",
      status: (hasHeader ? (status === "phishing" ? "fail" : "pass") : "warning") as CheckStatus,
      description: status === "phishing" ? "SPF record mismatch detected" : "SPF validation passed",
    },
    {
      label: "DKIM Signature Validation",
      status: (hasHeader ? (status === "phishing" ? "fail" : "pass") : "warning") as CheckStatus,
      description: status === "phishing" ? "Invalid DKIM signature" : "DKIM signature valid",
    },
    {
      label: "DMARC Policy Check",
      status: (hasHeader ? "pass" : "warning") as CheckStatus,
      description: hasHeader ? "DMARC policy enforced" : "Headers needed for DMARC check",
    },
    {
      label: "Suspicious Keywords Detection",
      status: (hasUrgentLanguage || hasPasswordRequest ? "fail" : "pass") as CheckStatus,
      description: hasUrgentLanguage ? "Urgent/threatening language detected" : "No suspicious keywords found",
    },
    {
      label: "Malicious Link Detection",
      status: (hasSuspiciousLinks ? "fail" : "pass") as CheckStatus,
      description: hasSuspiciousLinks ? "Suspicious URLs detected in content" : "No malicious links detected",
    },
  ];

  const recommendations = [];
  if (status === "phishing") {
    recommendations.push("Do not click any links in this email");
    recommendations.push("Do not reply or provide any personal information");
    recommendations.push("Report this email as phishing to your email provider");
    recommendations.push("Delete the email immediately");
  } else if (status === "suspicious") {
    recommendations.push("Verify the sender through an alternative communication channel");
    recommendations.push("Avoid clicking links directly - navigate to websites manually");
    recommendations.push("Be cautious of any requests for personal information");
  } else {
    recommendations.push("Email appears safe, but always stay vigilant");
    recommendations.push("Keep your security software up to date");
  }

  return { status, riskScore, checks, recommendations };
};

const AnalysisResults = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    const storedData = sessionStorage.getItem("analysisData");
    if (!storedData) {
      navigate("/analyze");
      return;
    }

    const { emailContent, emailHeader } = JSON.parse(storedData);
    const analysisResults = generateMockResults(emailContent, emailHeader);
    setResults(analysisResults);
  }, [navigate]);

  if (!results) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-3">Analysis Results</h1>
            <p className="text-muted-foreground">
              Review the detailed security analysis of your email below.
            </p>
          </div>

          {/* Status Badge */}
          <div className="mb-8">
            <StatusBadge status={results.status} />
          </div>

          {/* Risk Score */}
          <div className="cyber-card mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Risk Score
              </h3>
              <span className="font-mono text-2xl font-bold">
                {results.riskScore}/100
              </span>
            </div>
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${
                  results.riskScore > 70
                    ? "bg-destructive"
                    : results.riskScore > 40
                    ? "bg-warning"
                    : "bg-success"
                }`}
                style={{ width: `${results.riskScore}%` }}
              />
            </div>
          </div>

          {/* Analysis Checks */}
          <div className="cyber-card mb-8">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Analysis Details
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
            <Button variant="outline" className="flex-1 gap-2">
              <BarChart3 className="h-5 w-5" />
              View Detailed Report
            </Button>
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
