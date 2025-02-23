import { NextResponse } from "next/server";
import { getFilmSummary } from "@/ml/ai-summaries";
import { generateTrailer } from "@/ml/trailer-generator";

export async function POST(req: Request) {
  const { type, title, description, moviePath } = await req.json();

  if (type === "summary") {
    const summary = await getFilmSummary(title, description);
    return NextResponse.json({ summary });
  } else if (type === "trailer") {
    const outputPath = `/trailers/${title.replace(/\s+/g, "_")}.mp4`;
    await generateTrailer(moviePath, outputPath);
    return NextResponse.json({ trailer: outputPath });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}
