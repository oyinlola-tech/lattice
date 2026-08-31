/**
 * MIME type utilities.
 *
 * Provides extension-to-MIME and MIME-to-extension resolution used by
 * request handling, static files, uploads, downloads, and HTTP responses.
 */

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface MIMETypeDefinition {
  readonly type: string;
  readonly extensions: readonly string[];
}

/* -------------------------------------------------------------------------- */
/* MIME Types                                                                 */
/* -------------------------------------------------------------------------- */

export const MIME_TYPES = {
  AAC: "audio/aac",
  AVIF: "image/avif",
  AVI: "video/x-msvideo",
  BIN: "application/octet-stream",
  BMP: "image/bmp",
  BZIP: "application/x-bzip",
  BZIP2: "application/x-bzip2",
  CSV: "text/csv",
  CSS: "text/css",
  DOC: "application/msword",
  DOCX:
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  EOT: "application/vnd.ms-fontobject",
  EPUB: "application/epub+zip",
  GIF: "image/gif",
  GZIP: "application/gzip",
  HTML: "text/html",
  ICO: "image/x-icon",
  JAR: "application/java-archive",
  JPEG: "image/jpeg",
  JPG: "image/jpeg",
  JS: "text/javascript",
  JSON: "application/json",
  MAP: "application/json",
  M4A: "audio/mp4",
  MP3: "audio/mpeg",
  MP4: "video/mp4",
  MPEG: "video/mpeg",
  OGG: "audio/ogg",
  OTF: "font/otf",
  PDF: "application/pdf",
  PNG: "image/png",
  PPT: "application/vnd.ms-powerpoint",
  PPTX:
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  RAR: "application/vnd.rar",
  RSS: "application/rss+xml",
  SVG: "image/svg+xml",
  TAR: "application/x-tar",
  TIFF: "image/tiff",
  TIF: "image/tiff",
  TS: "video/mp2t",
  TXT: "text/plain",
  WASM: "application/wasm",
  WAV: "audio/wav",
  WEBA: "audio/webm",
  WEBM: "video/webm",
  WEBP: "image/webp",
  WOFF: "font/woff",
  WOFF2: "font/woff2",
  XML: "application/xml",
  XLS: "application/vnd.ms-excel",
  XLSX:
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ZIP: "application/zip",
  ZST: "application/zstd",
} as const;

export type KnownMIMEType =
  (typeof MIME_TYPES)[keyof typeof MIME_TYPES];

/* -------------------------------------------------------------------------- */
/* Extension Map                                                              */
/* -------------------------------------------------------------------------- */

const EXTENSION_TO_MIME: Readonly<
  Record<string, string>
> = {
  aac: MIME_TYPES.AAC,
  avif: MIME_TYPES.AVIF,
  avi: MIME_TYPES.AVI,
  bin: MIME_TYPES.BIN,
  bmp: MIME_TYPES.BMP,
  bz: MIME_TYPES.BZIP,
  bz2: MIME_TYPES.BZIP2,
  csv: MIME_TYPES.CSV,
  css: MIME_TYPES.CSS,
  doc: MIME_TYPES.DOC,
  docx: MIME_TYPES.DOCX,
  eot: MIME_TYPES.EOT,
  epub: MIME_TYPES.EPUB,
  gif: MIME_TYPES.GIF,
  gz: MIME_TYPES.GZIP,
  gzip: MIME_TYPES.GZIP,
  htm: MIME_TYPES.HTML,
  html: MIME_TYPES.HTML,
  ico: MIME_TYPES.ICO,
  jar: MIME_TYPES.JAR,
  jpeg: MIME_TYPES.JPEG,
  jpg: MIME_TYPES.JPG,
  js: MIME_TYPES.JS,
  json: MIME_TYPES.JSON,
  map: MIME_TYPES.MAP,
  m4a: MIME_TYPES.M4A,
  mp3: MIME_TYPES.MP3,
  mp4: MIME_TYPES.MP4,
  mpeg: MIME_TYPES.MPEG,
  ogg: MIME_TYPES.OGG,
  otf: MIME_TYPES.OTF,
  pdf: MIME_TYPES.PDF,
  png: MIME_TYPES.PNG,
  ppt: MIME_TYPES.PPT,
  pptx: MIME_TYPES.PPTX,
  rar: MIME_TYPES.RAR,
  rss: MIME_TYPES.RSS,
  svg: MIME_TYPES.SVG,
  tar: MIME_TYPES.TAR,
  tif: MIME_TYPES.TIF,
  tiff: MIME_TYPES.TIFF,
  ts: MIME_TYPES.TS,
  txt: MIME_TYPES.TXT,
  wasm: MIME_TYPES.WASM,
  wav: MIME_TYPES.WAV,
  weba: MIME_TYPES.WEBA,
  webm: MIME_TYPES.WEBM,
  webp: MIME_TYPES.WEBP,
  woff: MIME_TYPES.WOFF,
  woff2: MIME_TYPES.WOFF2,
  xml: MIME_TYPES.XML,
  xls: MIME_TYPES.XLS,
  xlsx: MIME_TYPES.XLSX,
  zip: MIME_TYPES.ZIP,
  zst: MIME_TYPES.ZST,
};

