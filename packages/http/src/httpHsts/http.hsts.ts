/**
 * HTTP Strict Transport Security (HSTS) utilities.
 *
 * Provides parsing, formatting, validation, and response-header helpers
 * for the Strict-Transport-Security header.
 */

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface HSTSOptions {
  readonly maxAge: number;
  readonly includeSubDomains?: boolean;
  readonly preload?: boolean;
}

export interface HSTSPolicy {
  readonly maxAge: number;
  readonly includeSubDomains: boolean;
  readonly preload: boolean;
}

export interface HSTSResult {
  readonly header: string;
  readonly policy: HSTSPolicy;
}

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

export const STRICT_TRANSPORT_SECURITY_HEADER =
  "Strict-Transport-Security";

export const HSTS_DEFAULT_MAX_AGE =
  31536000;

export const HSTS_PRELOAD_MIN_MAX_AGE =
  31536000;

/* -------------------------------------------------------------------------- */
/* Parsing                                                                    */
/* -------------------------------------------------------------------------- */

export function parseHSTS(
  value:
    | string
    | undefined
    | null,
): HSTSPolicy | undefined {
  if (
    value === undefined ||
    value === null ||
    value.trim().length === 0
  ) {
    return undefined;
  }

  const directives =
    value
      .split(";")
      .map(
        (item) => item.trim(),
      )
      .filter(Boolean);

  let maxAge:
    | number
    | undefined;

  let includeSubDomains =
    false;

  let preload =
    false;

  for (
    const directive of directives
  ) {
    const separator =
      directive.indexOf("=");

    const name =
      (
        separator === -1
          ? directive
          : directive.slice(
              0,
              separator,
            )
      )
        .trim()
        .toLowerCase();

    const rawValue =
      separator === -1
        ? undefined
        : directive
            .slice(
              separator + 1,
            )
            .trim();

    if (
      name ===
      "max-age"
    ) {
      if (
        rawValue ===
          undefined ||
        !/^\d+$/.test(
          rawValue,
        )
      ) {
        return undefined;
      }

      const parsed =
        Number(
          rawValue,
        );

      if (
        !Number.isSafeInteger(
          parsed,
        )
      ) {
        return undefined;
      }

      maxAge =
        parsed;
      continue;
    }

    if (
      name ===
      "includeSubDomains"
        .toLowerCase()
    ) {
      includeSubDomains =
        true;
      continue;
    }

    if (
      name ===
      "preload"
    ) {
      preload =
        true;
    }
  }

  if (
    maxAge ===
    undefined
  ) {
    return undefined;
  }

  return {
    maxAge,
    includeSubDomains,
    preload,
  };
}

/* -------------------------------------------------------------------------- */
/* Formatting                                                                 */
/* -------------------------------------------------------------------------- */

export function formatHSTS(
  options:
    | HSTSOptions
    | HSTSPolicy,
): string {
  validateHSTSOptions(
    options,
  );

  const parts = [
    `max-age=${options.maxAge}`,
  ];

  if (
    options.includeSubDomains
  ) {
    parts.push(
      "includeSubDomains",
    );
  }

  if (
    options.preload
  ) {
    parts.push(
      "preload",
    );
  }

  return parts.join(
    "; ",
  );
}

export function createHSTS(
  options:
    | Partial<HSTSOptions> = {},
): HSTSResult {
  const policy: HSTSPolicy =
    {
      maxAge:
        options.maxAge ??
        HSTS_DEFAULT_MAX_AGE,
      includeSubDomains:
        options.includeSubDomains ??
        false,
      preload:
        options.preload ??
        false,
    };

  validateHSTSOptions(
    policy,
  );

  return {
    header:
      formatHSTS(
        policy,
      ),
    policy,
  };
}

export function createHSTSHeader(
  options:
    | Partial<HSTSOptions> = {},
): string {
  return createHSTS(
    options,
  ).header;
}

/* -------------------------------------------------------------------------- */
/* Common Policies                                                            */
/* -------------------------------------------------------------------------- */

export function strictHSTS(
  options:
    | Partial<HSTSOptions> = {},
): string {
  return createHSTSHeader({
    maxAge:
      options.maxAge ??
      HSTS_DEFAULT_MAX_AGE,
    includeSubDomains:
      options.includeSubDomains ??
      true,
    preload:
      options.preload ??
      false,
  });
}

