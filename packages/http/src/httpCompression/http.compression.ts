/**
 * HTTP compression utilities.
 *
 * Handles compression negotiation and response encoding decisions.
 * Actual compression/decompression is intentionally delegated to adapters.
 */

import {
  getHeader,
  setHeader,
} from "../httpProtocol/http.protocol.js";
import type { HTTPHeader } from "../httpProtocol/http.protocol.js";
import {
  parseAcceptEncoding,
} from "../httpNegotiation/httpNegotiation.core.js";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type CompressionEncoding =
  | "br"
  | "gzip"
  | "deflate"
  | "identity";

export interface CompressionPreference {
  readonly encoding: CompressionEncoding;
  readonly quality: number;
  readonly specificity: number;
  readonly order: number;
}

export interface CompressionOptions {
  readonly threshold?: number;
  readonly preferredEncodings?: readonly CompressionEncoding[];
  readonly minimumQuality?: number;
  readonly enabled?: boolean;
}

export interface CompressionDecision {
  readonly encoding: CompressionEncoding;
  readonly compress: boolean;
  readonly quality: number;
}

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

export const DEFAULT_COMPRESSION_THRESHOLD =
  1024;

export const DEFAULT_MIN_COMPRESSION_QUALITY =
  0.1;

export const DEFAULT_PREFERRED_ENCODINGS:
  readonly CompressionEncoding[] = [
    "br",
    "gzip",
    "deflate",
    "identity",
  ];

export const COMPRESSION_ENCODINGS:
  readonly CompressionEncoding[] = [
    "br",
    "gzip",
    "deflate",
    "identity",
  ];

/* -------------------------------------------------------------------------- */
/* Encoding Validation                                                        */
/* -------------------------------------------------------------------------- */

export function isCompressionEncoding(
  value: string,
): value is CompressionEncoding {
  const normalized =
    value.trim().toLowerCase();

  return (
    normalized === "br" ||
    normalized === "gzip" ||
    normalized === "deflate" ||
    normalized === "identity"
  );
}

export function normalizeCompressionEncoding(
  value: string,
): CompressionEncoding | undefined {
  const normalized =
    value.trim().toLowerCase();

  return isCompressionEncoding(
    normalized,
  )
    ? normalized
    : undefined;
}

/* -------------------------------------------------------------------------- */
/* Accept-Encoding                                                            */
/* -------------------------------------------------------------------------- */

export function parseCompressionPreferences(
  header:
    | string
    | undefined
    | null,
): CompressionPreference[] {
  return parseAcceptEncoding(
    header,
  ).map(
    (preference) => ({
      encoding:
        normalizeCompressionEncoding(
          preference.value,
        ) ??
        "identity",
      quality:
        preference.quality,
      specificity:
        preference.specificity,
      order:
        preference.order,
    }),
  );
}

/* -------------------------------------------------------------------------- */
/* Quality                                                                    */
/* -------------------------------------------------------------------------- */

export function getCompressionQuality(
  acceptEncoding:
    | string
    | undefined
    | null,
  encoding: CompressionEncoding,
): number {
  const preferences =
    parseCompressionPreferences(
      acceptEncoding,
    );

  if (
    preferences.length ===
    0
  ) {
    return 1;
  }

  let best:
    | CompressionPreference
    | undefined;

  for (
    const preference of preferences
  ) {
    const matches =
      preference.encoding ===
        encoding ||
      preference.encoding ===
        "identity" &&
        encoding ===
          "identity";

    if (
      !matches
    ) {
      continue;
    }

    if (
      !best ||
      preference.quality >
        best.quality ||
      (
        preference.quality ===
          best.quality &&
        preference.specificity >
          best.specificity
      )
    ) {
      best =
        preference;
    }
  }

  /*
   * A wildcard can match any encoding that was not explicitly mentioned.
   */
  if (
    !best
  ) {
    const wildcard =
      parseAcceptEncoding(
        acceptEncoding,
      ).find(
        (preference) =>
          preference.value
            .trim()
            .toLowerCase() ===
          "*",
      );

    if (
      wildcard
    ) {
      return wildcard.quality;
    }
  }

  /*
   * RFC semantics treat identity as acceptable unless explicitly rejected,
   * unless a wildcard explicitly covers it.
   */
  if (
    !best &&
    encoding ===
      "identity"
  ) {
    const wildcard =
      parseAcceptEncoding(
        acceptEncoding,
      ).find(
        (preference) =>
          preference.value
            .trim()
            .toLowerCase() ===
          "*",
      );

    return wildcard
      ? wildcard.quality
      : 1;
  }

  return (
    best?.quality ??
    0
  );
}

