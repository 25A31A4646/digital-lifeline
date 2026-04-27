import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppState } from "@/context/AppStateContext";
import { Wifi, WifiOff, Signal, SignalLow, Zap, Pause, Play, Package, Database, FileText, CheckCircle, AlertTriangle, Inbox } from "lucide-react";

type NetState = "strong" | "weak" | "offline";

const networkConfig: Record<NetState, { label: string; color: string; bg: string; icon: any; speed: number }> = {
  strong: { label: "Strong Network", color: "text-success", bg: "bg-success/20", icon: Wifi, speed: 4 },
  weak: { label: "Weak Network", color: "text-warning", bg: "bg-warning/20", icon: SignalLow, speed: 1 },
  offline: { label: "Offline", color: "text-danger", bg: "bg-danger/20", icon: WifiOff, speed: 0 },
};

const formatSize = (b: number) => {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(2)} MB`;
};

const LowBandwidthPage = () => {
  const { files, addAlert } = useAppState();
  const [network, setNetwork] = useState<NetState>("strong");
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [pausedAt, setPausedAt] = useState<number | null>(null);
  const [currentFile, setCurrentFile] = useState<string>("");
  const [transferred, setTransferred] = useState<string[]>([]);
  const [queue, setQueue] = useState<string[]>([]);
  const [criticalMode, setCriticalMode] = useState(false);
  const [lightweight, setLightweight] = useState(false);
  const [phase, setPhase] = useState<"idle" | "metadata" | "full" | "done">("idle");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const transferList = (() => {
    if (network === "weak" || criticalMode) return files.filter((f) => f.priority === "HIGH");
    return [...files].sort((a, b) => ({ HIGH: 0, MEDIUM: 1, LOW: 2 })[a.priority] - ({ HIGH: 0, MEDIUM: 1, LOW: 2 })[b.priority]);
  })();

  const totalOriginal = transferList.reduce((s, f) => s + f.size, 0);
  const totalCompressed = Math.round(totalOriginal * 0.42);

  // Auto-switch behavior on network change
  useEffect(() => {
    if (network === "weak") {
      setCriticalMode(true);
      addAlert("⚡ Low Internet Detected – Switching to Critical Mode");
    } else if (network === "offline") {
      setCriticalMode(false);
      if (running) {
        setPaused(true);
        setPausedAt(progress);
        addAlert(`⏸ Connection lost — Upload paused at ${progress}%`);
      }
      const newQueue = files.filter((f) => !transferred.includes(f.id)).map((f) => f.name);
      setQueue(newQueue);
      if (newQueue.length > 0) addAlert(`📴 Offline Mode – ${newQueue.length} files queued`);
    } else {
      setCriticalMode(false);
      if (paused) {
        setPaused(false);
        addAlert(`▶ Connection restored — Resuming upload from ${pausedAt}%`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network]);

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const startTransfer = () => {
    if (transferList.length === 0 || network === "offline") {
      if (network === "offline") addAlert("📴 Cannot transfer — Offline. Files queued.");
      return;
    }
    setRunning(true);
    setPaused(false);
    setProgress(0);
    setTransferred([]);
    setPhase(lightweight ? "metadata" : "full");
    setCurrentFile(transferList[0]?.name || "");

    let p = pausedAt ?? 0;
    intervalRef.current = setInterval(() => {
      if (paused) return;
      const speed = networkConfig[network].speed;
      if (speed === 0) return;
      p += speed * 0.5;
      const clamped = Math.min(p, 100);
      setProgress(Math.round(clamped));

      const idx = Math.min(Math.floor((clamped / 100) * transferList.length), transferList.length - 1);
      setCurrentFile(transferList[idx]?.name || "");

      if (clamped >= 100) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setTransferred(transferList.map((f) => f.id));
        if (lightweight && phase === "metadata") {
          setPhase("full");
          addAlert("✓ Metadata recovered — Fetching full files...");
          setTimeout(() => {
            setPhase("done");
            setRunning(false);
            addAlert("✅ Lightweight Recovery complete");
          }, 1500);
        } else {
          setPhase("done");
          setRunning(false);
          setPausedAt(null);
          addAlert("✅ Transfer complete");
        }
      }
    }, 100);
  };

  const togglePause = () => {
    if (!running) return;
    if (paused) {
      setPaused(false);
      addAlert(`▶ Resuming from ${progress}%`);
    } else {
      setPaused(true);
      setPausedAt(progress);
      addAlert(`⏸ Upload paused at ${progress}%`);
    }
  };

  const NetIcon = networkConfig[network].icon;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Signal className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Low Bandwidth Handling</h1>
      </div>

      {/* Network Detection */}
      <div className="glass-card rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Network Status</h3>
          <motion.div key={network} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${networkConfig[network].bg}`}>
            <NetIcon className={`h-4 w-4 ${networkConfig[network].color} ${network === "strong" ? "" : "animate-pulse"}`} />
            <span className={`text-xs font-bold ${networkConfig[network].color}`}>{networkConfig[network].label.toUpperCase()}</span>
          </motion.div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {(["strong", "weak", "offline"] as NetState[]).map((n) => {
            const Icon = networkConfig[n].icon;
            const active = network === n;
            return (
              <button key={n} onClick={() => setNetwork(n)} className={`p-4 rounded-xl border transition-all ${active ? "border-primary bg-primary/10 scale-105" : "border-border bg-muted/30 hover:bg-muted/60"}`}>
                <Icon className={`h-6 w-6 mx-auto mb-2 ${active ? networkConfig[n].color : "text-muted-foreground"}`} />
                <span className={`text-xs font-medium ${active ? "text-foreground" : "text-muted-foreground"}`}>{networkConfig[n].label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mode banners */}
      <AnimatePresence>
        {criticalMode && network === "weak" && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-3 p-4 rounded-xl bg-warning/10 border border-warning/30">
            <Zap className="h-5 w-5 text-warning animate-pulse" />
            <p className="text-sm text-warning font-medium">Low Internet Detected – Switching to Critical Mode (HIGH priority only)</p>
          </motion.div>
        )}
        {network === "offline" && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-3 p-4 rounded-xl bg-danger/10 border border-danger/30">
            <Inbox className="h-5 w-5 text-danger animate-pulse" />
            <p className="text-sm text-danger font-medium">Offline Mode – {queue.length} files queued for transfer when reconnected</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compression */}
      <div className="glass-card rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">File Compression</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-muted/40">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Original</div>
            <div className="font-mono text-foreground font-bold mt-1">{formatSize(totalOriginal)}</div>
          </div>
          <div className="p-3 rounded-lg bg-success/10">
            <div className="text-[10px] uppercase tracking-wider text-success">Compressed</div>
            <div className="font-mono text-success font-bold mt-1">{formatSize(totalCompressed)}</div>
          </div>
          <div className="p-3 rounded-lg bg-primary/10">
            <div className="text-[10px] uppercase tracking-wider text-primary">Savings</div>
            <div className="font-mono text-primary font-bold mt-1">{totalOriginal > 0 ? Math.round((1 - totalCompressed / totalOriginal) * 100) : 0}%</div>
          </div>
        </div>
      </div>

      {/* Lightweight Recovery toggle */}
      <div className="glass-card rounded-xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-semibold text-foreground text-sm">Lightweight Recovery Mode</h3>
            <p className="text-xs text-muted-foreground">Recover metadata first, then full files</p>
          </div>
        </div>
        <button onClick={() => setLightweight(!lightweight)} className={`relative w-12 h-6 rounded-full transition-colors ${lightweight ? "bg-primary" : "bg-muted"}`}>
          <motion.div animate={{ x: lightweight ? 24 : 2 }} className="absolute top-0.5 w-5 h-5 rounded-full bg-background" />
        </button>
      </div>

      {/* Transfer Panel */}
      <div className="glass-card rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Transfer ({transferList.length} files)</h3>
          {lightweight && phase !== "idle" && (
            <span className={`text-xs font-bold px-2 py-1 rounded ${phase === "metadata" ? "bg-primary/20 text-primary" : phase === "full" ? "bg-warning/20 text-warning" : "bg-success/20 text-success"}`}>
              {phase === "metadata" ? "📋 METADATA" : phase === "full" ? "📦 FULL FILES" : "✓ DONE"}
            </span>
          )}
        </div>

        {currentFile && running && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <FileText className="h-3 w-3" />
            <span>Transferring: <span className="text-foreground font-mono">{currentFile}</span></span>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {paused ? `⏸ Upload paused at ${progress}%` : running ? "Transferring..." : phase === "done" ? "Complete ✓" : "Ready"}
            </span>
            <span className="font-mono text-foreground">{progress}%</span>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden relative">
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
              className={`h-full rounded-full ${paused ? "bg-warning" : network === "weak" ? "bg-gradient-to-r from-warning to-warning/60" : "bg-gradient-to-r from-primary to-success"}`}
            />
            {running && !paused && (
              <motion.div className="absolute top-0 h-full w-8 bg-foreground/20" animate={{ x: ["-32px", "100%"] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} />
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={startTransfer} disabled={running || transferList.length === 0 || network === "offline"} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-opacity">
            {phase === "done" ? "✓ Done — Restart" : pausedAt ? "Resume Transfer" : "Start Transfer"}
          </button>
          <button onClick={togglePause} disabled={!running} className="px-4 py-2.5 bg-muted text-foreground rounded-lg font-medium text-sm hover:bg-muted/80 disabled:opacity-50 transition-opacity flex items-center gap-1.5">
            {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            {paused ? "Resume" : "Pause"}
          </button>
        </div>

        {transferList.length === 0 && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/40">
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">No files to transfer. Upload files first.</p>
          </div>
        )}
      </div>

      {/* Offline Queue */}
      {queue.length > 0 && (
        <div className="glass-card rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Inbox className="h-5 w-5 text-warning" />
            <h3 className="font-semibold text-foreground">Offline Queue ({queue.length})</h3>
          </div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {queue.map((name, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 p-2 rounded bg-muted/40 text-xs">
                <FileText className="h-3 w-3 text-muted-foreground shrink-0" />
                <span className="text-foreground font-mono truncate">{name}</span>
                <span className="ml-auto text-warning text-[10px] font-bold">QUEUED</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {transferred.length > 0 && phase === "done" && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-3 p-4 rounded-xl bg-success/10 border border-success/30">
          <CheckCircle className="h-5 w-5 text-success" />
          <p className="text-sm text-success font-bold">{transferred.length} files transferred successfully</p>
        </motion.div>
      )}
    </div>
  );
};

export default LowBandwidthPage;
