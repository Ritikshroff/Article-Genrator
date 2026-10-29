"use client";
// ─────────────────────────────────────────────────────────────
// Login Page — AI Stack for Edit desk (ASED)
// ─────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { useAuth } from "@/lib/authContext";
import { useToast } from "@/lib/toastContext";
import { Newspaper, Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login(username, password);
      toast.success(`Welcome back, ${username}!`);
    } catch (err: any) {
      const msg = err.message || "Login failed. Please check your credentials.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 via-zinc-100 to-zinc-200 dark:from-[#0a0a0a] dark:via-[#111] dark:to-[#161616] px-4">
      <div className="w-full max-w-md">

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img
              src="/cybermediaLogo.png"
              alt="CyberMedia"
              className="h-10 sm:h-11 w-auto object-contain"
            />
          </div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
            AI Stack for Edit Desk (ASED)
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            CyberMedia Editorial Intelligence Platform
          </p>

          {/* 3 Publication Brand Logos */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 mt-4 pt-3 border-t border-zinc-200/80 dark:border-zinc-800">
            <img src="/DQlogo.webp" alt="Dataquest" className="h-5 sm:h-5.5 w-auto object-contain max-w-[90px]" />
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <img src="/VandDLOGO.webp" alt="Voice&Data" className="h-5 sm:h-5.5 w-auto object-contain max-w-[90px]" />
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <img src="/PCquestLogo.webp" alt="PCquest" className="h-5 sm:h-5.5 w-auto object-contain max-w-[90px]" />
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 shadow-xl p-8 space-y-6">

          {/* Error Alert */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username / Email */}
            <div>
              <label htmlFor="username" className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                Username or Email
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username or @cybermedia.co.in email"
                required
                autoFocus
                className="w-full px-4 py-3 text-sm bg-zinc-50 dark:bg-[#111] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#e30613]/30 focus:border-[#e30613] transition-all placeholder:text-zinc-400"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full px-4 py-3 pr-12 text-sm bg-zinc-50 dark:bg-[#111] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#e30613]/30 focus:border-[#e30613] transition-all placeholder:text-zinc-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || !username.trim() || !password.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#e30613] hover:bg-[#b8040f] text-white font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Internal Tool Notice & Team Quick Access */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
            <details className="group">
              <summary className="text-[11px] font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer list-none flex items-center justify-between">
                <span>🔐 Team Access Directory & Quick Login</span>
                <span className="text-zinc-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="mt-2.5 space-y-2 text-[11px] text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-[#111] p-3 border border-zinc-200 dark:border-zinc-800 rounded-xs">
                <div>
                  <div className="font-black text-purple-600 dark:text-purple-400 uppercase text-[9px] tracking-wider mb-1">
                    👑 Super Admin (All Pubs + Monitor)
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {[
                      { name: "Sudesh", user: "sudesh", pass: "SudeshPrasad@123" },
                      { name: "Dhaval", user: "dhaval", pass: "Dhaval@CyberMedia2026" },
                      { name: "Ritik", user: "ritik", pass: "Ritik@CyberMedia2026" },
                      { name: "Admin", user: "admin", pass: "Admin@CyberMedia2026" },
                    ].map((u) => (
                      <button
                        key={u.user}
                        type="button"
                        onClick={() => {
                          setUsername(u.user);
                          setPassword(u.pass);
                        }}
                        className="px-2 py-1 bg-white dark:bg-zinc-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-zinc-200 dark:border-zinc-700 text-[10px] font-semibold rounded-xs cursor-pointer"
                      >
                        {u.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-1 border-t border-zinc-200/60 dark:border-zinc-800">
                  <div className="font-black text-[#00839b] uppercase text-[9px] tracking-wider mb-1">
                    📡 Voice&Data (No Cross Access)
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {[
                      { name: "Shubhendu (Editor)", user: "shubhendup", pass: "ShubhenduParth@123" },
                      { name: "Ayushi (Author)", user: "ayushis", pass: "AyushiS@123" },
                    ].map((u) => (
                      <button
                        key={u.user}
                        type="button"
                        onClick={() => {
                          setUsername(u.user);
                          setPassword(u.pass);
                        }}
                        className="px-2 py-1 bg-white dark:bg-zinc-800 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 border border-zinc-200 dark:border-zinc-700 text-[10px] font-semibold rounded-xs cursor-pointer"
                      >
                        {u.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-1 border-t border-zinc-200/60 dark:border-zinc-800">
                  <div className="font-black text-[#e30613] uppercase text-[9px] tracking-wider mb-1">
                    📰 Dataquest & CIOL (No Cross Access)
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {[
                      { name: "Shrikanth (Editor)", user: "shrikanthg", pass: "ShrikanthG@123" },
                      { name: "Deepali", user: "deepalij", pass: "DeepaliJain@123" },
                      { name: "Nikitha", user: "nikithas", pass: "NikithaS@123" },
                      { name: "Manisha", user: "manishas", pass: "ManishaS@123" },
                      { name: "Preeti", user: "preetia", pass: "PreetiA@123" },
                    ].map((u) => (
                      <button
                        key={u.user}
                        type="button"
                        onClick={() => {
                          setUsername(u.user);
                          setPassword(u.pass);
                        }}
                        className="px-2 py-1 bg-white dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/40 border border-zinc-200 dark:border-zinc-700 text-[10px] font-semibold rounded-xs cursor-pointer"
                      >
                        {u.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-1 border-t border-zinc-200/60 dark:border-zinc-800">
                  <div className="font-black text-[#2563eb] uppercase text-[9px] tracking-wider mb-1">
                    💻 PCQ (No Cross Access)
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {[
                      { name: "Ashok Pandey (Editor)", user: "ashokpa", pass: "AshokPA@123" },
                      { name: "Neha", user: "nehaj", pass: "NehaJoshi@123" },
                      { name: "Harsh", user: "harshs", pass: "HarshSharma@123" },
                      { name: "Amay", user: "amays", pass: "AmayS@123" },
                      { name: "Preeti", user: "preetia", pass: "PreetiA@123" },
                    ].map((u) => (
                      <button
                        key={u.user + "-pcq"}
                        type="button"
                        onClick={() => {
                          setUsername(u.user);
                          setPassword(u.pass);
                        }}
                        className="px-2 py-1 bg-white dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-zinc-200 dark:border-zinc-700 text-[10px] font-semibold rounded-xs cursor-pointer"
                      >
                        {u.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </details>

            <p className="text-[10px] text-zinc-400 text-center">
              CyberMedia Internal Platform • Role-Based Publication Isolation Enforced
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-zinc-400 mt-6">
          AI Stack for Edit desk (ASED) • CyberMedia © 2026
        </p>
      </div>
    </div>
  );
}
