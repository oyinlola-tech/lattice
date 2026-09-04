/**
 * Zudo Documentation Site — Search Module
 * Client-side search with keyboard navigation
 */

const SEARCH_DATA = [
  { title: 'Installation', path: 'getting-started/', excerpt: 'Install Zudo packages from npm. Node.js >= 24 required.', tags: ['setup', 'install', 'npm'] },
  { title: 'Your First App', path: 'getting-started/first-app.html', excerpt: 'Scaffold a project with the CLI and start building.', tags: ['tutorial', 'quickstart', 'cli'] },
  { title: 'Project Structure', path: 'getting-started/project-structure.html', excerpt: 'Standard layout for Zudo applications.', tags: ['structure', 'layout', 'monolith'] },
  { title: 'Architecture Overview', path: 'architecture/', excerpt: 'Five-layer architecture with dependency direction.', tags: ['architecture', 'layers', 'design'] },
  { title: 'Module System', path: 'architecture/module-system.html', excerpt: 'Modules as self-contained units of functionality.', tags: ['modules', 'composition', 'boundaries'] },
  { title: 'Runtime', path: 'architecture/runtime.html', excerpt: 'Application lifecycle orchestrator.', tags: ['runtime', 'lifecycle', 'orchestration'] },
  { title: 'Adapters', path: 'architecture/adapters.html', excerpt: 'Boundary layer between Zudo and external platforms.', tags: ['adapters', 'platform', 'transport'] },
  { title: 'Dependency Direction', path: 'architecture/dependency-direction.html', excerpt: 'Dependencies flow inward through five tiers.', tags: ['dependencies', 'tiers', 'circular'] },
  { title: 'Application', path: 'concepts/', excerpt: 'Top-level container for modules, plugins, and infrastructure.', tags: ['application', 'container', 'context'] },
  { title: 'Configuration', path: 'concepts/configuration.html', excerpt: 'Layered configuration with clear precedence.', tags: ['config', 'env', 'settings'] },
  { title: 'Contexts', path: 'concepts/contexts.html', excerpt: 'AsyncLocalStorage for context propagation.', tags: ['context', 'async', 'localstorage'] },
  { title: 'Dependency Injection', path: 'concepts/dependency-injection.html', excerpt: 'Token-based DI container with scoped lifecycles.', tags: ['di', 'container', 'tokens', 'singleton'] },
  { title: 'Lifecycle', path: 'concepts/lifecycle.html', excerpt: 'State machine for component lifecycle management.', tags: ['lifecycle', 'states', 'hooks'] },
  { title: 'Modules', path: 'concepts/modules.html', excerpt: 'Primary building blocks with explicit boundaries.', tags: ['modules', 'imports', 'exports', 'providers'] },
  { title: 'Packages', path: 'packages/', excerpt: '30+ packages for every infrastructure concern.', tags: ['packages', 'libraries', 'modules'] },
  { title: 'Contributing', path: 'contributing/', excerpt: 'How to contribute to the Zudo framework.', tags: ['contributing', 'development', 'pr'] },
  { title: 'Roadmap', path: 'roadmap.html', excerpt: 'Implementation status and future directions.', tags: ['roadmap', 'status', 'phases'] },
  { title: 'Package Rules', path: 'rules.html', excerpt: 'Internal development standards for every package.', tags: ['rules', 'standards', 'conventions'] },
];

class ZudoSearch {
  constructor() {
    this.overlay = document.getElementById('searchOverlay');
    this.input = document.getElementById('searchInput');
    this.results = document.getElementById('searchResults');
    this.trigger = document.getElementById('searchTrigger');
    this.closeBtn = document.getElementById('searchClose');
    this.activeIndex = -1;
    this.filteredResults = [];

    this.init();
  }

  init() {
    this.trigger.addEventListener('click', () => this.open());
    this.closeBtn.addEventListener('click', () => this.close());

    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        this.toggle();
      }
      if (e.key === 'Escape' && !this.overlay.classList.contains('hidden')) {
        this.close();
      }
    });

    this.input.addEventListener('input', () => this.search());
    this.input.addEventListener('keydown', (e) => this.navigate(e));
  }

  open() {
    this.overlay.classList.remove('hidden');
    this.input.focus();
    this.input.value = '';
    this.results.innerHTML = '';
    this.activeIndex = -1;
    this.filteredResults = [];
  }

  close() {
    this.overlay.classList.add('hidden');
    this.input.value = '';
    this.results.innerHTML = '';
    this.activeIndex = -1;
    this.filteredResults = [];
  }

  toggle() {
    if (this.overlay.classList.contains('hidden')) {
      this.open();
    } else {
      this.close();
    }
  }

  search() {
    const query = this.input.value.toLowerCase().trim();

    if (query.length < 2) {
      this.results.innerHTML = '';
      this.filteredResults = [];
      this.activeIndex = -1;
      return;
    }

    this.filteredResults = SEARCH_DATA.filter(item => {
      const titleMatch = item.title.toLowerCase().includes(query);
      const excerptMatch = item.excerpt.toLowerCase().includes(query);
      const tagMatch = item.tags.some(tag => tag.includes(query));
      return titleMatch || excerptMatch || tagMatch;
    });

    this.activeIndex = -1;
    this.renderResults();
  }

  renderResults() {
    if (this.filteredResults.length === 0) {
      this.results.innerHTML = '<div class="text-white/50 py-4">No results found.</div>';
      return;
    }

    this.results.innerHTML = this.filteredResults.map((item, index) => `
      <a href="${item.path}" 
         class="search-result block p-4 mb-2 ${index === this.activeIndex ? 'border-red-500 bg-gray-900' : ''}"
         data-index="${index}">
        <div class="font-bold">${this.highlightMatch(item.title, this.input.value)}</div>
        <div class="text-sm text-white/50 mt-1">${this.highlightMatch(item.excerpt, this.input.value)}</div>
        <div class="text-xs text-blue-400 mt-2 font-mono">${item.path}</div>
      </a>
    `).join('');
  }

  highlightMatch(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<span class="text-yellow-400 font-bold">$1</span>');
  }

  navigate(e) {
    const items = this.results.querySelectorAll('.search-result');

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.activeIndex = Math.min(this.activeIndex + 1, items.length - 1);
      this.updateActive(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.activeIndex = Math.max(this.activeIndex - 1, -1);
      this.updateActive(items);
    } else if (e.key === 'Enter' && this.activeIndex >= 0) {
      e.preventDefault();
      const activeItem = items[this.activeIndex];
      if (activeItem) {
        window.location.href = activeItem.getAttribute('href');
      }
    }
  }

  updateActive(items) {
    items.forEach((item, index) => {
      if (index === this.activeIndex) {
        item.classList.add('border-red-500', 'bg-gray-900');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('border-red-500', 'bg-gray-900');
      }
    });
  }
}

// Initialize search when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new ZudoSearch();
});
