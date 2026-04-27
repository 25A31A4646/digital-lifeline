import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppState } from "@/context/AppStateContext";
import {
  Lock, Puzzle, Send, ShieldCheck, Ban, CheckCircle, AlertTriangle, KeyRound, FileLock2,
} from "lucide-react";

type Stage = "idle" | "encrypting" | "fragmenting" | "transferring" | "verifying" | "done";

const SecurityPage = () => {
  const { files, disaster, addAlert } = useAppState();
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [transferIndex, setTransferIndex] = useState(0);
  const [unauthorized, setUnauthorized] = useState(false);

  const highRiskActive = disaster.active && disaster.riskLevel === "High";

  const sortedFiles = useMemo(() => {
    const order = { HIGH: 0, MEDIUM: 1, LOW: 2 } as const;
    return [...files].sort((a, b) => order[a.priority] - order[b.priority]);
  }, [files]);

  const triggerUnauthorized = () => {
    setUnauthorized(true);
    addAlert("🚫 Unauthorized Access Blocked");
    setTimeout(() => setUnauthorized(false), 2500);
  };

  const startHardening = useCallback(() => {
    if (stage !== "idle" && stage !== "done") return;
    if (!highRiskActive) {
      triggerUnauthorized();
      return;
    }
    if (sortedFiles.length === 0) {
      addAlert("⚠️ No files to secure");
      return;
    }

    setProgress(0);
    setTransferIndex(0);
    setStage("encrypting");

    // Stage 1: Encryption
    setTimeout(() => setStage("fragmenting"), 1500);
    // Stage 2: Fragmentation
    setTimeout(() => {
      setStage("transferring");
      // Stage 3: Sequential transfer per file
      let i = 0;
      const total = sortedFiles.length;
      const interval = setInterval(() => {
        i += 1;
        setTransferIndex(i);
        setProgress(Math.round((i / total) * 100));
        if (i >= total) {
          clearInterval(interval);
          setStage("verifying");
          setTimeout(() => {
            setStage("done");
            addAlert("✔ Integrity Verified — Secure transfer complete");
          }, 1400);
        }
      }, 600);
    }, 3000);
  }, [stage, highRiskActive, sortedFiles, addAlert]);

  const stageLabel: Record<Stage, string> = {
    idle: "Awaiting HIGH risk trigger",
    encrypting: "Encrypting data… AES Encryption Enabled 🔐",
    fragmenting: "Splitting files into Part A / B / C 🧩",
    transferring: "Transferring to secure storage…",
    verifying: "Verifying file integrity…",
    done: "Integrity Verified ✔",
  };

  const stages: { key: Stage; icon: any; label: string }[] = [
    { key: "encrypting", icon: KeyRound, label: "AES Encryption" },
    { key: "fragmenting", icon: Puzzle, label: "Fragmentation (A/B/C)" },
    { key: "transferring", icon: Send, label: "Secure Transfer" },
    { key: "verifying", icon: ShieldCheck, label: "Integrity Check" },
  ];

  const stageOrder: Stage[] = ["idle", "encrypting", "fragmenting", "transferring", "verifying", "done"];
  const currentIdx = stageOrder.indexOf(stage);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Lock className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Security Hardening Simulation</h1>
      </div>

      {/* Status banner */}
      <div className={`glass-card rounded-xl p-4 flex items-center justify-between ${highRiskActive ? "border border-danger/40" : ""}`}>
        <div className="flex items-center gap-3">
          <FileLock2 className={`h-5 w-5 ${highRiskActive ? "text-danger" : "text-muted-foreground"}`} />
          <div>
            <p className="text-sm font-semibold text-foreground">
              {highRiskActive ? `HIGH RISK active — ${disaster.disasterType} in ${disaster.city}` : "System idle — No high risk detected"}
            </p>
            <p className="text-xs text-muted-foreground">{stageLabel[stage]}</p>
          </div>
        </div>
        <button
          onClick={startHardening}
          disabled={stage !== "idle" && stage !== "done"}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {stage === "done" ? "Run Again" : stage === "idle" ? "Start Hardening" : "Running…"}
        </button>
      </div>

      {/* Unauthorized Alert */}
      <AnimatePresence>
        {unauthorized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-3 p-4 rounded-lg bg-danger/15 border border-danger/40"
          >
            <Ban className="h-5 w-5 text-danger animate-pulse" />
            <p className="text-sm font-bold text-danger">Unauthorized Access Blocked 🚫 — Hardening only runs during HIGH risk events.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stage Pipeline */}
      <div className="glass-card rounded-xl p-5 space-y-4">
        <h3 className="font-semibold text-foreground text-sm">Hardening Pipeline</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {stages.map((s, i) => {
            const sIdx = stageOrder.indexOf(s.key);
            const active = currentIdx === sIdx;
            const completed = currentIdx > sIdx;
            return (
              <motion.div
                key={s.key}
                animate={{ scale: active ? 1.03 : 1 }}
                className={`p-4 rounded-lg border transition-colors ${
                  completed ? "bg-success/10 border-success/40" : active ? "bg-primary/10 border-primary/40" : "bg-muted/30 border-border"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {completed ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <s.icon className={`h-4 w-4 ${active ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
                  )}
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Step {i + 1}</span>
                </div>
                <p className={`text-sm font-medium ${active ? "text-foreground" : completed ? "text-success" : "text-muted-foreground"}`}>{s.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Progress bar */}
        {(stage === "transferring" || stage === "verifying" || stage === "done") && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Secure Transfer Progress</span>
              <span className="font-mono text-foreground">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} className="h-full bg-gradient-to-r from-primary to-success" />
            </div>
          </div>
        )}
      </div>

      {/* Fragmentation visual */}
      {(stage === "fragmenting" || currentIdx >= stageOrder.indexOf("fragmenting")) && stage !== "idle" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-5">
          <h3 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
            <Puzzle className="h-4 w-4 text-warning" /> Fragmentation Preview
          </h3>
          <div className="flex flex-wrap gap-2">
            {(["Part A", "Part B", "Part C"] as const).map((p, i) => (
              <motion.div
                key={p}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.25 }}
                className="px-3 py-2 rounded-lg bg-warning/10 border border-warning/30 text-xs font-mono text-warning"
              >
                🧩 {p}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Transfer queue by priority */}
      {stage === "transferring" || stage === "verifying" || stage === "done" ? (
        <div className="glass-card rounded-xl p-5">
          <h3 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
            <Send className="h-4 w-4 text-primary" /> Secure Transfer Queue
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {sortedFiles.map((f, i) => {
              const done = i < transferIndex;
              const active = i === transferIndex && stage === "transferring";
              const priorityColor = f.priority === "HIGH" ? "text-danger" : f.priority === "MEDIUM" ? "text-warning" : "text-success";
              return (
                <div key={f.id} className={`flex items-center justify-between p-2.5 rounded-lg border text-xs transition-colors ${
                  done ? "bg-success/5 border-success/30" : active ? "bg-primary/10 border-primary/40" : "bg-muted/30 border-border"
                }`}>
                  <div className="flex items-center gap-2 min-w-0">
                    {done ? <CheckCircle className="h-3.5 w-3.5 text-success shrink-0" /> : <Lock className={`h-3.5 w-3.5 shrink-0 ${active ? "text-primary animate-pulse" : "text-muted-foreground"}`} />}
                    <span className="truncate text-foreground">{f.name}</span>
                  </div>
                  <span className={`font-bold text-[10px] ${priorityColor}`}>{f.priority}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Done banner */}
      <AnimatePresence>
        {stage === "done" && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-3 p-4 rounded-lg bg-success/10 border border-success/40">
            <ShieldCheck className="h-5 w-5 text-success" />
            <p className="text-sm font-bold text-success">Integrity Verified ✔ — All fragments transferred securely.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Demo unauthorized trigger */}
      <div className="glass-card rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Simulate an unauthorized action to see the security block in effect.</p>
        </div>
        <button onClick={triggerUnauthorized} className="px-3 py-1.5 bg-muted text-foreground rounded-lg text-xs font-medium hover:bg-danger/20 hover:text-danger transition-colors">
          Trigger Unauthorized
        </button>
      </div>
    </div>
  );
};

export default SecurityPage;
