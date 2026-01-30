import { Shield, AlertTriangle, XCircle } from "lucide-react";

type Status = "safe" | "suspicious" | "phishing";

interface StatusBadgeProps {
  status: Status;
  size?: "sm" | "lg";
}

const statusConfig = {
  safe: {
    icon: Shield,
    label: "SAFE",
    className: "status-safe cyber-glow-success",
    bgClass: "bg-success/10",
  },
  suspicious: {
    icon: AlertTriangle,
    label: "SUSPICIOUS",
    className: "status-suspicious cyber-glow-warning",
    bgClass: "bg-warning/10",
  },
  phishing: {
    icon: XCircle,
    label: "PHISHING DETECTED",
    className: "status-danger cyber-glow-danger",
    bgClass: "bg-destructive/10",
  },
};

const StatusBadge = ({ status, size = "lg" }: StatusBadgeProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  if (size === "sm") {
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.className}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    );
  }

  return (
    <div className={`rounded-xl border p-6 text-center ${config.className}`}>
      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${config.bgClass} mb-4`}>
        <Icon className="h-8 w-8" />
      </div>
      <h2 className="text-xl font-bold mb-1">Email Status</h2>
      <p className="text-2xl font-bold font-mono">{config.label}</p>
    </div>
  );
};

export default StatusBadge;
