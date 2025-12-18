
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  return (
    <div className="flex h-screen bg-slate-950 text-slate-200">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <i className="fas fa-shield-halved text-white text-xl"></i>
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">SentinelAI</h1>
              <p className="text-xs text-slate-500 font-medium">SOC Analyst Agent</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              activeTab === 'dashboard' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <i className="fas fa-chart-line w-5"></i>
            <span className="font-medium">Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('analyzer')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              activeTab === 'analyzer' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <i className="fas fa-microscope w-5"></i>
            <span className="font-medium">Alert Analyzer</span>
          </button>
          <button
            onClick={() => setActiveTab('stack')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              activeTab === 'stack' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <i className="fas fa-layer-group w-5"></i>
            <span className="font-medium">Tech Stack</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              activeTab === 'history' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <i className="fas fa-history w-5"></i>
            <span className="font-medium">History</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Agent Ready</span>
            </div>
            <p className="text-[10px] text-slate-500 italic">Gemini-3-Pro engine enabled</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-slate-800 bg-slate-900/30 flex items-center justify-between px-8 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-xl font-semibold text-slate-100 capitalize">{activeTab.replace('-', ' ')}</h2>
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-slate-200 transition-colors">
              <i className="fas fa-bell"></i>
            </button>
            <div className="h-8 w-px bg-slate-800"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600">
                <i className="fas fa-user text-sm"></i>
              </div>
              <span className="text-sm font-medium text-slate-300">Admin</span>
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
