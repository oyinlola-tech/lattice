import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const SITE = '/home/oyinlola/Desktop/Zudo/site/docs';

// Standard sidebar from adapters page (with active slot)
const STANDARD_SIDEBAR = `    <aside class="doc-sidebar w-60 border-r-2 border-black/10 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto flex-shrink-0">
      <div class="sidebar-section">Getting Started</div>
      <a href="/docs/getting-started" class="sidebar-item">Installation</a>
      <a href="/docs/getting-started-first-app" class="sidebar-item">Your First App</a>
      <a href="/docs/getting-started-project-structure" class="sidebar-item">Project Structure</a>

      <div class="sidebar-section mt-4">Architecture</div>
      <a href="/docs/architecture" class="sidebar-item">Overview</a>
      <a href="/docs/architecture-module-system" class="sidebar-item">Module System</a>
      <a href="/docs/architecture-runtime" class="sidebar-item">Runtime</a>
      <a href="/docs/architecture-adapters" class="sidebar-item">Adapters</a>
      <a href="/docs/architecture-dependency-direction" class="sidebar-item">Dependency Direction</a>

      <div class="sidebar-section mt-4">Concepts</div>
      <a href="/docs/concepts" class="sidebar-item">Application</a>
      <a href="/docs/concepts-configuration" class="sidebar-item">Configuration</a>
      <a href="/docs/concepts-contexts" class="sidebar-item">Contexts</a>
      <a href="/docs/concepts-dependency-injection" class="sidebar-item">Dependency Injection</a>
      <a href="/docs/concepts-lifecycle" class="sidebar-item">Lifecycle</a>
      <a href="/docs/concepts-modules" class="sidebar-item">Modules</a>

      <div class="sidebar-section mt-4">Packages</div>
      <a href="/docs/packages" class="sidebar-item">Overview</a>
      <a href="/docs/packages-adapters" class="sidebar-item">@zudojs/adapters</a>
      <a href="/docs/packages-errors" class="sidebar-item">@zudojs/errors</a>
      <a href="/docs/packages-constants" class="sidebar-item">@zudojs/constants</a>
      <a href="/docs/packages/types" class="sidebar-item">@zudojs/types</a>

      <div class="sidebar-section mt-4">Reference</div>
      <a href="/docs/roadmap" class="sidebar-item">Roadmap</a>
      <a href="/docs/rules" class="sidebar-item">Package Rules</a>
      <a href="/docs/contributing" class="sidebar-item">Contributing</a>
    </aside>`;

// Map: filename → which sidebar link gets active
const sidebarActiveMap = {
  'getting-started.html': '/docs/getting-started',
  'getting-started-first-app.html': '/docs/getting-started-first-app',
  'getting-started-project-structure.html': '/docs/getting-started-project-structure',
  'architecture.html': '/docs/architecture',
  'architecture-module-system.html': '/docs/architecture-module-system',
  'architecture-runtime.html': '/docs/architecture-runtime',
  'architecture-adapters.html': '/docs/architecture-adapters',
  'architecture-dependency-direction.html': '/docs/architecture-dependency-direction',
  'concepts.html': '/docs/concepts',
  'concepts-configuration.html': '/docs/concepts-configuration',
  'concepts-contexts.html': '/docs/concepts-contexts',
  'concepts-dependency-injection.html': '/docs/concepts-dependency-injection',
  'concepts-lifecycle.html': '/docs/concepts-lifecycle',
  'concepts-modules.html': '/docs/concepts-modules',
  'packages-adapters.html': '/docs/packages-adapters',
  'packages-api.html': '/docs/packages-api',
  'packages-auth.html': '/docs/packages-auth',
  'packages-cache.html': '/docs/packages-cache',
  'packages-cli.html': '/docs/packages-cli',
  'packages-config.html': '/docs/packages-config',
  'packages-constants.html': '/docs/packages-constants',
  'packages-container.html': '/docs/packages-container',
  'packages-core.html': '/docs/packages-core',
  'packages-cqrs.html': '/docs/packages-cqrs',
  'packages-crypto.html': '/docs/packages-crypto',
  'packages-database.html': '/docs/packages-database',
  'packages-docs.html': '/docs/packages-docs',
  'packages-errors.html': '/docs/packages-errors',
  'roadmap.html': '/docs/roadmap',
  'rules.html': '/docs/rules',
  'contributing.html': '/docs/contributing',
};

