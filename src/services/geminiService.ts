import { GoogleGenAI } from "@google/genai";
import { ClubStat } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getGolfAdvice(stats: ClubStat[], recentDistances: any[]) {
  const model = "gemini-3-flash-preview";
  
  const statsSummary = stats.map(s => `${s.club}: Avg ${s.avg_distance.toFixed(1)}m, Max ${s.max_distance}m`).join('\n');
  
  const recentSummary = recentDistances.slice(0, 10).map(d => 
    `${d.club}: ${d.distance}m, Direction: ${d.direction || 'N/A'}, Hit: ${d.hit_point || 'N/A'}, Traj: ${d.trajectory || 'N/A'}`
  ).join('\n');
  
  const prompt = `
    You are an expert golf coach. Analyze the following club distance data and shot patterns to provide 3 specific tips or exercises.
    
    Player Stats:
    ${statsSummary}
    
    Recent Shots (Last 10):
    ${recentSummary}
    
    Look for patterns in direction (e.g., constant slice/hook) and hit quality (e.g., hitting it fat or thin).
    Provide your advice in a structured JSON format:
    {
      "summary": "Overall assessment of distance gaps and shot patterns",
      "tips": [
        { "title": "Tip Title", "description": "Detailed explanation", "drill": "Specific drill name" }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error getting golf advice:", error);
    return {
      summary: "Keep practicing! Consistency is key.",
      tips: [
        { title: "Focus on Tempo", description: "Maintain a smooth 3:1 backswing to downswing ratio.", drill: "Metronome Drill" }
      ]
    };
  }
}
