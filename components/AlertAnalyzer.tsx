
import React, { useState } from 'react';
import { Severity, TechStack, SecurityAlert, AnalysisReport } from '../types';
import { analyzeAlert } from '../services/geminiService';

interface AlertAnalyzerProps {
  stack: TechStack;
  onAnalysisComplete: (alert: SecurityAlert, report: AnalysisReport) => void;
}

const AlertAnalyzer: React.FC<AlertAnalyzerProps> = ({ stack, onAnalysisComplete }) => {
  const [alert, setAlert] = useState<Partial<SecurityAlert>>({
    title: '',
    source: 'Manual Submission',
    rawLogs: '',
    timestamp: new Date().toISOString()
  });
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Initiating analysis engine...');
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!alert.title || !alert.rawLogs) {
      setError("Please provide both an alert title and raw logs for analysis.");
      return;
    }

    setLoading(true);
    setError(null);
    setLoadingMsg('Analyzing raw log signals...');

    try {
      const fullAlert: SecurityAlert = {
        id: Math.random().toString(36).substr(2, 9),
        title: alert.title || 'Untitled Alert',
        source: alert.source || 'Unknown',
        timestamp: new Date().toISOString(),
        rawLogs: alert.rawLogs || ''
      };
      
      const report = await analyzeAlert(fullAlert, stack, (msg) => {
        setLoadingMsg(msg);
      });
      onAnalysisComplete(fullAlert, report);
      
      setAlert({
        title: '',
        source: 'Manual Submission',
        rawLogs: '',
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      setError(err.message || "An error occurred during analysis.");
    } finally {
      setLoading(false);
      setLoadingMsg('Initiating analysis engine...');
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <i className="fas fa-terminal text-indigo-500"></i>
              Incident Triage Console
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Alert Title</label>
                <input
                  type="text"
                  placeholder="e.g. Brute Force attempt against Finance Web App"
                  value={alert.title}
                  onChange={(e) => setAlert({ ...alert, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Raw Alert / Log Data</label>
                <textarea
                  placeholder="Paste JSON alert data, system logs, or event details here..."
                  rows={12}
                  value={alert.rawLogs}
                  onChange={(e) => setAlert({ ...alert, rawLogs: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 mono text-sm focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                ></textarea>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3">
                  <i className="fas fa-circle-exclamation"></i>
                  {error}
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold flex flex-col items-center justify-center gap-1 transition-all duration-300 ${
                  loading 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 active:scale-[0.98]'
                }`}
              >
                {loading ? (
                  <>
                    <div className="flex items-center gap-3">
                      <i className="fas fa-spinner fa-spin"></i>
                      <span>AI Analyst Working...</span>
                    </div>
                    <span className="text-[10px] font-medium text-indigo-400 uppercase tracking-widest animate-pulse">{loadingMsg}</span>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <i className="fas fa-bolt"></i>
                      <span>Analyze & Trigger Playbooks</span>
                    </div>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Enrichment Sources</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm p-3 bg-slate-950 rounded-lg border border-slate-800">
                <i className="fas fa-check-circle text-emerald-500 text-xs"></i>
                <span className="text-slate-400">VirusTotal / AbuseIPDB</span>
              </div>
              <div className="flex items-center gap-3 text-sm p-3 bg-slate-950 rounded-lg border border-slate-800">
                <i className="fas fa-check-circle text-emerald-500 text-xs"></i>
                <span className="text-slate-400">ServiceNow CMDB</span>
              </div>
              <div className="flex items-center gap-3 text-sm p-3 bg-slate-950 rounded-lg border border-slate-800">
                <i className="fas fa-check-circle text-emerald-500 text-xs"></i>
                <span className="text-slate-400">Qualys Vulnerability Feed</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Available Playbooks</h4>
            <div className="space-y-2">
              <div className="text-xs p-3 bg-indigo-500/5 text-indigo-300 rounded-lg border border-indigo-500/20">
                <i className="fas fa-shield-virus mr-2"></i> Malware Outbreak Response
              </div>
              <div className="text-xs p-3 bg-indigo-500/5 text-indigo-300 rounded-lg border border-indigo-500/20">
                <i className="fas fa-user-shield mr-2"></i> Account Compromise (BEC)
              </div>
              <div className="text-xs p-3 bg-indigo-500/5 text-indigo-300 rounded-lg border border-indigo-500/20">
                <i className="fas fa-network-wired mr-2"></i> Brute Force Mitigation
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertAnalyzer;
