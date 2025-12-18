
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
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!alert.title || !alert.rawLogs) {
      setError("Please provide both an alert title and raw logs for analysis.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fullAlert: SecurityAlert = {
        id: Math.random().toString(36).substr(2, 9),
        title: alert.title || 'Untitled Alert',
        source: alert.source || 'Unknown',
        timestamp: new Date().toISOString(),
        rawLogs: alert.rawLogs || ''
      };
      
      const report = await analyzeAlert(fullAlert, stack);
      onAnalysisComplete(fullAlert, report);
      
      // Reset form
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
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <i className="fas fa-terminal text-indigo-500"></i>
              New Alert Triage
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Alert Title</label>
                <input
                  type="text"
                  placeholder="e.g. Unusual login from restricted geography"
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
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all duration-300 ${
                  loading 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 active:scale-[0.98]'
                }`}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Analyzing with Gemini Engine...
                  </>
                ) : (
                  <>
                    <i className="fas fa-bolt"></i>
                    Perform Threat Analysis
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Info/Examples Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Active Context</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500">SIEM</span>
                <span className="text-indigo-400 font-medium">{stack.siem}</span>
              </div>
              <div className="flex justify-between items-center text-sm p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500">EDR</span>
                <span className="text-indigo-400 font-medium">{stack.edr}</span>
              </div>
              <div className="flex justify-between items-center text-sm p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500">Cloud</span>
                <span className="text-indigo-400 font-medium">{stack.cloud}</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-500 italic">
              AI analysis is tuned for these specific technologies.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Quick Templates</h4>
            <div className="space-y-2">
              <button 
                onClick={() => setAlert({ 
                  title: 'Suspicious CloudTrail Activity', 
                  rawLogs: JSON.stringify({
                    "eventVersion": "1.08",
                    "userIdentity": { "type": "IAMUser", "userName": "malicious_actor" },
                    "eventName": "DeleteBucket",
                    "sourceIPAddress": "1.2.3.4"
                  }, null, 2) 
                })}
                className="w-full text-left text-xs p-3 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors text-slate-300"
              >
                AWS Resource Deletion
              </button>
              <button 
                onClick={() => setAlert({ 
                  title: 'EDR Malicious File Detected', 
                  rawLogs: 'Endpoint: LAPTOP-SOC-01\nDetection: Mimikatz\nProcess: lsass.exe\nAction: Blocked\nUser: JDoe'
                })}
                className="w-full text-left text-xs p-3 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors text-slate-300"
              >
                Endpoint Malware
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertAnalyzer;
