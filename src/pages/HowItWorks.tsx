import { Link } from "react-router-dom";
import { ArrowLeft, Upload, Globe, Shield, FileSearch, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      icon: Upload,
      title: "Submit Email Content",
      description: "User submits email content or headers by pasting text or uploading an .eml file for analysis.",
    },
    {
      number: "02",
      icon: Globe,
      title: "Verify Sender Domain",
      description: "System extracts and verifies the sender's domain to check for known spoofing patterns.",
    },
    {
      number: "03",
      icon: Shield,
      title: "Authentication Checks",
      description: "Comprehensive verification of SPF, DKIM, and DMARC email authentication protocols.",
    },
    {
      number: "04",
      icon: FileSearch,
      title: "Content & Link Analysis",
      description: "Scan email content for suspicious keywords, malicious URLs, and phishing patterns.",
    },
    {
      number: "05",
      icon: FileText,
      title: "Risk Classification",
      description: "Generate a detailed security report with risk score and actionable recommendations.",
    },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our multi-layered analysis process ensures comprehensive detection of phishing attempts and email spoofing.
            </p>
          </div>

          {/* Steps */}
          <div className="relative">
            {/* Connection Line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-px hidden sm:block" />

            <div className="space-y-8 md:space-y-12">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`relative flex flex-col md:flex-row gap-6 md:gap-12 ${
                    index % 2 === 1 ? "md:flex-row-reverse" : ""
                  }`}
                >
                  {/* Content */}
                  <div className={`flex-1 ${index % 2 === 1 ? "md:text-right" : ""}`}>
                    <div className={`cyber-card ${index % 2 === 1 ? "md:ml-auto" : ""} max-w-md`}>
                      <div className={`flex items-center gap-3 mb-4 ${index % 2 === 1 ? "md:flex-row-reverse" : ""}`}>
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <step.icon className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-sm font-mono text-primary">{step.number}</span>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </div>

                  {/* Center Node */}
                  <div className="absolute left-8 md:left-1/2 w-4 h-4 bg-primary rounded-full md:-translate-x-1/2 hidden sm:block cyber-glow" style={{ top: "2rem" }} />

                  {/* Spacer for alternating layout */}
                  <div className="flex-1 hidden md:block" />
                </div>
              ))}
            </div>
          </div>

          {/* Back Button */}
          <div className="mt-16 text-center">
            <Link to="/">
              <Button variant="outline" size="lg" className="gap-2">
                <ArrowLeft className="h-5 w-5" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HowItWorks;
