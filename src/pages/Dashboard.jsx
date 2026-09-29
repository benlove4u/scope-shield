import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  ShieldAlert, 
  DollarSign, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight, 
  FileCheck, 
  TrendingUp, 
  Users, 
  Search,
  Filter,
  Layers,
  ChevronRight,
  Shield,
  Zap,
  Info
} from 'lucide-react';
import { getStoredClients, getStoredChangeOrders } from '../config/supabase';

export default function Dashboard({ activeClient, onSelectClient }) {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [changeOrders, setChangeOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setClients(getStoredClients());
    setChangeOrders(getStoredChangeOrders());
  }, []);

  // Compute aggregate KPIs
  const totalProtectedRevenue = clients.reduce((acc, c) => acc + (c.project?.scopeCreepProtectedValue || 0), 0);
  const pendingOrders = changeOrders.filter(co => co.status === 'pending_client_approval');
  const pendingOrdersValue = pendingOrders.reduce((acc, co) => acc + (co.amount || 0), 0);
  const approvedOrders = changeOrders.filter(co => co.status === 'approved');
  const approvedOrdersValue = approvedOrders.reduce((acc, co) => acc + (co.amount || 0), 0);

  const totalRetainerHours = clients.reduce((acc, c) => acc + c.retainer.totalHours, 0);
  const usedRetainerHours = clients.reduce((acc, c) => acc + c.retainer.usedHours, 0);
  const retainerBurnPercentage = Math.round((usedRetainerHours / totalRetainerHours) * 100);

  const filteredOrders = changeOrders.filter(co => {
    const matchesStatus = filterStatus === 'all' || co.status === filterStatus;
    const matchesSearch = co.requestTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          co.requestedBy.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Banner / Hero Metric Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-obsidian-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>Agency Command & Scope Shield</span>
            <span className="badge-shield text-xs font-mono font-medium">REALTIME GUARD</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Monitoring client contract boundaries, active retainers, and automated change order generation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(`/portal/${activeClient?.portalSlug || 'apex-robotics'}`)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-shield-500 hover:bg-shield-400 text-obsidian-950 font-bold text-sm shadow-shield-glow transition-all active:scale-95"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Simulate Client Portal</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Revenue Protected */}
        <div className="shield-panel p-5 relative overflow-hidden border-shield-500/20 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-shield-500/10 rounded-full blur-2xl group-hover:bg-shield-500/15 transition-all"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Scope Creep Protected</span>
            <div className="w-8 h-8 rounded-lg bg-shield-500/15 text-shield-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
            ${totalProtectedRevenue.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-shield-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Prevented unpaid dev work</span>
          </div>
        </div>

        {/* Metric 2: Pending Change Orders */}
        <div className="shield-panel p-5 relative overflow-hidden border-amber-500/20 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/15 transition-all"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pending Change Orders</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-300">
              {pendingOrders.length}
            </div>
            <span className="text-xs text-slate-400 font-mono">(${pendingOrdersValue.toLocaleString()} awaiting signature)</span>
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-amber-400">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Awaiting client payment approval</span>
          </div>
        </div>

        {/* Metric 3: Retainer Burn Velocity */}
        <div className="shield-panel p-5 relative overflow-hidden border-cyan-500/20 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/15 transition-all"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Aggregate Retainer Burn</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
              {retainerBurnPercentage}%
            </div>
            <span className="text-xs text-slate-400 font-mono">
              ({usedRetainerHours.toFixed(1)} / {totalRetainerHours} hrs)
            </span>
          </div>
          <div className="w-full bg-obsidian-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                retainerBurnPercentage > 80 ? 'bg-rose-500' : 'bg-cyan-400'
              }`}
              style={{ width: `${retainerBurnPercentage}%` }}
            />
          </div>
        </div>

        {/* Metric 4: Approved & Paid Orders */}
        <div className="shield-panel p-5 relative overflow-hidden border-obsidian-700 group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Approved Change Orders</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
            ${approvedOrdersValue.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
            <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{approvedOrders.length} orders signed & billed</span>
          </div>
        </div>

      </div>

      {/* Active Client Portals Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-shield-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">Active Client Portals</h2>
            <span className="text-xs font-mono text-slate-400">({clients.length} protected portals)</span>
          </div>
          <span className="text-xs text-slate-400">
            Click any portal to switch perspective
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {clients.map(client => {
            const clientOrders = changeOrders.filter(co => co.clientId === client.id);
            const clientPendingCount = clientOrders.filter(co => co.status === 'pending_client_approval').length;
            const remainingHours = client.retainer.totalHours - client.retainer.usedHours;
            const burnPct = Math.round((client.retainer.usedHours / client.retainer.totalHours) * 100);
            const isSelected = activeClient?.id === client.id;

            return (
              <div 
                key={client.id}
                onClick={() => onSelectClient(client.id)}
                className={`shield-panel p-6 cursor-pointer transition-all duration-200 relative ${
                  isSelected 
                    ? 'border-shield-500/60 ring-1 ring-shield-500/40 bg-obsidian-850' 
                    : 'shield-panel-hover'
                }`}
              >
                {/* Header: Company & Status */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 rounded-xl bg-obsidian-800 border border-obsidian-700/60">
                      {client.companyLogo}
                    </span>
                    <div>
                      <h3 className="font-bold text-white text-base group-hover:text-cyan-400 transition-colors">
                        {client.name}
                      </h3>
                      <p className="text-xs text-slate-400">{client.industry}</p>
                    </div>
                  </div>
                  {clientPendingCount > 0 ? (
                    <span className="badge-alert">
                      {clientPendingCount} Pending CO
                    </span>
                  ) : (
                    <span className="badge-shield">
                      Shield Guarded
                    </span>
                  )}
                </div>

                {/* Project Details */}
                <div className="mb-4 bg-obsidian-950/60 p-3 rounded-lg border border-obsidian-800/80">
                  <div className="text-xs text-slate-400 mb-1">Active Project</div>
                  <div className="text-sm font-semibold text-slate-200 truncate">{client.project.name}</div>
                  <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-obsidian-800">
                    <span className="text-slate-400">Base SOW:</span>
                    <span className="font-mono text-slate-300 font-medium">
                      ${client.project.baseContractValue.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Retainer Health Bar */}
                <div className="space-y-1.5 mb-5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      Retainer Remaining
                    </span>
                    <span className={`font-mono font-bold ${remainingHours < 15 ? 'text-rose-400' : 'text-slate-200'}`}>
                      {remainingHours.toFixed(1)} / {client.retainer.totalHours} hrs
                    </span>
                  </div>
                  <div className="w-full bg-obsidian-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        burnPct > 85 ? 'bg-rose-500' : burnPct > 65 ? 'bg-amber-400' : 'bg-cyan-400'
                      }`}
                      style={{ width: `${burnPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                    <span>${client.retainer.hourlyRate}/hr</span>
                    <span>Renews {client.retainer.renewalDate}</span>
                  </div>
                </div>

                {/* Bottom Action Row */}
                <div className="pt-3 border-t border-obsidian-800 flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    Protected: <span className="text-shield-400 font-mono font-semibold">+${client.project.scopeCreepProtectedValue.toLocaleString()}</span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/portal/${client.portalSlug}`);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 group-hover:translate-x-0.5 transition-all"
                  >
                    <span>Open Portal</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Scope Creep & Change Order Feed */}
      <div className="shield-panel p-6">
        
        {/* Feed Header with Filtering & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-obsidian-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <span>Scope Creep Alerts & Change Orders</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Features flagged by ScopeShield AI as exceeding Master Contract deliverables.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders..."
                className="bg-obsidian-950 border border-obsidian-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-obsidian-950 p-1 rounded-lg border border-obsidian-800 text-xs">
              <button 
                onClick={() => setFilterStatus('all')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filterStatus === 'all' ? 'bg-obsidian-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({changeOrders.length})
              </button>
              <button 
                onClick={() => setFilterStatus('pending_client_approval')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filterStatus === 'pending_client_approval' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Pending ({pendingOrders.length})
              </button>
              <button 
                onClick={() => setFilterStatus('approved')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filterStatus === 'approved' ? 'bg-shield-500/20 text-shield-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Approved ({approvedOrders.length})
              </button>
            </div>
          </div>
        </div>

        {/* Change Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No change orders match your filter criteria.
            </div>
          ) : (
            filteredOrders.map(order => {
              const client = clients.find(c => c.id === order.clientId);
              return (
                <div 
                  key={order.id}
                  className="bg-obsidian-950/70 border border-obsidian-800 rounded-xl p-4 sm:p-5 hover:border-obsidian-700 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    
                    {/* Left: Client & Order Description */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-obsidian-800 text-slate-300 border border-obsidian-700">
                          {client ? `${client.companyLogo} ${client.name}` : 'Unknown Client'}
                        </span>
                        
                        {order.status === 'pending_client_approval' && (
                          <span className="badge-alert">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                            Awaiting Client Signature
                          </span>
                        )}
                        {order.status === 'approved' && (
                          <span className="badge-shield">
                            <CheckCircle2 className="w-3 h-3" />
                            Approved & Billed
                          </span>
                        )}

                        <span className="text-xs font-mono text-slate-500">
                          ID: #{order.id}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white">
                        {order.requestTitle}
                      </h3>

                      {/* Scope Creep Diagnostic Box */}
                      <div className="bg-obsidian-900/90 border border-obsidian-800 rounded-lg p-3 text-xs flex items-start gap-2.5">
                        <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-amber-300">Scope Guard Assessment: </span>
                          <span className="text-slate-300">{order.scopeAnalysis}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono">
                        <span>Requested by: <strong className="text-slate-300">{order.requestedBy}</strong></span>
                        <span>Date: {new Date(order.requestedAt).toLocaleDateString()}</span>
                        {order.clientSignature && (
                          <span className="text-emerald-400">Signed by: {order.clientSignature}</span>
                        )}
                      </div>
                    </div>

                    {/* Right: Hours, Amount & Quick Action */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-obsidian-800">
                      <div className="text-right">
                        <div className="text-xl font-extrabold font-mono text-white">
                          ${order.amount.toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          {order.estimatedHours} Billable Hours
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (client) {
                            navigate(`/portal/${client.portalSlug}`);
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-obsidian-800 hover:bg-obsidian-750 text-xs font-semibold text-cyan-400 hover:text-cyan-300 border border-obsidian-700 transition-colors"
                      >
                        <span>Open in Portal</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

    </div>
  );
}
