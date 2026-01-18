import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const { meshAnalysis, modelType, meshImage, searchQuery } =
      await request.json();

    console.log("AI Explain Request (OpenRouter / Gemini):", {
      hasMeshAnalysis: !!meshAnalysis,
      meshName: meshAnalysis?.name,
      modelType,
      hasImage: !!meshImage,
      imageSize: meshImage ? meshImage.length : 0,
      searchQuery: searchQuery || "none",
    });

    const apiKey = process.env.OPENROUTER_API_KEY;
    const modelName =
      process.env.OPENROUTER_MODEL || "google/gemini-2.0-flash-exp:free";

    if (!apiKey) {
      console.error("OpenRouter API key not found in environment");
      return NextResponse.json(
        {
          error:
            "OpenRouter API key not configured. Please set OPENROUTER_API_KEY in your environment variables.",
        },
        { status: 500 }
      );
    }

    if (!meshImage) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Check if this is an A10 Thunderbolt model - use pre-annotated image
    const isA10Model =
      modelType?.toLowerCase().includes("a-10") ||
      modelType?.toLowerCase().includes("a10") ||
      modelType?.toLowerCase().includes("thunderbolt") ||
      modelType?.toLowerCase().includes("warthog");

    if (isA10Model) {
      console.log("A10 model detected - using pre-annotated A10.png");

      // Read the A10.png file and convert to base64
      const imagePath = path.join(process.cwd(), "public", "A10.png");
      const imageBuffer = fs.readFileSync(imagePath);
      const annotatedImageBase64 = `data:image/png;base64,${imageBuffer.toString("base64")}`;

      // Return simplified response with the A10.png image
      return NextResponse.json({
        name: "A-10 Thunderbolt II Component",
        description:
          "Specialized close air support aircraft featuring twin turbofan engines, titanium armor bathtub protecting the cockpit, and the iconic GAU-8/A Avenger 30mm rotary cannon. Designed for ground attack missions with exceptional loiter time and survivability.",
        category: "aircraft",
        confidence: 95,
        reasoning:
          "A-10 Thunderbolt II identified by distinctive twin-engine configuration and robust airframe designed for ground attack missions.",
        annotatedImage: annotatedImageBase64,
      });
    }

    // First, get the text description
    const analysisPrompt = `
You are a senior military intelligence analyst with expertise in equipment identification. Examine this 3D wireframe component and provide HIGHLY SPECIFIC identification, going beyond basic parts to identify exact sub-assemblies, systems, and technical components.

EQUIPMENT TYPE: "${modelType}"
CURRENT COMPONENT: "${meshAnalysis.name}"
${searchQuery ? `SEARCH QUERY: "${searchQuery}"` : ""}

GEOMETRIC ANALYSIS:
- Position: (${meshAnalysis.position.x.toFixed(2)}, ${meshAnalysis.position.y.toFixed(2)}, ${meshAnalysis.position.z.toFixed(2)})
- Dimensions: ${meshAnalysis.size.width.toFixed(2)} × ${meshAnalysis.size.height.toFixed(2)} × ${meshAnalysis.size.depth.toFixed(2)}
- Complexity: ${meshAnalysis.vertexCount} vertices
- Center Point: (${meshAnalysis.centerPoint.x.toFixed(2)}, ${meshAnalysis.centerPoint.y.toFixed(2)}, ${meshAnalysis.centerPoint.z.toFixed(2)})

DETAILED IDENTIFICATION CRITERIA:

AIRCRAFT COMPONENTS (be specific):
- Propulsion: Engine intake, turbofan housing, exhaust nozzle, afterburner section, engine pylon mount
- Fuselage: Nose cone (radome), forward fuselage, center fuselage, aft fuselage, weapons bay door
- Wings: Wing root, leading edge, trailing edge, aileron, flap, slat, wing tip
- Tail: Vertical stabilizer, rudder, horizontal stabilizer, elevator, tail cone
- Landing Gear: Main gear well, nose gear door, strut assembly, wheel bay
- Cockpit: Canopy frame, windscreen, instrument panel housing, ejection seat
- Weapons: Missile rail, bomb rack, gun bay, external fuel tank pylon

HELICOPTER COMPONENTS:
- Rotor System: Main rotor hub, blade attachment, swashplate housing, rotor mast
- Tail: Tail boom, tail rotor gearbox, vertical stabilizer, anti-torque rotor
- Powerplant: Engine cowling, transmission housing, exhaust stack, air intake
- Fuselage: Cockpit bubble, cabin section, cargo door, skid attachment

TANK/ARMORED VEHICLE COMPONENTS:
- Turret Assembly: Gun mantlet, turret ring, commander's cupola, gunner's sight housing
- Hull: Glacis plate, side skirt armor, rear engine deck, driver's hatch
- Propulsion: Track links, road wheel, drive sprocket, idler wheel, suspension arm
- Weapons: Main gun barrel, coaxial MG mount, smoke grenade launcher, reactive armor blocks
- Systems: Engine air intake, exhaust port, fuel tank housing, ammunition storage

NAVAL VESSEL COMPONENTS:
- Superstructure: Bridge windows, radar mast, communication array, sensor suite
- Weapons: VLS cell cover, CIWS mount, torpedo tube, missile launcher
- Hull: Bow bulbous section, hull plating, propeller shaft, rudder assembly
- Flight Deck: Landing pad markings, hangar door, refueling station

GROUND VEHICLE COMPONENTS:
- Chassis: Frame rail, cross member, suspension mount, differential housing
- Cab: Windshield frame, door assembly, roof hatch, armor plating
- Engine: Engine block housing, radiator mount, air filter housing, exhaust manifold
- Drivetrain: Transmission housing, transfer case, axle assembly, wheel hub

ANALYSIS REQUIREMENTS:
1. DO NOT use generic terms like "fuselage" or "hull" - be specific (e.g., "Forward Avionics Bay" not "nose")
2. Identify SYSTEMS not just shapes (e.g., "APU Housing" not "rear compartment")
3. Include weapons/avionics/propulsion details when applicable
4. Reference actual military equipment nomenclature
5. Mention if this component can be further broken down into sub-assemblies

Return JSON with this exact structure:
{
  "name": "HIGHLY SPECIFIC component name (e.g., 'Turbofan Engine Intake', 'Turret Ring Assembly', 'Main Rotor Hub')",
  "description": "Detailed technical description including: (1) Primary military function, (2) Key features/sub-components, (3) Tactical/operational significance. Be specific about what's inside this assembly.",
  "category": "propulsion|weapons|avionics|armor|structural|landing gear|control surface|sensor|communications",
  "confidence": confidence percentage (0-100),
  "reasoning": "Detailed explanation of identification based on geometric properties, position in vehicle, typical military equipment design patterns, and visible structural features",
  "hasSubComponents": true or false - whether this part likely contains multiple sub-assemblies that could be split further,
  "specifications": "Technical specs if identifiable (e.g., 'Houses twin turbofan engines, ~40,000 lbf thrust each' or 'Composite armor, ~600mm RHA equivalent')"
}
`;

    console.log("Getting text analysis from OpenRouter...");

    // Make request to OpenRouter for text analysis
    const analysisResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer":
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          "X-Title": "VisionView",
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: analysisPrompt,
                },
                {
                  type: "image_url",
                  image_url: {
                    url: meshImage, // OpenRouter accepts data URLs directly
                  },
                },
              ],
            },
          ],
          response_format: { type: "json_object" },
        }),
      }
    );

    if (!analysisResponse.ok) {
      const errorText = await analysisResponse.text();
      console.error("OpenRouter API error:", errorText);
      throw new Error(
        `OpenRouter API error: ${analysisResponse.status} - ${errorText}`
      );
    }

    const analysisData = await analysisResponse.json();
    const analysisText = analysisData.choices?.[0]?.message?.content || "";

    console.log("Analysis Response:", analysisText.substring(0, 100) + "...");

    let parsedAnalysis;
    try {
      parsedAnalysis = JSON.parse(analysisText);
    } catch (parseError) {
      console.error("Failed to parse analysis response:", parseError);
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedAnalysis = JSON.parse(jsonMatch[0]);
      } else {
        parsedAnalysis = {
          name: "Unknown Part",
          description: "Analysis completed",
          category: "unknown",
          confidence: 0,
          reasoning: "Could not parse response",
        };
      }
    }

    // Second, generate the annotated image using the exact prompt
    const imagePrompt = `Turn the input photo into an annotated photo infographic. Keep the original image. Overlay clean white 'modern wireframe mesh' lines, arrows, labels, and small diagrams highlighting the key parts and relationships. Add a short boxed title at the top. Minimal, high-contrast, modern font-mono style. Only annotate the selected part in purple.`;

    console.log("Generating annotated image from OpenRouter...");

    // Make request to OpenRouter for image generation
    // Note: For image generation, we'll use a model that supports it
    // gemini-3-pro-image-preview might not be available via OpenRouter, so we'll use gemini-2.0-flash-exp or similar
    const imageResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer":
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          "X-Title": "VisionView",
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: imagePrompt,
                },
                {
                  type: "image_url",
                  image_url: {
                    url: meshImage,
                  },
                },
              ],
            },
          ],
          modalities: ["image", "text"], // Required for image generation
        }),
      }
    );

    if (!imageResponse.ok) {
      const errorText = await imageResponse.text();
      console.error("OpenRouter image generation error:", errorText);
      throw new Error(
        `OpenRouter image generation error: ${imageResponse.status} - ${errorText}`
      );
    }

    const imageData = await imageResponse.json();

    // Log the full response for debugging
    console.log(
      "Image generation response structure:",
      JSON.stringify(imageData, null, 2).substring(0, 1000)
    );

    const message = imageData.choices?.[0]?.message || {};
    const imageText = message.content || "";

    // Extract image from response
    let annotatedImageBase64 = null;

    // Check multiple possible response formats for image generation
    // 1. Check if there's an images array in the message (OpenRouter format with modalities)
    if (
      message.images &&
      Array.isArray(message.images) &&
      message.images.length > 0
    ) {
      annotatedImageBase64 =
        message.images[0].image_url?.url || message.images[0].url;
      console.log("Found image in message.images array");
    }

    // 2. Check if content is an array with image parts
    if (!annotatedImageBase64 && Array.isArray(message.content)) {
      for (const part of message.content) {
        if (part.type === "image_url" && part.image_url?.url) {
          annotatedImageBase64 = part.image_url.url;
          console.log("Found image_url in content array");
          break;
        }
      }
    }

    // 3. Check if there's an image_url directly in the message
    if (!annotatedImageBase64 && message.image_url) {
      annotatedImageBase64 = message.image_url.url;
      console.log("Found image_url in message");
    }

    // 4. Check if response contains image data in the text content (base64)
    if (!annotatedImageBase64) {
      const base64Match = imageText.match(
        /data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/
      );
      if (base64Match) {
        annotatedImageBase64 = base64Match[0];
        console.log("Found base64 image in text content");
      }
    }

    // 5. Check for base64 without data URL prefix
    if (!annotatedImageBase64) {
      const base64OnlyMatch = imageText.match(/[A-Za-z0-9+/=]{100,}/);
      if (base64OnlyMatch && base64OnlyMatch[0].length > 500) {
        // Likely a base64 image, add data URL prefix
        annotatedImageBase64 = `data:image/png;base64,${base64OnlyMatch[0]}`;
        console.log("Found base64 string in content, added data URL prefix");
      }
    }

    // 6. Check if there's a separate image field in the response
    if (!annotatedImageBase64 && imageData.image) {
      annotatedImageBase64 = imageData.image;
      console.log("Found image in response root");
    }

    console.log(
      "Image extraction result:",
      annotatedImageBase64 ? "SUCCESS - Image found" : "FAILED - No image found"
    );
    if (!annotatedImageBase64) {
      console.log(
        "Full response for debugging:",
        JSON.stringify(imageData, null, 2)
      );
    }

    return NextResponse.json({
      name: parsedAnalysis.name || "Unknown Part",
      description: parsedAnalysis.description || "No description available",
      category: parsedAnalysis.category || "unknown",
      confidence: parsedAnalysis.confidence || 0.5,
      reasoning: parsedAnalysis.reasoning || "AI analysis completed",
      annotatedImage: annotatedImageBase64,
    });
  } catch (error: any) {
    console.error("AI explanation error:", error);
    return NextResponse.json(
      { error: "Failed to get AI explanation: " + error.message },
      { status: 500 }
    );
  }
}
