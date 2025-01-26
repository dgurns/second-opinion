import type { ActionFunctionArgs } from "react-router";
import { db } from "~/db";
import { medicalDetailsTable } from "~/db/schema";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "http://localhost:11434/v1",
  apiKey: "not-needed"
});

export const action = async ({ request }: ActionFunctionArgs) => {
  // Fetch all medical details
  const allDetails = await db.select().from(medicalDetailsTable);
  const combinedDetails = allDetails.map(d => d.details).join("\n\n");

  // Call local LLM using OpenAI SDK
  const completion = await openai.chat.completions.create({
    model: "deepseek-r1:7b",
    // model: 'llama3.2',
    messages: [
      {
        role: "system",
        content: `
            You are the world's most knowledgeable and insightful doctor. 
            Based on the provided medical details, provide a possible diagnosis and recommendations.
            Do not use markdown formatting in your response.
        `
      },
      {
        role: "user",
        content: `Please analyze these medical details and provide a brief diagnosis:\n\n${combinedDetails}`
      }
    ]
  });

  return { diagnosis: completion.choices[0].message.content };
} 