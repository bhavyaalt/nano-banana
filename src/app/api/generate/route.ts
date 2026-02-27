import Replicate from "replicate";
import { NextRequest, NextResponse } from "next/server";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

interface GenerateRequest {
  prompt: string;
  style: string;
  tone: string;
  aspectRatio?: string;
  seed?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { prompt, style, tone, aspectRatio = "2:3", seed } = body;

    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { error: "REPLICATE_API_TOKEN not configured" },
        { status: 500 }
      );
    }

    // Build the comic-optimized prompt
    const stylePrompts: Record<string, string> = {
      western: "western comic book style, bold ink lines, dynamic shading, superhero comic aesthetic, vibrant colors",
      manga: "manga style, clean linework, expressive anime eyes, Japanese comic aesthetic, screentones, black and white with accents",
      cinematic: "cinematic comic style, dramatic lighting, film noir influences, detailed backgrounds, moody atmosphere",
      watercolor: "watercolor comic style, soft edges, painterly textures, artistic brush strokes, delicate colors",
    };

    const tonePrompts: Record<string, string> = {
      romantic: "warm colors, soft lighting, intimate atmosphere, tender mood",
      funny: "exaggerated expressions, vibrant colors, comedic timing, playful",
      dramatic: "high contrast, intense shadows, emotional depth, serious",
      kids: "bright cheerful colors, simple friendly shapes, cute characters, wholesome",
    };

    const fullPrompt = `Comic book panel illustration, ${stylePrompts[style] || stylePrompts.western}, ${tonePrompts[tone] || ""}, ${prompt}, professional comic art, high quality, detailed, speech bubble safe composition`;

    console.log("Generating with Replicate, prompt:", fullPrompt);

    // Use Flux Schnell for fast, high-quality generation
    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt: fullPrompt,
          aspect_ratio: aspectRatio,
          num_outputs: 1,
          output_format: "webp",
          output_quality: 90,
          ...(seed && { seed }),
        },
      }
    );

    // Flux returns an array of URLs
    const images = output as string[];
    
    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: "No image generated" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      imageUrl: images[0],
      prompt: fullPrompt,
    });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}
