import React from 'react';
import { Stage } from '../types';

interface HeaderProps {
  currentStage: Stage;
  onSelectStage: (stage: Stage) => void;
  datasetName: string;
  rowCount: number;
  onOpenUpload: () => void;
  onResetDemo: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStage,
  onSelectStage,
  datasetName,
  rowCount,
  onOpenUpload,
  onResetDemo,
}) => {
  const stages: { id: Stage; label: string }[] = [
    { id: 'ingest-and-profile', label: '1. Ingest & Profile' },
    { id: 'ai-cleaning-copilot', label: '2. AI Cleaning Copilot' },
    { id: 'review-and-approval', label: '3. Review & Approval (Flagged)' },
    { id: 'diff-and-export', label: '4. Diff & Export' },
    { id: 'audit-and-judge-guide', label: '5. Audit & Judge Guide' },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#ffffff] border-b border-[#cbd5e1] shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-col justify-between pt-2">
        {/* Top brand & meta bar */}
        <div className="flex items-center justify-between gap-4 border-b border-[#e2e8f0] pb-2">
          {/* Logo & Product Name */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => onSelectStage('ingest-and-profile')}>
              <div className="w-8 h-8 rounded-lg bg-[#004ac6] flex items-center justify-center text-white shadow-sm">
                <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-base text-[#0b1c30] tracking-tight">SaaSsum AI</span>
                  <span className="font-mono text-[11px] font-bold uppercase bg-[#dbe1ff] text-[#00174b] px-1.5 py-0.5 rounded">
                    v1.2
                  </span>
                </div>
                <p className="text-xs text-[#64748b] leading-tight">Data Quality &amp; AI Cleaning Engine</p>
              </div>
            </div>

            {/* Live Buffer Pill */}
            <div className="hidden xl:flex items-center gap-2 bg-[#eff4ff] px-2.5 py-1 rounded border border-[#cbd5e1]/60 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-[#007d55] animate-pulse"></span>
              <span className="text-[#64748b] font-medium">Demo Mode:</span>
              <span className="text-[#004ac6] font-semibold">{datasetName}</span>
              <span className="text-[#64748b]">({rowCount} rows)</span>
            </div>

            {/* Quick action buttons */}
            <button
              onClick={onResetDemo}
              className="inline-flex items-center gap-1.5 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0b1c30] px-2.5 py-1 rounded text-xs font-medium transition-colors border border-[#cbd5e1]/60"
              type="button"
              title="Reload synthetic demo dataset"
            >
              <span className="material-symbols-outlined text-[15px] text-[#004ac6]">cloud_download</span>
              <span>Load Demo Dataset</span>
            </button>
            <button
              onClick={onOpenUpload}
              className="hidden sm:inline-flex items-center gap-1.5 bg-[#eff4ff] hover:bg-[#dbe1ff] text-[#004ac6] px-2.5 py-1 rounded text-xs font-medium transition-colors border border-[#cbd5e1]/60"
              type="button"
            >
              <span className="material-symbols-outlined text-[15px]">upload_file</span>
              <span>Upload File</span>
            </button>
          </div>

          {/* Right badges & user profile */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 text-xs font-mono">
              <span className="bg-[#f1f5f9] px-2 py-0.5 rounded text-[#0b1c30] font-medium border border-[#cbd5e1]/60">
                Team Dragons #TRI26669 | 24h MVP
              </span>
              <span className="flex items-center gap-1 text-[#005236] bg-[#6ffbbe]/30 px-2 py-0.5 rounded border border-[#006242]/20 font-medium">
                <span className="material-symbols-outlined text-[14px]">bolt</span>
                AI Engine: Claude 3.5 Sonnet (Fallback: Active)
              </span>
            </div>

            <div
              className="w-8 h-8 rounded-full bg-[#004ac6] flex items-center justify-center text-white cursor-pointer shadow-sm hover:opacity-90"
              title="Verified Auditor: Team Dragons"
            >
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
          </div>
        </div>

        {/* Bottom Stage Navigation Strip */}
        <div className="flex items-center justify-between">
          <nav className="flex items-center gap-6 overflow-x-auto py-1 text-sm">
            {stages.map((stage) => {
              const isActive = currentStage === stage.id;
              return (
                <button
                  key={stage.id}
                  onClick={() => onSelectStage(stage.id)}
                  className={`py-2 transition-colors whitespace-nowrap font-medium text-xs sm:text-sm border-b-2 flex items-center gap-1.5 ${
                    isActive
                      ? 'border-[#004ac6] text-[#004ac6] font-semibold'
                      : 'border-transparent text-[#64748b] hover:text-[#0b1c30]'
                  }`}
                >
                  {stage.label}
                  {stage.id === 'review-and-approval' && (
                    <span className="bg-[#ffdad6] text-[#ba1a1a] text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      8 Flagged
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-1.5 text-[#64748b] text-xs font-mono">
            <span className="material-symbols-outlined text-[15px]">memory</span>
            <span>Memory: 12.4 MB</span>
          </div>
        </div>
      </div>
    </header>
  );
};
