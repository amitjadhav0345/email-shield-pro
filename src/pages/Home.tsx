import { Link } from "react-router-dom";
import { Shield, Search, FileQuestion, AlertTriangle, Phone, ArrowRight, Lock, Zap, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";

const Home = () => {
  const features = [
    {
      icon: Lock,
      title: "SPF, DKIM & DMARC",
      description: "Comprehensive email authentication protocol verification",
    },
    {
      icon: Search,
      title: "Link Analysis",
      description: "Detect malicious URLs and suspicious redirects",
    },
    {
      icon: Zap,
      title: "Instant Results",
      description: "Get detailed analysis results in seconds",
    },
    {
      icon: CheckCircle,
      title: "Content Scanning",
      description: "Identify phishing keywords and suspicious patterns",
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Shield Icon with Animation */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-8 animate-float">
              <Shield className="h-10 w-10 text-primary" />
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="text-primary">Phishing</span> and{" "}
              <span className="text-primary">Email Spoofing</span>
              <br />
              Detection System
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Detect suspicious, spoofed, and phishing emails instantly using smart security analysis.
              Upload or paste email content and headers to verify authenticity and protect yourself from email-based cyber attacks.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-16">
              <Link to="/analyze">
                <Button size="lg" className="cyber-glow gap-2">
                  <Search className="h-5 w-5" />
                  Analyze Email
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button size="lg" variant="outline" className="gap-2">
                  <FileQuestion className="h-5 w-5" />
                  How It Works
                </Button>
              </Link>
              <Link to="/phishing-signs">
                <Button size="lg" variant="outline" className="gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Common Phishing Signs
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="gap-2">
                  <Phone className="h-5 w-5" />
                  Contact / Help
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Comprehensive Email Security Analysis
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="cyber-card group hover:border-primary/50 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="cyber-card max-w-3xl mx-auto text-center cyber-glow">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Check Your Email?
            </h2>
            <p className="text-muted-foreground mb-8">
              Start analyzing emails now to protect yourself from phishing attacks and email spoofing.
            </p>
            <Link to="/analyze">
              <Button size="lg" className="gap-2">
                Start Analysis Now
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;
