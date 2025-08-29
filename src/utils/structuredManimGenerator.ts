import { z } from "zod";
import { blobStorage } from "./blobStorage";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";

// Schema for structured Manim code generation
const manimCodeSchema = z.object({
  imports: z
    .array(z.string())
    .describe("All necessary import statements for Manim"),
  class_name: z
    .string()
    .describe("Name of the Scene class (e.g., 'PythagoreanTheorem')"),
  class_definition: z.object({
    name: z.string(),
    docstring: z.string().optional(),
    methods: z.array(
      z.object({
        name: z.string(),
        parameters: z.array(z.string()),
        body: z
          .string()
          .describe("Complete method body with proper 4-space indentation"),
        docstring: z.string().optional(),
      })
    ),
  }),
  complete_script: z
    .string()
    .describe(
      "Full executable Manim Python script with proper PEP 8 formatting"
    ),
});

/**
 * Advanced formatter that uses AI to generate structured, production-ready Manim code
 */
export async function generateStructuredManimCode(
  topic: string
): Promise<string> {
  try {
    // Check storage first
    console.log(`Checking storage for Manim code: ${topic}`);
    const cachedCode = await blobStorage.getManimCode(topic);

    if (cachedCode) {
      console.log(`🎯 Storage HIT - Using stored Manim code for: ${topic}`);
      return cachedCode.validatedCode;
    }

    console.log(`🔄 Storage MISS - Generating new Manim code for: ${topic}`);

    // Generate AI-powered Manim code
    const { object } = await generateObject({
      model: google('gemini-1.5-flash'),
      schema: manimCodeSchema,
      prompt: `Generate production-ready Manim Python code for the topic: "${topic}".

Requirements:
- Use proper 4-space indentation throughout
- Include 'from manim import *' as the only import at the top
- Create a Scene class that inherits from Scene
- Include a construct method with complete animation logic
- Use MathTex for mathematical expressions, never use Tex for math
- Follow proper Manim syntax:
  - Never use .label() method (it doesn't exist in Manim)
  - Use next_to() instead of .label() for positioning text
  - For labeling lines, create separate MathTex objects and position them
  - Use buff parameter with next_to() to control spacing
  - Always provide arguments to set_opacity() (e.g., set_opacity(0.5))
  - For Square, use side_length as a positional parameter, not a keyword
- Use only standard Manim objects and methods that exist in the latest Manim version
- Keep method chains simple (avoid long chains of animations)
- Follow PEP 8 standards for Python code formatting
- Always properly initialize objects with required parameters
- For animations in self.play(), ensure all objects are properly created first
- Add detailed comments explaining each animation step
- IMPORTANT: Do not include any render commands or scene execution at the end
- IMPORTANT: Just define the Scene class, do not instantiate or run it

Example proper Manim patterns:
- Creating text with math: text = MathTex(r"e^{i\pi} + 1 = 0")
- Labeling a line: 
  line = Line(start=LEFT, end=RIGHT)
  label = MathTex("x").next_to(line, UP, buff=0.1)
- Creating and positioning objects:
  square = Square(2)  # side_length as positional parameter
  circle = Circle(radius=1.5)
  arrow = Arrow(start=square.get_corner(DR), end=circle.get_left())

The animation should:
1. Clearly explain the mathematical concept
2. Use visual elements effectively  
3. Progress logically through the explanation
4. Be educational and engaging

Topic: ${topic}

Generate complete, runnable Manim code with proper Python syntax but WITHOUT execution.`
    });

    const rawCode = object.complete_script;
    const validatedCode = validateAndFixManimCode(rawCode);

    // Store the results
    await blobStorage.storeManimCode(topic, rawCode, validatedCode);
    console.log(`💾 Stored Manim code for future use: ${topic}`);

    return validatedCode;
  } catch (error) {
    console.error("Error generating structured Manim code:", error);
    throw new Error(`Failed to generate Manim code for topic: ${topic}. Original error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Function that validates and fixes common issues in AI-generated Manim code
 */
export function validateAndFixManimCode(code: string): string {
  let fixedCode = code;

  // Ensure proper imports
  if (!fixedCode.includes("from manim import *")) {
    fixedCode =
      "from manim import *\n\n" +
      fixedCode.replace(/^.*from manim import \*.*\n?/gm, "");
  }

  // Fix common Manim syntax issues
  fixedCode = fixedCode
    // Fix MathMathTex which doesn't exist (duplicated Math prefix) - more robust pattern
    .replace(/MathMathTex/g, "MathTex")

    // Fix Line.label() which doesn't exist
    .replace(
      /(\w+) = Line\(([^)]*)\)\.label\(([^,]+),?\s*buff=([^)]+)\)/g,
      "$1 = Line($2)\n    $1_label = MathTex($3).next_to($1, UP, buff=$4)"
    )

    // Fix any Tex to MathTex for mathematical content
    .replace(/Tex\(("[^"]*[\\^_].*?"|'[^']*[\\^_].*?')\)/g, "MathTex($1)")

    // Fix set_opacity without arguments
    .replace(/(\w+)\.set_opacity\(\)/g, "$1.set_opacity(0.5)")

    // Fix Square constructor with keyword argument
    .replace(/Square\(side_length=([^,)]+)/g, "Square($1")

    // Fix Circle constructor with keyword argument
    .replace(/Circle\(radius=([^,)]+)/g, "Circle($1")

    // Fix animation syntax for FadeOut all
    .replace(
      /self\.play\(\*\[FadeOut\(mob\) for mob in self\.mobjects\]\)/g,
      "self.play(*[FadeOut(mob) for mob in self.mobjects])"
    )

    // Fix calls to non-existent label method on geometric objects
    .replace(/(\w+)\.label\(([^)]+)\)/g, "MathTex($2).next_to($1, UP)")

    // Fix common animation sequencing issues
    .replace(
      /self\.play\(([^)]+)\.animate\.([^)]+)\)/g,
      "self.play($1.animate.$2)"
    )

    // Fix missing arguments in Create animation
    .replace(/Create\(\)/g, "Create()")

    // Fix Vector constructor with missing arguments
    .replace(/Vector\(\)/g, "Vector(RIGHT)")

    // Fix ValueTracker initialization without value
    .replace(/ValueTracker\(\)/g, "ValueTracker(0)")

    // Fix incorrect MathTex formatting for fractions
    .replace(
      /MathTex\("(.*?)\\frac\{(.*?)\}\{(.*?)\}"(.*?)\)/g,
      'MathTex(r"$1\\frac{$2}{$3}"$4)'
    )

    // Ensure r prefix for complex math expressions
    .replace(/MathTex\("(.*?[\\^_\{\}].*?)"\)/g, 'MathTex(r"$1")');

  // Validate structure
  if (!/class \w+\(Scene\):/.test(fixedCode)) {
    throw new Error("No valid Scene class found in the generated code");
  }

  if (!/def construct\(self\):/.test(fixedCode)) {
    throw new Error("No construct method found in the Scene class");
  }

  // Ensure proper indentation
  const lines = fixedCode.split("\n");
  const properlyIndentedLines = [];
  let inClass = false;
  let inMethod = false;

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Skip empty lines
    if (!trimmedLine) {
      properlyIndentedLines.push("");
      continue;
    }

    // Check for class definition
    if (trimmedLine.startsWith("class ") && trimmedLine.includes("(Scene):")) {
      inClass = true;
      inMethod = false;
      properlyIndentedLines.push(trimmedLine);
      continue;
    }

    // Check for method definition within class
    if (inClass && trimmedLine.startsWith("def ")) {
      inMethod = true;
      properlyIndentedLines.push("    " + trimmedLine);
      continue;
    }

    // Handle indentation based on context
    if (inMethod) {
      properlyIndentedLines.push("        " + trimmedLine);
    } else if (inClass) {
      properlyIndentedLines.push("    " + trimmedLine);
    } else {
      properlyIndentedLines.push(trimmedLine);
    }
  }

  // Join lines back into a string
  fixedCode = properlyIndentedLines.join("\n");

  // Check if there are self.wait() calls in the code, and add them if needed
  // This is crucial for rendering videos properly
  if (!fixedCode.includes("self.wait(")) {
    // Find the end of the construct method to add a wait call
    const constructPattern =
      /def construct\(self\):[\s\S]*?\n(\s+)(?:[^\n]*$|$)/;
    const match = fixedCode.match(constructPattern);

    if (match) {
      const indentation = match[1];
      // Add a wait call at the end of the construct method
      fixedCode = fixedCode.replace(
        constructPattern,
        `def construct(self):\n$&\n${indentation}# Ensure we have enough time to render the final state\n${indentation}self.wait(2)`
      );
    }
  }

  // Fix duplicate construct method definitions
  fixedCode = fixedCode.replace(
    /def construct\(self\):\s*\n\s*def construct\(self\):/g,
    "def construct(self):"
  );

  // Add additional wait calls after each self.play for better rendering
  const playLines = fixedCode.match(/self\.play\(.*?\)/g);
  if (playLines && playLines.length > 0) {
    // Iterate through each self.play and add a wait if there isn't already one
    for (const playLine of playLines) {
      const playLineEscaped = playLine.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const hasWaitAfterPlay = new RegExp(
        `${playLineEscaped}[\\s\\S]*?self\\.wait\\(`,
        "m"
      ).test(fixedCode);

      if (!hasWaitAfterPlay) {
        fixedCode = fixedCode.replace(
          playLineEscaped,
          `${playLine}\n        # Add a brief pause after animation\n        self.wait(0.5)`
        );
      }
    }
  }

  return fixedCode;
}

export { manimCodeSchema };
