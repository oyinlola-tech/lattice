// Zudo Homepage Scripts

// ==================== SEARCH ====================
(function() {
  const searchTrigger = document.getElementById('searchTrigger');
  const searchOverlay = document.getElementById('searchOverlay');
  const searchInput = document.getElementById('searchInput');
  const searchClose = document.getElementById('searchClose');

  if (searchTrigger && searchOverlay) {
    searchTrigger.addEventListener('click', function() {
      searchOverlay.classList.remove('hidden');
      searchInput.focus();
    });

    if (searchClose) {
      searchClose.addEventListener('click', function() {
        searchOverlay.classList.add('hidden');
        searchInput.value = '';
        document.getElementById('searchResults').innerHTML = '';
      });
    }

    document.addEventListener('keydown', function(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchOverlay.classList.remove('hidden');
        searchInput.focus();
      }
      if (e.key === 'Escape') {
        searchOverlay.classList.add('hidden');
        searchInput.value = '';
        document.getElementById('searchResults').innerHTML = '';
      }
    });
  }

  // Search index (static data for demo)
  var searchIndex = [
    { title: 'Installation', path: 'docs/getting-started/', excerpt: 'Install Zudo packages from npm. Node.js >= 24 required.' },
    { title: 'Your First App', path: 'docs/getting-started/first-app.html', excerpt: 'Scaffold a project with the CLI and start building.' },
    { title: 'Project Structure', path: 'docs/getting-started/project-structure.html', excerpt: 'Standard layout for Zudo applications.' },
    { title: 'Architecture Overview', path: 'docs/architecture/', excerpt: 'Five-layer architecture with dependency direction.' },
    { title: 'Module System', path: 'docs/architecture/module-system.html', excerpt: 'Modules as self-contained units of functionality.' },
    { title: 'Runtime', path: 'docs/architecture/runtime.html', excerpt: 'Application lifecycle orchestrator.' },
    { title: 'Adapters', path: 'docs/architecture/adapters.html', excerpt: 'Boundary layer between Zudo and external platforms.' },
    { title: 'Dependency Direction', path: 'docs/architecture/dependency-direction.html', excerpt: 'Dependencies flow inward through five tiers.' },
    { title: 'Application', path: 'docs/concepts/', excerpt: 'Top-level container for modules, plugins, and infrastructure.' },
    { title: 'Configuration', path: 'docs/concepts/configuration.html', excerpt: 'Layered configuration with clear precedence.' },
    { title: 'Contexts', path: 'docs/concepts/contexts.html', excerpt: 'AsyncLocalStorage for context propagation.' },
    { title: 'Dependency Injection', path: 'docs/concepts/dependency-injection.html', excerpt: 'Token-based DI container with scoped lifecycles.' },
    { title: 'Lifecycle', path: 'docs/concepts/lifecycle.html', excerpt: 'State machine for component lifecycle management.' },
    { title: 'Modules', path: 'docs/concepts/modules.html', excerpt: 'Primary building blocks with explicit boundaries.' },
    { title: 'Packages', path: 'docs/packages/', excerpt: '30+ packages for every infrastructure concern.' },
    { title: 'Contributing', path: 'docs/contributing/', excerpt: 'How to contribute to the Zudo framework.' },
    { title: 'Roadmap', path: 'docs/roadmap.html', excerpt: 'Implementation status and future directions.' },
    { title: 'Package Rules', path: 'docs/rules.html', excerpt: 'Internal development standards for every package.' },
  ];

  if (searchInput) {
    searchInput.addEventListener('input', function(e) {
      var query = e.target.value.toLowerCase().trim();
      var resultsContainer = document.getElementById('searchResults');

      if (query.length < 2) {
        resultsContainer.innerHTML = '';
        return;
      }

      var results = searchIndex.filter(function(item) {
        return item.title.toLowerCase().includes(query) ||
               item.excerpt.toLowerCase().includes(query);
      });

      if (results.length === 0) {
        resultsContainer.innerHTML = '<div class="text-zudo-white/50 py-4">No results found.</div>';
        return;
      }

      resultsContainer.innerHTML = results.map(function(item) {
        return '<a href="' + item.path + '" class="search-result block border-2 border-zudo-white/20 p-4 mb-2 hover:border-zudo-red">' +
          '<div class="font-bold">' + item.title + '</div>' +
          '<div class="text-sm text-zudo-white/50 mt-1">' + item.excerpt + '</div>' +
          '<div class="text-xs text-zudo-blue mt-2 font-mono">' + item.path + '</div>' +
        '</a>';
      }).join('');
    });
  }
})();

// ==================== MOBILE MENU ====================
(function() {
  var mobileMenuTrigger = document.getElementById('mobileMenuTrigger');
  var mobileMenu = document.getElementById('mobileMenu');
  var mobileMenuClose = document.getElementById('mobileMenuClose');

  if (mobileMenuTrigger && mobileMenu) {
    mobileMenuTrigger.addEventListener('click', function() {
      mobileMenu.classList.remove('hidden');
    });
  }

  if (mobileMenuClose && mobileMenu) {
    mobileMenuClose.addEventListener('click', function() {
      mobileMenu.classList.add('hidden');
    });
  }
})();