// Header info for each page (used for header box fix)
const headerInfo = {
  'getting-started.html': { title: 'Getting Started', desc: 'Install Zudo and build your first application.', tags: ['QUICKSTART', 'INSTALLATION'] },
  'getting-started-first-app.html': { title: 'Your First App', desc: 'Scaffold a Zudo project with the CLI and build your first module.', tags: ['SCAFFOLD', 'CLI', 'FIRST APP'] },
  'getting-started-project-structure.html': { title: 'Project Structure', desc: 'Standard directory layout for Zudo applications.', tags: ['DIRECTORY', 'LAYOUT', 'STRUCTURE'] },
  'architecture.html': { title: 'Architecture Overview', desc: 'Five-layer architecture with clear dependency direction.', tags: ['FIVE LAYERS', 'DEPENDENCY DIRECTION', 'MODULAR'] },
  'architecture-module-system.html': { title: 'Module System', desc: 'Modules as self-contained units of functionality with explicit boundaries.', tags: ['MODULES', 'BOUNDARIES', 'ENCAPSULATION'] },
  'architecture-runtime.html': { title: 'Runtime', desc: 'Application lifecycle orchestrator with dependency ordering and graceful shutdown.', tags: ['RUNTIME', 'LIFECYCLE', 'ORCHESTRATION'] },
  'architecture-adapters.html': { title: 'Adapters', desc: 'Boundary layer between Zudo and external platforms.', tags: ['ADAPTERS', 'BOUNDARY', 'PLATFORM'] },
  'architecture-dependency-direction.html': { title: 'Dependency Direction', desc: 'Dependencies flow inward through five tiers — leaf to core.', tags: ['DEPENDENCIES', 'TIERS', 'COUPLING'] },
  'concepts.html': { title: 'Core Concepts', desc: 'The foundational concepts that power every Zudo application.', tags: ['CONCEPTS', 'FOUNDATION', 'PRINCIPLES'] },
  'concepts-configuration.html': { title: 'Configuration', desc: 'Layered configuration with multiple sources and clear precedence.', tags: ['CONFIG', 'SOURCES', 'ENV'] },
  'concepts-contexts.html': { title: 'Execution Contexts', desc: 'AsyncLocalStorage-based context propagation across async boundaries.', tags: ['CONTEXT', 'ASYNCLOCALSTORAGE', 'PROPAGATION'] },
  'concepts-dependency-injection.html': { title: 'Dependency Injection', desc: 'Token-based DI container with scoped lifecycles and module awareness.', tags: ['DI', 'CONTAINER', 'TOKENS'] },
  'concepts-lifecycle.html': { title: 'Lifecycle', desc: 'State machine for component lifecycle management with hooks and dependency ordering.', tags: ['LIFECYCLE', 'STATE MACHINE', 'HOOKS'] },
  'concepts-modules.html': { title: 'Modules', desc: 'Primary building blocks with explicit boundaries and dependency contracts.', tags: ['MODULES', 'BOUNDARIES', 'CONTRACTS'] },
  'packages-api.html': { title: '@zudojs/api', desc: 'Transport-agnostic operation definitions, interceptors, policies, and result types.', tags: ['API', 'OPERATIONS', 'INTERCEPTORS'] },
  'packages-auth.html': { title: '@zudojs/auth', desc: 'Authentication primitives — JWT, sessions, password hashing, and RBAC delegation.', tags: ['AUTH', 'JWT', 'SESSIONS'] },
  'packages-cache.html': { title: '@zudojs/cache', desc: 'Cache abstraction with memory adapter, tag-based invalidation, and distributed locking.', tags: ['CACHE', 'MEMORY', 'LOCKING'] },
  'packages-cli.html': { title: '@zudojs/cli', desc: 'Command-line interface for scaffolding, generating, and managing Zudo projects.', tags: ['CLI', 'SCAFFOLD', 'GENERATE'] },
  'packages-config.html': { title: '@zudojs/config', desc: 'Layered configuration with multiple sources, priority ordering, and sensitive value redaction.', tags: ['CONFIGURATION', 'SOURCES', 'ENV'] },
  'packages-constants.html': { title: '@zudojs/constants', desc: 'Shared constants, branded types, enums, and type-safe literals for the entire Zudo ecosystem.', tags: ['LEAF PACKAGE', 'CONSTANTS', 'TYPES'] },
  'packages-container.html': { title: '@zudojs/container', desc: 'Token-based dependency injection container with scoped lifecycles and module awareness.', tags: ['DI', 'CONTAINER', 'TOKENS'] },
  'packages-core.html': { title: '@zudojs/core', desc: 'Application lifecycle, context propagation, runtime orchestrator, and module system.', tags: ['CORE', 'LIFECYCLE', 'RUNTIME'] },
  'packages-cqrs.html': { title: '@zudojs/cqrs', desc: 'Command Query Responsibility Segregation — separate read and write models with typed handlers.', tags: ['CQRS', 'COMMANDS', 'QUERIES'] },
  'packages-crypto.html': { title: '@zudojs/crypto', desc: 'Cryptographic primitives — hashing, encryption, key derivation, and token generation.', tags: ['CRYPTO', 'HASHING', 'ENCRYPTION'] },
  'packages-database.html': { title: '@zudojs/database', desc: 'Database infrastructure — clients, repositories, transactions, and migration support.', tags: ['DATABASE', 'REPOSITORY', 'TRANSACTIONS'] },
  'packages-docs.html': { title: '@zudojs/docs', desc: 'Documentation infrastructure — document model, registry, validation, navigation, and generation.', tags: ['DOCS', 'DOCUMENTATION', 'GENERATION'] },
  'packages-errors.html': { title: '@zudojs/errors', desc: 'Shared error base class, error codes, error categories, and typed error hierarchy.', tags: ['ERRORS', 'EXCEPTIONS', 'HANDLING'] },
  'roadmap.html': { title: 'Roadmap', desc: 'Implementation status, completed milestones, and future directions for the Zudo framework.', tags: ['ROADMAP', 'STATUS', 'FUTURE'] },
  'rules.html': { title: 'Package Rules', desc: 'Internal development standards — file naming, folder organization, code style, and type ownership.', tags: ['RULES', 'STANDARDS', 'CONVENTIONS'] },
  'contributing.html': { title: 'Contributing', desc: 'How to contribute to the Zudo framework — setup, workflow, code style, and PR process.', tags: ['CONTRIBUTING', 'OPEN SOURCE', 'PR'] },
};

