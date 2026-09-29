import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ClientPortalView from './pages/ClientPortalView';
import LandingPage from './pages/LandingPage';
import { getStoredClients } from './config/supabase';
import { ShieldCheck, ShieldAlert, Layers, ExternalLink, Clock, Sparkles } from 'lucide-react';

export default function App() {
  const location = useLocation();
  const [clients, setClients] = useState([]);
  const [activeClient, setActiveClient] = useState(null);

  useEffect(() => {
    const loadedClients = getStoredClients();
    setClients(loadedClients);
    if (loadedClients.length > 0) {
      setActiveClient(loadedClients[0]);
    }
  }, []);

  const handleClientChange = (clientId) => {
    const selected = clients.find(c => c.id === clientId);
    if (selected) {
      setActiveClient(selected);
    }
  };

  const isCurrent = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 font-sans flex flex-col selection:bg-shield-500/20 selection:text-shield-400">
      {/* Global Header */}
      <header className="border-b border-obsidian-800/80 bg-obsidian-900/80 backdrop-blur-md px-4 sm:px-6 py-3.5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-shield-500/10 border border-shield-500/30 flex items-center justify-center text-shield-400 group-hover:scale-105 transition-transform shadow-shield-glow">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold tracking-wider text-base text-white">SCOPE<span className="text-shield-400">SHIELD</span></span>
                  <span className="px-1.5 py-0.5 rounded bg-shield-500/20 text-shield-400 border border-shield-500/30 text-[10px] font-mono font-bold">PRO</span>
                </div>
              </div>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-obsidian-800">
              <Link
                to="/"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isCurrent('/')
                    ? 'bg-obsidian-800 text-white border border-obsidian-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Overview
              </Link>
              <Link
                to="/dashboard"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isCurrent('/dashboard')
                    ? 'bg-obsidian-800 text-cyan-400 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </div>
              </Link>
              <Link
                to={`/portal/${activeClient?.portalSlug || 'apex-robotics'}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isCurrent('/portal')
                    ? 'bg-obsidian-800 text-shield-400 border border-shield-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Client Portal</span>
                </div>
              </Link>
            </nav>
          </div>

          {/* Client Quick Switcher */}
          <div className="flex items-center gap-3">
            {activeClient && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-obsidian-850 border border-obsidian-800 text-xs">
                <span className="text-slate-400 hidden sm:inline">Active:</span>
                <select
                  value={activeClient.id}
                  onChange={(e) => handleClientChange(e.target.value)}
                  className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id} className="bg-obsidian-900 text-slate-100">
                      {c.companyLogo} {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-shield-500/10 border border-shield-500/30 text-xs font-semibold text-shield-400">
              <span className="w-1.5 h-1.5 rounded-full bg-shield-400 animate-pulse"></span>
              <span>Guard Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard activeClient={activeClient} onSelectClient={handleClientChange} />} />
          <Route path="/portal" element={<ClientPortalView client={activeClient} />} />
          <Route path="/portal/:portalSlug" element={<ClientPortalView client={activeClient} />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="border-t border-obsidian-800/80 bg-obsidian-950/80 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-shield-500" />
            <span className="text-slate-400 font-medium">ScopeShield Platform</span>
            <span>— The Zero Unbilled Hours Operating System.</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Stripe Certified</span>
            <span>SHA-256 Audit Sealed</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
