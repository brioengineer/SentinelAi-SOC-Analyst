
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { AnalysisHistoryItem, Severity } from '../types';

interface DashboardProps {
  history: AnalysisHistoryItem[];
}

const Dashboard: React.FC<DashboardProps> = ({ history }) => {
  const getSeverityDistribution = () => {
    const counts: Record<string, number> = { [Severity.LOW]: 0, [Severity.MEDIUM]: 0, [Severity.HIGH]: 0, [Severity.CRITICAL]: 0 };
    history.forEach(item => {
      counts[item.report.severity]++;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };

  const getTimelineData = () => {
    // Group history by date (last 7 days - mock since history might be small)
    return [
      { date: 'Mon', count: 4, threats: 1 },
      { date: 'Tue', count: 7, threats: 2 },
      { date: 'Wed', count: 3, threats: 0 },
      { date: 'Thu', count: history.length > 5 ? history.length : 8, threats: 3 },
      { date: 'Fri', count: 12, threats: 5 },
      { date: 'Sat', count: 5, threats: 2 },
      { date: 'Sun', count: 6, threats: 1 },
    ];
  };

  const COLORS = {
    [Severity.LOW]: '#3b82f6',
    [Severity.MEDIUM]: '#eab308',
    [Severity.HIGH]: '#f97316',
    [Severity.CRITICAL]: '#ef4444',
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
              <i className="fas fa-bolt"></i>
            </div>
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Alerts Processed</span>
          </div>
          <p className="text-4xl font-bold text-white">{history.length}</p>
          <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1">
            <i className="fas fa-arrow-up"></i> 12% from last week
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-red-500/10 text-red-500 rounded-xl">
              <i className="fas fa-triangle-exclamation"></i>
            </div>
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Critical Threats</span>
          </div>
          <p className="text-4xl font-bold text-white">
            {history.filter(h => h.report.severity === Severity.CRITICAL).length}
          </p>
          <p className="text-xs text-slate-500 mt-2">Active triage required</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <i className="fas fa-check-double"></i>
            </div>
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Avg Confidence</span>
          </div>
          <p className="text-4xl font-bold text-white">
            {history.length ? Math.round((history.reduce((acc, h) => acc + h.report.confidenceScore, 0) / history.length) * 100) : 0}%
          </p>
          <p className="text-xs text-slate-500 mt-2">Model accuracy rating</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
              <i className="fas fa-clock"></i>
            </div>
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Time Saved</span>
          </div>
          <p className="text-4xl font-bold text-white">{history.length * 45}m</p>
          <p className="text-xs text-slate-500 mt-2">Est. triage automation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Severity Distribution */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl">
          <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-widest">Severity Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getSeverityDistribution()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {getSeverityDistribution().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as Severity] || '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alert Volume */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl">
          <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-widest">Alert Volume History</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getTimelineData()}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="count" stroke="#6366f1" fillOpacity={1} fill="url(#colorCount)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white uppercase tracking-widest">Recent Detections</h3>
          <button className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">View Full Logs</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950/50 text-slate-500 text-xs uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Alert Title</th>
                <th className="px-6 py-4">Severity</th>
                <th className="px-6 py-4">Confidence</th>
                <th className="px-6 py-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {history.slice(0, 5).map((item, i) => (
                <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-200">{item.alert.title}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      item.report.severity === Severity.CRITICAL ? 'border-red-500/50 text-red-400' :
                      item.report.severity === Severity.HIGH ? 'border-orange-500/50 text-orange-400' :
                      'border-slate-700 text-slate-400'
                    }`}>
                      {item.report.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">{Math.round(item.report.confidenceScore * 100)}%</td>
                  <td className="px-6 py-4 text-slate-500 text-xs">{new Date(item.alert.timestamp).toLocaleTimeString()}</td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-500 italic">
                    No alerts triaged in the last 24 hours.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
