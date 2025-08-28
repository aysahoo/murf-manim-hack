from manim import *

class StringTheoryScene(Scene):
    def construct(self):
        # Step 1: Display the title "String Theory"
        title = MathTex(r"\textbf{String Theory}").scale(1.2)
        self.play(Write(title))
        self.wait(1)
        self.play(FadeOut(title))

        # Step 2: Present the basic mathematical expression from string theory.
        # This action shows the Polyakov action used in string theory.
        polyakov_action = MathTex(
            r"S = \frac{-1}{2\pi \alpha'}\int d^2\sigma \sqrt{-h}\, h^{ab}\, \partial_a X^\mu \partial_b X^\mu g_{\mu\nu}"
        )
        polyakov_action.shift(UP * 2)
        self.play(Write(polyakov_action))
        self.wait(1)

        # Step 3: Create a visual representation of a vibrating string using a line.
        string_line = Line(LEFT * 3, RIGHT * 3)
        self.play(Create(string_line))
        self.wait(1)

        # Step 4: Label the string with a MathTex object.
        string_label = MathTex(r"\text{Vibrating String}")
        string_label.next_to(string_line, UP, buff=0.2)
        self.play(Write(string_label))
        self.wait(1)

        # Step 5: Introduce extra spatial dimensions.
        # Create a square to visually represent extra dimensions.
        extra_dimensions = Square(2)
        extra_dimensions.next_to(string_line, DOWN, buff=0.5)
        extra_dimensions.set_opacity(0.5)
        self.play(Create(extra_dimensions))
        self.wait(1)

        # Step 6: Label the extra dimensions.
        extra_label = MathTex(r"\text{Extra Dimensions}")
        extra_label.next_to(extra_dimensions, DOWN, buff=0.1)
        self.play(Write(extra_label))
        self.wait(1)

        # Step 7: Use an arrow to indicate the connection between the vibrating string and extra dimensions.
        arrow = Arrow(start=string_line.get_corner(DR), end=extra_dimensions.get_top(), buff=0.1)
        self.play(Create(arrow))
        self.wait(1)

        # Step 8: Fade out all objects to conclude the scene.
        self.play(
            FadeOut(polyakov_action),
            FadeOut(string_line),
            FadeOut(string_label),
            FadeOut(extra_dimensions),
            FadeOut(extra_label),
            FadeOut(arrow)
        )
        self.wait(1)
