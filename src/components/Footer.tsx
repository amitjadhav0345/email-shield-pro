import { Link } from "react-router-dom";
import { Shield, Lock, FileText, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Shield className="h-8 w-8 text-primary" />
              <span className="font-bold text-lg">PhishGuard</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-md">
              Detect suspicious, spoofed, and phishing emails instantly using smart security analysis.
              Built for academic & security awareness purposes.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/analyze" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                  Analyze Email
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/phishing-signs" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                  Phishing Signs
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-primary text-sm transition-colors flex items-center gap-2">
                  <Lock className="h-3 w-3" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary text-sm transition-colors flex items-center gap-2">
                  <FileText className="h-3 w-3" />
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary text-sm transition-colors flex items-center gap-2">
                  <Mail className="h-3 w-3" />
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            © 2026 Phishing & Email Spoofing Detection System. Built for Academic & Security Awareness Purpose.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
