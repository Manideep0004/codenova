import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Shield, Cpu, Activity, ArrowRight, CheckCircle2, Lock } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-200 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <header className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-500/20">
            <Terminal size={24} />
          </div>
          <span className="font-extrabold text-xl text-white tracking-wide">CodeNova</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white transition">
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-12 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-800 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-8">
          <Shield size={14} /> Cloud-Native Secure Code Execution Platform
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-3xl mb-6">
          Execute Untrusted Code with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Zero Host Risk</span>
        </h1>

        <p className="text-lg text-gray-400 max-w-2xl mb-10 leading-relaxed">
          Decoupled microservices architecture on Amazon EKS with Redis Bull queuing, ephemeral air-gapped Docker sandboxes, Linux cgroup limits, and full Prometheus/Grafana observability.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <Link
            to="/login"
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
          >
            <span>Launch Platform</span>
            <ArrowRight size={18} />
          </Link>
          <Link
            to="/register"
            className="px-8 py-3.5 rounded-xl text-base font-semibold text-gray-300 bg-gray-800/80 hover:bg-gray-800 border border-gray-700 transition"
          >
            Create Free Account
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full mt-4">
          <div className="p-6 rounded-2xl bg-[#161b22] border border-gray-800 shadow-lg">
            <div className="p-3 bg-indigo-600/10 text-indigo-400 rounded-xl w-fit mb-4 border border-indigo-500/20">
              <Lock size={20} />
            </div>
            <h3 className="font-bold text-white text-base mb-2">Air-Gapped Sandboxing</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Untrusted code runs in disposable containers with <code className="text-indigo-300">--network none</code>, 256MB RAM, 1.0 vCPU, and capability revocation (CapDrop=ALL).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#161b22] border border-gray-800 shadow-lg">
            <div className="p-3 bg-emerald-600/10 text-emerald-400 rounded-xl w-fit mb-4 border border-emerald-500/20">
              <Cpu size={20} />
            </div>
            <h3 className="font-bold text-white text-base mb-2">Decoupled Queue & Worker</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Sub-100ms API ingestion latency returning HTTP 202 Accepted. Workloads are buffered in Redis 7 and processed asynchronously by dedicated workers.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#161b22] border border-gray-800 shadow-lg">
            <div className="p-3 bg-cyan-600/10 text-cyan-400 rounded-xl w-fit mb-4 border border-cyan-500/20">
              <Activity size={20} />
            </div>
            <h3 className="font-bold text-white text-base mb-2">Full-Stack Observability</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Real-time Prometheus scraping of ingress RPS, execution times, queue depths, and ELK-compatible Winston structured JSON audit logs.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800/80 py-6 text-center text-xs text-gray-500">
        CodeNova Academic Project • Lovely Professional University • Department of CSE
      </footer>
    </div>
  );
}
