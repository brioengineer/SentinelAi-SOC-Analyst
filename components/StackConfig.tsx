
import React from 'react';
import { TechStack } from '../types';

interface StackConfigProps {
  stack: TechStack;
  setStack: (stack: TechStack) => void;
}

const StackConfig: React.FC<StackConfigProps> = ({ stack, setStack }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStack({ ...stack, [name]: value });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-white mb-2">Organization Context</h3>
          <p className="text-slate-400">Personalize your SOC agent by defining your security infrastructure. This informs how the AI interprets logs and recommends queries.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-300">SIEM Platform</label>
            <select
              name="siem"
              value={stack.siem}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              <option value="Splunk">Splunk</option>
              <option value="Microsoft Sentinel">Microsoft Sentinel</option>
              <option value="Elastic Search">Elastic Security</option>
              <option value="IBM QRadar">IBM QRadar</option>
              <option value="Sumo Logic">Sumo Logic</option>
              <option value="Datadog">Datadog Cloud SIEM</option>
              <option value="Other">Other (Generic KQL/SQL)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-300">EDR/XDR Provider</label>
            <select
              name="edr"
              value={stack.edr}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              <option value="CrowdStrike Falcon">CrowdStrike Falcon</option>
              <option value="Microsoft Defender for Endpoint">Microsoft Defender for Endpoint</option>
              <option value="SentinelOne">SentinelOne</option>
              <option value="Carbon Black">VMware Carbon Black</option>
              <option value="Sophos Intercept X">Sophos Intercept X</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-300">Cloud Provider</label>
            <select
              name="cloud"
              value={stack.cloud}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              <option value="AWS">Amazon Web Services (AWS)</option>
              <option value="Azure">Microsoft Azure</option>
              <option value="GCP">Google Cloud Platform (GCP)</option>
              <option value="On-Prem">On-Premises / Hybrid</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-300">Identity Provider (IdP)</label>
            <select
              name="identity"
              value={stack.identity}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              <option value="Okta">Okta</option>
              <option value="Azure AD">Microsoft Entra ID (Azure AD)</option>
              <option value="Ping Identity">Ping Identity</option>
              <option value="Auth0">Auth0</option>
              <option value="Active Directory">Traditional Active Directory</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-300">Network Security</label>
            <input
              type="text"
              name="network"
              value={stack.network}
              onChange={handleChange}
              placeholder="e.g. Palo Alto, Zscaler, Cisco"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-300">Industry Vertical</label>
            <select
              name="industry"
              value={stack.industry}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              <option value="Finance">Finance / Banking</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Tech">Technology / SaaS</option>
              <option value="Government">Government / Public Sector</option>
              <option value="Retail">Retail / E-commerce</option>
              <option value="Manufacturing">Manufacturing</option>
            </select>
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl flex items-start gap-4">
          <div className="text-indigo-400 mt-1">
            <i className="fas fa-circle-info"></i>
          </div>
          <div>
            <h4 className="text-sm font-bold text-indigo-300 uppercase tracking-wide">Analyst's Note</h4>
            <p className="text-sm text-slate-400 leading-relaxed">Changes to your tech stack will take effect on the next alert analysis. This ensures the AI uses the correct query syntax for your tools.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StackConfig;
