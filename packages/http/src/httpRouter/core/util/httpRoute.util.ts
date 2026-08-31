function getRequestMethod(
  request:
    | RequestContext,
):
  | string {
  const value =
    (
      request as unknown as {
        method?:
          | string;
      }
    ).method;

  return (
    value ??
    "GET"
  ).toUpperCase();
}

function getRequestUrl(
  request:
    | RequestContext,
):
  | string {
  const value =
    (
      request as unknown as {
        url?:
          | string
          | URL;
      }
    ).url;

  if (
    value instanceof
    URL
  ) {
    return value.toString();
  }

  return (
    value ??
    "/"
  );
}

function getRequestSignal(
  request:
    | RequestContext,
):
  | AbortSignal
  | undefined {
  return (
    request as unknown as {
      signal?:
        | AbortSignal;
    }
  ).signal;
}

function parseUrl(
  value:
    | string,
):
  | URL {
  try {
    return new URL(
      value,
      "http://lattice.local",
    );
  } catch {
    return new URL(
      "/",
      "http://lattice.local",
    );
  }
}

function parseQuery(
  params:
    | URLSearchParams,
):
  | Readonly<
      Record<
        string,
        string | string[]
      >
    > {
  const result:
    | Record<
        string,
        string | string[]
      > =
    {};

  for (
    const key of new Set(
      Array.from(
        params.keys(),
      ),
    )
  ) {
    const values =
      params.getAll(
        key,
      );

    result[key] =
      values.length >
      1
        ? values
        : values[0] ??
          "";
  }

  return Object.freeze({
    ...result,
  });
}

/* -------------------------------------------------------------------------- */
/* Path Helpers                                                               */
/* -------------------------------------------------------------------------- */

function normalizePath(
  path:
    | string,
):
  | string {
  if (
    !path ||
    path ===
      ""
  ) {
    return "/";
  }

  const withoutQuery =
    path.split(
      "?",
      1,
    )[0] ??
    path;

  let normalized =
    withoutQuery.startsWith(
      "/",
    )
      ? withoutQuery
      : `/${withoutQuery}`;
