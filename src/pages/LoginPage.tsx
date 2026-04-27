import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/context/AuthContext";
import logo from "@/assets/logo.png";
import { Shield, Mail, Lock, User, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const [isSignup, setIsSignup] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("user");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();
    setError("");
    setLoading(true);

    try {

      // SIGNUP
      if (isSignup) {

        const result = await signup(
          name,
          email,
          password,
          role
        );

        if (!result.success) {
          setError(result.message || "Signup failed");
          return;
        }

        setError("Account created! Please login.");
        setIsSignup(false);

      }

      // LOGIN
      else {

        const result = await login(email, password);

        if (!result.success) {
          setError(result.message || "Invalid credentials");
          return;
        }

        // 🔥 IMPORTANT: redirect after login
        navigate("/");

      }

    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="min-h-screen bg-background flex items-center justify-center p-4">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >

        {/* HEADER */}
        <div className="text-center mb-8">

          <motion.img
            src={logo}
            alt="Digital Lifeline"
            className="w-20 h-20 mx-auto mb-4 rounded-xl"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
          />

          <h1 className="text-2xl font-bold text-foreground">
            Digital Lifeline
          </h1>

          <p className="text-muted-foreground text-sm mt-1">
            AI-Powered Disaster Data Protection
          </p>

        </div>

        {/* CARD */}
        <div className="glass-card rounded-xl p-6 glow-primary">

          {/* TOGGLE */}
          <div className="flex mb-6 bg-muted rounded-lg p-1">

            <button
              onClick={() => setIsSignup(false)}
              className={`flex-1 py-2 rounded-md text-sm font-medium ${
                !isSignup
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Login
            </button>

            <button
              onClick={() => setIsSignup(true)}
              className={`flex-1 py-2 rounded-md text-sm font-medium ${
                isSignup
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Sign Up
            </button>

          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {isSignup && (
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-muted rounded-lg text-foreground text-sm"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Email"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-muted rounded-lg text-foreground text-sm"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Password"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-muted rounded-lg text-foreground text-sm"
              />
            </div>

            {isSignup && (
              <div className="flex gap-2">

                <button
                  type="button"
                  onClick={() => setRole("user")}
                  className={`flex-1 py-2 rounded-lg text-sm ${
                    role === "user"
                      ? "bg-primary text-white"
                      : "text-muted-foreground"
                  }`}
                >
                  <User className="inline h-3 w-3 mr-1" />
                  User
                </button>

                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`flex-1 py-2 rounded-lg text-sm ${
                    role === "admin"
                      ? "bg-primary text-white"
                      : "text-muted-foreground"
                  }`}
                >
                  <Shield className="inline h-3 w-3 mr-1" />
                  Admin
                </button>

              </div>
            )}

            {error && (
              <p className="text-red-500 text-sm">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary text-white rounded-lg flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {loading ? "Please wait..." : isSignup ? "Create Account" : "Login"}
              <ArrowRight className="h-4 w-4" />
            </button>

          </form>

        </div>

      </motion.div>

    </div>
  );
};

export default LoginPage;