/* -------------------------------------------------------------------------- */
/* Reverse Map                                                                */
/* -------------------------------------------------------------------------- */

const MIME_TO_EXTENSIONS: Readonly<
  Record<string, readonly string[]>
> = buildReverseMap(
  EXTENSION_TO_MIME,
);

/* -------------------------------------------------------------------------- */
/* Lookup                                                                     */
/* -------------------------------------------------------------------------- */

export function getMIMEType(
  filenameOrExtension:
    | string
    | undefined
    | null,
): string {
  if (
    filenameOrExtension ===
      undefined ||
    filenameOrExtension ===
      null
  ) {
    return MIME_TYPES.BIN;
  }

  const extension =
    getExtension(
      filenameOrExtension,
    );

  if (
    extension.length ===
    0
  ) {
    return MIME_TYPES.BIN;
  }

  return (
    EXTENSION_TO_MIME[
      extension
    ] ??
    MIME_TYPES.BIN
  );
}

export function lookupMIMEType(
  filenameOrExtension:
    | string
    | undefined
    | null,
): string | undefined {
  if (
    filenameOrExtension ===
      undefined ||
    filenameOrExtension ===
      null
  ) {
    return undefined;
  }

  const extension =
    getExtension(
      filenameOrExtension,
    );

  return (
    EXTENSION_TO_MIME[
      extension
    ]
  );
}

export function getExtension(
  filenameOrExtension: string,
): string {
  const clean =
    filenameOrExtension
      .split(
        "?",
        1,
      )[0]
      .split(
        "#",
        1,
      )[0]
      .trim();

  const lastSlash =
    Math.max(
      clean.lastIndexOf(
        "/",
      ),
      clean.lastIndexOf(
        "\\",
      ),
    );

  const filename =
    clean.slice(
      lastSlash + 1,
    );

  const lastDot =
    filename.lastIndexOf(
      ".",
    );

  if (
    lastDot <=
    0
  ) {
    return "";
  }

  return filename
    .slice(
      lastDot + 1,
    )
    .toLowerCase();
}

export function getMIMEExtensions(
  mimeType: string,
): readonly string[] {
  const normalized =
    normalizeMIMEType(
      mimeType,
    );

  return (
    MIME_TO_EXTENSIONS[
      normalized
    ] ??
    []
  );
}

