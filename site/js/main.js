/**
 * Zudo Documentation Site — Main Module
 * Global interactions, scroll behavior, dark mode
 */

class ZudoApp {
  constructor() {
    this.init();
  }

  init() {
    this.initScrollBehavior();
    this.initCodeCopy();
    this.initKeyboardShortcuts();
  }

  initScrollBehavior() {
    // Smooth scroll for anchor links (only for in-page anchors)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href').slice(1);
        const target = document.getElementById(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'auto', block: 'start' });
        }
      });
    });
  }

  initCodeCopy() {
    // Add copy button to code blocks
    document.querySelectorAll('.code-block, pre').forEach(block => {
      const wrapper = document.createElement('div');
      wrapper.className = 'relative';
      block.parentNode.insertBefore(wrapper, block);
      wrapper.appendChild(block);

      const copyBtn = document.createElement('button');
      copyBtn.className = 'absolute top-2 right-2 px-2 py-1 text-xs font-bold bg-black/50 text-white border border-white/20 hover:bg-white/20';
      copyBtn.textContent = 'COPY';
      copyBtn.style.cssText = 'font-family: system-ui, monospace; font-size: 0.7rem; padding: 2px 8px; border-radius: 0;';

      copyBtn.addEventListener('click', async () => {
        const code = block.textContent;
        try {
          await navigator.clipboard.writeText(code);
          copyBtn.textContent = 'COPIED';
          copyBtn.style.background = '#00FF00';
          copyBtn.style.color = '#000000';
          setTimeout(() => {
            copyBtn.textContent = 'COPY';
            copyBtn.style.background = '';
            copyBtn.style.color = '';
          }, 2000);
        } catch (err) {
          console.error('Failed to copy:', err);
        }
      });

      wrapper.appendChild(copyBtn);
    });
  }

  initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Cmd/Ctrl + / to focus search (if on page with search)
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
          searchInput.focus();
        }
      }
    });
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new ZudoApp();
});
