/**
 * Zudo Documentation — Package Page Scripts
 * Sidebar, TOC, Search, Code Copy, Keyboard shortcuts
 */

/* ==================== SIDEBAR ==================== */

class Sidebar {
  constructor() {
    this.el = document.getElementById('sidebar');
    this.toggle = document.getElementById('sidebarToggle');
    this.init();
  }

  init() {
    if (this.toggle && this.el) {
      this.toggle.addEventListener('click', () => this.el.classList.toggle('open'));
    }
    this.highlightActive();
  }

  highlightActive() {
    const path = window.location.pathname;
    document.querySelectorAll('.sidebar-item').forEach(link => {
      const href = link.getAttribute('href');
      if (href && path.endsWith(href)) {
        link.classList.add('sidebar-item-active');
      }
    });
  }
}

/* ==================== TABLE OF CONTENTS ==================== */

class TableOfContents {
  constructor() {
    this.el = document.getElementById('toc');
    if (!this.el) return;
    this.build();
    this.observe();
  }

  build() {
    const headings = document.querySelectorAll('main h2[id], main h3[id]');
    if (!headings.length) return;

    const list = document.createElement('div');
    list.className = 'space-y-1';

    headings.forEach(h => {
      const a = document.createElement('a');
      a.href = '#' + h.id;
      a.className = 'toc-item';
      a.textContent = h.textContent.replace(/#$/, '').trim();
      a.dataset.level = h.tagName === 'H3' ? '3' : '2';
      list.appendChild(a);
    });

    this.el.appendChild(list);
  }

  observe() {
    const headings = document.querySelectorAll('main h2[id], main h3[id]');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          this.el.querySelectorAll('.toc-item').forEach(i => i.classList.remove('toc-item-active'));
          const active = this.el.querySelector('a[href="#' + id + '"]');
          if (active) active.classList.add('toc-item-active');
        }
      });
    }, { rootMargin: '-80px 0px -80% 0px' });

    headings.forEach(h => observer.observe(h));
  }
}

/* ==================== SEARCH ==================== */

class Search {
  constructor() {
    this.overlay = document.getElementById('searchOverlay');
    this.input = document.getElementById('searchInput');
    this.results = document.getElementById('searchResults');
    this.trigger = document.getElementById('searchTrigger');
    this.closeBtn = document.getElementById('searchClose');
    this.activeIndex = -1;
    this.filtered = [];
    this.init();
  }

  init() {
    if (this.trigger) this.trigger.addEventListener('click', () => this.open());
    if (this.closeBtn) this.closeBtn.addEventListener('click', () => this.close());

    document.addEventListener('keydown', e => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        this.toggle();
      }
      if (e.key === 'Escape' && this.overlay && !this.overlay.classList.contains('hidden')) {
        this.close();
      }
    });

    if (this.input) {
      this.input.addEventListener('input', () => this.search());
      this.input.addEventListener('keydown', e => this.navigate(e));
    }
  }

  open() {
    if (!this.overlay) return;
    this.overlay.classList.remove('hidden');
    this.input.focus();
    this.input.value = '';
    this.results.innerHTML = '';
    this.activeIndex = -1;
    this.filtered = [];
  }

  close() {
    if (!this.overlay) return;
    this.overlay.classList.add('hidden');
    this.input.value = '';
    this.results.innerHTML = '';
    this.activeIndex = -1;
    this.filtered = [];
  }

  toggle() {
    if (this.overlay.classList.contains('hidden')) this.open();
    else this.close();
  }

  search() {
    const q = this.input.value.toLowerCase().trim();
    if (q.length < 2) {
      this.results.innerHTML = '';
      this.filtered = [];
      this.activeIndex = -1;
      return;
    }

    this.filtered = SEARCH_DATA.filter(i =>
      i.title.toLowerCase().includes(q) ||
      i.excerpt.toLowerCase().includes(q) ||
      i.tags.some(t => t.includes(q))
    );
    this.activeIndex = -1;
    this.render();
  }

  render() {
    if (!this.filtered.length) {
      this.results.innerHTML = '<div style="color:rgba(255,255,255,0.5);padding:16px 0">No results found.</div>';
      return;
    }
    this.results.innerHTML = this.filtered.map((item, i) => `
      <a href="${item.path}" class="search-result" style="display:block;margin-bottom:8px;${i === this.activeIndex ? 'border-color:#FF0000;background:#1a1a1a' : ''}">
        <div style="font-weight:700">${this.highlight(item.title, this.input.value)}</div>
        <div style="font-size:0.85rem;color:rgba(255,255,255,0.5);margin-top:4px">${this.highlight(item.excerpt, this.input.value)}</div>
        <div style="font-size:0.75rem;color:#0000FF;margin-top:8px;font-family:monospace">${item.path}</div>
      </a>
    `).join('');
  }

  highlight(text, q) {
    if (!q) return text;
    const re = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
    return text.replace(re, '<span style="color:#FFFF00;font-weight:700">$1</span>');
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
      const a = items[this.activeIndex];
      if (a) window.location.href = a.getAttribute('href');
    }
  }

  updateActive(items) {
    items.forEach((item, i) => {
      if (i === this.activeIndex) {
        item.style.borderColor = '#FF0000';
        item.style.background = '#1a1a1a';
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.style.borderColor = '';
        item.style.background = '';
      }
    });
  }
}

