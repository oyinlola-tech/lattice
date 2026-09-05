// Zudo Packages Page Scripts

(function() {
  var filterBtns = document.querySelectorAll('.filter-btn');
  var pkgCards = document.querySelectorAll('.pkg-card');

  filterBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      filterBtns.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');

      var filter = btn.getAttribute('data-filter');

      pkgCards.forEach(function(card) {
        if (filter === 'all') {
          card.classList.remove('hidden-pkg');
        } else {
          var tags = card.getAttribute('data-tags') || '';
          if (tags.includes(filter)) {
            card.classList.remove('hidden-pkg');
          } else {
            card.classList.add('hidden-pkg');
          }
        }
      });
    });
  });
})();
