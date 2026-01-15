# Project: Lux - Refraction & TIR Simulator

## Project Goal
Create a visually stunning, scientifically accurate, and interactive simulation of Light Refraction and Total Internal Reflection (TIR).

## Physics Rules (Strict Adherence)
1.  **Snell's Law:** $n_1 \cdot \sin(\theta_1) = n_2 \cdot \sin(\theta_2)$
2.  **Critical Angle:** Calculate $\theta_c = \arcsin(n_2 / n_1)$.
3.  **TIR:** If $n_1 > n_2$ and $\theta_1 > \theta_c$, the ray must reflect entirely (Angle of Incidence = Angle of Reflection).
4.  **Reflection:** A weak reflected ray should always exist (partial reflection) even during refraction, but for this MVP, prioritize the main Refracted ray unless TIR occurs.

## Aesthetic Guidelines ("Vibe Coding")
-   **Theme:** Dark mode / Sci-fi Laboratory aesthetic. Deep blues, neon accents for rays.
-   **Visuals:**
    -   Medium 1 and Medium 2 should have distinct, subtle background colors.
    -   The Laser source should look polished (not just a box).
    -   Rays should have a "glow" effect (shadowBlur).
-   **UX:** Controls should be semi-transparent or floating to maximize the canvas area.

## Code Standards
-   No spaghetti code. Separate the `Canvas` logic into a custom hook (e.g., `useRefractionCanvas`) or a dedicated component.
-   Use TypeScript interfaces for all props.