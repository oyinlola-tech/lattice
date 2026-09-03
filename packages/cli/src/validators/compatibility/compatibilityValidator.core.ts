/**
 * zudo-cli — Compatibility Validator
 *
 * Validates compatibility between selected project options.
 */

export interface CompatibilityCheck {
  readonly option1: string;
  readonly option2: string;
  readonly reason: string;
  readonly severity: "error" | "warning";
}

export interface CompatibilityResult {
  readonly valid: boolean;
  readonly checks: readonly CompatibilityCheck[];
}

export class CompatibilityValidator {
  private readonly incompatibilities: CompatibilityCheck[] = [
    {
      option1: "next",
      option2: "vite",
      reason: "Next.js manages its own build system and does not need Vite.",
      severity: "error",
    },
    {
      option1: "nuxt",
      option2: "vite",
      reason: "Nuxt manages its own build system.",
      severity: "error",
    },
    {
      option1: "angular",
      option2: "vite",
      reason: "Angular uses its own build system.",
      severity: "error",
    },
    {
      option1: "sveltekit",
      option2: "vite",
      reason: "SvelteKit manages its own build system.",
      severity: "error",
    },
    {
      option1: "astro",
      option2: "vite",
      reason: "Astro manages its own build system.",
      severity: "error",
    },
    {
      option1: "flutter",
      option2: "react",
      reason: "Flutter and React are different frameworks.",
      severity: "error",
    },
    {
      option1: "flutter",
      option2: "vue",
      reason: "Flutter and Vue are different frameworks.",
      severity: "error",
    },
    {
      option1: "react-native",
      option2: "react",
      reason: "React Native uses its own React variant.",
      severity: "error",
    },
    {
      option1: "flutter",
      option2: "pnpm",
      reason: "Flutter uses its own package manager (pub).",
      severity: "warning",
    },
    {
      option1: "flutter",
      option2: "npm",
      reason: "Flutter uses its own package manager (pub).",
      severity: "warning",
    },
    {
      option1: "flutter",
      option2: "yarn",
      reason: "Flutter uses its own package manager (pub).",
      severity: "warning",
    },
  ];

  validate(options: Record<string, string>): CompatibilityResult {
    const checks: CompatibilityCheck[] = [];
    const values = Object.values(options);

    for (const incompatibility of this.incompatibilities) {
      const hasOption1 = values.includes(incompatibility.option1);
      const hasOption2 = values.includes(incompatibility.option2);

      if (hasOption1 && hasOption2) {
        checks.push(incompatibility);
      }
    }

    const valid = checks.filter((c) => c.severity === "error").length === 0;

    return { valid, checks };
  }
}
