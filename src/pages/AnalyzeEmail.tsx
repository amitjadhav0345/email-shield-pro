import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Rocket, RotateCcw, Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Layout from "@/components/Layout";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const AnalyzeEmail = () => {
  const navigate = useNavigate();
  const [emailContent, setEmailContent] = useState("");
  const [emailHeader, setEmailHeader] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleReset = () => {
    setEmailContent("");
    setEmailHeader("");
  };

  const handleAnalyze = async () => {
    if (!emailContent.trim()) {
      toast.error("Please paste email content to analyze");
      return;
    }

    setIsAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-email", {
        body: { emailContent, emailHeader },
      });

      if (error) {
        console.error("Analysis error:", error);
        toast.error(error.message || "Failed to analyze email");
        setIsAnalyzing(false);
        return;
      }

      if (data.error) {
        toast.error(data.error);
        setIsAnalyzing(false);
        return;
      }

      // Store analysis results for the results page
      sessionStorage.setItem("analysisResults", JSON.stringify(data));
      sessionStorage.setItem(
        "analysisData",
        JSON.stringify({
          emailContent,
          emailHeader,
          timestamp: new Date().toISOString(),
        })
      );
      navigate("/results");
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("An unexpected error occurred");
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setEmailContent(content);
        toast.success("Email file loaded successfully");
      };
      reader.readAsText(file);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-3">Email Analysis</h1>
            <p className="text-muted-foreground">
              Paste your email content and headers below to check for phishing and spoofing indicators.
            </p>
          </div>

          {/* Analysis Form */}
          <div className="cyber-card space-y-6">
            {/* Email Content */}
            <div className="space-y-2">
              <Label htmlFor="email-content" className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Paste Email Content
              </Label>
              <Textarea
                id="email-content"
                placeholder="Paste the full email content here including the body text..."
                className="min-h-[200px] bg-secondary/50 border-border font-mono text-sm resize-none"
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
              />
            </div>

            {/* Email Header */}
            <div className="space-y-2">
              <Label htmlFor="email-header" className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Paste Email Header (Optional)
              </Label>
              <Textarea
                id="email-header"
                placeholder="Paste email headers here (From, To, Subject, Received, etc.)..."
                className="min-h-[150px] bg-secondary/50 border-border font-mono text-sm resize-none"
                value={emailHeader}
                onChange={(e) => setEmailHeader(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Headers help verify sender authenticity through SPF, DKIM, and DMARC checks.
              </p>
            </div>

            {/* File Upload */}
            <div className="flex items-center gap-4 p-4 rounded-lg border border-dashed border-border bg-secondary/30">
              <Upload className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">Upload Email File</p>
                <p className="text-xs text-muted-foreground">Supports .eml, .txt, .doc, .docx, .pdf, .html, and more</p>
              </div>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".eml,.txt,.doc,.docx,.pdf,.msg,.html,.htm,.csv,.json,.xml,.rtf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button variant="outline" size="sm" asChild>
                  <span>Choose File</span>
                </Button>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="flex-1 gap-2 cyber-glow"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <Rocket className="h-5 w-5" />
                    Start Analysis
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={isAnalyzing}
                className="gap-2"
                size="lg"
              >
                <RotateCcw className="h-5 w-5" />
                Reset
              </Button>
            </div>
          </div>

          {/* Tips */}
          <div className="mt-8 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <h3 className="font-semibold text-sm mb-2 text-primary">💡 Tips for Better Analysis</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Include the complete email content for thorough scanning</li>
              <li>• Email headers contain important authentication data</li>
              <li>• Look for "Show original" or "View source" in your email client to get headers</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AnalyzeEmail;