export function getPrimaryExtension(
  mimeType: string,
): string | undefined {
  return getMIMEExtensions(
    mimeType,
  )[0];
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

export function isKnownMIMEType(
  mimeType:
    | string
    | undefined
    | null,
): mimeType is KnownMIMEType {
  if (
    !mimeType
  ) {
    return false;
  }

  const normalized =
    normalizeMIMEType(
      mimeType,
    );

  return Object.values(
    MIME_TYPES,
  ).includes(
    normalized as KnownMIMEType,
  );
}

export function isMIMEType(
  value:
    | string
    | undefined
    | null,
): boolean {
  if (
    !value
  ) {
    return false;
  }

  const normalized =
    value.trim();

  const separator =
    normalized.indexOf(
      "/",
    );

  if (
    separator <=
      0 ||
    separator ===
      normalized.length -
        1
  ) {
    return false;
  }

  const type =
    normalized.slice(
      0,
      separator,
    );

  const subtype =
    normalized.slice(
      separator + 1,
    );

  return (
    isMIMEToken(
      type,
    ) &&
    isMIMEToken(
      subtype,
    )
  );
}

export function assertMIMEType(
  value: string,
): asserts value is KnownMIMEType {
  if (
    !isMIMEType(
      value,
    )
  ) {
    throw new TypeError(
      `Invalid MIME type: ${value}`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Normalization                                                              */
/* -------------------------------------------------------------------------- */

export function normalizeMIMEType(
  mimeType: string,
): string {
  return mimeType
    .trim()
    .split(
      ";",
      1,
    )[0]
    .trim()
    .toLowerCase();
}

/* -------------------------------------------------------------------------- */
/* MIME Categories                                                            */
/* -------------------------------------------------------------------------- */

export function getMIMECategory(
  mimeType: string,
): string | undefined {
  const normalized =
    normalizeMIMEType(
      mimeType,
    );

  const separator =
    normalized.indexOf(
      "/",
    );

  if (
    separator <=
    0
  ) {
    return undefined;
  }

  return normalized.slice(
    0,
    separator,
  );
}

export function getMIMESubtype(
  mimeType: string,
): string | undefined {
  const normalized =
    normalizeMIMEType(
      mimeType,
    );

  const separator =
    normalized.indexOf(
      "/",
    );

  if (
    separator <=
    0 ||
    separator ===
      normalized.length -
        1
  ) {
    return undefined;
  }

  return normalized.slice(
    separator + 1,
  );
}

export function isTextMIME(
  mimeType: string,
): boolean {
  return (
    getMIMECategory(
      mimeType,
    ) === "text"
  );
}

export function isImageMIME(
  mimeType: string,
): boolean {
  return (
    getMIMECategory(
      mimeType,
    ) === "image"
  );
}

export function isAudioMIME(
  mimeType: string,
): boolean {
  return (
    getMIMECategory(
      mimeType,
    ) === "audio"
  );
}

export function isVideoMIME(
  mimeType: string,
): boolean {
  return (
    getMIMECategory(
      mimeType,
    ) === "video"
  );
}

export function isApplicationMIME(
  mimeType: string,
): boolean {
  return (
    getMIMECategory(
      mimeType,
    ) === "application"
  );
}

export function isFontMIME(
  mimeType: string,
): boolean {
  return (
    getMIMECategory(
      mimeType,
    ) === "font"
  );
}

/* -------------------------------------------------------------------------- */
/* Structured Types                                                           */
/* -------------------------------------------------------------------------- */

export function isJSONMIME(
  mimeType: string,
): boolean {
  const normalized =
    normalizeMIMEType(
      mimeType,
    );

  return (
    normalized ===
      "application/json" ||
    normalized.endsWith(
      "+json",
    )
  );
}

export function isXMLMIME(
  mimeType: string,
): boolean {
  const normalized =
    normalizeMIMEType(
      mimeType,
    );

  return (
    normalized ===
      "application/xml" ||
    normalized ===
      "text/xml" ||
    normalized.endsWith(
      "+xml",
    )
  );
}

export function isMultipartMIME(
  mimeType: string,
): boolean {
  return normalizeMIMEType(
    mimeType,
  ).startsWith(
    "multipart/",
  );
}

export function isBinaryMIME(
  mimeType: string,
): boolean {
  const normalized =
    normalizeMIMEType(
      mimeType,
    );

  if (
    normalized ===
      MIME_TYPES.BIN
  ) {
    return true;
  }

  return (
    isImageMIME(
      normalized,
    ) ||
    isAudioMIME(
      normalized,
    ) ||
    isVideoMIME(
      normalized,
    ) ||
    normalized ===
      MIME_TYPES.PDF ||
    normalized ===
      MIME_TYPES.ZIP ||
    normalized ===
      MIME_TYPES.GZIP ||
    normalized ===
      MIME_TYPES.BZIP ||
    normalized ===
      MIME_TYPES.BZIP2 ||
    normalized ===
      MIME_TYPES.RAR ||
    normalized ===
      MIME_TYPES.TAR ||
    normalized ===
      MIME_TYPES.WASM
  );
}

/* -------------------------------------------------------------------------- */
/* Content Negotiation                                                        */
/* -------------------------------------------------------------------------- */

export function mimeTypesEqual(
  left: string,
  right: string,
): boolean {
  return (
    normalizeMIMEType(
      left,
    ) ===
    normalizeMIMEType(
      right,
    )
  );
}

export function matchesMIMEType(
  actual: string,
  expected: string,
): boolean {
  const left =
    normalizeMIMEType(
      actual,
    );

  const right =
    normalizeMIMEType(
      expected,
    );

  if (
    left ===
    right
  ) {
    return true;
  }

  const [
    actualType,
    actualSubtype,
  ] =
    splitMIMEType(
      left,
    );

  const [
    expectedType,
    expectedSubtype,
  ] =
    splitMIMEType(
      right,
    );

  if (
    !actualType ||
    !actualSubtype ||
    !expectedType ||
    !expectedSubtype
  ) {
    return false;
  }

  if (
    expectedType !==
      "*" &&
    expectedType !==
      actualType
  ) {
    return false;
  }

  return (
    expectedSubtype ===
      "*" ||
    expectedSubtype ===
      actualSubtype
  );
}

export function parseAcceptHeader(
  header:
    | string
    | undefined
    | null,
): string[] {
  if (
    !header
  ) {
    return [];
  }

  return header
    .split(
      ",",
    )
    .map(
      (part) =>
        part
          .split(
            ";",
            1,
          )[0]
          .trim()
          .toLowerCase(),
    )
    .filter(
      isMIMEType,
    );
}

export function negotiateMIMEType(
  accepted:
    | string
    | readonly string[],
  available: readonly string[],
): string | undefined {
  const acceptedTypes =
    typeof accepted ===
    "string"
      ? parseAcceptHeader(
          accepted,
        )
      : accepted.map(
          normalizeMIMEType,
        );

  for (
    const candidate of acceptedTypes
  ) {
    const match =
      available.find(
        (availableType) =>
          matchesMIMEType(
            availableType,
            candidate,
          ),
      );

    if (
      match
    ) {
      return match;
    }
  }

  return undefined;
}

/* -------------------------------------------------------------------------- */
/* Charset Helpers                                                            */
/* -------------------------------------------------------------------------- */

export function withCharset(
  mimeType: string,
  charset: string,
): string {
  return `${normalizeMIMEType(
    mimeType,
  )}; charset=${charset
    .trim()
    .toLowerCase()}`;
}

export function isUTF8MIME(
  mimeType: string,
): boolean {
  const match =
    /;\s*charset\s*=\s*"?([^";]+)"?/i.exec(
      mimeType,
    );

  return (
    match?.[1]
      .trim()
      .toLowerCase() ===
    "utf-8"
  );
}

/* -------------------------------------------------------------------------- */
/* File Helpers                                                               */
/* -------------------------------------------------------------------------- */

export function filenameToMIME(
  filename: string,
): string {
  return getMIMEType(
    filename,
  );
}

export function mimeToFilename(
  mimeType: string,
  basename = "file",
): string {
  const extension =
    getPrimaryExtension(
      mimeType,
    );

  if (
    !extension
  ) {
    return basename;
  }

  return `${basename}.${extension}`;
}

/* -------------------------------------------------------------------------- */
/* Internal Helpers                                                           */
/* -------------------------------------------------------------------------- */

function splitMIMEType(
  mimeType: string,
): [
  string | undefined,
  string | undefined,
] {
  const separator =
    mimeType.indexOf(
      "/",
    );

  if (
    separator <=
      0 ||
    separator ===
      mimeType.length -
        1
  ) {
    return [
      undefined,
      undefined,
    ];
  }

  return [
    mimeType.slice(
      0,
      separator,
    ),
    mimeType.slice(
      separator + 1,
    ),
  ];
}

function isMIMEToken(
  value: string,
): boolean {
  return /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/.test(
    value,
  );
}

function buildReverseMap(
  map: Readonly<
    Record<string, string>
  >,
): Readonly<
  Record<string, readonly string[]>
> {
  const result:
    Record<
      string,
      string[]
    > = {};

  for (
    const [
      extension,
      mimeType,
    ] of Object.entries(
      map,
    )
  ) {
    const existing =
      result[
        mimeType
      ];

    if (
      existing
    ) {
      existing.push(
        extension,
      );
    } else {
      result[
        mimeType
      ] = [
        extension,
      ];
    }
  }

  return result;
}