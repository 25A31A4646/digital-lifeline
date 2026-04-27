import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppState } from "@/context/AppStateContext";
import { Brain, Info, ChevronDown, ChevronUp } from "lucide-react";

const AIPriorityPage = () => {
  const { files } = useAppState();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sorted = [...files].sort((a, b) => {
    const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return order[a.priority] - order[b.priority];
  });

  const priorityColor = (p: string) => p === "HIGH" ? "text-danger" : p === "MEDIUM" ? "text-warning" : "text-success";
  const priorityBg = (p: string) => p === "HIGH" ? "bg-danger/10 border-danger/30" : p === "MEDIUM" ? "bg-warning/10 border-warning/30" : "bg-success/10 border-success/30";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Brain className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Priority Engine</h1>
          <p className="text-muted-foreground text-sm">Automatic classification based on filename patterns</p>
        </div>
      </div>

      {files.length === 0 ? (
        <div className="glass-card rounded-xl p-10 text-center">
          <Brain className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Upload files first to see AI classifications</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {sorted.map((f, i) => (
              <motion.div key={f.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className={`glass-card rounded-xl border ${priorityBg(f.priority)} overflow-hidden`}>
                <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setExpandedId(expandedId === f.id ? null : f.id)}>
                  <div className="flex items-center gap-3">
                    <span className={`font-bold text-sm ${priorityColor(f.priority)}`}>
                      {f.priority === "HIGH" ? "🔴" : f.priority === "MEDIUM" ? "🟡" : "🟢"} {f.priority}
                    </span>
                    <span className="text-sm text-foreground font-medium">{f.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground">Confidence</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${f.priority === "HIGH" ? "bg-danger" : f.priority === "MEDIUM" ? "bg-warning" : "bg-success"}`} style={{ width: `${f.confidence}%` }} />
                        </div>
                        <span className="text-xs font-mono text-foreground">{f.confidence}%</span>
                      </div>
                    </div>
                    {expandedId === f.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </div>
                <AnimatePresence>
                  {expandedId === f.id && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4 pt-0">
                        <div className="bg-muted rounded-lg p-3 flex items-start gap-2">
                          <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-semibold text-foreground mb-1">AI Decision Explanation</p>
                            <p className="text-xs text-muted-foreground">{f.aiReason}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default AIPriorityPage;
