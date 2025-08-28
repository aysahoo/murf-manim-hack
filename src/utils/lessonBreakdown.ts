import { z } from "zod";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { blobStorage } from "./blobStorage";

// Schema for lesson breakdown
const lessonBreakdownSchema = z.object({
  lessons: z
    .array(
      z.object({
        part: z.number().describe("Part number (1, 2, 3, etc.)"),
        script: z
          .string()
          .max(70)
          .describe("Narration script (≤70 words for 15 second duration)"),
        manim_code: z
          .string()
          .describe(
            "Python Manim code for this part with lightweight animations"
          ),
      })
    )
    .min(3)
    .max(4)
    .describe("3-4 sequential mini-lessons"),
});

// Fallback lesson breakdowns for common topics
function getFallbackLessonBreakdown(topic: string) {
  const topicLower = topic.toLowerCase();

  if (topicLower.includes("string theory")) {
    return {
      lessons: [
        {
          part: 1,
          script:
            "Welcome to our comprehensive string theory exploration! Imagine everything around us - your phone, the air, even you - is fundamentally made of incredibly tiny vibrating strings. These aren't ordinary strings, but microscopic building blocks smaller than anything we can possibly see, vibrating in countless different patterns to create all matter and energy throughout the entire universe.",
          manim_code: `from manim import *

class Part1(Scene):
    def construct(self):
        title = Text("String Theory - Part 1", font_size=36, color=BLUE)
        title.to_edge(UP)
        
        # Create a simple string representation
        string_line = Line(LEFT * 2, RIGHT * 2, color=YELLOW)
        string_line.set_stroke(width=8)
        
        # Create vibration effect
        vibration_text = Text("Vibrating Strings", font_size=24, color=WHITE)
        vibration_text.next_to(string_line, DOWN)
        
        # Animate
        self.play(Write(title), run_time=2)
        self.play(FadeIn(string_line), run_time=2)
        self.play(Write(vibration_text), run_time=2)
        
        # Simple vibration animation
        self.play(string_line.animate.shift(UP * 0.2), run_time=0.5)
        self.play(string_line.animate.shift(DOWN * 0.4), run_time=0.5)
        self.play(string_line.animate.shift(UP * 0.2), run_time=0.5)
        
        self.wait(2)`,
        },
        {
          part: 2,
          script:
            "Now here's where things get absolutely mind-bending and truly extraordinary! These vibrating strings don't exist in just our familiar three dimensions of length, width, and height. String theory reveals that reality actually needs up to eleven dimensions total - with extra hidden dimensions curled up so incredibly tiny that we can't detect them. These invisible dimensions are absolutely crucial for the mathematics to work properly.",
          manim_code: `from manim import *

class Part2(Scene):
    def construct(self):
        title = Text("Extra Dimensions", font_size=36, color=BLUE)
        title.to_edge(UP)
        
        # Create 3D representation
        visible_dims = Text("3 Visible Dimensions", font_size=24, color=GREEN)
        visible_dims.shift(UP)
        
        hidden_dims = Text("+ Hidden Dimensions", font_size=24, color=RED)
        hidden_dims.shift(DOWN)
        
        # Simple cube to represent 3D space
        cube_outline = Square(2, color=WHITE)
        cube_outline.shift(LEFT * 2)
        
        # Question mark for hidden dimensions
        mystery = Text("?", font_size=48, color=RED)
        mystery.shift(RIGHT * 2)
        
        # Animate
        self.play(Write(title), run_time=2)
        self.play(FadeIn(cube_outline), Write(visible_dims), run_time=3)
        self.play(FadeIn(mystery), Write(hidden_dims), run_time=3)
        
        self.wait(2)`,
        },
        {
          part: 3,
          script:
            "But why do physicists obsess over string theory with such passionate dedication? Because it promises the ultimate prize - a comprehensive 'Theory of Everything' that unifies all fundamental forces into one elegant mathematical framework. Gravity, electromagnetism, and nuclear forces would all emerge from different vibration patterns of the same underlying strings, finally explaining how our universe truly works at its deepest level.",
          manim_code: `from manim import *

class Part3(Scene):
    def construct(self):
        title = Text("Unified Forces", font_size=36, color=BLUE)
        title.to_edge(UP)
        
        # Create force labels
        gravity = Text("Gravity", font_size=20, color=GREEN)
        gravity.shift(UP * 1.5 + LEFT * 2)
        
        electro = Text("Electromagnetism", font_size=20, color=YELLOW)
        electro.shift(UP * 0.5 + LEFT * 2)
        
        nuclear = Text("Nuclear Forces", font_size=20, color=RED)
        nuclear.shift(DOWN * 0.5 + LEFT * 2)
        
        # Arrow pointing to unified theory
        arrow = Arrow(LEFT * 0.5, RIGHT * 0.5, color=WHITE)
        
        unified = Text("One Theory", font_size=24, color=PURPLE)
        unified.shift(RIGHT * 2)
        
        # Animate
        self.play(Write(title), run_time=2)
        self.play(Write(gravity), Write(electro), Write(nuclear), run_time=4)
        self.play(FadeIn(arrow), run_time=2)
        self.play(Write(unified), run_time=2)
        
        self.wait(2)`,
        },
        {
          part: 4,
          script:
            "However, here's the fascinating challenge that keeps physicists awake at night with endless contemplation. Despite being mathematically gorgeous and internally consistent, string theory remains completely unproven by experiments. The energy scales needed to test it directly are impossibly high for current technology. So scientists are getting increasingly creative, searching for indirect evidence and hoping future technology might reveal whether these tiny strings truly orchestrate reality.",
          manim_code: `from manim import *

class Part4(Scene):
    def construct(self):
        title = Text("The Challenge", font_size=36, color=BLUE)
        title.to_edge(UP)
        
        # Create balance scale concept
        theory = Text("Mathematical\\nElegance", font_size=20, color=GREEN)
        theory.shift(LEFT * 2.5)
        
        vs_text = Text("VS", font_size=24, color=WHITE)
        
        experiment = Text("Experimental\\nEvidence", font_size=20, color=RED)
        experiment.shift(RIGHT * 2.5)
        
        # Question about future
        future = Text("Future Discovery?", font_size=24, color=YELLOW)
        future.shift(DOWN * 1.5)
        
        # Animate
        self.play(Write(title), run_time=2)
        self.play(Write(theory), Write(vs_text), Write(experiment), run_time=4)
        self.play(Write(future), run_time=2)
        
        self.wait(2)`,
        },
      ],
    };
  }

  if (topicLower.includes("gravity")) {
    return {
      lessons: [
        {
          part: 1,
          script:
            "Gravity is the fundamental force that pulls objects toward each other throughout the universe. Earth's gravity pulls everything downward toward its center with tremendous force. The more massive an object becomes, the stronger its gravitational pull on surrounding objects. This invisible force shapes the structure of our entire cosmos and governs planetary motion.",
          manim_code: `from manim import *

class Part1(Scene):
    def construct(self):
        title = Text("What is Gravity?", font_size=36, color=BLUE)
        title.to_edge(UP)
        
        earth = Circle(radius=1.2, color=GREEN, fill_opacity=0.8)
        earth.shift(DOWN * 1.5)
        
        apple = Circle(radius=0.3, color=RED, fill_opacity=1)
        apple.shift(UP * 2)
        
        # Animate
        self.play(Write(title), run_time=2)
        self.play(FadeIn(earth), FadeIn(apple), run_time=3)
        
        # Show gravitational pull
        self.play(apple.animate.shift(DOWN * 2.5), run_time=3)
        
        self.wait(2)`,
        },
        {
          part: 2,
          script:
            "Newton's revolutionary law states that gravitational force depends directly on mass and inversely on distance squared. Larger masses create exponentially stronger gravity fields around them. Objects farther apart experience dramatically weaker gravitational attraction. This mathematical relationship governs everything from falling apples to orbiting planets throughout the solar system.",
          manim_code: `from manim import *

class Part2(Scene):
    def construct(self):
        title = Text("Newton's Law", font_size=36, color=BLUE)
        title.to_edge(UP)
        
        # Newton's equation
        equation = MathTex("F = G", "\\\\frac{m_1 m_2}{r^2}")
        equation.scale(1.5)
        
        # Labels
        force_label = Text("Force", font_size=20, color=YELLOW)
        force_label.next_to(equation[0], DOWN)
        
        mass_label = Text("Masses", font_size=20, color=GREEN)
        mass_label.next_to(equation[1], DOWN, buff=0.5)
        
        # Animate
        self.play(Write(title), run_time=2)
        self.play(Write(equation), run_time=3)
        self.play(FadeIn(force_label), FadeIn(mass_label), run_time=3)
        
        self.wait(2)`,
        },
        {
          part: 3,
          script:
            "Einstein revolutionized our understanding by showing gravity isn't actually a force but curved spacetime itself. Massive objects bend and warp the fabric of space and time around them. This fundamental curvature guides the motion of all other objects. Matter tells spacetime how to curve, and curved spacetime tells matter how to move through the universe.",
          manim_code: `from manim import *

class Part3(Scene):
    def construct(self):
        title = Text("Einstein's View", font_size=36, color=BLUE)
        title.to_edge(UP)
        
        # Simple representation of curved spacetime
        grid_lines = VGroup()
        for i in range(-3, 4):
            line = Line(UP * 2, DOWN * 2)
            line.shift(RIGHT * i * 0.5)
            if i == 0:  # Curve the middle line
                line.become(Arc(radius=2, angle=PI/3))
                line.set_color(YELLOW)
            grid_lines.add(line)
        
        mass_text = Text("Mass curves\\nspacetime", font_size=20, color=WHITE)
        mass_text.shift(DOWN * 2)
        
        # Animate
        self.play(Write(title), run_time=2)
        self.play(FadeIn(grid_lines), run_time=4)
        self.play(Write(mass_text), run_time=2)
        
        self.wait(2)`,
        },
      ],
    };
  }

  if (topicLower.includes("photosynthesis")) {
    return {
      lessons: [
        {
          part: 1,
          script:
            "Photosynthesis is the remarkable process by which plants make food using sunlight energy. Plants capture radiant light energy from the sun through specialized chlorophyll molecules. This captured energy powers the complex process of creating sugar from simple ingredients like carbon dioxide and water. This process sustains virtually all life on Earth.",
          manim_code: `from manim import *

class Part1(Scene):
    def construct(self):
        title = Text("Photosynthesis Basics", font_size=36, color=GREEN)
        title.to_edge(UP)
        
        # Sun
        sun = Circle(radius=0.8, color=YELLOW, fill_opacity=1)
        sun.shift(UP * 1.5 + LEFT * 2)
        
        # Light rays
        ray1 = Line(sun.get_center(), DOWN * 0.5 + RIGHT * 1)
        ray2 = Line(sun.get_center(), DOWN * 0.5)
        ray3 = Line(sun.get_center(), DOWN * 0.5 + LEFT * 1)
        rays = VGroup(ray1, ray2, ray3)
        rays.set_color(YELLOW)
        
        # Plant
        plant = Text("🌱", font_size=48)
        plant.shift(DOWN * 0.5)
        
        # Animate
        self.play(Write(title), run_time=2)
        self.play(FadeIn(sun), run_time=2)
        self.play(FadeIn(rays), run_time=2)
        self.play(FadeIn(plant), run_time=2)
        
        self.wait(2)`,
        },
        {
          part: 2,
          script:
            "The photosynthesis equation clearly shows the precise inputs and outputs of this vital process. Carbon dioxide from the air plus water from roots plus light energy creates glucose sugar and releases life-giving oxygen gas. This chemical transformation converts inorganic materials into organic compounds. The equation represents one of nature's most important chemical reactions.",
          manim_code: `from manim import *

class Part2(Scene):
    def construct(self):
        title = Text("The Equation", font_size=36, color=GREEN)
        title.to_edge(UP)
        
        # Simplified equation
        equation = MathTex("CO_2", "+", "H_2O", "+", "Light", "\\\\rightarrow", "C_6H_{12}O_6", "+", "O_2")
        equation.scale(0.8)
        
        # Labels
        inputs = Text("Inputs", font_size=20, color=BLUE)
        inputs.shift(UP * 1.5 + LEFT * 2)
        
        outputs = Text("Outputs", font_size=20, color=RED)
        outputs.shift(UP * 1.5 + RIGHT * 2)
        
        # Animate
        self.play(Write(title), run_time=2)
        self.play(Write(equation), run_time=4)
        self.play(FadeIn(inputs), FadeIn(outputs), run_time=2)
        
        self.wait(2)`,
        },
        {
          part: 3,
          script:
            "Photosynthesis happens in specialized structures called chloroplasts inside plant cells. Chlorophyll is the essential green pigment that captures light energy from sunlight. This remarkable process feeds nearly all life on Earth by producing food and oxygen. Without photosynthesis, complex life as we know it could not exist on our planet.",
          manim_code: `from manim import *

class Part3(Scene):
    def construct(self):
        title = Text("Global Impact", font_size=36, color=GREEN)
        title.to_edge(UP)
        
        # Earth
        earth = Circle(radius=1, color=BLUE, fill_opacity=0.8)
        
        # Plants around Earth
        plant1 = Text("🌱", font_size=24)
        plant1.shift(UP * 1.3)
        
        plant2 = Text("🌳", font_size=24)
        plant2.shift(RIGHT * 1.3)
        
        plant3 = Text("🌿", font_size=24)
        plant3.shift(DOWN * 1.3)
        
        plant4 = Text("🌾", font_size=24)
        plant4.shift(LEFT * 1.3)
        
        plants = VGroup(plant1, plant2, plant3, plant4)
        
        life_text = Text("Feeds All Life", font_size=24, color=YELLOW)
        life_text.shift(DOWN * 2.5)
        
        # Animate
        self.play(Write(title), run_time=2)
        self.play(FadeIn(earth), run_time=2)
        self.play(FadeIn(plants), run_time=3)
        self.play(Write(life_text), run_time=2)
        
        self.wait(2)`,
        },
      ],
    };
  }

  // Default fallback for any topic
  return {
    lessons: [
      {
        part: 1,
        script: `Welcome to our comprehensive introduction to ${topic}. This fundamental concept significantly shapes our understanding of the world around us. Let's explore its key principles and basic components step by step through detailed analysis. Understanding these foundations will help you grasp how this concept influences various aspects of science and everyday life.`,
        manim_code: `from manim import *

class Part1(Scene):
    def construct(self):
        title = Text("${topic} - Part 1", font_size=36, color=BLUE)
        title.to_edge(UP)
        
        intro_text = Text("Introduction", font_size=24, color=WHITE)
        
        concept = Text("Key Concept", font_size=20, color=YELLOW)
        concept.shift(DOWN * 1.5)
        
        # Animate
        self.play(Write(title), run_time=2)
        self.play(FadeIn(intro_text), run_time=3)
        self.play(Write(concept), run_time=3)
        
        self.wait(2)`,
      },
      {
        part: 2,
        script: `Now let's examine the core principles of ${topic} in greater detail. Understanding these essential fundamentals helps us grasp how this concept works in practice and why it matters in various real-world applications. These principles form the foundation for more advanced concepts and practical implementations across multiple fields.`,
        manim_code: `from manim import *

class Part2(Scene):
    def construct(self):
        title = Text("Core Principles", font_size=36, color=BLUE)
        title.to_edge(UP)
        
        principle1 = Text("Principle 1", font_size=20, color=GREEN)
        principle1.shift(UP * 0.5)
        
        principle2 = Text("Principle 2", font_size=20, color=YELLOW)
        principle2.shift(DOWN * 0.5)
        
        arrow = Arrow(principle1.get_bottom(), principle2.get_top(), color=WHITE)
        
        # Animate
        self.play(Write(title), run_time=2)
        self.play(Write(principle1), run_time=2)
        self.play(FadeIn(arrow), run_time=2)
        self.play(Write(principle2), run_time=2)
        
        self.wait(2)`,
      },
      {
        part: 3,
        script: `Let's explore the practical applications of ${topic} in our modern world. This concept has significant real-world implications and countless practical uses across multiple industries. It connects to many other areas of knowledge and everyday experiences, demonstrating its fundamental importance in science, technology, and daily life.`,
        manim_code: `from manim import *

class Part3(Scene):
    def construct(self):
        title = Text("Applications", font_size=36, color=BLUE)
        title.to_edge(UP)
        
        app1 = Text("Application 1", font_size=20, color=GREEN)
        app1.shift(LEFT * 2 + UP * 0.5)
        
        app2 = Text("Application 2", font_size=20, color=YELLOW)
        app2.shift(RIGHT * 2 + UP * 0.5)
        
        center = Circle(radius=0.5, color=WHITE)
        center_text = Text("${topic}", font_size=16, color=WHITE)
        
        # Animate
        self.play(Write(title), run_time=2)
        self.play(FadeIn(center), Write(center_text), run_time=2)
        self.play(Write(app1), Write(app2), run_time=3)
        
        self.wait(2)`,
      },
    ],
  };
}

