import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const SITE = '/home/oyinlola/Desktop/Zudo/site/docs';
const files = readdirSync(SITE).filter(f => f.endsWith('.html') && f.startsWith('packages-') && f !== 'packages.html');

// Packages already in the standard sidebar
const sidebarPackages = ['adapters', 'errors', 'constants'];

// Map file → package slug
const pkgMap = {
  'packages-api.html': 'api',
  'packages-auth.html': 'auth',
  'packages-cache.html': 'cache',
  'packages-cli.html': 'cli',
  'packages-config.html': 'config',
  'packages-container.html': 'container',
  'packages-core.html': 'core',
  'packages-cqrs.html': 'cqrs',
  'packages-crypto.html': 'crypto',
  'packages-database.html': 'database',
  'packages-docs.html': 'docs',
};

let fixed = 0;

for (const file of files) {
  const slug = pkgMap[file];
  if (!slug || sidebarPackages.includes(slug)) continue;

  const filePath = join(SITE, file);
  let content = readFileSync(filePath, 'utf8');
  const original = content;

  // Check if already has sidebar-item-active
  if (content.includes('sidebar-item-active')) continue;

  // Add the current package link after the last package in sidebar, with active class
  // Find the last sidebar-item in the Packages section
  const lastPkgLink = '      <a href="/docs/packages/constants" class="sidebar-item">@zudojs/constants</a>';
  const newLink = `      <a href="/docs/packages-${slug}" class="sidebar-item sidebar-item-active">@zudojs/${slug}</a>`;

  if (content.includes(lastPkgLink)) {
    content = content.replace(lastPkgLink, lastPkgLink + '\n' + newLink);
  }

  if (content !== original) {
    writeFileSync(filePath, content, 'utf8');
    fixed++;
    console.log(`✓ ${file} — added @zudojs/${slug} as active`);
  } else {
    console.log(`— ${file} (no match)`);
  }
}

console.log(`\nFixed ${fixed} pages.`);
