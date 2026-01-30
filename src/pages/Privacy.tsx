import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";

const Privacy = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="cyber-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">Privacy Policy</h1>
            </div>

            <div className="prose prose-invert prose-sm max-w-none space-y-6 text-muted-foreground">
              <p>
                <strong className="text-foreground">Last updated:</strong> January 2026
              </p>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3">Data Collection</h2>
                <p>
                  When you use our Phishing Detection System, we may temporarily process email content and headers that you submit for analysis. This data is used solely for the purpose of detecting potential phishing attempts.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3">Data Storage</h2>
                <p>
                  We do not permanently store the email content you submit for analysis. All submitted data is processed in real-time and discarded after the analysis is complete.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3">Security</h2>
                <p>
                  We employ industry-standard security measures to protect any data processed through our system. All communications are encrypted using TLS/SSL protocols.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3">Third Parties</h2>
                <p>
                  We do not share, sell, or transfer your data to any third parties. The analysis is performed entirely within our secure infrastructure.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3">Contact</h2>
                <p>
                  If you have questions about this privacy policy, please contact us at privacy@phishguard.com
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

export default Privacy;
