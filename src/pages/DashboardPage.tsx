import { motion } from "framer-motion";
import { useAppState } from "@/context/AppStateContext";
import { useAuth } from "@/context/AuthContext";
import {
  Files,
  AlertTriangle,
  Shield,
  Activity,
  TrendingUp
} from "lucide-react";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/* ---------------- STAT CARD ---------------- */

const StatCard = ({
  icon: Icon,
  label,
  value,
  color
}: {
  icon: any;
  label: string;
  value: string | number;
  color: string;
}) => (

  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`glass-card rounded-xl p-5 ${color}`}
  >

    <div className="flex items-center justify-between">

      <div>

        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
          {label}
        </p>

        <p className="text-2xl font-bold text-foreground mt-1">
          {value}
        </p>

      </div>

      <div className="p-3 rounded-xl bg-muted/50">
        <Icon className="h-5 w-5 text-foreground" />
      </div>

    </div>

  </motion.div>

);

/* ---------------- COLORS ---------------- */

const COLORS = [
  "hsl(0,72%,51%)",
  "hsl(32,95%,54%)",
  "hsl(145,63%,42%)"
];

/* ---------------- MAIN DASHBOARD ---------------- */

const DashboardPage = () => {

  const navigate = useNavigate();

  const { user } = useAuth();

  const {
    files,
    disaster,
    protectionProgress,
    isProtecting
  } = useAppState();

  /* 🔒 PROTECT DASHBOARD */

  useEffect(() => {

    

  }, [user, navigate]);

  /* ---------------- DATA ---------------- */

  const high =
    files.filter(
      (f) => f.priority === "HIGH"
    ).length;

  const med =
    files.filter(
      (f) => f.priority === "MEDIUM"
    ).length;

  const low =
    files.filter(
      (f) => f.priority === "LOW"
    ).length;

  const pieData = [

    { name: "High", value: high || 1 },

    { name: "Medium", value: med || 1 },

    { name: "Low", value: low || 1 },

  ];

  const barData = [

    {
      name: "HIGH",
      count: high,
      fill: "hsl(0,72%,51%)"
    },

    {
      name: "MED",
      count: med,
      fill: "hsl(32,95%,54%)"
    },

    {
      name: "LOW",
      count: low,
      fill: "hsl(145,63%,42%)"
    },

  ];

  /* ---------------- UI ---------------- */

  return (

    <div className="space-y-6">

      {/* HEADER */}

      <div>

        <h1 className="text-2xl font-bold text-foreground">

          Welcome back, {user?.name}

        </h1>

        <p className="text-muted-foreground text-sm">

          System overview — {

            user?.role === "admin"

              ? "Full access"

              : "Standard access"

          }

        </p>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <StatCard
          icon={Files}
          label="Total Files"
          value={files.length}
          color="glow-primary"
        />

        <StatCard
          icon={AlertTriangle}
          label="Critical Files"
          value={high}
          color="glow-danger"
        />

        <StatCard
          icon={Activity}
          label="Risk Level"
          value={disaster.riskLevel}
          color="glow-warning"
        />

        <StatCard
          icon={Shield}
          label="Transfer"
          value={
            isProtecting
              ? `${protectionProgress}%`
              : "Idle"
          }
          color="glow-success"
        />

      </div>

      {/* CHARTS */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* PIE CHART */}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-5"
        >

          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">

            <TrendingUp className="h-4 w-4 text-primary" />

            File Priority Distribution

          </h3>

          <ResponsiveContainer
            width="100%"
            height={200}
          >

            <PieChart>

              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                paddingAngle={5}
              >

                {pieData.map((_, i) => (

                  <Cell
                    key={i}
                    fill={COLORS[i]}
                  />

                ))}

              </Pie>

              <Tooltip />

            </PieChart>

          </ResponsiveContainer>

        </motion.div>

        {/* BAR CHART */}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-xl p-5"
        >

          <h3 className="font-semibold text-foreground mb-4">

            File Counts by Priority

          </h3>

          <ResponsiveContainer
            width="100%"
            height={220}
          >

            <BarChart data={barData}>

              <XAxis dataKey="name" />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="count"
                radius={[6, 6, 0, 0]}
              >

                {barData.map(
                  (entry, i) => (

                    <Cell
                      key={i}
                      fill={entry.fill}
                    />

                  )
                )}

              </Bar>

            </BarChart>

          </ResponsiveContainer>

        </motion.div>

      </div>

      {/* DISASTER ALERT */}

      {disaster.active && (

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.95
          }}
          animate={{
            opacity: 1,
            scale: 1
          }}
          className="glass-card rounded-xl p-5 border-danger/50 glow-danger"
        >

          <h3 className="font-semibold text-danger flex items-center gap-2">

            <AlertTriangle className="h-4 w-4" />

            Active Disaster Alert

          </h3>

          <p className="text-muted-foreground text-sm mt-1">

            {disaster.disasterType}

            {" "}detected in{" "}

            {disaster.city}

            {" "}— Risk:{" "}

            {disaster.riskLevel}

          </p>

        </motion.div>

      )}

    </div>

  );

};

export default DashboardPage;