import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const SITE = '/home/oyinlola/Desktop/Zudo/site/docs';

const files = readdirSync(SITE).filter(f => f.endsWith('.html') && f !== 'packages.html');

// Adapters reference rules
const rules = {
  // Navbar
  navbar_sticky: 'sticky top-0 z-50 bg-black text-white border-b-4 border-zudo-red',
  navbar_container: 'max-w-screen-2xl mx-auto px-6 py-3',
  // Sidebar
  sidebar_class: 'doc-sidebar w-60 border-r-2 border-black/10 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto flex-shrink-0',
  sidebar_getting_started: 'sidebar-section">Getting Started',
  sidebar_architecture: 'sidebar-section',
  // Breadcrumbs
  breadcrumb_format: 'text-sm mb-6',
  breadcrumb_separator: 'mx-2 text-black/30',
  // Header
  header_box: 'border-4 border-black p-8 mb-10 relative',
  header_version: 'absolute -top-3 left-6 px-3 py-1 bg-zudo-red text-black font-black text-sm border-2 border-black',
  header_h1: 'text-4xl font-black mb-3 mt-2',
  // H2
  h2_style: 'text-2xl font-black mb-4 border-b-4 border-black pb-2',
  // Tables
  table_wrapper: 'border-4 border-black',
  table_thead: 'bg-black text-white',
  table_row_border: 'border-b-2 border-black/10',
  // Code blocks
  code_block: 'code-block',
  // Callouts
  callout: 'callout',
  // Main
  main_class: 'flex-1 min-w-0 px-8 py-10 max-w-4xl',
  // Tailwind config
  tailwind_src: '/js/tailwind-config.js',
  // CSS
  docs_css: '/css/docs.css',
};

for (const file of files) {
  const content = readFileSync(join(SITE, file), 'utf8');
  const issues = [];

  // Check head
  if (!content.includes(rules.tailwind_src)) issues.push('MISSING: tailwind-config.js');
  if (!content.includes(rules.docs_css)) issues.push('MISSING: docs.css');

  // Check navbar
  if (!content.includes('bg-black text-white border-b-4 border-zudo-red')) issues.push('NAVBAR: wrong styling');
  if (!content.includes('max-w-screen-2xl')) issues.push('NAVBAR: missing max-w-screen-2xl');

  // Check sidebar
  if (!content.includes('doc-sidebar')) issues.push('SIDEBAR: missing doc-sidebar class');
  if (!content.includes('sidebar-item')) issues.push('SIDEBAR: missing sidebar-item links');
  if (!content.includes('sidebar-item-active')) issues.push('SIDEBAR: missing sidebar-item-active on current page');

  // Check breadcrumbs
  if (!content.includes('text-sm mb-6')) issues.push('BREADCRUMBS: wrong format');

  // Check header
  if (!content.includes('border-4 border-black p-8 mb-10 relative')) {
    if (content.includes('<header')) issues.push('HEADER: not using border-4 box format');
    else if (content.includes('<h1')) issues.push('HEADER: missing header wrapper');
  }
  if (!content.includes('bg-zudo-red text-black font-black text-sm border-2 border-black">v0.0.1')) {
    issues.push('HEADER: missing version badge');
  }

  // Check H2s
  const h2Matches = content.match(/<h2[^>]*>/g) || [];
  for (const h2 of h2Matches) {
    if (!h2.includes('border-b-4 border-black')) {
      issues.push(`H2: "${h2.substring(0, 60)}..." missing border-b-4`);
    }
  }

  // Check tables
  const tableCount = (content.match(/<table/g) || []).length;
  const border4Tables = (content.match(/border-4 border-black[\s\S]*?<table/g) || []).length;
  if (tableCount > 0 && border4Tables === 0) {
    issues.push('TABLES: not wrapped in border-4 border-black');
  }
  const theadCount = (content.match(/<thead/g) || []).length;
  const blackThead = (content.match(/bg-black text-white/g) || []).length;
  if (theadCount > 0 && blackThead === 0) {
    issues.push('TABLES: thead not using bg-black text-white');
  }

  // Check main
  if (!content.includes('max-w-4xl')) issues.push('MAIN: missing max-w-4xl');

  if (issues.length > 0) {
    console.log(`\n❌ ${file} (${issues.length} issues):`);
    issues.forEach(i => console.log(`   ${i}`));
  } else {
    console.log(`✅ ${file}`);
  }
}
