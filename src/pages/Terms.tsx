import { Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";

const Terms = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="cyber-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">Terms of Use</h1>
            </div>

            <div className="prose prose-invert prose-sm max-w-none space-y-6 text-muted-foreground">
              <p>
                <strong className="text-foreground">Last updated:</strong> January 2026
              </p>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3">Acceptance of Terms</h2>
                <p>
                  By using the Phishing Detection System, you agree to these terms of use. If you do not agree to these terms, please do not use our service.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3">Service Description</h2>
                <p>
                  Our service provides email analysis to help identify potential phishing attempts and email spoofing. The service is provided "as is" for educational and security awareness purposes.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3">Limitations</h2>
                <p>
                  While we strive for accuracy, our analysis may not detect all phishing attempts. Users should exercise their own judgment and not rely solely on our service for email security decisions.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3">Acceptable Use</h2>
                <p>
                  You agree to use this service only for lawful purposes. You may not use this service to analyze emails without proper authorization or for any malicious purposes.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3">Disclaimer</h2>
                <p>
                  This service is provided for academic and security awareness purposes. We are not responsible for any damages or losses resulting from reliance on our analysis results.
                </p>
              </section>
            </div>

            <div className="mt-8 pt-6 border-t border-border">
              <Link to="/">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Terms;
