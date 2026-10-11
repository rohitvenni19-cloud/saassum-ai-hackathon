import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { DuplicatePair, QueuedTransformation } from '../types';

interface ReviewApprovalStageProps {
  duplicatePairs: DuplicatePair[];
  onUpdateDuplicatePairs: (pairs: DuplicatePair[]) => void;
  queuedTransformations: QueuedTransformation[];
  onUpdateQueuedTransformations: (items: QueuedTransformation[]) => void;
  onNavigateBack: () => void;
  onCommitApproved: () => void;
}

export const ReviewApprovalStage: React.FC<ReviewApprovalStageProps> = ({
  duplicatePairs,
  onUpdateDuplicatePairs,
  queuedTransformations,
  onUpdateQueuedTransformations,
  onNavigateBack,
  onCommitApproved,
}) => {
  const [filterCategory, setFilterCategory] = useState<'all' | 'email' | 'date' | 'phone' | 'city'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [allApprovedAlert, setAllApprovedAlert] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleResolvePair = (pairId: string, status: DuplicatePair['resolutionStatus']) => {
    const updated = duplicatePairs.map(p => {
      if (p.id === pairId) {
        return { ...p, resolutionStatus: status };
      }
      return p;
    });
    onUpdateDuplicatePairs(updated);

    const labels: Record<string, string> = {
      merged: 'Merged candidate duplicate into primary canonical record.',
      distinct: 'Marked records as separate distinct entities.',
      linked: 'Linked records with cross-referential lineage pointer.',
      forced: 'Force merge override applied.',
    };
    showToast(labels[status] || 'Candidate decision updated.');
  };

  const handleBatchApprove = () => {
    setAllApprovedAlert(true);
    const updatedPairs = duplicatePairs.map(p => ({
      ...p,
      resolutionStatus: p.id === 'pair-card-1' ? ('merged' as const) : ('distinct' as const),
    }));
    onUpdateDuplicatePairs(updatedPairs);

    const updatedQueue = queuedTransformations.map(q => ({
      ...q,
      state: 'APPROVED' as const,
    }));
    onUpdateQueuedTransformations(updatedQueue);

    showToast('All 4 staged candidate resolutions approved.');
  };

  const handleToggleTransformState = (id: string, newState: QueuedTransformation['state']) => {
    const updated = queuedTransformations.map(item => {
      if (item.id === id) {
        return { ...item, state: newState };
      }
      return item;
    });
    onUpdateQueuedTransformations(updated);
    showToast(`Transformation state set to: ${newState}`);
  };

  const handleCommit = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {
      // safe fallback
    }
    onCommitApproved();
  };

  const filteredTransformations = queuedTransformations.filter(t => {
    if (filterCategory === 'all') return true;
    return t.category === filterCategory;
  });

  return (
    <div className="flex flex-col w-full pb-20">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="bg-[#004ac6] text-white px-4 py-2.5 rounded-lg text-sm shadow-lg flex items-center gap-2 fixed bottom-24 right-8 z-50 animate-fade-in">
          <span className="material-symbols-outlined text-[18px]">verified</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Utility Context Bar */}
      <div className="w-full bg-[#eff4ff] px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-[#cbd5e1]/40">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-xs text-[#64748b] uppercase tracking-wider font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#004ac6] animate-ping"></span>
            <span>Stage 03 / Human Arbiter</span>
          </div>
          <span className="text-[#cbd5e1] font-mono text-xs">/</span>
          <div className="flex items-center gap-1.5 font-mono text-xs text-[#0b1c30]">
            <span className="material-symbols-outlined text-[#004ac6] text-[16px]">verified_user</span>
            <span>Reversible Transaction Checkpoint:</span>
            <span className="bg-[#d3e4fe] px-1.5 py-0.5 rounded text-[#004ac6] font-bold tracking-wide">
              #TXN-8849-DRAGON
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs text-[#64748b]">
          <span className="flex items-center gap-1 text-[#005236] bg-[#6ffbbe]/30 px-2 py-0.5 rounded font-medium">
            <span className="material-symbols-outlined text-[14px]">history</span>
            Undo Stack: 8 Depths Ready
          </span>
          <span>Deterministic State: Frozen</span>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6 max-w-[1720px] mx-auto">
        {/* Section 1: Gate Review Header & Resolution Meter */}
        <section className="w-full bg-white rounded-xl shadow-sm border border-[#e2e8f0] p-5 sm:p-6 flex flex-col gap-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[22px]">gavel</span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-[#0b1c30] tracking-tight">
                    Human-in-the-Loop Approval Gate
                  </h1>
                  <span className="bg-[#ffdad6] text-[#ba1a1a] font-mono text-xs uppercase px-2 py-0.5 rounded font-bold">
                    8 Ambiguity Flags
                  </span>
                </div>
                <p className="text-sm text-[#64748b] mt-0.5">
                  8 records require human verification before destructive or high-ambiguity entity merges are executed against production models.
                </p>
              </div>
            </div>

            {/* Quick Batch Actions Toolbar */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleBatchApprove}
                className={`h-9 px-3.5 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm ${
                  allApprovedAlert ? 'bg-[#007d55] text-white' : 'bg-[#004ac6] text-white hover:bg-[#003ea8]'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">done_all</span>
                <span>{allApprovedAlert ? 'All Staged Approved!' : 'Approve Selected (4)'}</span>
              </button>
              <button
                onClick={() => showToast('Marked uncertain entities for manual inspection.')}
                className="h-9 px-3 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0b1c30] text-xs font-medium rounded-lg transition-colors border border-[#cbd5e1] flex items-center gap-1.5"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px] text-[#ba1a1a]">close</span>
                <span>Reject All Uncertain</span>
              </button>
              <button
                onClick={() => showToast('Flagged in compliance audit report log.')}
                className="h-9 px-3 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#64748b] hover:text-[#0b1c30] text-xs font-medium rounded-lg transition-colors border border-[#cbd5e1] flex items-center gap-1.5"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">bookmark_flag</span>
                <span>Skip &amp; Flag in Audit Log</span>
              </button>
            </div>
          </div>

          {/* Resolution Progress Tracker */}
          <div className="bg-[#eff4ff]/60 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#cbd5e1]/40">
            <div className="flex-1 max-w-xl flex flex-col gap-1.5">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-[#0b1c30] font-semibold uppercase tracking-wide">Verification Progress</span>
                <span className="text-[#004ac6] font-bold">4 of 8 candidates reviewed (50%)</span>
              </div>
              <div className="w-full h-2.5 bg-[#e2e8f0] rounded-full overflow-hidden flex">
                <div className="h-full bg-[#007d55] transition-all duration-300" style={{ width: '37.5%' }}></div>
                <div className="h-full bg-[#004ac6] transition-all duration-300" style={{ width: '12.5%' }}></div>
                <div className="h-full bg-[#cbd5e1] transition-all duration-300" style={{ width: '50%' }}></div>
              </div>
              <div className="flex items-center gap-4 font-mono text-xs text-[#64748b]">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#007d55]"></span> 3 Merges Staged
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#004ac6]"></span> 1 Marked Distinct
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#cbd5e1]"></span> 4 Awaiting Resolution
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 bg-white px-4 py-2.5 rounded-lg shadow-sm border border-[#cbd5e1]/50">
              <div className="text-right">
                <div className="font-mono text-[10px] uppercase text-[#64748b] font-semibold">
                  Automated Heuristic Score
                </div>
                <div className="font-mono text-sm font-bold text-[#007d55]">94.8% Engine Accuracy</div>
              </div>
              <svg className="w-10 h-10 text-[#007d55] shrink-0" viewBox="0 0 36 36">
                <path
                  className="text-[#e2e8f0]"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                ></path>
                <path
                  className="text-[#007d55]"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="94.8, 100"
                  strokeLinecap="round"
                  strokeWidth="3"
                ></path>
                <text className="text-[#0b1c30] font-mono text-[9px] font-bold" fill="currentColor" textAnchor="middle" x="18" y="21">
                  95%
                </text>
              </svg>
            </div>
          </div>
        </section>

        {/* Section 2: Side-by-Side Duplicate Conflict Arbiter */}
        <section className="w-full flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#004ac6]"></span>
                <h2 className="text-lg font-bold text-[#0b1c30] tracking-tight">Duplicate Conflict Arbiter</h2>
                <span className="bg-[#dbe1ff] text-[#00174b] font-mono text-xs uppercase px-2 py-0.5 rounded font-bold">
                  Deep Entity Resolution
                </span>
              </div>
              <p className="text-xs text-[#64748b] mt-0.5">
                Compare fuzzy cluster records side-by-side. Automated matching algorithms suggest merge lineage with high-precision confidence flags.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[#64748b] font-mono text-xs">
              <span>Sort By:</span>
              <span className="bg-[#d3e4fe] text-[#0b1c30] px-2 py-1 rounded font-semibold">
                Confidence Score (Desc)
              </span>
            </div>
          </div>

          {/* Comparison Pair 1: Vikram Sharma */}
          <div className="w-full bg-white rounded-xl shadow-sm border border-[#e2e8f0] overflow-hidden flex flex-col">
            <div className="px-5 py-3 bg-[#eff4ff] flex flex-wrap items-center justify-between gap-2 border-b border-[#cbd5e1]/40">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-[#0b1c30]">
                  Candidate Pair #01: Vikram Sharma
                </span>
                <span className="bg-[#e2e8f0] text-[#0b1c30] font-mono text-xs px-2 py-0.5 rounded">
                  Cluster ID: #CL-104
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-[#6ffbbe]/40 text-[#005236] font-mono text-xs uppercase px-2.5 py-1 rounded font-bold">
                  <span className="material-symbols-outlined text-[16px] text-[#007d55]">verified</span>
                  <span>Match Confidence: 98% (High)</span>
                </div>
                <span className="font-mono text-xs text-[#64748b]">Exact Email + Normalized Phone Hash</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-5">
              {/* Primary Source Record (Row #14) */}
              <div className="bg-white rounded-xl p-4 border border-[#e2e8f0] flex flex-col gap-2 shadow-xs relative">
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#004ac6] text-white font-mono text-xs px-2 py-0.5 rounded font-bold">
                      Row #14
                    </span>
                    <span className="font-semibold text-sm text-[#0b1c30]">Canonical Target (Primary)</span>
                  </div>
                  <span className="font-mono text-[10px] uppercase bg-[#6ffbbe] text-[#002113] px-2 py-0.5 rounded font-bold">
                    Survivor Node
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-y-2 text-xs pt-1">
                  <span className="font-mono text-[11px] uppercase text-[#64748b]">Full Name</span>
                  <span className="col-span-2 font-mono text-[#0b1c30] font-semibold">Vikram Sharma</span>
                  <span className="font-mono text-[11px] uppercase text-[#64748b]">Email Address</span>
                  <span className="col-span-2 font-mono text-[#0b1c30]">vikram.s@techcorp.in</span>
                  <span className="font-mono text-[11px] uppercase text-[#64748b]">Phone (E.164)</span>
                  <span className="col-span-2 font-mono text-[#0b1c30]">+91 98490 12345</span>
                  <span className="font-mono text-[11px] uppercase text-[#64748b]">City Location</span>
                  <span className="col-span-2 font-mono text-[#0b1c30]">Hyderabad</span>
                  <span className="font-mono text-[11px] uppercase text-[#64748b]">Signup Date</span>
                  <span className="col-span-2 font-mono text-[#0b1c30]">2023-01-15 <span className="text-[#64748b]">(ISO 8601)</span></span>
                </div>
              </div>

              {/* Secondary Duplicate Record (Row #62) */}
              <div className="bg-[#eff4ff]/60 rounded-xl p-4 border border-[#cbd5e1]/40 flex flex-col gap-2 shadow-xs relative">
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#d3e4fe] text-[#0b1c30] font-mono text-xs px-2 py-0.5 rounded font-bold">
                      Row #62
                    </span>
                    <span className="font-semibold text-sm text-[#0b1c30]">Incoming Dirty Duplicate</span>
                  </div>
                  <span className="font-mono text-[10px] uppercase bg-[#ffdad6] text-[#ba1a1a] px-2 py-0.5 rounded font-bold">
                    Archive Target
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-y-2 text-xs pt-1">
                  <span className="font-mono text-[11px] uppercase text-[#64748b]">Full Name</span>
                  <div className="col-span-2 flex items-center gap-1.5">
                    <span className="font-mono text-[#ba1a1a] bg-[#ffdad6]/40 px-1 rounded line-through">
                      VIKRAM SHARMA{' '}
                    </span>
                    <span className="material-symbols-outlined text-[#004ac6] text-[14px]">arrow_forward</span>
                    <span className="font-mono text-[#007d55] font-semibold">Standardized</span>
                  </div>
                  <span className="font-mono text-[11px] uppercase text-[#64748b]">Email Address</span>
                  <span className="col-span-2 font-mono text-[#0b1c30] font-semibold bg-[#6ffbbe]/30 px-1 rounded w-fit">
                    vikram.s@techcorp.in (100% Match)
                  </span>
                  <span className="font-mono text-[11px] uppercase text-[#64748b]">Phone (Raw)</span>
                  <div className="col-span-2 flex items-center gap-2">
                    <span className="font-mono text-[#64748b]">9849012345</span>
                    <span className="text-[#007d55] font-mono text-[10px] bg-[#6ffbbe]/30 px-1 rounded font-bold">
                      Matches E.164
                    </span>
                  </div>
                  <span className="font-mono text-[11px] uppercase text-[#64748b]">City Location</span>
                  <div className="col-span-2 flex items-center gap-1.5">
                    <span className="font-mono text-[#ba1a1a] bg-[#ffdad6]/40 px-1 rounded">HYD</span>
                    <span className="font-mono text-[10px] text-[#64748b]">Aliases to Hyderabad</span>
                  </div>
                  <span className="font-mono text-[11px] uppercase text-[#64748b]">Signup Date</span>
                  <div className="col-span-2 flex items-center gap-1.5">
                    <span className="font-mono text-[#0b1c30] bg-[#e3dfff] px-1 rounded">
                      15/01/2023 (DD/MM/YYYY)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Decision Bar */}
            <div className="px-5 py-3 bg-[#f8fafc] flex flex-col md:flex-row md:items-center justify-between gap-3 border-t border-[#e2e8f0]">
              <div className="flex items-center gap-2 text-[#0b1c30]">
                <span className="material-symbols-outlined text-[#004ac6] text-[20px]">psychology</span>
                <div className="text-xs">
                  <span className="font-bold">AI Resolution Proposal: </span>
                  <span className="text-[#64748b]">Merge into primary record (<span className="font-semibold text-[#0b1c30]">Row #14</span>), archive Row #62 with lineage audit pointer.</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleResolvePair('pair-card-1', 'merged')}
                  className="h-8 px-3.5 bg-[#004ac6] hover:bg-[#003ea8] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">merge_type</span>
                  <span>Accept Merge</span>
                </button>
                <button
                  onClick={() => handleResolvePair('pair-card-1', 'distinct')}
                  className="h-8 px-3 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0b1c30] text-xs font-medium rounded-lg transition-colors border border-[#cbd5e1]"
                  type="button"
                >
                  Keep Both as Separate
                </button>
                <button
                  onClick={() => showToast('Opened custom inline lineage editor.')}
                  className="h-8 px-3 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#64748b] hover:text-[#0b1c30] text-xs font-medium rounded-lg transition-colors border border-[#cbd5e1] flex items-center gap-1"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[15px]">tune</span>
                  <span>Custom Edit</span>
                </button>
              </div>
            </div>
          </div>

          {/* Comparison Pair 2: Pooja Verma vs Pooja R. Verma (Guardrail Tripped) */}
          <div className="w-full bg-white rounded-xl shadow-sm border border-[#e2e8f0] overflow-hidden flex flex-col">
            <div className="px-5 py-3 bg-[#ffdad6]/20 flex flex-wrap items-center justify-between gap-2 border-b border-[#ffdad6]">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-[#0b1c30]">
                  Candidate Pair #02: Pooja Verma vs Pooja R. Verma
                </span>
                <span className="bg-[#e2e8f0] text-[#0b1c30] font-mono text-xs px-2 py-0.5 rounded">
                  Cluster ID: #CL-209
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-[#ffdad6] text-[#ba1a1a] font-mono text-xs uppercase px-2.5 py-1 rounded font-bold">
                  <span className="material-symbols-outlined text-[16px]">warning</span>
                  <span>Match Confidence: 72% (Uncertain - Guardrail Tripped)</span>
                </div>
                <span className="font-mono text-xs text-[#ba1a1a] font-semibold">Shared Phone Number Collision</span>
              </div>
            </div>

            {/* Guardrail Alert Explanation Banner */}
            <div className="mx-5 mt-4 p-3.5 bg-[#ffdad6]/30 border border-[#ffdad6] rounded-xl flex items-start gap-3 text-[#ba1a1a]">
              <span className="material-symbols-outlined text-[20px] text-[#ba1a1a] shrink-0 mt-0.5">shield</span>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-[#ba1a1a]">Safety Rule Triggered: Domain Divergence Violation</span>
                <span className="text-xs text-[#475569]">
                  System automatically <strong>blocked auto-merge</strong>. While phone numbers match, the email domains (<code className="bg-white px-1.5 py-0.5 rounded font-mono text-[#ba1a1a] border border-[#ffdad6]">gmail.com</code> vs <code className="bg-white px-1.5 py-0.5 rounded font-mono text-[#ba1a1a] border border-[#ffdad6]">consulting.org</code>) denote potential family plan sharing or departmental line collision.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-5">
              {/* Record #28 */}
              <div className="bg-[#eff4ff]/60 rounded-xl p-4 border border-[#cbd5e1]/40 flex flex-col gap-2 shadow-xs relative">
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#5b598c] text-white font-mono text-xs px-2 py-0.5 rounded font-bold">
                      Row #28
                    </span>
                    <span className="font-semibold text-sm text-[#0b1c30]">Record A (Personal Identity)</span>
                  </div>
                  <span className="font-mono text-[10px] uppercase bg-[#e3dfff] text-[#181445] px-2 py-0.5 rounded font-bold">
                    Consumer Account
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-y-2 text-xs pt-1">
                  <span className="font-mono text-[11px] uppercase text-[#64748b]">Full Name</span>
                  <span className="col-span-2 font-mono text-[#0b1c30] font-semibold">Pooja Verma</span>
                  <span className="font-mono text-[11px] uppercase text-[#64748b]">Email Address</span>
                  <span className="col-span-2 font-mono text-[#ba1a1a] font-semibold bg-[#ffdad6]/40 px-1 rounded w-fit">
                    pooja.v@gmail.com
                  </span>
                  <span className="font-mono text-[11px] uppercase text-[#64748b]">Phone (E.164)</span>
                  <span className="col-span-2 font-mono text-[#0b1c30] font-bold bg-[#6ffbbe]/30 px-1 rounded w-fit">
                    +91 94401 88822
                  </span>
                  <span className="font-mono text-[11px] uppercase text-[#64748b]">City Location</span>
                  <span className="col-span-2 font-mono text-[#0b1c30]">Bengaluru</span>
                  <span className="font-mono text-[11px] uppercase text-[#64748b]">Organization</span>
                  <span className="col-span-2 font-mono text-[#64748b] italic">None (Retail Customer)</span>
                </div>
              </div>

              {/* Record #71 */}
              <div className="bg-[#eff4ff]/60 rounded-xl p-4 border border-[#cbd5e1]/40 flex flex-col gap-2 shadow-xs relative">
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#5b598c] text-white font-mono text-xs px-2 py-0.5 rounded font-bold">
                      Row #71
                    </span>
                    <span className="font-semibold text-sm text-[#0b1c30]">Record B (Enterprise Identity)</span>
                  </div>
                  <span className="font-mono text-[10px] uppercase bg-[#e3dfff] text-[#181445] px-2 py-0.5 rounded font-bold">
                    B2B Consultant
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-y-2 text-xs pt-1">
                  <span className="font-mono text-[11px] uppercase text-[#64748b]">Full Name</span>
                  <span className="col-span-2 font-mono text-[#0b1c30] font-semibold">Pooja R. Verma</span>
                  <span className="font-mono text-[11px] uppercase text-[#64748b]">Email Address</span>
                  <span className="col-span-2 font-mono text-[#ba1a1a] font-semibold bg-[#ffdad6]/40 px-1 rounded w-fit">
                    p.verma@consulting.org
                  </span>
                  <span className="font-mono text-[11px] uppercase text-[#64748b]">Phone (E.164)</span>
                  <span className="col-span-2 font-mono text-[#0b1c30] font-bold bg-[#6ffbbe]/30 px-1 rounded w-fit">
                    +91 94401 88822
                  </span>
                  <span className="font-mono text-[11px] uppercase text-[#64748b]">City Location</span>
                  <span className="col-span-2 font-mono text-[#0b1c30]">Bengaluru (Whitefield)</span>
                  <span className="font-mono text-[11px] uppercase text-[#64748b]">Organization</span>
                  <span className="col-span-2 font-mono text-[#0b1c30]">Verma &amp; Associates LLC</span>
                </div>
              </div>
            </div>

            {/* Decision Strip */}
            <div className="px-5 py-3 bg-[#f8fafc] flex flex-col md:flex-row md:items-center justify-between gap-3 border-t border-[#e2e8f0]">
              <div className="flex items-center gap-2 text-[#0b1c30]">
                <span className="material-symbols-outlined text-[#ba1a1a] text-[20px]">security_update_warning</span>
                <div className="text-xs">
                  <span className="font-bold">Safety Recommendation: </span>
                  <span className="text-[#64748b]">Keep Distinct to prevent corporate record cross-contamination.</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleResolvePair('pair-card-2', 'distinct')}
                  className="h-8 px-3.5 bg-[#006242] hover:bg-[#007d55] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>Keep Distinct (Recommended)</span>
                </button>
                <button
                  onClick={() => handleResolvePair('pair-card-2', 'linked')}
                  className="h-8 px-3 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0b1c30] text-xs font-medium rounded-lg transition-colors border border-[#cbd5e1] flex items-center gap-1"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[15px]">link</span>
                  <span>Link as Related</span>
                </button>
                <button
                  onClick={() => handleResolvePair('pair-card-2', 'forced')}
                  className="h-8 px-3 bg-[#ffdad6] hover:bg-[#ba1a1a] hover:text-white text-[#ba1a1a] text-xs font-semibold rounded-lg transition-colors"
                  type="button"
                >
                  Force Merge (Override)
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Granular Value Transformation Diff Table */}
        <section className="w-full bg-white rounded-xl shadow-sm border border-[#e2e8f0] p-5 sm:p-6 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#007d55]"></span>
                <h2 className="text-lg font-bold text-[#0b1c30] tracking-tight">Queued Field Transformations</h2>
                <span className="bg-[#e2e8f0] text-[#0b1c30] font-mono text-xs px-2 py-0.5 rounded">
                  42 Total Queued
                </span>
              </div>
              <p className="text-xs text-[#64748b] mt-0.5">
                Micro-level field repairs awaiting human checkpoint authorization. Inspect synthetic changes before persistence.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap font-mono text-xs">
              <button
                onClick={() => setFilterCategory('all')}
                className={`px-3 py-1 rounded transition-colors ${
                  filterCategory === 'all'
                    ? 'bg-[#004ac6] text-white font-semibold'
                    : 'bg-[#f1f5f9] text-[#0b1c30] hover:bg-[#e2e8f0]'
                }`}
              >
                All Types
              </button>
              <button
                onClick={() => setFilterCategory('email')}
                className={`px-3 py-1 rounded transition-colors ${
                  filterCategory === 'email'
                    ? 'bg-[#004ac6] text-white font-semibold'
                    : 'bg-[#f1f5f9] text-[#0b1c30] hover:bg-[#e2e8f0]'
                }`}
              >
                Emails (12)
              </button>
              <button
                onClick={() => setFilterCategory('date')}
                className={`px-3 py-1 rounded transition-colors ${
                  filterCategory === 'date'
                    ? 'bg-[#004ac6] text-white font-semibold'
                    : 'bg-[#f1f5f9] text-[#0b1c30] hover:bg-[#e2e8f0]'
                }`}
              >
                Dates (18)
              </button>
              <button
                onClick={() => setFilterCategory('phone')}
                className={`px-3 py-1 rounded transition-colors ${
                  filterCategory === 'phone'
                    ? 'bg-[#004ac6] text-white font-semibold'
                    : 'bg-[#f1f5f9] text-[#0b1c30] hover:bg-[#e2e8f0]'
                }`}
              >
                Phones (8)
              </button>
              <button
                onClick={() => setFilterCategory('city')}
                className={`px-3 py-1 rounded transition-colors ${
                  filterCategory === 'city'
                    ? 'bg-[#004ac6] text-white font-semibold'
                    : 'bg-[#f1f5f9] text-[#0b1c30] hover:bg-[#e2e8f0]'
                }`}
              >
                Geography (4)
              </button>
            </div>
          </div>

          {/* High Density Modern Data Grid */}
          <div className="w-full overflow-x-auto rounded-xl bg-[#eff4ff]/40 border border-[#cbd5e1]/40 shadow-inner">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#f1f5f9] font-mono uppercase text-[#64748b] tracking-wider h-9 border-b border-[#e2e8f0]">
                  <th className="px-4 py-2">Row ID</th>
                  <th className="px-4 py-2">Field</th>
                  <th className="px-4 py-2">Original Value (Raw)</th>
                  <th className="px-4 py-2">Proposed Value (Repaired)</th>
                  <th className="px-4 py-2">Reason / Cleaning Rule</th>
                  <th className="px-4 py-2">State</th>
                  <th className="px-4 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0] font-mono text-xs">
                {filteredTransformations.map(t => {
                  const isApproved = t.state === 'APPROVED';
                  const isReviewing = t.state === 'REVIEWING';

                  return (
                    <tr
                      key={t.id}
                      className={`hover:bg-white transition-colors ${
                        isReviewing ? 'bg-[#dbe1ff]/30' : 'bg-white/60'
                      }`}
                    >
                      <td className="px-4 py-3 font-bold text-[#0b1c30]">{t.rowId}</td>
                      <td className="px-4 py-3 text-[#64748b] font-medium">{t.field}</td>
                      <td className="px-4 py-3">
                        <span className="bg-[#ffdad6]/50 text-[#ba1a1a] px-2 py-0.5 rounded line-through">
                          {t.originalValue}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-[#6ffbbe]/40 text-[#005236] px-2 py-0.5 rounded font-semibold flex items-center gap-1 w-fit">
                          <span className="material-symbols-outlined text-[13px] text-[#007d55]">check_circle</span>
                          {t.proposedValue}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-sans text-xs text-[#64748b]">{t.reason}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-mono uppercase text-[10px] px-2 py-0.5 rounded font-bold ${
                            isApproved
                              ? 'bg-[#6ffbbe]/50 text-[#005236]'
                              : isReviewing
                              ? 'bg-[#d3e4fe] text-[#004ac6] animate-pulse'
                              : 'bg-[#ffdad6] text-[#ba1a1a]'
                          }`}
                        >
                          {t.state}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isReviewing ? (
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleToggleTransformState(t.id, 'APPROVED')}
                              className="px-2 py-1 rounded bg-[#004ac6] text-white text-[10px] font-mono uppercase hover:bg-[#003ea8]"
                              title="Confirm synthesis"
                              type="button"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleToggleTransformState(t.id, 'DISCARDED')}
                              className="px-2 py-1 rounded bg-[#e2e8f0] text-[#64748b] text-[10px] font-mono uppercase hover:bg-[#cbd5e1]"
                              title="Reject synthesis"
                              type="button"
                            >
                              Discard
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              handleToggleTransformState(
                                t.id,
                                t.state === 'APPROVED' ? 'REVIEWING' : 'APPROVED'
                              )
                            }
                            className="w-7 h-7 inline-flex items-center justify-center rounded text-[#64748b] hover:bg-[#e2e8f0] hover:text-[#ba1a1a] transition-colors"
                            title="Revert / Toggle change"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[16px]">undo</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 4: Visual Diagnostic Insight Bento Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-[#e2e8f0] flex flex-col gap-1">
            <div className="flex items-center justify-between text-[#64748b] font-mono text-xs uppercase font-semibold">
              <span>Determinism Guard</span>
              <span className="material-symbols-outlined text-[#007d55] text-[18px]">lock</span>
            </div>
            <div className="text-xl font-bold text-[#0b1c30]">100% Replayable</div>
            <p className="text-xs text-[#64748b]">
              Every human decision generates a cryptographic SHA-256 event logged into your internal data lineage tree.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-[#e2e8f0] flex flex-col gap-1">
            <div className="flex items-center justify-between text-[#64748b] font-mono text-xs uppercase font-semibold">
              <span>Pipeline Throughput</span>
              <span className="material-symbols-outlined text-[#004ac6] text-[18px]">speed</span>
            </div>
            <div className="text-xl font-bold text-[#0b1c30]">1.2k rows / sec</div>
            <p className="text-xs text-[#64748b]">
              Batch validation memory footprint capped at 12.4 MB on this node with parallel worker synchronization.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-[#e2e8f0] flex flex-col gap-1">
            <div className="flex items-center justify-between text-[#64748b] font-mono text-xs uppercase font-semibold">
              <span>Human Verification Bias</span>
              <span className="material-symbols-outlined text-[#5b598c] text-[18px]">balance</span>
            </div>
            <div className="text-xl font-bold text-[#0b1c30]">0.02 False Pos.</div>
            <p className="text-xs text-[#64748b]">
              Zero unintentional record loss. Safety policies mandate active approval on any low-similarity record.
            </p>
          </div>
        </section>
      </div>

      {/* Persistent Sticky Bottom Arbiter Action Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-[#cbd5e1] shadow-[0_-4px_24px_rgba(0,0,0,0.06)] px-4 sm:px-6 lg:px-8 py-3 z-40">
        <div className="max-w-[1720px] mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <button
              onClick={onNavigateBack}
              className="inline-flex items-center gap-1.5 text-[#64748b] hover:text-[#0b1c30] text-sm font-semibold transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>Back to Copilot</span>
            </button>
            <span className="text-[#cbd5e1] font-mono">|</span>
            <div className="hidden md:flex items-center gap-2 font-mono text-xs text-[#64748b]">
              <span className="w-2 h-2 rounded-full bg-[#007d55]"></span>
              <span>
                Pending State: <strong>42 Changes Approved</strong> • <strong>1 Merge Staged</strong> •{' '}
                <strong>1 Kept Distinct</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={() => showToast('Draft state saved to session checkpoint.')}
              className="h-10 px-4 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0b1c30] text-xs font-semibold rounded-lg transition-colors border border-[#cbd5e1] flex items-center gap-1.5"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              <span>Save Draft State</span>
            </button>
            <button
              onClick={handleCommit}
              className="h-10 px-5 bg-[#004ac6] hover:bg-[#003ea8] text-white text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-2 shadow-md shadow-[#004ac6]/20"
              type="button"
            >
              <span>Commit Approved Transformations (42 Changes, 1 Merge, 1 Kept Distinct)</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
