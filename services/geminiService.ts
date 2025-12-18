
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { TechStack, SecurityAlert, AnalysisReport, Severity } from "../types";

// Note: In a production environment, these would be real fetch calls to your internal APIs
const toolsMock = {
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
    result: `Successfully ${action} for ${target}. Action logged in ServiceNow ticket INC-${Math.floor(Math.random() * 90000 + 10000)}.`,
    timestamp: new Date().toISOString()
  })
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
): Promise<AnalysisReport & { sources?: any[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    You are a Live Senior SOC Analyst. 
    Use the 'googleSearch' tool to verify reputations of external IPs, domains, and file hashes in REAL-TIME.
    
    Current Organization Context:
    - SIEM: ${stack.siem}
    - EDR: ${stack.edr}
    - Cloud: ${stack.cloud}
    - Asset System: ServiceNow CMDB
    - Scanner: Qualys/Nessus
    - Industry: ${stack.industry}

    WORKFLOW:
    1. Identify external indicators (IPs, domains).
    2. Use 'googleSearch' to find current threat intel reports (AlienVault, VirusTotal, Mandiant blogs).
    3. Use 'lookupAssetDetails' for internal hostnames.
    4. Execute remediation via 'runPlaybookAction' for Critical/High alerts.
    5. Provide specific ${stack.siem} queries.
  `;

  const modelName = "gemini-3-pro-preview";
  const contents: any[] = [{ parts: [{ text: `LIVE ANALYSIS REQUEST: ${alert.title}\nLog Evidence: ${alert.rawLogs}` }] }];

  const generateResponse = async () => {
    return await ai.models.generateContent({
      model: modelName,
      contents,
      config: {
        systemInstruction,
        // Added googleSearch for live data retrieval
        tools: [
          { googleSearch: {} },
          { functionDeclarations: [lookupAssetDetailsDef, runPlaybookActionDef] }
        ],
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
  let sources: any[] = [];

  let loopLimit = 5;
  while (response.functionCalls && loopLimit > 0) {
    loopLimit--;
    const functionResponses: any[] = [];

    for (const fc of response.functionCalls) {
      onToolCall?.(`Querying Live System: ${fc.name}...`);
      let result;
      if (fc.name === 'lookupAssetDetails') result = toolsMock.lookupAssetDetails((fc.args as any).assetId);
      if (fc.name === 'runPlaybookAction') result = toolsMock.runPlaybookAction((fc.args as any).action, (fc.args as any).target);

      functionResponses.push({
        id: fc.id,
        name: fc.name,
        response: { result },
      });
    }

    if (response.candidates && response.candidates[0]) {
      contents.push({ parts: response.candidates[0].content.parts });
    }

    contents.push({
      parts: functionResponses.map(fr => ({
        functionResponse: fr
      }))
    });

    response = await generateResponse();
  }

  // Capture grounding sources from Search tool
  if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
    sources = response.candidates[0].groundingMetadata.groundingChunks.map((chunk: any) => chunk.web);
  }

  try {
    const text = response.text || "{}";
    const report = JSON.parse(text.trim());
    return { ...report, sources };
  } catch (error) {
    console.error("Failed to parse Gemini response", error);
    throw new Error("Could not parse enriched live analysis report");
  }
};
