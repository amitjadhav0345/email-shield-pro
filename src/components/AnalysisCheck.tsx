import { Check, X, AlertTriangle } from "lucide-react";

type CheckStatus = "pass" | "fail" | "warning" | "unknown";

interface AnalysisCheckProps {
  label: string;
  status: CheckStatus;
  description?: string;
}

const statusConfig = {
  pass: {
    icon: Check,
    className: "text-success",
    bgClass: "bg-success/10",
  },
  fail: {
    icon: X,
    className: "text-destructive",
    bgClass: "bg-destructive/10",
  },
  warning: {
    icon: AlertTriangle,
    className: "text-warning",
    bgClass: "bg-warning/10",
  },
  unknown: {
    icon: AlertTriangle,
    className: "text-muted-foreground",
    bgClass: "bg-muted/10",
  },
};

const AnalysisCheck = ({ label, status, description }: AnalysisCheckProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50 border border-border">
      <div className={`flex-shrink-0 w-6 h-6 rounded-full ${config.bgClass} flex items-center justify-center`}>
        <Icon className={`h-4 w-4 ${config.className}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>
    </div>
  );
};

export default AnalysisCheck;
