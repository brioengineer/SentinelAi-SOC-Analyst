
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { TechStack, SecurityAlert, AnalysisReport, Severity } from "../types";

// Simulated external tool implementations
const toolsMock = {
  lookupThreatIntel: (indicator: string) => ({
    indicator,
    type: indicator.includes('.') ? 'IP' : 'Hash',
    reputation: Math.random() > 0.5 ? 'Malicious' : 'Suspicious',
    source: 'VirusTotal / AlienVault OTX',
    lastSeen: new Date().toISOString(),
    details: 'Detected in recent Cobalt Strike campaign (Operation "ShadowStrike").'
  }),
  lookupAssetDetails: (assetId: string) => ({
    hostname: assetId || 'WKSTN-OFFICE-04',
    owner: 'Sarah Jenkins (Finance Dept)',
    criticality: 'High',
    vulnerabilities: ['CVE-2023-23397 (Critical)', 'CVE-2024-21413 (High)'],
    os: 'Windows 11 Enterprise',
    location: 'London HQ'
  }),
  runPlaybookAction: (action: string, target: string) => ({
    action,
    status: 'Completed',
    result: `Successfully ${action} for ${target}. Action logged in ServiceNow ticket INC-99421.`,
    timestamp: new Date().toISOString()
  })
};

const lookupThreatIntelDef: FunctionDeclaration = {
  name: 'lookupThreatIntel',
  parameters: {
    type: Type.OBJECT,
    description: 'Query VirusTotal, AbuseIPDB, and AlienVault OTX for indicator reputation.',
    properties: {
      indicator: { type: Type.STRING, description: 'IP address, domain name, or file hash (MD5/SHA256).' }
    },
    required: ['indicator'],
  },
};

const lookupAssetDetailsDef: FunctionDeclaration = {
  name: 'lookupAssetDetails',
  parameters: {
    type: Type.OBJECT,
    description: 'Query ServiceNow CMDB and Qualys/Nessus for asset context and vulnerabilities.',
    properties: {
      assetId: { type: Type.STRING, description: 'The hostname, IP, or asset tag of the affected system.' }
    },
    required: ['assetId'],
  },
};

const runPlaybookActionDef: FunctionDeclaration = {
  name: 'runPlaybookAction',
  parameters: {
    type: Type.OBJECT,
    description: 'Execute automated remediation playbooks based on incident type.',
    properties: {
      action: { type: Type.STRING, description: 'The action to perform (e.g., IsolateHost, ResetPassword, BlockIP).' },
      target: { type: Type.STRING, description: 'The target indicator or asset for the action.' }
    },
    required: ['action', 'target'],
  },
};

export const analyzeAlert = async (
  alert: SecurityAlert,
  stack: TechStack,
  onToolCall?: (msg: string) => void
): Promise<AnalysisReport> => {
  // Always use the API key directly from process.env.API_KEY as per guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    You are a Senior Tier 3 SOC Analyst with access to real-time tools.
    Your mission: Analyze the alert, enrich it with Threat Intel and Asset Context, and execute necessary Playbook Actions.
    
    Current Organization Context:
    - SIEM: ${stack.siem}
    - EDR: ${stack.edr}
    - Cloud: ${stack.cloud}
    - Asset System: ServiceNow CMDB
    - Scanner: Qualys/Nessus
    - Industry: ${stack.industry}

    WORKFLOW:
    1. Extract indicators (IPs, hashes, hostnames) from raw logs.
    2. Use 'lookupThreatIntel' for any IPs, domains, or hashes.
    3. Use 'lookupAssetDetails' for any internal hostnames or users.
    4. If the threat is High/Critical, use 'runPlaybookAction' to mitigate immediately.
    5. Summarize findings and provide SIEM/EDR specific hunting queries.
  `;

  const modelName = "gemini-3-pro-preview";
  // Fix: Explicitly type contents to any[] to avoid strict inference that prevents pushing functionResponse parts.
  const contents: any[] = [{ parts: [{ text: `Analyze this alert: ${alert.title}\nLogs: ${alert.rawLogs}` }] }];

  const generateResponse = async () => {
    return await ai.models.generateContent({
      model: modelName,
      contents,
      config: {
        systemInstruction,
        tools: [{ functionDeclarations: [lookupThreatIntelDef, lookupAssetDetailsDef, runPlaybookActionDef] }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            severity: { type: Type.STRING, enum: Object.values(Severity) },
            mitreTechniques: { type: Type.ARRAY, items: { type: Type.STRING } },
            remediationSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
            investigationQueries: { type: Type.ARRAY, items: { type: Type.STRING } },
            potentialImpact: { type: Type.STRING },
            confidenceScore: { type: Type.NUMBER },
            threatIntel: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT,
                properties: {
                  indicator: { type: Type.STRING },
                  type: { type: Type.STRING },
                  reputation: { type: Type.STRING },
                  source: { type: Type.STRING },
                  lastSeen: { type: Type.STRING },
                  details: { type: Type.STRING }
                }
              }
            },
            assetContext: {
              type: Type.OBJECT,
              properties: {
                hostname: { type: Type.STRING },
                owner: { type: Type.STRING },
                criticality: { type: Type.STRING },
                vulnerabilities: { type: Type.ARRAY, items: { type: Type.STRING } },
                os: { type: Type.STRING },
                location: { type: Type.STRING }
              }
            },
            playbookTimeline: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  action: { type: Type.STRING },
                  status: { type: Type.STRING },
                  result: { type: Type.STRING },
                  timestamp: { type: Type.STRING }
                }
              }
            }
          },
          required: ["summary", "severity", "threatIntel", "playbookTimeline"]
        }
      }
    });
  };

  let response = await generateResponse();

  // Loop to handle potential multiple tool calls (Gemini might chain them)
  let loopLimit = 5;
  while (response.functionCalls && loopLimit > 0) {
    loopLimit--;
    const functionResponses: any[] = [];

    for (const fc of response.functionCalls) {
      onToolCall?.(`Executing tool: ${fc.name}...`);
      let result;
      if (fc.name === 'lookupThreatIntel') result = toolsMock.lookupThreatIntel((fc.args as any).indicator);
      if (fc.name === 'lookupAssetDetails') result = toolsMock.lookupAssetDetails((fc.args as any).assetId);
      if (fc.name === 'runPlaybookAction') result = toolsMock.runPlaybookAction((fc.args as any).action, (fc.args as any).target);

      functionResponses.push({
        id: fc.id,
        name: fc.name,
        response: { result },
      });
    }

    // Fix: Store the model's turn (containing the function calls) back into history.
    if (response.candidates && response.candidates[0]) {
      contents.push({ parts: response.candidates[0].content.parts });
    }

    // Fix: Store the tool responses back into history. Typing 'contents' as any[] prevents the previous TS error on line 184.
    contents.push({
      parts: functionResponses.map(fr => ({
        functionResponse: fr
      }))
    });

    response = await generateResponse();
  }

  try {
    // Access response.text directly (do not call as a method).
    const text = response.text || "{}";
    return JSON.parse(text.trim()) as AnalysisReport;
  } catch (error) {
    console.error("Failed to parse Gemini response", error);
    throw new Error("Could not parse enriched analysis report");
  }
};
