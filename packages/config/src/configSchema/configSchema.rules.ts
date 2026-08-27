import type {
  ConfigSchema,
  ConfigArraySchema,
  ConfigNumberSchema,
  ConfigStringSchema,
  ConfigValidationContext,
  ConfigValidationIssue,
} from "./configSchema.type.js";

import {
  createConfigValidationIssue,
} from "./configSchema.validator.js";

/**
 * Formats expected schema types.
 */
export function formatExpectedType(
  type:
    | import("./configSchema.type.js").ConfigValueType
    | readonly import("./configSchema.type.js").ConfigValueType[],
): string {
  if (
    Array.isArray(type)
  ) {
    return type.join(
      " | ",
    );
  }

  return String(type);
}

/**
 * Resolves a schema default.
 */
export function resolveDefaultValue(
  schema: ConfigSchema,
): import("../configValue/configValue.core.js").ConfigValue | undefined {
  if (
    schema.default ===
      undefined
  ) {
    return undefined;
  }

  return typeof schema.default ===
    "function"
    ? (
        schema.default as () => import("../configValue/configValue.core.js").ConfigValue
      )()
    : schema.default;
}

/**
 * Adds custom validation output to the issue list.
 */
export function appendCustomValidationResult(
  result:
    | boolean
    | string
    | ConfigValidationIssue
    | readonly ConfigValidationIssue[],
  path: string,
  issues: ConfigValidationIssue[],
): void {
  if (
    result === true
  ) {
    return;
  }

  if (
    result === false
  ) {
    issues.push(
      createConfigValidationIssue(
        path,
        "Configuration value failed validation.",
        "CUSTOM_VALIDATION",
      ),
    );

    return;
  }

  if (
    typeof result === "string"
  ) {
    issues.push(
      createConfigValidationIssue(
        path,
        result,
        "CUSTOM_VALIDATION",
      ),
    );

    return;
  }

  if (
    Array.isArray(result)
  ) {
    issues.push(
      ...result,
    );

    return;
  }

  issues.push(
    ...(
      Array.isArray(result)
        ? result
        : [result]
    ),
  );
}

/**
 * Built-in schema validation rules.
 */
export function validateBuiltInRules(
  value: unknown,
  schema: ConfigSchema,
  context: ConfigValidationContext,
  issues: ConfigValidationIssue[],
): void {
  if (
    typeof value === "string"
  ) {
    const stringSchema =
      schema as ConfigStringSchema;

    if (
      stringSchema.minLength !==
        undefined &&
      value.length <
        stringSchema.minLength
    ) {
      issues.push(
        createConfigValidationIssue(
          context.path,
          `Value must contain at least ${stringSchema.minLength} characters.`,
          "MIN_LENGTH",
        ),
      );
    }

    if (
      stringSchema.maxLength !==
        undefined &&
      value.length >
        stringSchema.maxLength
    ) {
      issues.push(
        createConfigValidationIssue(
          context.path,
          `Value must contain at most ${stringSchema.maxLength} characters.`,
          "MAX_LENGTH",
        ),
      );
    }

    if (
      stringSchema.pattern
    ) {
      const pattern =
        typeof stringSchema.pattern ===
          "string"
          ? new RegExp(
              stringSchema.pattern,
            )
          : stringSchema.pattern;

      if (
        !pattern.test(value)
      ) {
        issues.push(
          createConfigValidationIssue(
            context.path,
            "Value does not match the required pattern.",
            "PATTERN",
          ),
        );
      }
    }

    if (
      stringSchema.enum &&
      !stringSchema.enum.includes(
        value,
      )
    ) {
      issues.push(
        createConfigValidationIssue(
          context.path,
          `Value must be one of: ${stringSchema.enum.join(", ")}.`,
          "ENUM",
        ),
      );
    }
  }

  if (
    typeof value === "number"
  ) {
    const numberSchema =
      schema as ConfigNumberSchema;

    if (
      numberSchema.min !==
        undefined &&
      value <
        numberSchema.min
    ) {
      issues.push(
        createConfigValidationIssue(
          context.path,
          `Value must be greater than or equal to ${numberSchema.min}.`,
          "MIN",
        ),
      );
    }

    if (
      numberSchema.max !==
        undefined &&
      value >
        numberSchema.max
    ) {
      issues.push(
        createConfigValidationIssue(
          context.path,
          `Value must be less than or equal to ${numberSchema.max}.`,
          "MAX",
        ),
      );
    }

    if (
      numberSchema.integer &&
      !Number.isInteger(value)
    ) {
      issues.push(
        createConfigValidationIssue(
          context.path,
          "Value must be an integer.",
          "INTEGER",
        ),
      );
    }

    if (
      numberSchema.positive &&
      value <= 0
    ) {
      issues.push(
        createConfigValidationIssue(
          context.path,
          "Value must be positive.",
          "POSITIVE",
        ),
      );
    }
  }

  if (
    Array.isArray(value)
  ) {
    const arraySchema =
      schema as ConfigArraySchema;

    if (
      arraySchema.minItems !==
        undefined &&
      value.length <
        arraySchema.minItems
    ) {
      issues.push(
        createConfigValidationIssue(
          context.path,
          `Array must contain at least ${arraySchema.minItems} items.`,
          "MIN_ITEMS",
        ),
      );
    }

    if (
      arraySchema.maxItems !==
        undefined &&
      value.length >
        arraySchema.maxItems
    ) {
      issues.push(
        createConfigValidationIssue(
          context.path,
          `Array must contain at most ${arraySchema.maxItems} items.`,
          "MAX_ITEMS",
        ),
      );
    }

    if (
      arraySchema.items
    ) {
      value.forEach(
        (
          item,
          index,
        ) => {
          const {
            validateConfigValue,
          } = require("./configSchema.validator.js");

          const result =
            validateConfigValue(
              item,
              arraySchema.items!,
              {
                path:
                  `${context.path}[${index}]`,
                root:
                  context.root,
                parent:
                  value,
                key:
                  index,
              },
            );

          issues.push(
            ...result.issues,
          );
        },
      );
    }
  }
}
