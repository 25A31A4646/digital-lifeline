import { motion } from "framer-motion";
import { useAppState } from "@/context/AppStateContext";
import { AlertTriangle, ShieldAlert, WifiOff, ServerCrash, Trash2 } from "lucide-react";

const alertIcons: Record<string, any> = {
  "⚠️": AlertTriangle,
  "🚫": ShieldAlert,
  "📴": WifiOff,
  "❌": ServerCrash,
};

const staticAlerts = [
  { msg: "Prediction Confidence Low — Some files classified with <70% confidence", type: "warning" },
  { msg: "Unauthorized Access Blocked — 3 failed login attempts detected", type: "danger" },
  { msg: "Integrity Check Failed — Fragment #47 checksum mismatch (auto-repaired)", type: "danger" },
  { msg: "API Failure Detected — Backup API endpoint used successfully", type: "warning" },
];

const AlertsPage = () => {
  const { alerts, clearAlerts } = useAppState();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Edge Case Alerts</h1>
        {alerts.length > 0 && (
          <button onClick={clearAlerts} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
            <Trash2 className="h-3 w-3" /> Clear
          </button>
        )}
      </div>

      <div className="space-y-3">
        {staticAlerts.map((a, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className={`glass-card rounded-xl p-4 border-l-4 ${a.type === "danger" ? "border-l-danger" : "border-l-warning"}`}>
            <div className="flex items-start gap-3">
              <AlertTriangle className={`h-4 w-4 shrink-0 mt-0.5 ${a.type === "danger" ? "text-danger" : "text-warning"}`} />
              <p className="text-sm text-foreground">{a.msg}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {alerts.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-foreground">Live Alerts</h2>
          <div className="space-y-2">
            {alerts.map((a, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-3 text-sm text-foreground">
                {a}
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AlertsPage;
