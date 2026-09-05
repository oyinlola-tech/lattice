// Zudo Documentation — TOC Active State

(function() {
  var tocLinks = document.querySelectorAll('.toc-link');
  var headings = document.querySelectorAll('section[id]');
  if (!tocLinks.length || !headings.length) return;

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        tocLinks.forEach(function(link) { link.classList.remove('toc-link-active'); });
        var active = document.querySelector('.toc-link[href="#' + entry.target.id + '"]');
        if (active) active.classList.add('toc-link-active');
      }
    });
  }, { rootMargin: '-80px 0px -80% 0px' });

  headings.forEach(function(h) { observer.observe(h); });
})();