/* -------------------------------------------------------------------------- */
/* Negotiation                                                                */
/* -------------------------------------------------------------------------- */

export function negotiateCompression(
  acceptEncoding:
    | string
    | undefined
    | null,
  available:
    | readonly CompressionEncoding[]
    | undefined =
      DEFAULT_PREFERRED_ENCODINGS,
): CompressionEncoding {
  const candidates =
    [
      ...available,
    ];

  if (
    candidates.length ===
    0
  ) {
    return "identity";
  }

  let best:
    | {
        encoding: CompressionEncoding;
        quality: number;
        priority: number;
      }
    | undefined;

  for (
    let index = 0;
    index < candidates.length;
    index += 1
  ) {
    const encoding =
      candidates[index];

    const quality =
      getCompressionQuality(
        acceptEncoding,
        encoding,
      );

    if (
      quality <= 0
    ) {
      continue;
    }

    const priority =
      candidates.length -
      index;

    if (
      !best ||
      quality >
        best.quality ||
      (
        quality ===
          best.quality &&
        priority >
          best.priority
      )
    ) {
      best = {
        encoding,
        quality,
        priority,
      };
    }
  }

  return (
    best?.encoding ??
    "identity"
  );
}

/* -------------------------------------------------------------------------- */
/* Response Compression                                                       */
/* -------------------------------------------------------------------------- */

export function shouldCompress(
  contentLength:
    | number
    | undefined,
  contentType:
    | string
    | undefined,
  options:
    | CompressionOptions
    | undefined = {},
): boolean {
  if (
    options.enabled ===
    false
  ) {
    return false;
  }

  if (
    contentLength !==
      undefined &&
    contentLength <
      (
        options.threshold ??
        DEFAULT_COMPRESSION_THRESHOLD
      )
  ) {
    return false;
  }

  if (
    contentType &&
    isAlreadyCompressedType(
      contentType,
    )
  ) {
    return false;
  }

  return true;
}

export function chooseCompression(
  acceptEncoding:
    | string
    | undefined
    | null,
  contentLength:
    | number
    | undefined,
  contentType:
    | string
    | undefined,
  options:
    | CompressionOptions
    | undefined = {},
): CompressionDecision {
  if (
    !shouldCompress(
      contentLength,
      contentType,
      options,
    )
  ) {
    return {
      encoding:
        "identity",
      compress: false,
      quality: getCompressionQuality(
        acceptEncoding,
        "identity",
      ),
    };
  }

  const available =
    options.preferredEncodings ??
    DEFAULT_PREFERRED_ENCODINGS;

  const encoding =
    negotiateCompression(
      acceptEncoding,
      available,
    );

  const quality =
    getCompressionQuality(
      acceptEncoding,
      encoding,
    );

  const minimumQuality =
    options.minimumQuality ??
    DEFAULT_MIN_COMPRESSION_QUALITY;

  if (
    encoding ===
      "identity" ||
    quality <
      minimumQuality
  ) {
    return {
      encoding:
        "identity",
      compress: false,
      quality:
        getCompressionQuality(
          acceptEncoding,
          "identity",
        ),
    };
  }

  return {
    encoding,
    compress: true,
    quality,
  };
}

/* -------------------------------------------------------------------------- */
/* Header Handling                                                            */
/* -------------------------------------------------------------------------- */

export function applyCompressionHeaders(
  headers: readonly HTTPHeader[],
  encoding: CompressionEncoding,
): HTTPHeader[] {
  if (
    encoding ===
    "identity"
  ) {
    return setHeader(
      headers,
      "content-encoding",
      "identity",
    );
  }

  let result =
    setHeader(
      headers,
      "content-encoding",
      encoding,
    );

  const existingVary =
    getHeader(
      result,
      "vary",
    );

  if (
    !existingVary
  ) {
    result =
      setHeader(
        result,
        "vary",
        "Accept-Encoding",
      );
  } else if (
    !hasVaryValue(
      existingVary,
      "accept-encoding",
    )
  ) {
    result =
      setHeader(
        result,
        "vary",
        `${existingVary}, Accept-Encoding`,
      );
  }

  /*
   * Content-Length refers to the encoded body. Compression adapters should
   * recalculate it after transforming the payload.
   */
  return result;
}