const SEARCH_DATA = [
  { title: 'API Package', path: 'api.html', excerpt: 'Transport-agnostic operation definitions, interceptors, policies, and result types.', tags: ['api', 'operations', 'interceptors', 'executor'] },
  { title: 'Adapters Package', path: 'adapters.html', excerpt: 'Boundary layer between Zudo and external platforms.', tags: ['adapters', 'platform', 'transport'] },
  { title: 'Auth Package', path: 'auth.html', excerpt: 'Authentication and authorization primitives.', tags: ['auth', 'jwt', 'session', 'rbac'] },
  { title: 'Cache Package', path: 'cache.html', excerpt: 'Cache abstraction with memory adapter.', tags: ['cache', 'redis', 'memory'] },
  { title: 'Config Package', path: 'config.html', excerpt: 'Layered configuration with sources.', tags: ['config', 'env', 'settings'] },
  { title: 'Container Package', path: 'container.html', excerpt: 'DI container with token-based registration.', tags: ['di', 'container', 'tokens'] },
  { title: 'Core Package', path: 'core.html', excerpt: 'Lifecycle, context, runtime, modules.', tags: ['core', 'application', 'modules'] },
  { title: 'Events Package', path: 'events.html', excerpt: 'Event bus, emitter, middleware, registry.', tags: ['events', 'bus', 'emitter'] },
  { title: 'Errors Package', path: 'errors.html', excerpt: 'Shared error base class and utilities.', tags: ['errors', 'exceptions', 'handling'] },
  { title: 'HTTP Package', path: 'http.html', excerpt: 'HTTP server and client primitives.', tags: ['http', 'server', 'rest', 'api'] },
  { title: 'Logger Package', path: 'logger.html', excerpt: 'Structured logging with transports.', tags: ['logging', 'logger', 'transports'] },
  { title: 'Schema Package', path: 'schema.html', excerpt: 'Schema definition and parsing engine.', tags: ['schema', 'validation', 'types'] },
  { title: 'Middleware Package', path: 'middleware.html', excerpt: 'Composable middleware pipeline.', tags: ['middleware', 'pipeline', 'composition'] },
];

/* ==================== CODE COPY ==================== */

class CodeCopy {
  constructor() {
    this.init();
  }

  init() {
    document.querySelectorAll('.code-block, .api-signature, pre').forEach(block => {
      const wrapper = document.createElement('div');
      wrapper.style.position = 'relative';
      block.parentNode.insertBefore(wrapper, block);
      wrapper.appendChild(block);

      const btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.textContent = 'COPY';
      btn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(block.textContent);
          btn.textContent = 'COPIED';
          btn.style.background = '#00FF00';
          btn.style.color = '#000000';
          btn.style.borderColor = '#00FF00';
          setTimeout(() => {
            btn.textContent = 'COPY';
            btn.style.background = '';
            btn.style.color = '';
            btn.style.borderColor = '';
          }, 2000);
        } catch (err) {
          console.error('Copy failed:', err);
        }
      });

      wrapper.appendChild(btn);
    });
  }
}

/* ==================== ANCHOR LINKS ==================== */

class AnchorLinks {
  constructor() {
    this.init();
  }

  init() {
    document.querySelectorAll('main h2, main h3').forEach(h => {
      if (!h.id) return;
      const link = document.createElement('a');
      link.href = '#' + h.id;
      link.className = 'anchor-link';
      link.textContent = '#';
      link.setAttribute('aria-label', 'Link to ' + h.textContent);
      h.appendChild(link);
    });
  }
}

/* ==================== SMOOTH SCROLL ==================== */

class SmoothScroll {
  constructor() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const id = a.getAttribute('href').slice(1);
        const target = document.getElementById(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'auto', block: 'start' });
        }
      });
    });
  }
}

/* ==================== INIT ==================== */

document.addEventListener('DOMContentLoaded', () => {
  new Sidebar();
  new TableOfContents();
  new Search();
  new CodeCopy();
  new AnchorLinks();
  new SmoothScroll();
});
