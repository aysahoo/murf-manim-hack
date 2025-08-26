import { z } from 'zod';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';

// Schema for structured Manim code generation
const manimCodeSchema = z.object({
  imports: z.array(z.string()).describe("All necessary import statements for Manim"),
  class_name: z.string().describe("Name of the Scene class (e.g., 'PythagoreanTheorem')"),
  class_definition: z.object({
    name: z.string(),
    docstring: z.string().optional(),
    methods: z.array(z.object({
      name: z.string(),
      parameters: z.array(z.string()),
      body: z.string().describe("Complete method body with proper 4-space indentation"),
      docstring: z.string().optional()
    }))
  }),
  complete_script: z.string().describe("Full executable Manim Python script with proper PEP 8 formatting")
});

/**
 * Advanced formatter that uses AI to generate structured, production-ready Manim code
 */
export async function generateStructuredManimCode(topic: string): Promise<string> {
  try {
    const { object } = await generateObject({
      model: google('gemini-1.5-flash'),
      schema: manimCodeSchema,
      prompt: `Generate production-ready Manim Python code for the topic: "${topic}".

Requirements:
- Use proper 4-space indentation throughout
- Include 'from manim import *' as the only import
- Create a Scene class that inherits from Scene
- Include a construct method with complete animation logic
- Use MathTex for mathematical expressions, not Tex
- Use proper Manim syntax (no .label() method on Line objects)
- Follow PEP 8 standards
- Make the code immediately executable without rendering (just import and class definition)
- Add comments explaining each animation step
- Use appropriate Manim objects and animations
- IMPORTANT: Do not include any render commands or scene execution at the end
- IMPORTANT: Just define the Scene class, do not instantiate or run it

The animation should:
1. Clearly explain the mathematical concept
2. Use visual elements effectively  
3. Progress logically through the explanation
4. Be educational and engaging

Topic: ${topic}

Generate complete, runnable Manim code with proper Python syntax but WITHOUT execution.`
    });

    return object.complete_script;
  } catch (error) {
    console.error('Error generating structured Manim code:', error);
    throw new Error('Failed to generate structured Manim code');
  }
}

/**
 * Fallback function that validates and fixes common issues in AI-generated Manim code
 */
export function validateAndFixManimCode(code: string): string {
  let fixedCode = code;

  // Ensure proper imports
  if (!fixedCode.includes('from manim import *')) {
    fixedCode = 'from manim import *\n\n' + fixedCode.replace(/^.*from manim import \*.*\n?/gm, '');
  }

  // Fix common Manim syntax issues
  fixedCode = fixedCode
    // Fix Line.label() which doesn't exist
    .replace(/(\w+) = Line\(([^)]*)\)\.label\(([^,]+),?\s*buff=([^)]+)\)/g,
      '$1 = Line($2)\n    $1_label = MathTex($3).next_to($1, UP, buff=$4)')
    
    // Fix Tex to MathTex for mathematical content
    .replace(/Tex\(("[^"]*[\\^_].*?"|'[^']*[\\^_].*?')\)/g, 'MathTex($1)')
    
    // Fix set_opacity without arguments
    .replace(/(\w+)\.set_opacity\(\)/g, '$1.set_opacity(0.5)')
    
    // Fix Square constructor
    .replace(/Square\(side_length=([^,)]+)/g, 'Square($1')
    
    // Fix animation syntax
    .replace(/self\.play\(\*\[FadeOut\(mob\) for mob in self\.mobjects\]\)/g,
      'self.play(*[FadeOut(mob) for mob in self.mobjects])');

  // Validate structure
  if (!/class \w+\(Scene\):/.test(fixedCode)) {
    throw new Error('No valid Scene class found in the generated code');
  }

  if (!/def construct\(self\):/.test(fixedCode)) {
    throw new Error('No construct method found in the Scene class');
  }

  return fixedCode;
}

export { manimCodeSchema };