export function removeCompressionHeaders(
  headers: readonly HTTPHeader[],
): HTTPHeader[] {
  return headers.filter(
    (header) => {
      const name =
        header.name.toLowerCase();

      return (
        name !==
          "content-encoding" &&
        name !==
          "content-length"
      );
    },
  );
}

/* -------------------------------------------------------------------------- */
/* Content-Type Helpers                                                       */
/* -------------------------------------------------------------------------- */

export function isAlreadyCompressedType(
  contentType: string,
): boolean {
  const normalized =
    contentType
      .split(
        ";",
        1,
      )[0]
      .trim()
      .toLowerCase();

  if (
    normalized ===
      "application/zip" ||
    normalized ===
      "application/gzip" ||
    normalized ===
      "application/x-gzip" ||
    normalized ===
      "application/x-7z-compressed" ||
    normalized ===
      "application/x-rar-compressed" ||
    normalized ===
      "application/zstd" ||
    normalized ===
      "image/jpeg" ||
    normalized ===
      "image/png" ||
    normalized ===
      "image/gif" ||
    normalized ===
      "image/webp" ||
    normalized ===
      "audio/mpeg" ||
    normalized ===
      "audio/ogg" ||
    normalized ===
      "video/mp4" ||
    normalized ===
      "video/webm"
  ) {
    return true;
  }

  return false;
}

export function isCompressibleType(
  contentType:
    | string
    | undefined,
): boolean {
  if (
    !contentType
  ) {
    return true;
  }

  if (
    isAlreadyCompressedType(
      contentType,
    )
  ) {
    return false;
  }

  const normalized =
    contentType
      .split(
        ";",
        1,
      )[0]
      .trim()
      .toLowerCase();

  return (
    normalized.startsWith(
      "text/",
    ) ||
    normalized.startsWith(
      "application/json",
    ) ||
    normalized.startsWith(
      "application/javascript",
    ) ||
    normalized.startsWith(
      "application/xml",
    ) ||
    normalized.endsWith(
      "+json",
    ) ||
    normalized.endsWith(
      "+xml",
    ) ||
    normalized ===
      "application/graphql" ||
    normalized ===
      "application/wasm" ||
    normalized ===
      "image/svg+xml"
  );
}

/* -------------------------------------------------------------------------- */
/* Vary Helpers                                                               */
/* -------------------------------------------------------------------------- */

export function hasVaryValue(
  vary:
    | string
    | undefined,
  value: string,
): boolean {
  if (
    !vary
  ) {
    return false;
  }

  const normalized =
    value
      .trim()
      .toLowerCase();

  return vary
    .split(",")
    .map(
      (item) =>
        item
          .trim()
          .toLowerCase(),
    )
    .some(
      (item) =>
        item ===
          normalized ||
        item === "*",
    );
}

export function addVaryValue(
  headers: readonly HTTPHeader[],
  value: string,
): HTTPHeader[] {
  const existing =
    getHeader(
      headers,
      "vary",
    );

  if (
    !existing
  ) {
    return setHeader(
      headers,
      "vary",
      value,
    );
  }

  if (
    hasVaryValue(
      existing,
      value,
    )
  ) {
    return [
      ...headers,
    ];
  }

  return setHeader(
    headers,
    "vary",
    `${existing}, ${value}`,
  );
}

/* -------------------------------------------------------------------------- */
/* Compression Stream Metadata                                                */
/* -------------------------------------------------------------------------- */

export function getCompressionMimeType(
  encoding: CompressionEncoding,
): string | undefined {
  switch (
    encoding
  ) {
    case "br":
      return "application/octet-stream";

    case "gzip":
      return "application/gzip";

    case "deflate":
      return "application/zlib";

    case "identity":
      return undefined;
  }
}

export function isCompressionSupported(
  encoding: string,
): encoding is CompressionEncoding {
  return isCompressionEncoding(
    encoding,
  );
}

/* -------------------------------------------------------------------------- */
/* Cache Semantics                                                            */
/* -------------------------------------------------------------------------- */

export function requiresCompressionVary(
  encoding: CompressionEncoding,
): boolean {
  return (
    encoding !==
    "identity"
  );
}

export function isCacheableCompressedResponse(
  encoding: CompressionEncoding,
): boolean {
  /*
   * Compression itself does not make a response uncacheable. The response
   * must vary on Accept-Encoding when multiple representations are served.
   */
  return (
    encoding ===
      "br" ||
    encoding ===
      "gzip" ||
    encoding ===
      "deflate"
  );
}