import type { ActionFunctionArgs } from "react-router";
import { db } from "~/db";
import { medicalDetailsTable } from "~/db/schema";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "http://localhost:11434/v1",
  apiKey: "not-needed",
});

export const action = async ({ request }: ActionFunctionArgs) => {
  // Fetch all medical details
  const allDetails = await db.select().from(medicalDetailsTable);
  const combinedDetails = allDetails.map((d) => d.details).join("\n\n");

  // Create a ReadableStream that will receive the tokens
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const completion = await openai.chat.completions.create({
        model: process.env.OLLAMA_MODEL ?? "gemma3:4b",
        stream: true,
        messages: [
          {
            role: "system",
            content: `
                You are the world's most knowledgeable and insightful doctor. 
                Based on the provided medical details, provide a possible diagnosis and recommendations.
                Do not use markdown formatting in your response.
            `,
          },
          {
            role: "user",
            content: `Please analyze these medical details and provide a brief diagnosis:\n\n${combinedDetails}`,
          },
        ],
      });

      try {
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            // Encode the text content into Uint8Array before enqueueing
            controller.enqueue(encoder.encode(content));
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
