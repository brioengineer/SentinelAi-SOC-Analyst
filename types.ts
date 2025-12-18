
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

export interface AnalysisReport {
  summary: string;
  severity: Severity;
  mitreTechniques: string[];
  remediationSteps: string[];
  investigationQueries: string[];
  potentialImpact: string;
  confidenceScore: number;
}

export interface AnalysisHistoryItem {
  alert: SecurityAlert;
  report: AnalysisReport;
}
