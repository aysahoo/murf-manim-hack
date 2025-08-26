import { z } from 'zod';

// Schema for structured Manim code generation
const manimCodeSchema = z.object({
  imports: z.array(z.string()).describe("All necessary import statements for Manim"),
  class_name: z.string().describe("Name of the Scene class"),
  class_definition: z.string().describe("Complete class definition with proper indentation"),
  methods: z.array(z.object({
    name: z.string(),
    parameters: z.array(z.string()),
    body: z.string().describe("Method body with proper 4-space indentation"),
    docstring: z.string().optional()
  })),
  complete_script: z.string().describe("Full executable Manim Python script with proper formatting")
});

/**
 * Formats and fixes common issues in generated Manim code to make it executable.
 * Uses structured formatting to ensure proper Python syntax and Manim best practices.
 */
export function formatManimCode(raw: string): string {
  let code = raw.trim();

  // Basic cleanup and formatting
  code = cleanupBasicSyntax(code);
  
  // Apply structured formatting
  code = applyStructuredFormatting(code);
  
  // Final validation and fixes
  code = finalValidationAndFixes(code);

  return code;
}

/**
 * Clean up basic Python syntax issues
 */
function cleanupBasicSyntax(code: string): string {
  // Remove all existing 'from manim import *' lines
  code = code.replace(/^.*from manim import \*.*\n?/gm, '');
  
  // Add proper import at the top
  code = 'from manim import *\n\n' + code;
  
  // Fix common Manim syntax issues
  code = fixManimSyntaxIssues(code);
  
  // Ensure proper indentation (4 spaces)
  code = fixIndentation(code);
  
  return code;
}

/**
 * Apply structured formatting based on Manim best practices
 */
function applyStructuredFormatting(code: string): string {
  // Fix Line.label() calls which don't exist in Manim
  code = code.replace(/(\w+) = Line\(([^)]*)\)\.label\(([^,]+),?\s*buff=([^)]+)\)/g,
    (match, varName, lineArgs, labelText, buff) => {
      return `${varName} = Line(${lineArgs})\n    ${varName}_label = MathTex(${labelText}).next_to(${varName}, UP, buff=${buff})`;
    }
  );

  // Replace incorrect Tex usage with MathTex for mathematical content
  code = code.replace(/Tex\(("[^"]*[\\^_].*?"|'[^']*[\\^_].*?')\)/g, 'MathTex($1)');
  
  // Fix set_opacity() calls without arguments
  code = code.replace(/(\w+)\.set_opacity\(\)/g, '$1.set_opacity(0.5)');
  
  // Fix animate.set_opacity syntax
  code = code.replace(/(\w+)\.animate\.set_opacity\(([^)]+)\)/g, '$1.animate.set_opacity($2)');
  
  return code;
}

/**
 * Fix common Manim-specific syntax issues
 */
function fixManimSyntaxIssues(code: string): string {
  // Replace label method calls on geometric objects
  code = code.replace(/(\w+)\.label\(([^)]+)\)/g, 'MathTex($2).next_to($1, UP)');
  
  // Fix Square constructor calls
  code = code.replace(/Square\(side_length=([^,)]+)/g, 'Square($1');
  
  // Fix common animation syntax
  code = code.replace(/self\.play\(\*\[FadeOut\(mob\) for mob in self\.mobjects\]\)/g, 
    'self.play(*[FadeOut(mob) for mob in self.mobjects])');
  
  return code;
}

/**
 * Fix indentation to use proper 4-space Python indentation
 */
function fixIndentation(code: string): string {
  const lines = code.split('\n');
  const fixedLines: string[] = [];
  
  for (const line of lines) {
    if (line.trim() === '') {
      fixedLines.push('');
      continue;
    }
    
    // Count current indentation level
    const leadingSpaces = line.match(/^ */)?.[0].length || 0;
    const indentLevel = Math.floor(leadingSpaces / 4);
    
    // Apply proper 4-space indentation
    const properIndent = '    '.repeat(indentLevel);
    const trimmedLine = line.trim();
    
    fixedLines.push(properIndent + trimmedLine);
  }
  
  return fixedLines.join('\n');
}

/**
 * Final validation and fixes
 */
function finalValidationAndFixes(code: string): string {
  // Remove trailing whitespace
  code = code.replace(/[ \t]+$/gm, '');
  
  // Ensure Scene class is present
  if (!/class \w+\(Scene\):/.test(code)) {
    code += '\n\n# ERROR: No Scene class found. Please ensure your code includes a class that inherits from Scene.';
  }
  
  // Ensure construct method is present
  if (!/def construct\(self\):/.test(code)) {
    code += '\n\n# ERROR: No construct method found. Please ensure your Scene class has a construct method.';
  }
  
  // Remove duplicate empty lines
  code = code.replace(/\n{3,}/g, '\n\n');
  
  return code;
}

function convertEscapedNewlines(llmOutput: string): string {
  /**
   * Convert escaped newlines to actual line breaks
   * @param llmOutput - The LLM output string containing escaped sequences
   * @returns Formatted string with actual line breaks and unescaped characters
   */

  // Replace \n with actual newlines
  let multilineCode = llmOutput.replace(/\\n/g, '\n');

  // Also handle other common escape sequences
  multilineCode = multilineCode.replace(/\\t/g, '\t');  // tabs
  multilineCode = multilineCode.replace(/\\"/g, '"');   // escaped double quotes
  multilineCode = multilineCode.replace(/\\'/g, "'");   // escaped single quotes
  multilineCode = multilineCode.replace(/\\\\/g, '\\'); // escaped backslashes

  return multilineCode;
}

export { manimCodeSchema, convertEscapedNewlines };
