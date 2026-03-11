import { GoogleGenAI, Type } from "@google/genai";
import { ClubStat, DistanceEntry } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getGolfAdvice(stats: ClubStat[], allDistances: DistanceEntry[]) {
  const model = "gemini-3-flash-preview";
  
  // Calculate consistency (standard deviation) for each club
  const clubData = stats.map(stat => {
    const clubShots = allDistances.filter(d => d.club === stat.club);
    const distances = clubShots.map(d => d.distance);
    
    // Calculate standard deviation
    let stdDev = 0;
    if (distances.length > 1) {
      const mean = stat.avg_distance;
      const variance = distances.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (distances.length - 1);
      stdDev = Math.sqrt(variance);
    }
    
    return {
      club: stat.club,
      avgDistance: stat.avg_distance.toFixed(1),
      maxDistance: stat.max_distance,
      count: stat.count,
      consistency: stdDev.toFixed(1) + 'm std dev',
      recentShots: clubShots.slice(0, 5).map(d => `${d.distance}m (${d.direction || 'N/A'}, ${d.hit_point || 'N/A'})`).join(' | ')
    };
  });

  const statsSummary = clubData.map(c => 
    `${c.club}: Avg ${c.avgDistance}m, Max ${c.maxDistance}m, Consistency: ${c.consistency}\n  Recent: ${c.recentShots}`
  ).join('\n');
  
  const prompt = `
    You are an expert golf coach. Analyze the following club distance data and shot patterns to provide 3 specific, tailored tips or exercises.
    
    Player Stats & Historical Data:
    ${statsSummary}
    
    Your analysis MUST explicitly consider:
    1. Gaps between club average distances (e.g., are there overlapping clubs or large 20m+ gaps between irons?).
    2. Shot consistency (look at the standard deviation and recent shot dispersion for each club).
    3. Historical miss patterns (e.g., constant slice/hook, toe/heel strikes, fat/thin shots).
    
    Based on these identified weaknesses, suggest specific drills that address them.
    
    Provide your advice in the following JSON format:
    {
      "summary": "Detailed overall assessment of distance gaps, consistency, and shot patterns.",
      "tips": [
        { 
          "title": "Tip Title", 
          "description": "Detailed explanation of the weakness and how to fix it", 
          "drill": "Specific drill name and how to perform it" 
        }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            tips: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  drill: { type: Type.STRING }
                },
                required: ["title", "description", "drill"]
              }
            }
          },
          required: ["summary", "tips"]
        }
      }
    });
    
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error getting golf advice:", error);
    return {
      summary: "Keep practicing! Consistency is key. We couldn't analyze your data right now.",
      tips: [
        { title: "Focus on Tempo", description: "Maintain a smooth 3:1 backswing to downswing ratio.", drill: "Metronome Drill" }
      ]
    };
  }
}
