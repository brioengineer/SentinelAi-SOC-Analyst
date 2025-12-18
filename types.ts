
export enum Severity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface TechStack {
  siem: string;
  edr: string;
  cloud: string;
  identity: string;
  network: string;
  industry: string;
}

export interface SecurityAlert {
  id: string;
  timestamp: string;
  source: string;
  title: string;
  rawLogs: string;
}

export interface ThreatIntel {
  indicator: string;
  type: 'IP' | 'Domain' | 'Hash';
  reputation: 'Malicious' | 'Suspicious' | 'Clean' | 'Unknown';
  source: string;
  lastSeen: string;
  details: string;
}

export interface AssetContext {
  hostname: string;
  owner: string;
  criticality: 'Low' | 'Medium' | 'High' | 'Mission Critical';
  vulnerabilities: string[];
  os: string;
  location: string;
}

export interface PlaybookStep {
  action: string;
  status: 'Completed' | 'Pending' | 'Failed';
  result: string;
  timestamp: string;
}

export interface AnalysisReport {
  summary: string;
  severity: Severity;
  mitreTechniques: string[];
  remediationSteps: string[];
  investigationQueries: string[];
  potentialImpact: string;
  confidenceScore: number;
  // New enriched fields
  threatIntel: ThreatIntel[];
  assetContext?: AssetContext;
  playbookTimeline: PlaybookStep[];
}

export interface AnalysisHistoryItem {
  alert: SecurityAlert;
  report: AnalysisReport;
}
