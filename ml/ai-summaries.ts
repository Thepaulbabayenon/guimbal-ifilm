import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function getFilmSummary(filmTitle: string, description: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "Generate a short, engaging film summary." },
      { role: "user", content: `Summarize: ${filmTitle} - ${description}` },
    ],
  });

  return response.choices[0]?.message?.content || "No summary available.";
}