export function preloadHSTS(
  options:
    | Partial<HSTSOptions> = {},
): string {
  return createHSTSHeader({
    maxAge:
      options.maxAge ??
      HSTS_PRELOAD_MIN_MAX_AGE,
    includeSubDomains:
      options.includeSubDomains ??
      true,
    preload:
      options.preload ??
      true,
  });
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

export function validateHSTS(
  value: string,
): boolean {
  const policy =
    parseHSTS(
      value,
    );

  if (
    !policy
  ) {
    return false;
  }

  return validateHSTSPolicy(
    policy,
  );
}

export function validateHSTSPolicy(
  policy:
    | HSTSPolicy,
): boolean {
  try {
    validateHSTSOptions(
      policy,
    );

    return true;
  } catch {
    return false;
  }
}

export function validateHSTSOptions(
  options:
    | HSTSOptions
    | HSTSPolicy,
): void {
  if (
    !Number.isSafeInteger(
      options.maxAge,
    ) ||
    options.maxAge < 0
  ) {
    throw new RangeError(
      "HSTS maxAge must be a non-negative safe integer.",
    );
  }

  if (
    typeof options.includeSubDomains !==
      "boolean"
  ) {
    throw new TypeError(
      "HSTS includeSubDomains must be a boolean.",
    );
  }

  if (
    typeof options.preload !==
      "boolean"
  ) {
    throw new TypeError(
      "HSTS preload must be a boolean.",
    );
  }

  if (
    options.preload &&
    options.maxAge <
      HSTS_PRELOAD_MIN_MAX_AGE
  ) {
    throw new RangeError(
      `HSTS preload requires maxAge to be at least ${HSTS_PRELOAD_MIN_MAX_AGE} seconds.`,
    );
  }

  if (
    options.preload &&
    !options.includeSubDomains
  ) {
    throw new RangeError(
      "HSTS preload requires includeSubDomains to be enabled.",
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Policy Helpers                                                             */
/* -------------------------------------------------------------------------- */

export function isHSTS(
  value:
    | string
    | undefined
    | null,
): boolean {
  return (
    parseHSTS(
      value,
    ) !== undefined
  );
}

export function isHSTSPreloadable(
  value:
    | string
    | HSTSPolicy,
): boolean {
  const policy =
    typeof value ===
    "string"
      ? parseHSTS(
          value,
        )
      : value;

  if (
    !policy
  ) {
    return false;
  }

  return (
    policy.maxAge >=
      HSTS_PRELOAD_MIN_MAX_AGE &&
    policy.includeSubDomains
  );
}

export function hasIncludeSubDomains(
  value:
    | string
    | HSTSPolicy,
): boolean {
  const policy =
    typeof value ===
    "string"
      ? parseHSTS(
          value,
        )
      : value;

  return (
    policy?.includeSubDomains ??
    false
  );
}

export function hasPreload(
  value:
    | string
    | HSTSPolicy,
): boolean {
  const policy =
    typeof value ===
    "string"
      ? parseHSTS(
          value,
        )
      : value;

  return (
    policy?.preload ??
    false
  );
}

export function getHSTSMaxAge(
  value:
    | string
    | HSTSPolicy,
): number | undefined {
  const policy =
    typeof value ===
    "string"
      ? parseHSTS(
          value,
        )
      : value;

  return policy?.maxAge;
}

/* -------------------------------------------------------------------------- */
/* Expiration                                                                  */
/* -------------------------------------------------------------------------- */

export function createHSTSRemovalHeader(): string {
  return "max-age=0";
}

export function isHSTSDisabled(
  value:
    | string
    | HSTSPolicy,
): boolean {
  return (
    getHSTSMaxAge(
      value,
    ) === 0
  );
}

export function createHSTSOptions(
  maxAge:
    | number,
  options:
    | Omit<
        Partial<HSTSOptions>,
        "maxAge"
      > = {},
): HSTSOptions {
  return {
    maxAge,
    includeSubDomains:
      options.includeSubDomains ??
      false,
    preload:
      options.preload ??
      false,
  };
}

/* -------------------------------------------------------------------------- */
/* HTTP Header Helpers                                                        */
/* -------------------------------------------------------------------------- */

export function createHSTSHeaders(
  options:
    | Partial<HSTSOptions> = {},
): Readonly<
  Record<string, string>
> {
  return {
    [
      STRICT_TRANSPORT_SECURITY_HEADER
    ]: createHSTSHeader(
      options,
    ),
  };
}

/* -------------------------------------------------------------------------- */
/* Time Helpers                                                               */
/* -------------------------------------------------------------------------- */

export function hstsDays(
  days: number,
): number {
  validateFiniteNumber(
    days,
    "days",
  );

  if (
    days < 0
  ) {
    throw new RangeError(
      "days cannot be negative.",
    );
  }

  return Math.floor(
    days * 24 * 60 * 60,
  );
}

export function hstsHours(
  hours: number,
): number {
  validateFiniteNumber(
    hours,
    "hours",
  );

  if (
    hours < 0
  ) {
    throw new RangeError(
      "hours cannot be negative.",
    );
  }

  return Math.floor(
    hours * 60 * 60,
  );
}

export function hstsMinutes(
  minutes: number,
): number {
  validateFiniteNumber(
    minutes,
    "minutes",
  );

  if (
    minutes < 0
  ) {
    throw new RangeError(
      "minutes cannot be negative.",
    );
  }

  return Math.floor(
    minutes * 60,
  );
}

/* -------------------------------------------------------------------------- */
/* Internal Helpers                                                           */
/* -------------------------------------------------------------------------- */

function validateFiniteNumber(
  value: number,
  name: string,
): void {
  if (
    !Number.isFinite(
      value,
    )
  ) {
    throw new TypeError(
      `${name} must be a finite number.`,
    );
  }
}