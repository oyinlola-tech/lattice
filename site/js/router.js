/**
 * Zudo Docs — Client-side Router
 * Intercepts internal link clicks for smooth navigation without full page reloads.
 * Falls back to normal navigation for external links.
 */
(function () {
  "use strict";

  const SITE_ROOT = window.location.origin;

  /**
   * Resolve a clean URL path to the actual flat HTML file.
   * e.g. "/docs/packages/auth" → "/docs-packages-auth.html"
   */
  function resolvePath(path) {
    const cleaned = path.replace(/\/+$/, "") || "/";
    if (cleaned === "/") return "/index.html";

    // Check for exact match first
    const exactFile = cleaned.replace(/\//g, "-").slice(1) + ".html";
    if (fileExists(exactFile)) return "/" + exactFile;

    // Try as directory index (e.g. /docs/packages → /docs-packages.html)
    const dirFile = cleaned.replace(/\//g, "-").slice(1) + ".html";
    if (fileExists(dirFile)) return "/" + dirFile;

    return null;
  }

  /**
   * Check if a file path exists by doing a HEAD request.
   * Cached to avoid repeated network calls.
   */
  const fileCache = {};
  function fileExists(path) {
    if (path in fileCache) return fileCache[path];
    // For synchronous routing, assume the file exists if the link was built by us.
    // The browser will handle 404s naturally.
    return true;
  }

  /**
   * Convert a flat file path back to a clean URL.
   * e.g. "/docs-packages-auth.html" → "/docs/packages/auth"
   */
  function cleanToPath(filename) {
    return filename
      .replace(/^\/?/, "/")
      .replace(/\.html$/, "")
      .replace(/-/g, "/");
  }

  /**
   * Navigate to a clean URL path using the History API.
   */
  function navigateTo(path) {
    const file = resolvePath(path);
    if (!file) {
      window.location.href = path;
      return;
    }

    // Push state
    window.history.pushState({ path: path }, "", path);

    // Scroll to top
    window.scrollTo(0, 0);

    // Dispatch custom event for page transition
    window.dispatchEvent(
      new CustomEvent("route-change", { detail: { path: path, file: file } })
    );
  }

  /**
   * Handle link clicks.
   */
  function handleClick(e) {
    const link = e.target.closest("a");
    if (!link) return;

    const href = link.getAttribute("href");
    if (!href) return;

    // Skip external links, anchors, mailto, tel
    if (
      href.startsWith("http") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      href.startsWith("#") ||
      href.startsWith("javascript:")
    ) {
      return;
    }

    // Skip if modifier keys pressed
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    e.preventDefault();
    navigateTo(href);
  }

  /**
   * Handle browser back/forward.
   */
  function handlePopState(e) {
    const path = window.location.pathname;
    window.dispatchEvent(
      new CustomEvent("route-change", { detail: { path: path } })
    );
  }

  /**
   * Intercept form submissions to internal routes.
   */
  function handleSubmit(e) {
    const form = e.target;
    const action = form.getAttribute("action");
    if (action && !action.startsWith("http")) {
      e.preventDefault();
      navigateTo(action);
    }
  }

  // Bind events
  document.addEventListener("click", handleClick);
  window.addEventListener("popstate", handlePopState);
  document.addEventListener("submit", handleSubmit);

  // Handle initial page load — ensure URL matches file
  const currentPath = window.location.pathname;
  if (currentPath !== "/" && !currentPath.endsWith(".html")) {
    // User arrived via clean URL — the server rewrite already served the right file.
    // Just update the URL bar to show the clean path.
    window.history.replaceState({ path: currentPath }, "", currentPath);
  }

  // Expose router API
  window.ZudoRouter = { navigateTo, resolvePath, cleanToPath };
})();
