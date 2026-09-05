import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const SITE = '/home/oyinlola/Desktop/Zudo/site/docs';
const files = readdirSync(SITE).filter(f => f.endsWith('.html') && f !== 'packages.html');

let fixed = 0;

for (const file of files) {
  const filePath = join(SITE, file);
  let content = readFileSync(filePath, 'utf8');
  const original = content;

  // 1. FIX MAIN — add px-8 py-10 max-w-4xl (handle various existing class patterns)
  content = content.replace(
    /<main class="doc-content flex-1 min-w-0" role="main">/g,
    '<main class="flex-1 min-w-0 px-8 py-10 max-w-4xl">'
  );
  content = content.replace(
    /<main class="doc-content flex-1 min-w-0">/g,
    '<main class="flex-1 min-w-0 px-8 py-10 max-w-4xl">'
  );
  content = content.replace(
    /<main class="flex-1 min-w-0">/g,
    '<main class="flex-1 min-w-0 px-8 py-10 max-w-4xl">'
  );
  content = content.replace(
    /<main class="flex-1 min-w-0 px-8 py-10">/g,
    '<main class="flex-1 min-w-0 px-8 py-10 max-w-4xl">'
  );
  content = content.replace(
    /<main class="flex-1 min-w-0 px-8 py-10" role="main">/g,
    '<main class="flex-1 min-w-0 px-8 py-10 max-w-4xl">'
  );

  // 2. FIX BREADCRUMBS — add proper format if missing
  // Check if page has breadcrumbs div with text-sm mb-6
  if (!content.includes('text-sm mb-6') && content.includes('<main')) {
    // Find the main tag and add breadcrumbs after it
    const mainMatch = content.match(/(<main[^>]*>)/);
    if (mainMatch) {
      // Determine page title for breadcrumb
      const titleMatch = content.match(/<h1[^>]*>([^<]+)<\/h1>/);
      const pageTitle = titleMatch ? titleMatch[1].trim() : '';

      // Determine parent section
      let parentSection = 'Docs';
      let parentHref = '/';
      if (file.startsWith('packages-')) {
        parentSection = 'Packages';
        parentHref = '/docs/packages';
      } else if (file.startsWith('architecture-') || file === 'architecture.html') {
        parentSection = 'Architecture';
        parentHref = '/docs/architecture';
      } else if (file.startsWith('concepts-') || file === 'concepts.html') {
        parentSection = 'Concepts';
        parentHref = '/docs/concepts';
      } else if (file.startsWith('getting-started')) {
        parentSection = 'Getting Started';
        parentHref = '/docs/getting-started';
      }

      const breadcrumbs = `
      <div class="text-sm mb-6">
        <a href="/" class="hover:text-zudo-blue">Docs</a>
        <span class="mx-2 text-black/30">/</span>
        <a href="${parentHref}" class="hover:text-zudo-blue">${parentSection}</a>
        <span class="mx-2 text-black/30">/</span>
        <span class="text-black/50">${pageTitle}</span>
      </div>`;

      content = content.replace(
        /(<main[^>]*>)/,
        `$1${breadcrumbs}`
      );
    }
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
