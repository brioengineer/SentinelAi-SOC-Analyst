
import React from 'react';
import { AnalysisReport, Severity, SecurityAlert } from '../types';

interface ReportCardProps {
  alert: SecurityAlert;
  report: AnalysisReport;
  onClose: () => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ alert, report, onClose }) => {
  const getSeverityColor = (sev: Severity) => {
    switch (sev) {
      case Severity.CRITICAL: return 'bg-red-500 text-white border-red-400';
      case Severity.HIGH: return 'bg-orange-500 text-white border-orange-400';
      case Severity.MEDIUM: return 'bg-yellow-500 text-black border-yellow-400';
      case Severity.LOW: return 'bg-blue-500 text-white border-blue-400';
      default: return 'bg-slate-500 text-white';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-slideUp">
      <div className="flex items-center justify-between">
        <button 
          onClick={onClose}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors group"
        >
          <i className="fas fa-arrow-left transition-transform group-hover:-translate-x-1"></i>
          Back to Analyzer
        </button>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm hover:bg-slate-700 transition-colors">
            <i className="fas fa-download mr-2"></i> Export PDF
          </button>
          <button className="px-4 py-2 bg-indigo-600 rounded-lg text-sm hover:bg-indigo-500 transition-colors">
            <i className="fas fa-share-nodes mr-2"></i> Send to Ticket System
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Analysis Column */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800">
              <div className="flex items-center gap-4 mb-4">
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border-2 ${getSeverityColor(report.severity)}`}>
                  {report.severity}
                </span>
                <span className="text-slate-500 text-sm">{new Date(alert.timestamp).toLocaleString()}</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">{alert.title}</h2>
              <p className="text-slate-400 text-lg leading-relaxed">{report.summary}</p>
            </div>

            <div className="p-8 space-y-8">
              {/* Remediation */}
              <section>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                    <i className="fas fa-shield-virus"></i>
                  </div>
                  Remediation Actions
                </h3>
                <div className="grid gap-3">
                  {report.remediationSteps.map((step, i) => (
                    <div key={i} className="flex gap-4 p-4 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0 mt-0.5">{i+1}</span>
                      <p className="text-slate-300">{step}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Investigation Queries */}
              <section>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
                    <i className="fas fa-search"></i>
                  </div>
                  Hunting & Investigation Queries
                </h3>
                <div className="space-y-4">
                  {report.investigationQueries.map((query, i) => (
                    <div key={i} className="relative group">
                      <pre className="p-5 bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto text-sm text-indigo-300 mono whitespace-pre-wrap">
                        {query}
                      </pre>
                      <button className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                        <i className="fas fa-copy"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h4 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-widest">Confidence Score</h4>
            <div className="flex flex-col items-center gap-2">
              <div className="relative w-24 h-24">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                  <circle 
                    cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
                    className="text-indigo-500"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - report.confidenceScore)}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white">
                  {Math.round(report.confidenceScore * 100)}%
                </div>
              </div>
              <p className="text-[10px] text-slate-500 text-center px-4 mt-2">
                Based on alert signal-to-noise ratio and known threat patterns.
              </p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h4 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-widest">MITRE ATT&CK</h4>
            <div className="flex flex-wrap gap-2">
              {report.mitreTechniques.map((t, i) => (
                <span key={i} className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-medium text-slate-300">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h4 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-widest">Business Impact</h4>
            <p className="text-sm text-slate-400 leading-relaxed italic border-l-2 border-indigo-500/50 pl-4 py-1">
              {report.potentialImpact}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportCard;
