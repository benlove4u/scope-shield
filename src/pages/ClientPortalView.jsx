import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  ShieldAlert, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  CreditCard, 
  Layers, 
  Sparkles, 
  Send, 
  DollarSign, 
  Info, 
  Lock, 
  ChevronRight, 
  Eye, 
  Calendar,
  Check,
  Download,
  AlertTriangle
} from 'lucide-react';
import { 
  getStoredClients, 
  getStoredChangeOrders, 
  approveChangeOrder, 
  saveChangeOrder, 
  evaluateScopeBoundary 
} from '../config/supabase';

export default function ClientPortalView({ client: propClient }) {
  const { portalSlug } = useParams();
  const [clients, setClients] = useState([]);
  const [currentClient, setCurrentClient] = useState(null);
  const [changeOrders, setChangeOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('change_orders'); // change_orders | new_request | scope_matrix
  
  // Perspective Mode (Client simulation vs Agency manager)
  const [perspectiveMode, setPerspectiveMode] = useState('client'); // 'client' | 'agency'

  // Approval Modal/Drawer State
  const [selectedOrderForApproval, setSelectedOrderForApproval] = useState(null);
  const [signatureName, setSignatureName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('stripe_checkout'); // stripe_checkout | retainer_deduction | net15_invoice
  const [approvalSubmitting, setApprovalSubmitting] = useState(false);
  const [approvalSuccessOrder, setApprovalSuccessOrder] = useState(null);

  // New Request Submission State
  const [requestTitle, setRequestTitle] = useState('');
  const [requestDescription, setRequestDescription] = useState('');
  const [requestUrgency, setRequestUrgency] = useState('medium');
  const [scopeGuardAnalysis, setScopeGuardAnalysis] = useState(null);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [submittedRequestNotice, setSubmittedRequestNotice] = useState(null);

  const loadData = () => {
    const allClients = getStoredClients();
    setClients(allClients);

    let active = null;
    if (portalSlug) {
      active = allClients.find(c => c.portalSlug === portalSlug);
    }
    if (!active && propClient) {
      active = allClients.find(c => c.id === propClient.id);
    }
    if (!active && allClients.length > 0) {
      active = allClients[0];
    }
    setCurrentClient(active);

    if (active) {
      setChangeOrders(getStoredChangeOrders(active.id));
    }
  };

  useEffect(() => {
    loadData();
  }, [portalSlug, propClient]);

  // Real-time Scope Guard evaluation when user types new request
  useEffect(() => {
    if (!currentClient || (!requestTitle.trim() && !requestDescription.trim())) {
      setScopeGuardAnalysis(null);
      return;
    }

    const timer = setTimeout(() => {
      const evaluation = evaluateScopeBoundary(requestTitle, requestDescription, currentClient);
      setScopeGuardAnalysis(evaluation);
    }, 250);

    return () => clearTimeout(timer);
  }, [requestTitle, requestDescription, currentClient]);

  if (!currentClient) {
    return (
      <div className="text-center py-20 text-slate-400">
        Loading Client Portal...
      </div>
    );
  }

  const remainingHours = currentClient.retainer.totalHours - currentClient.retainer.usedHours;
  const burnPct = Math.round((currentClient.retainer.usedHours / currentClient.retainer.totalHours) * 100);
  const pendingOrders = changeOrders.filter(co => co.status === 'pending_client_approval');
  const approvedOrders = changeOrders.filter(co => co.status === 'approved');

  // Handle Sign-off and Approval submission
  const handleApproveChangeOrder = async (e) => {
    e.preventDefault();
    if (!signatureName.trim() || !selectedOrderForApproval) return;

    setApprovalSubmitting(true);

    try {
      if (paymentMethod === 'stripe_checkout') {
        const response = await fetch('/api/create-change-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            changeOrderId: selectedOrderForApproval.id,
            clientName: currentClient.name,
            requestTitle: selectedOrderForApproval.requestTitle,
            amount: selectedOrderForApproval.amount,
            returnUrl: window.location.href,
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.checkoutUrl) {
            window.location.href = data.checkoutUrl;
            return;
          }
        }
      }

      // Fallback for non-Stripe or offline
      const approved = approveChangeOrder(
        selectedOrderForApproval.id,
        `${signatureName.trim()} (Electronic Sign-off)`,
        paymentMethod
      );

      setApprovalSuccessOrder(approved);
      setSelectedOrderForApproval(null);
      setSignatureName('');
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setApprovalSubmitting(false);
    }
  };

  // Handle New Scope Request Submission
  const handleNewRequestSubmit = (e) => {
    e.preventDefault();
    if (!requestTitle.trim() || !requestDescription.trim()) return;

    setIsSubmittingRequest(true);

    const evaluation = scopeGuardAnalysis || evaluateScopeBoundary(requestTitle, requestDescription, currentClient);
    const hours = evaluation.recommendedHours || 12;
    const rate = currentClient.retainer.hourlyRate;
    const amount = hours * rate;

    const newOrder = {
      id: `co_${Date.now().toString().slice(-4)}`,
      clientId: currentClient.id,
      requestTitle: requestTitle.trim(),
      requestedBy: perspectiveMode === 'client' ? currentClient.contactEmail : 'Agency Team on behalf of Client',
      requestedAt: new Date().toISOString(),
      status: evaluation.isScopeCreep ? 'pending_client_approval' : 'approved',
      urgency: requestUrgency,
      estimatedHours: hours,
      amount: amount,
      scopeClassification: evaluation.classification,
      scopeAnalysis: evaluation.explanation,
      lineItems: [
        {
          description: `${requestTitle.trim()} - Implementation & Engineering`,
          hours: Math.round(hours * 0.7),
          rate: rate,
        },
        {
          description: 'Quality assurance, regression testing & deployment verification',
          hours: Math.round(hours * 0.3),
          rate: rate,
        }
      ],
      billingOption: evaluation.isScopeCreep ? 'stripe_checkout' : 'retainer_deduction',
      clientSignature: evaluation.isScopeCreep ? null : 'Auto-authorized under MSA retainer',
      signedAt: evaluation.isScopeCreep ? null : new Date().toISOString(),
    };

    saveChangeOrder(newOrder);

    // If within retainer, deduct hours immediately
    if (!evaluation.isScopeCreep) {
      approveChangeOrder(newOrder.id, 'Retainer auto-drawdown', 'retainer_deduction');
    }

    setSubmittedRequestNotice({
      title: newOrder.requestTitle,
      isScopeCreep: evaluation.isScopeCreep,
      amount: newOrder.amount,
      id: newOrder.id,
    });

    setRequestTitle('');
    setRequestDescription('');
    setScopeGuardAnalysis(null);
    setIsSubmittingRequest(false);
    loadData();
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Client Header & Simulated Perspective Toggle */}
      <div className="shield-panel p-6 border-obsidian-800 bg-gradient-to-r from-obsidian-900 via-obsidian-850 to-obsidian-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Client Identity */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="text-4xl p-3 bg-obsidian-950 rounded-2xl border border-obsidian-750 shadow-md">
              {currentClient.companyLogo}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {currentClient.name}
                </h1>
                <span className="badge-shield font-mono text-[11px]">
                  MSA SHIELD ENFORCED
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Project: <span className="text-cyan-400 font-semibold">{currentClient.project.name}</span> • Contact: {currentClient.contactEmail}
              </p>
            </div>
          </div>

          {/* Perspective Mode Switcher */}
          <div className="flex items-center gap-3 self-end md:self-center">
            <div className="bg-obsidian-950 p-1 rounded-xl border border-obsidian-800 flex items-center gap-1 text-xs">
              <button
                onClick={() => setPerspectiveMode('client')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  perspectiveMode === 'client' 
                    ? 'bg-shield-500 text-obsidian-950 font-bold shadow-shield-glow' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Client View</span>
              </button>
              <button
                onClick={() => setPerspectiveMode('agency')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  perspectiveMode === 'agency' 
                    ? 'bg-obsidian-800 text-cyan-300 font-semibold border border-cyan-500/30' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Agency View</span>
              </button>
            </div>
          </div>

        </div>

        {/* Retainer & Contract Summary Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-obsidian-800/80">
          
          <div className="bg-obsidian-950/70 p-3.5 rounded-xl border border-obsidian-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" /> Retainer Balance
              </span>
              <span className="font-mono text-slate-500">{burnPct}% Burned</span>
            </div>
            <div className="text-lg font-bold font-mono text-white">
              {remainingHours.toFixed(1)} <span className="text-xs text-slate-400 font-normal">hrs remaining of {currentClient.retainer.totalHours}h</span>
            </div>
            <div className="w-full bg-obsidian-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className={`h-full rounded-full ${remainingHours < 15 ? 'bg-rose-500' : 'bg-cyan-400'}`}
                style={{ width: `${burnPct}%` }}
              />
            </div>
          </div>

          <div className="bg-obsidian-950/70 p-3.5 rounded-xl border border-obsidian-800">
            <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Hourly Billing Rate
            </div>
            <div className="text-lg font-bold font-mono text-white">
              ${currentClient.retainer.hourlyRate} <span className="text-xs text-slate-400 font-normal">/ billable hr</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-mono">
              Next monthly cycle: {currentClient.retainer.renewalDate}
            </div>
          </div>

          <div className="bg-obsidian-950/70 p-3.5 rounded-xl border border-obsidian-800">
            <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Pending Sign-offs
            </div>
            <div className="text-lg font-bold font-mono text-amber-300">
              {pendingOrders.length} Change Orders
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-mono">
              ${pendingOrders.reduce((sum, o) => sum + o.amount, 0).toLocaleString()} awaiting authorization
            </div>
          </div>

        </div>
      </div>

      {/* Portal Tab Navigation */}
      <div className="flex border-b border-obsidian-800 gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('change_orders')}
          className={`pb-3 relative transition-all ${
            activeTab === 'change_orders' 
              ? 'text-shield-400 font-bold border-b-2 border-shield-400' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Change Orders & Approvals</span>
            {pendingOrders.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 text-xs flex items-center justify-center font-mono">
                {pendingOrders.length}
              </span>
            )}
          </div>
        </button>

        <button
          onClick={() => setActiveTab('new_request')}
          className={`pb-3 relative transition-all ${
            activeTab === 'new_request' 
              ? 'text-cyan-400 font-bold border-b-2 border-cyan-400' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>Submit Scope Request</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('scope_matrix')}
          className={`pb-3 relative transition-all ${
            activeTab === 'scope_matrix' 
              ? 'text-slate-100 font-bold border-b-2 border-slate-100' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span>Scope Boundary Matrix</span>
          </div>
        </button>
      </div>

      {/* Success Notification for Approved Order */}
      {approvalSuccessOrder && (
        <div className="bg-shield-500/10 border border-shield-500/30 rounded-xl p-4 flex items-center justify-between gap-4 text-sm animate-fadeIn">
          <div className="flex items-center gap-3 text-shield-300">
            <CheckCircle2 className="w-5 h-5 text-shield-400 flex-shrink-0" />
            <div>
              <span className="font-bold">Change Order Approved: </span>
              "{approvalSuccessOrder.requestTitle}" has been signed and queued for active engineering sprint.
            </div>
          </div>
          <button 
            onClick={() => setApprovalSuccessOrder(null)}
            className="text-xs text-slate-400 hover:text-slate-200 font-mono"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Success Notification for Newly Submitted Request */}
      {submittedRequestNotice && (
        <div className={`rounded-xl p-4 flex items-center justify-between gap-4 text-sm animate-fadeIn ${
          submittedRequestNotice.isScopeCreep 
            ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300' 
            : 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-300'
        }`}>
          <div className="flex items-center gap-3">
            {submittedRequestNotice.isScopeCreep ? (
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0" />
            )}
            <div>
              <span className="font-bold">
                {submittedRequestNotice.isScopeCreep ? 'Out-of-Scope Change Order Created: ' : 'Retainer Task Approved: '}
              </span>
              "{submittedRequestNotice.title}" has been recorded.
            </div>
          </div>
          <button 
            onClick={() => setSubmittedRequestNotice(null)}
            className="text-xs text-slate-400 hover:text-slate-200 font-mono"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 1: CHANGE ORDERS & APPROVALS WORKFLOW */}
      {activeTab === 'change_orders' && (
        <div className="space-y-6">
          
          {/* Pending Approval Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <h2 className="text-base font-bold text-white uppercase tracking-wider text-xs">
                Awaiting Authorization ({pendingOrders.length})
              </h2>
            </div>

            {pendingOrders.length === 0 ? (
              <div className="shield-panel p-8 text-center">
                <CheckCircle2 className="w-10 h-10 text-shield-400 mx-auto mb-2 opacity-80" />
                <h3 className="font-bold text-white text-base">No Pending Change Orders</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  All active features are currently within contractual boundary or already authorized.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingOrders.map(order => (
                  <div 
                    key={order.id}
                    className="shield-panel p-6 border-amber-500/30 bg-obsidian-900/95 relative overflow-hidden"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      
                      {/* Left: Request Title & Diagnosis */}
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="badge-alert">
                            <AlertCircle className="w-3 h-3" />
                            Action Required: Scope Creep Authorization
                          </span>
                          <span className="text-xs font-mono text-slate-500">#{order.id}</span>
                        </div>

                        <h3 className="text-lg font-bold text-white">
                          {order.requestTitle}
                        </h3>

                        {/* Contract Deviation Diagnostic Notice */}
                        <div className="bg-obsidian-950 p-3.5 rounded-lg border border-amber-500/20 text-xs space-y-1">
                          <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5" /> Scope Boundary Classification:
                          </div>
                          <p className="text-slate-300 leading-relaxed">
                            {order.scopeAnalysis}
                          </p>
                        </div>

                        {/* Line Items Table */}
                        <div className="pt-2">
                          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                            Itemized Scope Breakdown
                          </div>
                          <div className="bg-obsidian-950/80 rounded-lg border border-obsidian-800 divide-y divide-obsidian-800 text-xs">
                            {order.lineItems.map((item, idx) => (
                              <div key={idx} className="p-2.5 flex items-center justify-between gap-4">
                                <span className="text-slate-300">{item.description}</span>
                                <div className="text-right font-mono flex items-center gap-3 flex-shrink-0">
                                  <span className="text-slate-400">{item.hours} hrs</span>
                                  <span className="text-slate-200 font-semibold">${item.hours * item.rate}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>

                      {/* Right: Summary Card & Sign-Off Trigger */}
                      <div className="w-full md:w-72 bg-obsidian-950 p-5 rounded-xl border border-obsidian-800 flex flex-col justify-between flex-shrink-0">
                        <div>
                          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Change Order Total</span>
                          <div className="text-3xl font-extrabold font-mono text-white mt-1">
                            ${order.amount.toLocaleString()}
                          </div>
                          <div className="text-xs text-slate-400 font-mono mt-0.5">
                            {order.estimatedHours} hours @ ${currentClient.retainer.hourlyRate}/hr
                          </div>

                          <div className="my-4 pt-4 border-t border-obsidian-800 space-y-2 text-xs text-slate-400">
                            <div className="flex justify-between">
                              <span>Requested by:</span>
                              <span className="text-slate-200 font-medium truncate max-w-[140px]">{order.requestedBy}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Date:</span>
                              <span className="text-slate-200 font-mono">{new Date(order.requestedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedOrderForApproval(order)}
                          className="w-full py-2.5 rounded-xl bg-shield-500 hover:bg-shield-400 text-obsidian-950 font-bold text-sm shadow-shield-glow transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                          <Lock className="w-4 h-4" />
                          <span>Review & Authorize</span>
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Approved Orders Archive */}
          {approvedOrders.length > 0 && (
            <div className="pt-6">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-shield-400" />
                <h2 className="text-base font-bold text-white uppercase tracking-wider text-xs">
                  Executed & Signed Change Orders ({approvedOrders.length})
                </h2>
              </div>

              <div className="shield-panel overflow-hidden border-obsidian-800">
                <div className="divide-y divide-obsidian-800 text-xs">
                  {approvedOrders.map(order => (
                    <div key={order.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-obsidian-950/40 hover:bg-obsidian-850/40 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="badge-shield text-[10px]">
                            <Check className="w-3 h-3" /> Signed & Authorized
                          </span>
                          <span className="font-mono text-slate-500">#{order.id}</span>
                        </div>
                        <div className="font-bold text-white text-sm">
                          {order.requestTitle}
                        </div>
                        <div className="text-slate-400 text-[11px] font-mono">
                          Signature: <span className="text-emerald-400">{order.clientSignature}</span> • Date: {new Date(order.signedAt || order.requestedAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="text-right font-mono flex items-center gap-4">
                        <div>
                          <div className="font-bold text-white text-sm">${order.amount.toLocaleString()}</div>
                          <div className="text-[11px] text-slate-400">{order.estimatedHours} hrs ({order.billingOption})</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 2: SUBMIT NEW SCOPE REQUEST (WITH AI SCOPE GUARD) */}
      {activeTab === 'new_request' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Submission Form */}
          <div className="lg:col-span-2 shield-panel p-6">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <span>Submit Feature or Work Request</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Requests are evaluated against your Master Services Agreement in real-time by ScopeShield Guard.
              </p>
            </div>

            <form onSubmit={handleNewRequestSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Request Title / Feature Name *
                </label>
                <input
                  type="text"
                  required
                  value={requestTitle}
                  onChange={(e) => setRequestTitle(e.target.value)}
                  placeholder="e.g. Add native iOS driver push notification worker"
                  className="w-full bg-obsidian-950 border border-obsidian-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Detailed Functional Specifications *
                </label>
                <textarea
                  required
                  rows={4}
                  value={requestDescription}
                  onChange={(e) => setRequestDescription(e.target.value)}
                  placeholder="Describe technical requirements, inputs, outputs, third-party integrations, or target behavior..."
                  className="w-full bg-obsidian-950 border border-obsidian-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Urgency & Sprint Priority
                  </label>
                  <select
                    value={requestUrgency}
                    onChange={(e) => setRequestUrgency(e.target.value)}
                    className="w-full bg-obsidian-950 border border-obsidian-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="low">Standard Sprint Backlog</option>
                    <option value="medium">Next Sprint Priority</option>
                    <option value="high">Critical Expedited Sprint</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Authorized Submitter
                  </label>
                  <input
                    type="text"
                    disabled
                    value={perspectiveMode === 'client' ? currentClient.contactEmail : 'agency-admin@scopeshield.io'}
                    className="w-full bg-obsidian-950/60 border border-obsidian-800 rounded-xl px-3 py-2 text-sm text-slate-400 font-mono cursor-not-allowed"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingRequest || !requestTitle.trim() || !requestDescription.trim()}
                className="w-full py-3 mt-4 rounded-xl bg-gradient-to-r from-shield-500 to-cyan-500 hover:from-shield-400 hover:to-cyan-400 disabled:opacity-50 text-obsidian-950 font-bold text-sm shadow-shield-glow transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit to Engineering Queue</span>
              </button>
            </form>
          </div>

          {/* Real-time Scope Shield Guard Evaluation Card */}
          <div className="shield-panel p-6 border-obsidian-800">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              <ShieldCheck className="w-4 h-4 text-shield-400" />
              <span>Real-Time Scope Analysis</span>
            </div>

            {scopeGuardAnalysis ? (
              <div className="space-y-4 animate-fadeIn">
                <div className={`p-4 rounded-xl border ${
                  scopeGuardAnalysis.isScopeCreep 
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-200' 
                    : 'bg-shield-500/10 border-shield-500/30 text-shield-200'
                }`}>
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {scopeGuardAnalysis.isScopeCreep ? (
                      <>
                        <ShieldAlert className="w-4 h-4 text-amber-400" />
                        <span>Scope Creep Detected (Out-of-Scope)</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-shield-400" />
                        <span>Within Contractual Scope</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs mt-2 leading-relaxed opacity-90">
                    {scopeGuardAnalysis.explanation}
                  </p>
                </div>

                <div className="bg-obsidian-950 p-4 rounded-xl border border-obsidian-800 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Estimated Effort:</span>
                    <span className="font-mono text-white font-bold">{scopeGuardAnalysis.recommendedHours} Hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Hourly Rate:</span>
                    <span className="font-mono text-slate-300">${scopeGuardAnalysis.recommendedRate}/hr</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-obsidian-800 font-bold">
                    <span className="text-slate-300">Total Projected Cost:</span>
                    <span className="font-mono text-shield-400">
                      ${scopeGuardAnalysis.recommendedHours * scopeGuardAnalysis.recommendedRate}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 leading-normal">
                  {scopeGuardAnalysis.isScopeCreep ? (
                    <span>💡 Submitting will generate a Change Order requiring client approval before developers start.</span>
                  ) : (
                    <span>💡 This request will be deducted directly from your monthly retainer hours balance.</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">
                Start typing your title and requirements to view instant contractual scope verification.
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 3: SCOPE BOUNDARY MATRIX */}
      {activeTab === 'scope_matrix' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* In Scope Column */}
          <div className="shield-panel p-6 border-shield-500/20">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-obsidian-800">
              <CheckCircle2 className="w-5 h-5 text-shield-400" />
              <div>
                <h3 className="font-bold text-white text-base">In-Scope Deliverables</h3>
                <p className="text-xs text-slate-400">Covered under current Master Services Agreement</p>
              </div>
            </div>

            <ul className="space-y-3">
              {currentClient.project.scopeBoundary.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs text-slate-200">
                  <span className="w-4 h-4 rounded-full bg-shield-500/20 text-shield-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Out of Scope Exclusions */}
          <div className="shield-panel p-6 border-rose-500/20">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-obsidian-800">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <div>
                <h3 className="font-bold text-white text-base">Explicit Exclusions (Out of Scope)</h3>
                <p className="text-xs text-slate-400">Requires formal signed Change Order & payment authorization</p>
              </div>
            </div>

            <ul className="space-y-3">
              {currentClient.project.explicitExclusions.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs text-slate-200">
                  <span className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                    ✕
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      )}

      {/* APPROVAL & SIGNATURE MODAL */}
      {selectedOrderForApproval && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="shield-panel max-w-xl w-full p-6 border-shield-500/30 bg-obsidian-900 shadow-2xl animate-scaleUp">
            
            <div className="flex items-center justify-between pb-4 border-b border-obsidian-800">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-shield-400" />
                <h3 className="font-bold text-white text-base">
                  Sign & Authorize Change Order #{selectedOrderForApproval.id}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedOrderForApproval(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApproveChangeOrder} className="mt-4 space-y-4">
              <div className="bg-obsidian-950 p-4 rounded-xl border border-obsidian-800">
                <div className="text-xs text-slate-400">Order Title:</div>
                <div className="text-sm font-bold text-white mt-0.5">{selectedOrderForApproval.requestTitle}</div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-obsidian-800 text-xs">
                  <span className="text-slate-400">Approved Billable Total:</span>
                  <span className="text-lg font-mono font-bold text-shield-400">
                    ${selectedOrderForApproval.amount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Authorization & Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('stripe_checkout')}
                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                      paymentMethod === 'stripe_checkout'
                        ? 'border-shield-400 bg-shield-500/10 text-white font-semibold'
                        : 'border-obsidian-800 bg-obsidian-950 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <CreditCard className="w-4 h-4 text-shield-400" />
                      <span>Credit Card / Stripe</span>
                    </div>
                    <span className="text-[10px] text-slate-500">Instant checkout settlement</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('retainer_deduction')}
                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                      paymentMethod === 'retainer_deduction'
                        ? 'border-cyan-400 bg-cyan-500/10 text-white font-semibold'
                        : 'border-obsidian-800 bg-obsidian-950 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      <span>Deduct from Retainer</span>
                    </div>
                    <span className="text-[10px] text-slate-500">Deduct {selectedOrderForApproval.estimatedHours} hrs from balance</span>
                  </button>
                </div>
              </div>

              {/* Typed Legal Signature */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Authorized Client Representative Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  placeholder="e.g. David Vance, VP of Engineering"
                  className="w-full bg-obsidian-950 border border-obsidian-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-shield-400"
                />
                <p className="text-[10px] text-slate-500 mt-1 font-mono">
                  By clicking Authorize, you legally execute this addendum to the MSA with SHA-256 timestamping.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForApproval(null)}
                  className="flex-1 py-2.5 rounded-xl bg-obsidian-800 hover:bg-obsidian-750 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={approvalSubmitting || !signatureName.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-shield-500 hover:bg-shield-400 disabled:opacity-50 text-obsidian-950 text-xs font-bold shadow-shield-glow transition-all active:scale-95"
                >
                  {approvalSubmitting ? 'Signing...' : 'Authorize & Execute'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
