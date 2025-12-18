
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import StackConfig from './components/StackConfig';
import AlertAnalyzer from './components/AlertAnalyzer';
import ReportCard from './components/ReportCard';
import Dashboard from './components/Dashboard';
import { TechStack, SecurityAlert, AnalysisReport, AnalysisHistoryItem } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [stack, setStack] = useState<TechStack>({
    siem: 'Microsoft Sentinel',
    edr: 'CrowdStrike Falcon',
    cloud: 'Azure',
    identity: 'Azure AD',
    network: 'Palo Alto Networks',
    industry: 'Tech'
  });
  
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [currentView, setCurrentView] = useState<{alert: SecurityAlert, report: AnalysisReport} | null>(null);

  // Initialize with some mock history if empty
  useEffect(() => {
    const saved = localStorage.getItem('sentinel_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sentinel_history', JSON.stringify(history));
  }, [history]);

  const handleAnalysisComplete = (alert: SecurityAlert, report: AnalysisReport) => {
    const newItem = { alert, report };
    setHistory([newItem, ...history]);
    setCurrentView(newItem);
  };

  const renderContent = () => {
    if (currentView) {
      return (
        <ReportCard 
          alert={currentView.alert} 
          report={currentView.report} 
          onClose={() => setCurrentView(null)} 
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard history={history} />;
      case 'analyzer':
        return <AlertAnalyzer stack={stack} onAnalysisComplete={handleAnalysisComplete} />;
      case 'stack':
        return <StackConfig stack={stack} setStack={setStack} />;
      case 'history':
        return (
          <div className="max-w-6xl mx-auto space-y-4">
            <h3 className="text-2xl font-bold text-white mb-6">Triage Archive</h3>
            {history.map((item, i) => (
              <div 
                key={i} 
                onClick={() => setCurrentView(item)}
                className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:bg-slate-800/50 transition-all cursor-pointer flex justify-between items-center group shadow-lg"
              >
                <div className="flex gap-6 items-center">
                  <div className={`w-3 h-12 rounded-full ${
                    item.report.severity === 'CRITICAL' ? 'bg-red-500' : 
                    item.report.severity === 'HIGH' ? 'bg-orange-500' : 'bg-slate-700'
                  }`}></div>
                  <div>
                    <h4 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">{item.alert.title}</h4>
                    <p className="text-sm text-slate-500">
                      Triaged on {new Date(item.alert.timestamp).toLocaleString()} • {item.report.mitreTechniques.length} MITRE Techniques
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Confidence</span>
                    <span className="text-indigo-400 font-bold">{Math.round(item.report.confidenceScore * 100)}%</span>
                  </div>
                  <i className="fas fa-chevron-right text-slate-600 group-hover:text-slate-300"></i>
                </div>
              </div>
            ))}
            {history.length === 0 && (
              <div className="text-center py-32 bg-slate-900/50 rounded-3xl border border-dashed border-slate-800">
                <i className="fas fa-box-open text-4xl text-slate-700 mb-4"></i>
                <p className="text-slate-500 italic">No triage history found.</p>
              </div>
            )}
          </div>
        );
      default:
        return <Dashboard history={history} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={(tab) => {
      setActiveTab(tab);
      setCurrentView(null);
    }}>
      {renderContent()}
    </Layout>
  );
};

export default App;
