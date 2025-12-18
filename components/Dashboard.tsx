
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Cell
} from 'recharts';
import { AnalysisHistoryItem, Severity } from '../types';

interface DashboardProps {
  history: AnalysisHistoryItem[];
}

const Dashboard: React.FC<DashboardProps> = ({ history }) => {
  const [liveIocs, setLiveIocs] = useState<any[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(true);

  // Fetch real-time threats from ThreatFox (public API)
  useEffect(() => {
    const fetchLiveFeed = async () => {
      try {
        const response = await fetch('https://threatfox-api.abuse.ch/api/v1/', {
          method: 'POST',
          body: JSON.stringify({ query: 'get_recent', days: 1 })
        });
        const data = await response.json();
        if (data.data) {
          setLiveIocs(data.data.slice(0, 8));
        }
      } catch (err) {
        console.error("Failed to fetch live threat feed", err);
      } finally {
        setLoadingFeed(false);
      }
    };
    fetchLiveFeed();
  }, []);

  const getSeverityDistribution = () => {
    const counts: Record<string, number> = { [Severity.LOW]: 0, [Severity.MEDIUM]: 0, [Severity.HIGH]: 0, [Severity.CRITICAL]: 0 };
    history.forEach(item => {
      counts[item.report.severity]++;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };

  const COLORS = {
    [Severity.LOW]: '#3b82f6',
    [Severity.MEDIUM]: '#eab308',
    [Severity.HIGH]: '#f97316',
    [Severity.CRITICAL]: '#ef4444',
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Real-Time Status Bar */}
      <div className="flex items-center justify-between p-4 bg-indigo-600/10 border border-indigo-600/20 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center animate-pulse shadow-lg shadow-indigo-600/20">
            <i className="fas fa-satellite-dish text-white"></i>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Live Monitoring Active</h4>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Global Intelligence Feed Connected</p>
          </div>
        </div>
        <div className="flex gap-8 px-6">
          <div className="text-right">
            <p className="text-xs text-slate-500 mb-0.5">Uptime</p>
            <p className="text-sm font-bold text-white">99.98%</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 mb-0.5">Engine</p>
            <p className="text-sm font-bold text-indigo-400">Gemini 3 Pro</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Statistics Column */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Triage Volume</p>
              <p className="text-4xl font-bold text-white">{history.length}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Critical Responses</p>
              <p className="text-4xl font-bold text-red-500">{history.filter(h => h.report.severity === Severity.CRITICAL).length}</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl">
            <h3 className="text-sm font-bold text-white mb-8 uppercase tracking-widest">Alert Profile</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getSeverityDistribution()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {getSeverityDistribution().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name as Severity] || '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Live Global Threat Feed */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-slate-800 bg-slate-800/20">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              GLOBAL THREAT FEED
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loadingFeed ? (
              <div className="py-20 text-center">
                <i className="fas fa-circle-notch fa-spin text-indigo-500 text-2xl"></i>
              </div>
            ) : liveIocs.map((ioc, i) => (
              <div key={i} className="p-3 bg-slate-950 border border-slate-800 rounded-xl hover:bg-slate-800/30 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase">{ioc.threat_type.replace('_', ' ')}</span>
                  <span className="text-[9px] text-slate-600 mono">{new Date(ioc.first_seen).toLocaleTimeString()}</span>
                </div>
                <p className="text-xs font-medium text-slate-300 truncate mb-1">{ioc.ioc}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-slate-500">Tag: {ioc.tags?.[0] || 'Malicious'}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-slate-800/30 border-t border-slate-800 text-center">
            <p className="text-[10px] text-slate-500">Source: ThreatFox (Abuse.ch)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
