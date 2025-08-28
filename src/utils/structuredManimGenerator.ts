import { z } from "zod";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { blobStorage } from "./blobStorage";

// Fallback Manim code when API is down
function getFallbackManimCode(topic: string): string {
  const topicLower = topic.toLowerCase();

  if (
    topicLower.includes("math") ||
    topicLower.includes("addition") ||
    topicLower.includes("equation")
  ) {
    return `from manim import *

class MathScene(Scene):
    def construct(self):
        # Create a simple math equation
        equation = MathTex("2 + 3 = 5")
        equation.scale(2)
        
        # Animate the equation
        self.play(Write(equation))
        self.wait(1)
        
        # Transform to show process
        equation2 = MathTex("2", "+", "3", "=", "5")
        equation2.scale(2)
        
        self.play(Transform(equation, equation2))
        self.wait(1)
        
        # Highlight the result
        self.play(equation[4].animate.set_color(YELLOW))
        self.wait(2)`;
  }

  if (topicLower.includes("circle") || topicLower.includes("geometry")) {
    return `from manim import *

class CircleScene(Scene):
    def construct(self):
        # Create a circle
        circle = Circle(radius=2, color=BLUE)
        
        # Create title
        title = Text("Circle", font_size=48)
        title.to_edge(UP)
        
        # Animate
        self.play(Write(title))
        self.play(Create(circle))
        self.wait(1)
        
        # Show radius
        radius = Line(circle.get_center(), circle.get_right(), color=RED)
        radius_label = Text("r", font_size=36, color=RED)
        radius_label.next_to(radius, DOWN)
        
        self.play(Create(radius), Write(radius_label))
        self.wait(2)`;
  }

  if (topicLower.includes("gravity") || topicLower.includes("physics")) {
    return `from manim import *

class GravityScene(Scene):
    def construct(self):
        # Create title
        title = Text("Gravity", font_size=48, color=BLUE)
        title.to_edge(UP)
        
        # Create objects
        earth = Circle(radius=1, color=GREEN, fill_opacity=0.8)
        apple = Circle(radius=0.2, color=RED, fill_opacity=1)
        
        # Position objects
        earth.shift(DOWN * 2)
        apple.shift(UP * 2)
        
        # Create force arrow
        force_arrow = Arrow(apple.get_center(), earth.get_center(), color=YELLOW)
        force_label = Text("F = mg", font_size=24, color=YELLOW)
        force_label.next_to(force_arrow, RIGHT)
        
        # Animate
        self.play(Write(title))
        self.play(Create(earth), Create(apple))
        self.wait(0.5)
        self.play(Create(force_arrow), Write(force_label))
        self.wait(1)
        
        # Show falling motion
        self.play(apple.animate.move_to(earth.get_center() + UP * 1.3))
        self.wait(2)`;
  }

  if (
    topicLower.includes("list") ||
    topicLower.includes("array") ||
    topicLower.includes("data")
  ) {
    return `from manim import *

class ListScene(Scene):
    def construct(self):
        # Create title
        title = Text("Lists", font_size=48, color=BLUE)
        title.to_edge(UP)
        
        # Create simple list boxes
        box1 = Rectangle(width=1, height=1, color=WHITE)
        text1 = Text("A", font_size=36)
        item1 = VGroup(box1, text1)
        item1.shift(LEFT * 2)
        
        box2 = Rectangle(width=1, height=1, color=WHITE)
        text2 = Text("B", font_size=36)
        item2 = VGroup(box2, text2)
        
        box3 = Rectangle(width=1, height=1, color=WHITE)
        text3 = Text("C", font_size=36)
        item3 = VGroup(box3, text3)
        item3.shift(RIGHT * 2)
        
        # Create indices
        index1 = Text("0", font_size=24, color=GRAY)
        index1.next_to(item1, DOWN)
        
        index2 = Text("1", font_size=24, color=GRAY)
        index2.next_to(item2, DOWN)
        
        index3 = Text("2", font_size=24, color=GRAY)
        index3.next_to(item3, DOWN)
        
        # Animate
        self.play(Write(title))
        self.wait(0.5)
        self.play(Create(item1), Create(item2), Create(item3))
        self.wait(0.5)
        self.play(Write(index1), Write(index2), Write(index3))
        self.wait(1)
        
        # Highlight elements
        self.play(item1[0].animate.set_color(YELLOW))
        self.wait(0.5)
        self.play(item1[0].animate.set_color(WHITE))
        
        self.play(item2[0].animate.set_color(YELLOW))
        self.wait(0.5)
        self.play(item2[0].animate.set_color(WHITE))
        
        self.play(item3[0].animate.set_color(YELLOW))
        self.wait(0.5)
        self.play(item3[0].animate.set_color(WHITE))
        
        self.wait(1)`;
  }

  if (topicLower.includes("tuple") || topicLower.includes("pair")) {
    return `from manim import *

class TupleScene(Scene):
    def construct(self):
        # Create title
        title = Text("Tuples", font_size=48, color=PURPLE)
        title.to_edge(UP)
        
        # Create tuple with parentheses
        left_paren = Text("(", font_size=72, color=WHITE)
        left_paren.shift(LEFT * 2.5)
        
        right_paren = Text(")", font_size=72, color=WHITE)
        right_paren.shift(RIGHT * 2.5)
        
        # Create tuple elements
        text1 = Text("A", font_size=36, color=YELLOW)
        text1.shift(LEFT * 1.5)
        
        comma1 = Text(",", font_size=36, color=WHITE)
        comma1.shift(LEFT * 0.8)
        
        text2 = Text("B", font_size=36, color=YELLOW)
        
        comma2 = Text(",", font_size=36, color=WHITE)
        comma2.shift(RIGHT * 0.8)
        
        text3 = Text("C", font_size=36, color=YELLOW)
        text3.shift(RIGHT * 1.5)
        
        # Create indices
        index1 = Text("0", font_size=24, color=GRAY)
        index1.next_to(text1, DOWN, buff=0.8)
        
        index2 = Text("1", font_size=24, color=GRAY)
        index2.next_to(text2, DOWN, buff=0.8)
        
        index3 = Text("2", font_size=24, color=GRAY)
        index3.next_to(text3, DOWN, buff=0.8)
        
        # Animate
        self.play(Write(title))
        self.wait(0.5)
        self.play(Write(left_paren), Write(right_paren))
        self.wait(0.3)
        self.play(Write(text1), Write(comma1))
        self.wait(0.3)
        self.play(Write(text2), Write(comma2))
        self.wait(0.3)
        self.play(Write(text3))
        self.wait(0.5)
        self.play(Write(index1), Write(index2), Write(index3))
        self.wait(1)
        
        # Show immutable text
        immutable = Text("Immutable", font_size=32, color=RED)
        immutable.to_edge(DOWN)
        self.play(Write(immutable))
        self.wait(2)`;
  }

  // Default fallback
  return `from manim import *

class TopicScene(Scene):
    def construct(self):
        # Create title
        title = Text("${topic}", font_size=48)
        title.set_color(BLUE)
        
        # Create a simple animation
        square = Square(2, color=GREEN)
        circle = Circle(1, color=RED)
        
        # Position elements
        title.to_edge(UP)
        square.to_edge(LEFT)
        circle.to_edge(RIGHT)
        
        # Animate
        self.play(Write(title))
        self.wait(0.5)
        self.play(Create(square), Create(circle))
        self.wait(1)
        
        # Transform square to circle
        self.play(Transform(square, circle.copy().to_edge(LEFT)))
        self.wait(2)`;
}

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

    // Use fallback immediately instead of trying Gemini API (quota exceeded)
    console.log("🚨 Using fallback Manim code (Gemini quota exceeded)...");
    const fallbackCode = getFallbackManimCode(topic);

    // Store the fallback for future use
    await blobStorage.storeManimCode(topic, fallbackCode, fallbackCode);
    console.log(`💾 Stored fallback Manim code for future use: ${topic}`);

    return fallbackCode;

    /* Commented out Gemini API call due to quota
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
    */
  } catch (error) {
    console.error("Error generating structured Manim code:", error);
    console.log("🚨 Gemini API failed for Manim code, using fallback...");

    // Return fallback Manim code and store it
    const fallbackCode = getFallbackManimCode(topic);
    await blobStorage.storeManimCode(topic, fallbackCode, fallbackCode);
    console.log(`💾 Stored fallback Manim code for future use: ${topic}`);

    return fallbackCode;
  }
}

/**
 * Fallback function that validates and fixes common issues in AI-generated Manim code
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