let fixed = 0;

const files = readdirSync(SITE).filter(f => f.endsWith('.html') && f !== 'packages.html');

for (const file of files) {
  const filePath = join(SITE, file);
  let content = readFileSync(filePath, 'utf8');
  const original = content;

  // 1. FIX SIDEBAR — replace entire aside with standard sidebar + active
  const sidebarRegex = /<aside[\s\S]*?<\/aside>/;
  if (sidebarRegex.test(content)) {
    const activeHref = sidebarActiveMap[file];
    let newSidebar = STANDARD_SIDEBAR;
    if (activeHref) {
      // Add sidebar-item-active to the matching link
      newSidebar = newSidebar.replace(
        `href="${activeHref}" class="sidebar-item"`,
        `href="${activeHref}" class="sidebar-item sidebar-item-active"`
      );
    }
    content = content.replace(sidebarRegex, newSidebar);
  }

  // 2. FIX HEADER — replace header/h1 block with border-4 box format
  const info = headerInfo[file];
  if (info) {
    // Try to match existing header patterns
    // Pattern A: <header class="...">...</header>
    const headerRegexA = /<header[\s\S]*?<\/header>/;
    // Pattern B: <div class="..."><h1...>...</h1>...</div> (no header tag)
    const headerRegexB = /<div class="[^"]*mb-[^"]*">\s*<h1[\s\S]*?<\/div>\s*<\/div>/;
    // Pattern C: just h1 with some wrapper

    const newHeader = `      <div class="border-4 border-black p-8 mb-10 relative">
        <div class="absolute -top-3 left-6 px-3 py-1 bg-zudo-red text-black font-black text-sm border-2 border-black">v0.0.1</div>
        <h1 class="text-4xl font-black mb-3 mt-2">${info.title}</h1>
        <p class="text-lg text-black/70 leading-relaxed max-w-2xl">
          ${info.desc}
        </p>
        <div class="flex flex-wrap gap-2 mt-4">
          ${info.tags.map(t => `<span class="px-3 py-1 border-2 border-black text-xs font-bold">${t}</span>`).join('\n          ')}
        </div>
      </div>`;

    if (headerRegexA.test(content)) {
      content = content.replace(headerRegexA, newHeader);
    }
    // For pages without header tag, try to find the h1 area
    else {
      // Find from breadcrumb end to first section
      const h1Regex = /(\s*<!-- BREADCRUMBS -->[\s\S]*?)([\s\S]*?)(<section|<div class="grid|<div class="space)/;
      if (h1Regex.test(content)) {
        // Keep breadcrumbs, replace everything between breadcrumb and first section
      }
    }
  }

  // 3. FIX H2s — replace border-b-2 with border-b-4, add uppercase
  content = content.replace(
    /<h2 class="([^"]*?)border-b-2 border-black([^"]*?)">/g,
    '<h2 class="$1border-b-4 border-black$2 uppercase">'
  );
  // Fix text-h2 class pattern (concepts pages)
  content = content.replace(
    /<h2 class="text-h2 mb-4"/g,
    '<h2 class="text-2xl font-black mb-4 border-b-4 border-black pb-2 uppercase"'
  );
  content = content.replace(
    /<h2 class="text-h2 mb-6"/g,
    '<h2 class="text-2xl font-black mb-4 border-b-4 border-black pb-2 uppercase"'
  );

  // 4. FIX MAIN — add max-w-4xl
  content = content.replace(
    /<main class="flex-1 min-w-0 px-8 py-10">/g,
    '<main class="flex-1 min-w-0 px-8 py-10 max-w-4xl">'
  );
  content = content.replace(
    /<main class="flex-1 min-w-0 px-8 py-10" role="main">/g,
    '<main class="flex-1 min-w-0 px-8 py-10 max-w-4xl">'
  );

  // 5. FIX TABLES — wrap in border-4 border-black, fix thead
  content = content.replace(
    /<table class="/g,
    '<table class="w-full text-sm'
  );
  // Ensure tables are in border-4 wrapper
  if (content.includes('<table') && !content.includes('border-4 border-black')) {
    content = content.replace(
      /(<div class="[^"]*?)>\s*<table/g,
      '$1 border-4 border-black"><table'
    );
  }

  if (content !== original) {
    writeFileSync(filePath, content, 'utf8');
    fixed++;
    console.log(`✓ ${file}`);
  } else {
    console.log(`— ${file} (no changes)`);
  }
}

console.log(`\nFixed ${fixed}/${files.length} pages.`);
