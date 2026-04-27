import Sidebar from "@/components/Sidebar";
import { Outlet } from "react-router-dom";
import { useAppState } from "@/context/AppStateContext";
import { motion, AnimatePresence } from "framer-motion";

const AppLayout = () => {
  const { emergencyMode, offlineMode } = useAppState();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-64 min-h-screen">
        <AnimatePresence>
          {emergencyMode && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="bg-danger text-danger-foreground text-center text-sm font-medium py-2 overflow-hidden">
              🚨 EMERGENCY MODE ACTIVE — All systems prioritizing critical data protection
            </motion.div>
          )}
        </AnimatePresence>
        {offlineMode && (
          <div className="bg-warning/20 text-warning text-center text-sm font-medium py-1.5">
            📴 Offline Mode — Operating with cached data
          </div>
        )}
        <div className="p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
