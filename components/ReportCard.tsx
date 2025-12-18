
import React from 'react';
import { AnalysisReport, Severity, SecurityAlert } from '../types';

interface ReportCardProps {
  alert: SecurityAlert;
  report: AnalysisReport & { sources?: any[] };
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
    <div className="max-w-6xl mx-auto space-y-6 animate-slideUp pb-12">
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
            <i className="fas fa-print mr-2"></i> Case File
          </button>
          <button className="px-4 py-2 bg-indigo-600 rounded-lg text-sm hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30">
            <i className="fas fa-check-circle mr-2"></i> Close Incident
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Analysis Column */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/30">
              <div className="flex items-center gap-4 mb-4">
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border-2 ${getSeverityColor(report.severity)}`}>
                  {report.severity}
                </span>
                <span className="text-slate-500 text-sm flex items-center gap-2">
                  <i className="fas fa-globe-americas"></i>
                  Live Search Enabled
                </span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">{alert.title}</h2>
              <p className="text-slate-300 text-lg leading-relaxed">{report.summary}</p>
            </div>

            <div className="p-8 space-y-10">
              {/* Evidence Sources (Live Grounding) */}
              {report.sources && report.sources.length > 0 && (
                <section>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                      <i className="fas fa-link"></i>
                    </div>
                    Intelligence Sources & Evidence
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {report.sources.map((src, i) => (
                      <a 
                        key={i} 
                        href={src.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl hover:border-indigo-500/50 hover:bg-slate-900 transition-all group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-indigo-400">
                          <i className="fas fa-external-link-alt text-xs"></i>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-300 truncate">{src.title || 'Threat Report'}</p>
                          <p className="text-[10px] text-slate-500 truncate">{src.uri}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </section>
              )}

              {/* Automated Playbook Timeline */}
              <section>
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                    <i className="fas fa-robot"></i>
                  </div>
                  Live Response Timeline
                </h3>
                <div className="relative pl-8 space-y-6 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-px before:bg-slate-800">
                  {report.playbookTimeline.map((step, i) => (
                    <div key={i} className="relative">
                      <div className={`absolute -left-[29px] w-3 h-3 rounded-full border-2 border-slate-900 ${step.status === 'Completed' ? 'bg-emerald-500' : 'bg-slate-600'}`}></div>
                      <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-bold text-slate-200">{step.action}</span>
                          <span className="text-[10px] text-slate-500 mono">{new Date(step.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-xs text-slate-400">{step.result}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Threat Intelligence Enrichment */}
              <section>
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                    <i className="fas fa-microchip"></i>
                  </div>
                  Enriched Indicators (IOCs)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {report.threatIntel.map((intel, i) => (
                    <div key={i} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex gap-4">
                      <div className={`p-3 rounded-lg h-fit ${intel.reputation === 'Malicious' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
                        <i className={`fas ${intel.type === 'IP' ? 'fa-network-wired' : 'fa-fingerprint'}`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-sm font-bold text-white truncate">{intel.indicator}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${intel.reputation === 'Malicious' ? 'border-red-500/50 text-red-400' : 'border-amber-500/50 text-amber-400'}`}>
                            {intel.reputation}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mb-2">{intel.source}</p>
                        <p className="text-xs text-slate-400 leading-snug">{intel.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Investigation Queries */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
                      <i className="fas fa-terminal"></i>
                    </div>
                    Live Hunting Commands
                  </h3>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-2 py-1 rounded">PLATFORM-SPECIFIC</span>
                </div>
                <div className="space-y-4">
                  {report.investigationQueries.map((query, i) => (
                    <div key={i} className="relative group">
                      <pre className="p-5 bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto text-[13px] text-indigo-300 mono whitespace-pre-wrap">
                        {query}
                      </pre>
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
            <h4 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-widest">Asset Priority</h4>
            {report.assetContext ? (
              <div className="space-y-4">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <p className="text-sm font-bold text-white mb-1">{report.assetContext.hostname}</p>
                  <p className="text-[11px] text-slate-400 mb-3">{report.assetContext.owner}</p>
                  <div className={`px-3 py-1 text-center rounded-lg text-xs font-bold ${
                    report.assetContext.criticality === 'Mission Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {report.assetContext.criticality}
                  </div>
                </div>
                <div className="space-y-2">
                  {report.assetContext.vulnerabilities.map((v, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] text-red-400 bg-red-400/5 p-2 rounded border border-red-400/10">
                      <i className="fas fa-biohazard"></i> {v}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No asset context detected.</p>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-center">
            <h4 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-widest">Confidence Score</h4>
            <div className="text-5xl font-bold text-white mb-1">
              {Math.round(report.confidenceScore * 100)}<span className="text-indigo-500">%</span>
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Analyst Certainty</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportCard;
