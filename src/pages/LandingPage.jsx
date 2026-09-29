import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, Lock, CreditCard, ArrowRight, CheckCircle, Clock } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="space-y-24 py-8">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-shield-500/10 border border-shield-500/30 text-shield-400 text-xs font-semibold tracking-wide">
          <ShieldCheck className="w-4 h-4" /> Stop Working For Free. Protect Your Retainer Scope.
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Eliminate Scope Creep. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-shield-400 via-cyan-400 to-emerald-400">
            Turn Extra Work Into Paid Retainers.
          </span>
        </h1>
        
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
          ScopeShield is the vertical client portal for boutique agencies and software contractors that monitors project contract boundaries, flags out-of-scope requests, and collects instant client signatures & payments.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-shield-500 hover:bg-shield-400 text-obsidian-950 font-bold text-sm shadow-shield-glow transition-all flex items-center justify-center gap-2"
          >
            Launch Command Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/portal/apex-robotics"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-obsidian-850 hover:bg-obsidian-800 border border-obsidian-700 text-slate-200 font-semibold text-sm transition-all"
          >
            Live Client Demo Portal
          </Link>
        </div>
      </section>

      {/* Feature Value Props */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="shield-panel p-6 space-y-3 border-obsidian-800">
          <div className="w-10 h-10 rounded-lg bg-shield-500/10 border border-shield-500/30 flex items-center justify-center text-shield-400">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">AI Scope Boundary Guard</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Every feature request is parsed against your Statement of Work. Exclusions trigger automated change orders before any work begins.
          </p>
        </div>

        <div className="shield-panel p-6 space-y-3 border-obsidian-800">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">SHA-256 Digital Signatures</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Clients legally authorize extra billable hours with typed electronic signatures and tamper-evident cryptographic audit timestamps.
          </p>
        </div>

        <div className="shield-panel p-6 space-y-3 border-obsidian-800">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CreditCard className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Instant Stripe Billing</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Deduct automatically from active monthly retainers or trigger instant Stripe Checkout sessions straight from the portal.
          </p>
        </div>
      </section>

      {/* SaaS Pricing Tiers */}
      <section className="space-y-8 max-w-4xl mx-auto">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-white">Predictable, High-ROI Pricing</h2>
          <p className="text-sm text-slate-400">One recovered billable hour pays for ScopeShield for an entire year.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          {/* Starter Plan */}
          <div className="shield-panel p-8 border-obsidian-800 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Freelancer Tier</span>
              <div className="text-4xl font-extrabold font-mono text-white">$29<span className="text-base text-slate-500 font-normal">/mo</span></div>
              <p className="text-xs text-slate-400">Perfect for solo software contractors and designers.</p>
              <ul className="space-y-2.5 text-xs text-slate-300 pt-4 border-t border-obsidian-800">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-shield-400" /> Up to 5 Active Client Portals</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-shield-400" /> Automated Scope Boundary Detection</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-shield-400" /> Retainer Burn Tracking</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-shield-400" /> Stripe Payment Integration</li>
              </ul>
            </div>
            <Link to="/dashboard" className="mt-8 w-full py-2.5 rounded-lg bg-obsidian-800 hover:bg-obsidian-750 text-white font-semibold text-xs text-center border border-obsidian-700">
              Launch Dashboard
            </Link>
          </div>

          {/* Agency Plan */}
          <div className="shield-panel p-8 border-shield-500/40 bg-obsidian-900 shadow-shield-glow flex flex-col justify-between relative">
            <div className="absolute -top-3 right-6 bg-shield-500 text-obsidian-950 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full">
              Most Popular
            </div>
            <div className="space-y-4">
              <span className="text-xs font-bold text-shield-400 uppercase tracking-wider">Agency Growth</span>
              <div className="text-4xl font-extrabold font-mono text-white">$49<span className="text-base text-slate-500 font-normal">/mo</span></div>
              <p className="text-xs text-slate-400">Engineered for digital agencies managing high-volume retainers.</p>
              <ul className="space-y-2.5 text-xs text-slate-300 pt-4 border-t border-obsidian-800">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-shield-400" /> Unlimited Client Portals</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-shield-400" /> Custom Domain Support (portal.youragency.com)</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-shield-400" /> White-label Branding</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-shield-400" /> SHA-256 Legal Audit Trail Export</li>
              </ul>
            </div>
            <Link to="/dashboard" className="mt-8 w-full py-2.5 rounded-lg bg-shield-500 hover:bg-shield-400 text-obsidian-950 font-bold text-xs text-center shadow-shield-glow">
              Launch Agency Workspace
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
