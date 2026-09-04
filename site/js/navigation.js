/**
 * Zudo Documentation Site — Navigation Module
 * Sidebar navigation, collapsible sections, breadcrumbs
 */

class ZudoNavigation {
  constructor() {
    this.sidebar = document.getElementById('sidebar');
    this.mobileMenuTrigger = document.getElementById('mobileMenuTrigger');
    this.mobileMenu = document.getElementById('mobileMenu');
    this.toc = document.getElementById('toc');

    this.init();
  }

  init() {
    // Mobile menu toggle
    if (this.mobileMenuTrigger && this.mobileMenu) {
      this.mobileMenuTrigger.addEventListener('click', () => {
        this.mobileMenu.classList.toggle('hidden');
      });
    }

    // Sidebar toggle for doc pages
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle && this.sidebar) {
      sidebarToggle.addEventListener('click', () => {
        this.sidebar.classList.toggle('open');
      });
    }

    // Collapsible sections
    this.initCollapsibles();

    // Active page highlighting
    this.highlightActivePage();

    // Table of contents
    this.initTOC();
  }

  initCollapsibles() {
    const collapsibles = document.querySelectorAll('[data-collapse]');
    collapsibles.forEach(el => {
      el.addEventListener('click', () => {
        const targetId = el.getAttribute('data-collapse');
        const target = document.getElementById(targetId);
        if (target) {
          const isHidden = target.classList.contains('hidden');
          target.classList.toggle('hidden');
          el.setAttribute('aria-expanded', isHidden);
        }
      });
    });
  }

  highlightActivePage() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.sidebar-item');

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && currentPath.endsWith(href)) {
        link.classList.add('sidebar-item-active');
      }
    });
  }

  initTOC() {
    if (!this.toc) return;

    const headings = document.querySelectorAll('main h2, main h3');
    if (headings.length === 0) return;

    const tocList = document.createElement('div');
    tocList.className = 'space-y-1';

    headings.forEach((heading, index) => {
      const id = heading.id || `section-${index}`;
      heading.id = id;

      const link = document.createElement('a');
      link.href = `#${id}`;
      link.className = 'toc-item block';
      link.textContent = heading.textContent;
      link.dataset.level = heading.tagName === 'H2' ? '2' : '3';

      if (heading.tagName === 'H3') {
        link.style.paddingLeft = '24px';
      }

      tocList.appendChild(link);
    });

    this.toc.appendChild(tocList);

    // Intersection Observer for active state
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            const tocLink = this.toc.querySelector(`a[href="#${id}"]`);
            if (tocLink) {
              this.toc.querySelectorAll('.toc-item').forEach(item => {
                item.classList.remove('toc-item-active');
              });
              tocLink.classList.add('toc-item-active');
            }
          }
        });
      },
      { rootMargin: '-80px 0px -80% 0px' }
    );

    headings.forEach(heading => observer.observe(heading));
  }
}

// Breadcrumb generator
function generateBreadcrumbs() {
  const breadcrumbs = document.getElementById('breadcrumbs');
  if (!breadcrumbs) return;

  const path = window.location.pathname;
  const parts = path.split('/').filter(Boolean);
  const crumbs = [{ title: 'Home', path: '/' }];

  let currentPath = '';
  parts.forEach((part, index) => {
    currentPath += `/${part}`;
    const title = part
      .replace(/\.html$/, '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());

    if (index < parts.length - 1) {
      crumbs.push({ title, path: currentPath });
    } else {
      crumbs.push({ title, path: null });
    }
  });

  breadcrumbs.innerHTML = crumbs.map((crumb, index) => {
    if (crumb.path) {
      return `<a href="${crumb.path}" class="hover:text-blue-600">${crumb.title}</a>
              <span class="mx-2 text-black/30">/</span>`;
    }
    return `<span class="text-black/50">${crumb.title}</span>`;
  }).join('');
}

// Initialize navigation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new ZudoNavigation();
  generateBreadcrumbs();
});
