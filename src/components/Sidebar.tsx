import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useAppState } from "@/context/AppStateContext";
import logo from "@/assets/logo.png";
import {
  LayoutDashboard, Upload, Brain, CloudLightning, ShieldCheck, RotateCcw,
  Lock, AlertTriangle, Sun, Moon, LogOut, Zap, WifiOff, Menu, X, Signal, CloudRain, Activity
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/upload", icon: Upload, label: "File Upload" },
  { to: "/ai-engine", icon: Brain, label: "AI Priority" },
  { to: "/disaster", icon: CloudLightning, label: "Disaster Detection" },
  { to: "/weather-risk", icon: CloudRain, label: "Weather Risk" },
  { to: "/protection", icon: ShieldCheck, label: "Data Protection" },
  { to: "/recovery", icon: RotateCcw, label: "Recovery" },
  { to: "/low-bandwidth", icon: Signal, label: "Low Bandwidth" },
  { to: "/security", icon: Lock, label: "Security" },
  { to: "/alerts", icon: AlertTriangle, label: "Alerts" },
  { to: "/edge-cases", icon: Activity, label: "Edge Cases" },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const { emergencyMode, setEmergencyMode, offlineMode, setOfflineMode } = useAppState();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <>
      <button onClick={() => setCollapsed(!collapsed)} className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card rounded-lg border border-border">
        {collapsed ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform lg:translate-x-0 ${collapsed ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="p-4 flex items-center gap-3 border-b border-sidebar-border">
          <img src={logo} alt="Logo" className="w-9 h-9 rounded-lg" />
          <div className="min-w-0">
            <h2 className="font-bold text-sm text-sidebar-foreground truncate">Digital Lifeline</h2>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Disaster Protection</span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setCollapsed(false)}
              className={() => {
                const active = location.pathname === item.to;
                return `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent"}`;
              }}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 space-y-2 border-t border-sidebar-border">
          <button onClick={() => setEmergencyMode(!emergencyMode)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${emergencyMode ? "bg-danger text-danger-foreground" : "bg-muted text-muted-foreground hover:bg-danger/20 hover:text-danger"}`}>
            <Zap className="h-3.5 w-3.5" /> {emergencyMode ? "🚨 EMERGENCY ON" : "Emergency Mode"}
          </button>
          <button onClick={() => setOfflineMode(!offlineMode)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${offlineMode ? "bg-warning text-warning-foreground" : "bg-muted text-muted-foreground"}`}>
            <WifiOff className="h-3.5 w-3.5" /> {offlineMode ? "📴 OFFLINE" : "Offline Mode"}
          </button>
          <div className="flex items-center justify-between px-3 py-2">
            <button onClick={toggle} className="text-muted-foreground hover:text-foreground transition-colors">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <div className="text-xs text-muted-foreground truncate mx-2">
              {user?.name} <span className="text-[10px] uppercase bg-primary/20 text-primary px-1.5 py-0.5 rounded">{user?.role}</span>
            </div>
            <button onClick={logout} className="text-muted-foreground hover:text-danger transition-colors">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
