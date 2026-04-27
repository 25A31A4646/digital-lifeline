import React, { createContext, useContext, useState } from "react";

export type Priority = "HIGH" | "MEDIUM" | "LOW";
export type RiskLevel = "Low" | "Medium" | "High";
export type DisasterType =
  | "Flood"
  | "Cyclone"
  | "Storm"
  | "Earthquake"
  | "None";

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadTime: Date;
  priority: Priority;
  confidence: number;
  aiReason: string;
  recovered: boolean;
  protected: boolean;
}

export interface DisasterState {
  city: string;
  disasterType: DisasterType;
  riskLevel: RiskLevel;
  active: boolean;
}

interface AppState {
  files: UploadedFile[];
  addFiles: (files: File[]) => void;
  disaster: DisasterState;
  setDisaster: React.Dispatch<React.SetStateAction<DisasterState>>;
  protectionProgress: number;
  setProtectionProgress: React.Dispatch<React.SetStateAction<number>>;
  protectionStep: string;
  setProtectionStep: React.Dispatch<React.SetStateAction<string>>;
  isProtecting: boolean;
  setIsProtecting: React.Dispatch<React.SetStateAction<boolean>>;
  recoveredFiles: string[];
  setRecoveredFiles: React.Dispatch<React.SetStateAction<string[]>>;
  emergencyMode: boolean;
  setEmergencyMode: React.Dispatch<React.SetStateAction<boolean>>;
  offlineMode: boolean;
  setOfflineMode: React.Dispatch<React.SetStateAction<boolean>>;
  alerts: string[];
  addAlert: (a: string) => void;
  clearAlerts: () => void;
  setFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
}

const AppStateContext = createContext<AppState | null>(null);

export const useAppState = () => {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be inside AppStateProvider");
  return ctx;
};

function classifyFile(name: string): { priority: Priority; confidence: number; reason: string } {
  const lower = name.toLowerCase();
  if (/(medical|id|emergency|patient)/.test(lower))
    return { priority: "HIGH", confidence: 92 + Math.random() * 7, reason: `File "${name}" contains keywords matching critical categories (medical/id/emergency/patient). Classified as HIGH priority for immediate protection.` };
  if (/(report|document)/.test(lower))
    return { priority: "MEDIUM", confidence: 78 + Math.random() * 15, reason: `File "${name}" matches documentation patterns (reports/documents). Classified as MEDIUM priority.` };
  if (/(log|archive)/.test(lower))
    return { priority: "LOW", confidence: 70 + Math.random() * 20, reason: `File "${name}" appears to be a log or archive file. Classified as LOW priority.` };
  return { priority: "MEDIUM", confidence: 60 + Math.random() * 25, reason: `File "${name}" does not match known critical patterns. Defaulting to MEDIUM priority based on general analysis.` };
}

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [disaster, setDisaster] = useState<DisasterState>({ city: "", disasterType: "None", riskLevel: "Low", active: false });
  const [protectionProgress, setProtectionProgress] = useState(0);
  const [protectionStep, setProtectionStep] = useState("");
  const [isProtecting, setIsProtecting] = useState(false);
  const [recoveredFiles, setRecoveredFiles] = useState<string[]>([]);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [alerts, setAlerts] = useState<string[]>([]);

  const addFiles = (newFiles: File[]) => {
    const mapped = newFiles.map((f) => {
      const { priority, confidence, reason } = classifyFile(f.name);
      return {
        id: crypto.randomUUID(),
        name: f.name,
        size: f.size,
        type: f.type || "unknown",
        uploadTime: new Date(),
        priority,
        confidence: Math.round(confidence),
        aiReason: reason,
        recovered: false,
        protected: false,
      } as UploadedFile;
    });
    setFiles((prev) => [...prev, ...mapped]);
  };

  const addAlert = (a: string) => setAlerts((prev) => [a, ...prev].slice(0, 10));
  const clearAlerts = () => setAlerts([]);

  return (
    <AppStateContext.Provider value={{ files, addFiles, setFiles, disaster, setDisaster, protectionProgress, setProtectionProgress, protectionStep, setProtectionStep, isProtecting, setIsProtecting, recoveredFiles, setRecoveredFiles, emergencyMode, setEmergencyMode, offlineMode, setOfflineMode, alerts, addAlert, clearAlerts }}>
      {children}
    </AppStateContext.Provider>
  );
};
