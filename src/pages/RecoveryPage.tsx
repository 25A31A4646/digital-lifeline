import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppState } from "@/context/AppStateContext";
import { RotateCcw, CheckCircle, Phone } from "lucide-react";

const RecoveryPage = () => {
  const { files, setFiles, recoveredFiles, setRecoveredFiles, addAlert } = useAppState();
  const [recovering, setRecovering] = useState(false);
  const [smsNumber, setSmsNumber] = useState("");
  const [smsSent, setSmsSent] = useState(false);

  const recoverData = () => {
    if (recovering) return;
    setRecovering(true);
    const sorted = [...files].filter((f) => f.protected && !f.recovered).sort((a, b) => {
      const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      return order[a.priority] - order[b.priority];
    });

    let i = 0;
    const interval = setInterval(() => {
      if (i >= sorted.length) {
        clearInterval(interval);
        setRecovering(false);
        addAlert("✅ Recovery complete — All critical data restored");
        return;
      }
      const file = sorted[i];
      setRecoveredFiles((prev) => [...prev, file.id]);
      setFiles((prev) => prev.map((f) => f.id === file.id ? { ...f, recovered: true } : f));
      i++;
    }, 500);
  };

  const sendSms = () => {
    if (!smsNumber) return;
    setSmsSent(true);
    addAlert(`📱 SMS recovery link sent to ${smsNumber}`);
    setTimeout(() => setSmsSent(false), 3000);
  };

  const protectedFiles = files.filter((f) => f.protected);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <RotateCcw className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Recovery System</h1>
      </div>

      <div className="glass-card rounded-xl p-5 space-y-4">
        <button onClick={recoverData} disabled={recovering || protectedFiles.length === 0} className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2">
          <RotateCcw className={`h-4 w-4 ${recovering ? "animate-spin" : ""}`} />
          {recovering ? "Recovering..." : "Recover Critical Data"}
        </button>

        {protectedFiles.length === 0 && (
          <p className="text-muted-foreground text-sm text-center">No protected files to recover. Run Data Protection first.</p>
        )}

        <AnimatePresence>
          {protectedFiles.map((f, i) => (
            <motion.div key={f.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className={`flex items-center justify-between p-3 rounded-lg border ${f.recovered ? "border-success/30 bg-success/5" : "border-border bg-muted/30"}`}>
              <span className="text-sm text-foreground">{f.name}</span>
              {f.recovered ? <CheckCircle className="h-4 w-4 text-success" /> : <span className="text-xs text-muted-foreground">Pending</span>}
            </motion.div>
          ))}
        </AnimatePresence>

        {recoveredFiles.length > 0 && recoveredFiles.length === protectedFiles.length && protectedFiles.length > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 rounded-lg bg-success/10 border border-success/30 text-center">
            <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
            <p className="text-success font-bold">Recovery Complete!</p>
            <p className="text-muted-foreground text-xs mt-1">All {recoveredFiles.length} files recovered successfully</p>
          </motion.div>
        )}
      </div>

      <div className="glass-card rounded-xl p-5 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> SMS Recovery Simulation</h3>
        <div className="flex gap-3">
          <input value={smsNumber} onChange={(e) => setSmsNumber(e.target.value)} placeholder="+1 (555) 000-0000" className="flex-1 px-4 py-2.5 bg-muted rounded-lg text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          <button onClick={sendSms} disabled={!smsNumber} className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
            {smsSent ? "✓ Sent" : "Send Link"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecoveryPage;
