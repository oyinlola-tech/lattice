/**
 * 3xx HTTP redirection status reason phrases.
 */

export const REDIRECTION_STATUS_TEXT = Object.freeze({
  300: "Multiple Choices",

  301: "Moved Permanently",

  302: "Found",

  303: "See Other",

  304: "Not Modified",

  305: "Use Proxy",

  307: "Temporary Redirect",

  308: "Permanent Redirect",
} as const);
