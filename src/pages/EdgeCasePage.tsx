import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppState } from "@/context/AppStateContext";
import {
  ShieldAlert, WifiOff, FileWarning, Ban, ServerCrash, RefreshCw, DatabaseBackup,
  Globe2, CheckCircle, AlertTriangle, Activity, ScrollText, Trash2, Play,
} from "lucide-react";

type CaseKey = "prediction" | "internet" | "corruption" | "unauthorized" | "server";
type LogLevel = "info" | "warning" | "danger" | "success";

interface LogEntry {
  id: string;
  time: string;
  level: LogLevel;
  message: string;
}

const CASES: { key: CaseKey; title: string; desc: string; icon: any; color: string }[] = [
  { key: "prediction", title: "Wrong Prediction", desc: "AI confidence drops below 70%", icon: FileWarning, color: "warning" },
  { key: "internet", title: "Internet Failure", desc: "Connection drops mid-transfer", icon: WifiOff, color: "danger" },
  { key: "corruption", title: "Data Corruption", desc: "Fragment checksum mismatch", icon: ShieldAlert, color: "danger" },
  { key: "unauthorized", title: "Unauthorized Access", desc: "Invalid credentials detected", icon: Ban, color: "danger" },
  { key: "server", title: "Server Failure", desc: "Primary endpoint unreachable", icon: ServerCrash, color: "danger" },
];

const REGIONS = ["US-East", "EU-West", "AP-South", "SA-East"];

