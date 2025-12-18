
import { GoogleGenAI, Type } from "@google/genai";
import { TechStack, SecurityAlert, AnalysisReport, Severity } from "../types";

export const analyzeAlert = async (
  alert: SecurityAlert,
  stack: TechStack
): Promise<AnalysisReport> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  const systemInstruction = `
    You are a Senior Tier 3 SOC Analyst. Your task is to analyze security alerts and provide a detailed report.
    You must personalize your investigation queries and remediation steps based on the organization's tech stack.
    
    Tech Stack:
    - SIEM: ${stack.siem}
    - EDR/XDR: ${stack.edr}
    - Cloud Provider: ${stack.cloud}
    - Identity: ${stack.identity}
    - Network Security: ${stack.network}
    - Industry: ${stack.industry}

    When providing investigation queries, use the syntax appropriate for the SIEM (${stack.siem}) or EDR (${stack.edr}).
    If industry is provided, consider industry-specific threat actors.
  `;

  const prompt = `
    Analyze the following security alert:
    Title: ${alert.title}
    Source: ${alert.source}
    Timestamp: ${alert.timestamp}
    
    Raw Logs/Data:
    ${alert.rawLogs}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: "Executive summary of the alert" },
          severity: { type: Type.STRING, enum: Object.values(Severity) },
          mitreTechniques: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "MITRE ATT&CK techniques identified"
          },
          remediationSteps: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Step-by-step remediation actions"
          },
          investigationQueries: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Queries for SIEM/EDR to further investigate"
          },
          potentialImpact: { type: Type.STRING, description: "Business impact if not addressed" },
          confidenceScore: { type: Type.NUMBER, description: "Analyst confidence from 0 to 1" }
        },
        required: ["summary", "severity", "mitreTechniques", "remediationSteps", "investigationQueries", "potentialImpact", "confidenceScore"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}") as AnalysisReport;
  } catch (error) {
    console.error("Failed to parse Gemini response", error);
    throw new Error("Could not parse analysis report");
  }
};
