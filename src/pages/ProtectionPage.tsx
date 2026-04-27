import { useCallback } from "react";
import { motion } from "framer-motion";
import { useAppState } from "@/context/AppStateContext";
import { ShieldCheck, Lock, Scissors, Globe, CheckCircle } from "lucide-react";

const steps = [
  { icon: Lock, label: "Encrypting data…", duration: 30 },
  { icon: Scissors, label: "Splitting into fragments…", duration: 60 },
  { icon: Globe, label: "Transferring to safe regions…", duration: 100 },
];

const ProtectionPage = () => {
  const { files, setFiles, disaster, protectionProgress, setProtectionProgress, protectionStep, setProtectionStep, isProtecting, setIsProtecting, addAlert } = useAppState();

  const startProtection = useCallback(() => {
    if (isProtecting || files.length === 0) return;
    setIsProtecting(true);
    setProtectionProgress(0);

    const sorted = [...files].sort((a, b) => {
      const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      return order[a.priority] - order[b.priority];
    });

    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      setProtectionProgress(Math.min(progress, 100));

      if (progress <= 30) setProtectionStep(steps[0].label);
      else if (progress <= 60) setProtectionStep(steps[1].label);
      else setProtectionStep(steps[2].label);

      if (progress >= 100) {
        clearInterval(interval);
        setIsProtecting(false);
        setProtectionStep("Protection complete ✓");
        setFiles((prev) => prev.map((f) => ({ ...f, protected: true })));
        addAlert("✅ All files protected and transferred to safe regions");
      }
    }, 100);
  }, [isProtecting, files, setIsProtecting, setProtectionProgress, setProtectionStep, setFiles, addAlert]);

  const currentStepIndex = protectionProgress <= 30 ? 0 : protectionProgress <= 60 ? 1 : 2;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Smart Data Protection</h1>
      </div>

      {disaster.riskLevel !== "High" && !isProtecting && protectionProgress === 0 && (
        <div className="glass-card rounded-xl p-5 text-center">
          <p className="text-muted-foreground">Protection triggers when disaster risk is <span className="text-danger font-semibold">HIGH</span>. You can also trigger manually.</p>
        </div>
      )}

      <div className="glass-card rounded-xl p-5 space-y-6">
        <div className="space-y-4">
          {steps.map((step, i) => (
            <motion.div key={i} initial={{ opacity: 0.4 }} animate={{ opacity: i <= currentStepIndex && (isProtecting || protectionProgress === 100) ? 1 : 0.4 }} className="flex items-center gap-4">
              <div className={`p-2.5 rounded-lg ${i < currentStepIndex && protectionProgress > 0 ? "bg-success/20" : i === currentStepIndex && isProtecting ? "bg-primary/20" : "bg-muted"}`}>
                {i < currentStepIndex && protectionProgress > 0 ? (
                  <CheckCircle className="h-5 w-5 text-success" />
                ) : (
                  <step.icon className={`h-5 w-5 ${i === currentStepIndex && isProtecting ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
                )}
              </div>
              <span className={`text-sm font-medium ${i === currentStepIndex && isProtecting ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</span>
            </motion.div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{protectionStep || "Ready"}</span>
            <span className="font-mono text-foreground">{protectionProgress}%</span>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <motion.div animate={{ width: `${protectionProgress}%` }} transition={{ duration: 0.3 }} className="h-full rounded-full bg-gradient-to-r from-primary to-success" />
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          Transfer order: <span className="text-danger">HIGH</span> → <span className="text-warning">MEDIUM</span> → <span className="text-success">LOW</span>
        </div>

        <button onClick={startProtection} disabled={isProtecting || files.length === 0} className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-opacity">
          {isProtecting ? "Protecting..." : protectionProgress === 100 ? "✓ Protected" : "Start Protection"}
        </button>
      </div>
    </div>
  );
};

export default ProtectionPage;