/**
 * Generates a structured lesson breakdown for any topic
 */
export async function generateLessonBreakdown(topic: string): Promise<{
  lessons: Array<{
    part: number;
    script: string;
    manim_code: string;
  }>;
}> {
  try {
    // Check storage first
    console.log(`Checking storage for lesson breakdown: ${topic}`);
    const cachedBreakdown = await blobStorage.getLessonBreakdown(topic);

    if (cachedBreakdown) {
      console.log(
        `🎯 Storage HIT - Using stored lesson breakdown for: ${topic}`
      );
      return cachedBreakdown;
    }

    console.log(
      `🔄 Storage MISS - Generating new lesson breakdown for: ${topic}`
    );

    // Use fallback immediately (can be enhanced with AI later)
    console.log("🚨 Using fallback lesson breakdown...");
    const fallbackBreakdown = getFallbackLessonBreakdown(topic);

    // Store the fallback for future use
    await blobStorage.storeLessonBreakdown(topic, fallbackBreakdown);
    console.log(`💾 Stored fallback lesson breakdown for future use: ${topic}`);

    return fallbackBreakdown;

    /* Future AI integration - uncomment when ready to use Gemini API
    const { object } = await generateObject({
      model: google('gemini-1.5-flash'),
      schema: lessonBreakdownSchema,
      prompt: `Break down the topic "${topic}" into 3-4 sequential mini-lessons for educational animation.

REQUIREMENTS:
1. Each lesson should be 15 seconds long
2. Narration script must be ≤70 words (fits in 15 seconds of speech)
3. Manim code must use ONLY: Write, FadeIn, FadeOut, Transform
4. Maximum 3-4 animations per scene
5. Set run_time so total scene duration is 15 seconds
6. Each scene class named Part1, Part2, Part3, etc.
7. Lessons must flow naturally from one to the next

MANIM CODE RULES:
- Use 'from manim import *' as only import
- Create Scene class that inherits from Scene
- Include construct method with complete animation logic
- Use proper 4-space indentation
- Add self.wait() calls for proper timing
- Keep animations lightweight and fast
- Focus on visual clarity over complexity

LESSON FLOW:
- Part 1: Introduction and basic definition
- Part 2: Key mechanism or process
- Part 3: Applications or implications
- Part 4 (optional): Advanced concepts or future directions

Make each part build naturally on the previous one while being understandable independently.

Topic: ${topic}`
    });

    // Store the result
    await blobStorage.storeLessonBreakdown(topic, object);
    console.log(`💾 Stored lesson breakdown for future use: ${topic}`);

    return object;
    */
  } catch (error) {
    console.error("Error generating lesson breakdown:", error);
    console.log("🚨 AI generation failed, using fallback...");

    // Return fallback lesson breakdown
    const fallbackBreakdown = getFallbackLessonBreakdown(topic);

    // Store the fallback
    await blobStorage.storeLessonBreakdown(topic, fallbackBreakdown);
    console.log(`💾 Stored fallback lesson breakdown for future use: ${topic}`);

    return fallbackBreakdown;
  }
}

export { lessonBreakdownSchema };
