import { cn } from "@/lib/utils";
import { Info, AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";

interface CalloutProps {
  type?: "info" | "warning" | "error" | "success";
  children: React.ReactNode;
}

const icons = {
  info: Info,
  warning: AlertTriangle,
  error: AlertCircle,
  success: CheckCircle,
};

const styles = {
  info: "bg-blue-500/10 border-blue-500/50 text-blue-600 dark:text-blue-400",
  warning: "bg-yellow-500/10 border-yellow-500/50 text-yellow-600 dark:text-yellow-400",
  error: "bg-red-500/10 border-red-500/50 text-red-600 dark:text-red-400",
  success: "bg-green-500/10 border-green-500/50 text-green-600 dark:text-green-400",
};

export function Callout({ type = "info", children }: CalloutProps) {
  const Icon = icons[type];

  return (
    <div className={cn("flex gap-3 rounded-lg border p-4 my-6", styles[type])}>
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
      <div className="text-sm [&>p]:m-0">{children}</div>
    </div>
  );
}
