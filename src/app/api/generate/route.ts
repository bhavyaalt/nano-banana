import { fal } from "@fal-ai/client";
import { NextRequest, NextResponse } from "next/server";

// Configure fal client
fal.config({
  credentials: process.env.FAL_KEY,
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

    if (!process.env.FAL_KEY) {
      return NextResponse.json(
        { error: "FAL_KEY not configured" },
        { status: 500 }
      );
    }

    // Build the comic-optimized prompt
    const stylePrompts: Record<string, string> = {
      western: "western comic book style, bold lines, dynamic shading, superhero comic aesthetic",
      manga: "manga style, clean linework, expressive eyes, Japanese comic aesthetic, screentones",
      cinematic: "cinematic comic style, dramatic lighting, film noir influences, detailed backgrounds",
      watercolor: "watercolor comic style, soft edges, painterly textures, artistic brush strokes",
    };

    const tonePrompts: Record<string, string> = {
      romantic: "warm colors, soft lighting, intimate atmosphere",
      funny: "exaggerated expressions, vibrant colors, comedic timing",
      dramatic: "high contrast, intense shadows, emotional depth",
      kids: "bright cheerful colors, simple shapes, friendly characters",
    };

    const fullPrompt = `Comic book panel illustration, ${stylePrompts[style] || stylePrompts.western}, ${tonePrompts[tone] || ""}, ${prompt}, speech bubble safe space, high quality, detailed`;

    console.log("Generating with prompt:", fullPrompt);

    const result = await fal.subscribe("fal-ai/nano-banana-pro", {
      input: {
        prompt: fullPrompt,
        aspect_ratio: aspectRatio as "2:3" | "1:1" | "16:9",
        resolution: "2K",
        output_format: "png",
        num_images: 1,
        ...(seed && { seed }),
      },
      logs: true,
    });

    const data = result.data as {
      images: Array<{ url: string; width: number; height: number }>;
      description: string;
    };

    if (!data.images || data.images.length === 0) {
      return NextResponse.json(
        { error: "No image generated" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      imageUrl: data.images[0].url,
      width: data.images[0].width,
      height: data.images[0].height,
      description: data.description,
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