const EdgeCasePage = () => {
  const { addAlert } = useAppState();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeCase, setActiveCase] = useState<CaseKey | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [retryProgress, setRetryProgress] = useState(0);
  const [backupActive, setBackupActive] = useState(false);
  const [activeRegion, setActiveRegion] = useState(REGIONS[0]);
  const [recoveryDelayed, setRecoveryDelayed] = useState(false);
  const busyRef = useRef(false);

  const log = (level: LogLevel, message: string) => {
    const entry: LogEntry = {
      id: crypto.randomUUID(),
      time: new Date().toLocaleTimeString(),
      level,
      message,
    };
    setLogs((prev) => [entry, ...prev].slice(0, 30));
  };

  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const runCase = async (key: CaseKey) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setActiveCase(key);
    setRetryCount(0);
    setRetryProgress(0);
    setBackupActive(false);
    setRecoveryDelayed(false);

    try {
      switch (key) {
        case "prediction": {
          log("warning", "⚠️ Prediction Confidence Low — 62% on file batch");
          addAlert("⚠️ Prediction Confidence Low");
          await wait(900);
          log("info", "🔁 Re-running classification with fallback model…");
          await wait(1200);
          log("success", "✅ Re-classification complete — confidence 91%");
          break;
        }
        case "internet": {
          log("danger", "📴 Internet Failure — transfer interrupted at 47%");
          for (let i = 1; i <= 3; i++) {
            setRetryCount(i);
            log("warning", `🔁 Retrying Transfer (attempt ${i}/3)…`);
            addAlert(`🔁 Retrying Transfer (attempt ${i}/3)`);
            for (let p = 0; p <= 100; p += 20) {
              setRetryProgress(p);
              await wait(120);
            }
            if (i < 3) {
              log("danger", `❌ Attempt ${i} failed — connection unstable`);
              await wait(400);
            }
          }
          log("success", "✅ Transfer resumed and completed successfully");
          break;
        }
        case "corruption": {
          log("danger", "❌ Data Corruption — Fragment #47 checksum mismatch");
          await wait(800);
          log("warning", "🧩 Reconstructing from redundant fragments (B+C)…");
          await wait(1400);
          log("success", "✅ Auto-repair complete — integrity restored");
          break;
        }
        case "unauthorized": {
          log("danger", "🚫 Unauthorized Access Blocked — invalid token");
          addAlert("🚫 Unauthorized Access Blocked");
          await wait(700);
          log("info", "🔒 Session terminated, IP flagged for review");
          await wait(600);
          log("success", "✅ Security perimeter restored");
          break;
        }
        case "server": {
          log("danger", "💥 Server Failure — primary endpoint unreachable");
          await wait(700);
          setBackupActive(true);
          log("warning", "🛟 Backup Activated — switching to secondary cluster");
          addAlert("🛟 Backup Activated");
          await wait(900);
          const next = REGIONS[(REGIONS.indexOf(activeRegion) + 1) % REGIONS.length];
          setActiveRegion(next);
          log("info", `🌍 Fallback Region engaged: ${next}`);
          await wait(900);
          setRecoveryDelayed(true);
          log("warning", "⏳ Recovery Delayed — replication lag 12s");
          addAlert("⏳ Recovery Delayed");
          await wait(1200);
          log("success", `✅ Service restored via ${next}`);
          break;
        }
      }
    } finally {
      busyRef.current = false;
      setActiveCase(null);
    }
  };

  const levelStyles: Record<LogLevel, string> = {
    info: "border-l-primary text-foreground",
    warning: "border-l-warning text-foreground",
    danger: "border-l-danger text-foreground",
    success: "border-l-success text-foreground",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Activity className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Advanced Edge Case Handling</h1>
      </div>

      {/* Edge case grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {CASES.map((c) => {
          const running = activeCase === c.key;
          return (
            <motion.div
              key={c.key}
              animate={{ scale: running ? 1.02 : 1 }}
              className={`glass-card rounded-xl p-4 border ${running ? "border-primary/50" : "border-border"}`}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className={`p-2 rounded-lg bg-${c.color}/10`}>
                  <c.icon className={`h-4 w-4 text-${c.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.desc}</p>
                </div>
              </div>
              <button
                onClick={() => runCase(c.key)}
                disabled={!!activeCase}
                className="w-full px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-1.5"
              >
                <Play className="h-3 w-3" />
                {running ? "Simulating…" : "Simulate"}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Recovery systems */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Retry */}
        <div className="glass-card rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 text-primary ${activeCase === "internet" ? "animate-spin" : ""}`} />
            <h3 className="font-semibold text-foreground text-sm">Retry System</h3>
          </div>
          <div className="text-xs text-muted-foreground">Attempts: <span className="font-mono text-foreground">{retryCount}/3</span></div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <motion.div animate={{ width: `${retryProgress}%` }} transition={{ duration: 0.2 }} className="h-full bg-gradient-to-r from-primary to-success" />
          </div>
        </div>

        {/* Backup */}
        <div className="glass-card rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <DatabaseBackup className={`h-4 w-4 ${backupActive ? "text-success" : "text-muted-foreground"}`} />
            <h3 className="font-semibold text-foreground text-sm">Backup Recovery</h3>
          </div>
          <div className={`text-xs font-medium ${backupActive ? "text-success" : "text-muted-foreground"}`}>
            {backupActive ? "● Secondary cluster online" : "○ Standby"}
          </div>
          {recoveryDelayed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-warning flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> Recovery delayed (replication lag)
            </motion.div>
          )}
        </div>

        {/* Fallback Regions */}
        <div className="glass-card rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Globe2 className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-foreground text-sm">Fallback Regions</h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {REGIONS.map((r) => (
              <span
                key={r}
                className={`px-2 py-1 rounded-md text-[10px] font-mono border ${
                  r === activeRegion ? "bg-primary/15 border-primary/40 text-primary" : "bg-muted/30 border-border text-muted-foreground"
                }`}
              >
                {r === activeRegion ? "● " : ""}{r}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Logs */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ScrollText className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-foreground text-sm">Recovery Logs</h3>
          </div>
          {logs.length > 0 && (
            <button onClick={() => setLogs([])} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              <Trash2 className="h-3 w-3" /> Clear
            </button>
          )}
        </div>
        <div className="space-y-1.5 max-h-80 overflow-y-auto font-mono text-xs">
          <AnimatePresence initial={false}>
            {logs.length === 0 ? (
              <p className="text-muted-foreground italic text-center py-6">No events yet — run a simulation above.</p>
            ) : (
              logs.map((l) => (
                <motion.div
                  key={l.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex items-start gap-3 p-2 rounded border-l-2 bg-muted/30 ${levelStyles[l.level]}`}
                >
                  <span className="text-muted-foreground shrink-0">{l.time}</span>
                  <span className="flex-1">{l.message}</span>
                  {l.level === "success" && <CheckCircle className="h-3 w-3 text-success shrink-0" />}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default EdgeCasePage;
