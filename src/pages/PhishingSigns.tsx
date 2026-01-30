import { Link } from "react-router-dom";
import { Search, AlertTriangle, Link2, User, KeyRound, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";

const PhishingSigns = () => {
  const signs = [
    {
      icon: AlertTriangle,
      title: "Urgent or Threatening Language",
      description: "Phishing emails often create a sense of urgency, warning that your account will be suspended, closed, or compromised if you don't act immediately.",
      examples: ["Your account will be suspended in 24 hours", "Immediate action required", "Your password expires today"],
    },
    {
      icon: Link2,
      title: "Suspicious Links or Shortened URLs",
      description: "Attackers hide malicious destinations behind shortened URLs or links that look legitimate but lead to fake websites.",
      examples: ["bit.ly/xyz123", "Links that don't match the displayed text", "Misspelled domain names"],
    },
    {
      icon: User,
      title: "Unknown Sender Address",
      description: "Emails from addresses that don't match the claimed sender organization, or use free email services for official communications.",
      examples: ["support@bank-secure.xyz", "amazon.verify@gmail.com", "Random alphanumeric addresses"],
    },
    {
      icon: KeyRound,
      title: "Requests for Sensitive Information",
      description: "Legitimate organizations never ask for passwords, PINs, OTPs, or complete credit card numbers via email.",
      examples: ["Please verify your password", "Enter your OTP below", "Confirm your SSN to continue"],
    },
    {
      icon: Type,
      title: "Grammar and Spelling Mistakes",
      description: "Professional organizations have strict quality control. Multiple errors suggest a fraudulent email crafted by non-native speakers.",
      examples: ["Unusual capitalization", "Multiple typos", "Awkward phrasing"],
    },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-warning/10 mb-6">
              <AlertTriangle className="h-8 w-8 text-warning" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Common Phishing Signs</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Learn to identify the telltale signs of phishing emails to protect yourself from cyber attacks.
            </p>
          </div>

          {/* Signs Grid */}
          <div className="space-y-6">
            {signs.map((sign, index) => (
              <div key={index} className="cyber-card hover:border-warning/30 transition-colors">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                      <sign.icon className="h-6 w-6 text-warning" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{sign.title}</h3>
                    <p className="text-muted-foreground mb-4">{sign.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {sign.examples.map((example, i) => (
                        <span
                          key={i}
                          className="text-xs font-mono px-3 py-1.5 rounded-full bg-secondary text-muted-foreground"
                        >
                          {example}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Found a suspicious email? Analyze it now to confirm if it's a phishing attempt.
            </p>
            <Link to="/analyze">
              <Button size="lg" className="gap-2 cyber-glow">
                <Search className="h-5 w-5" />
                Check an Email Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PhishingSigns;
