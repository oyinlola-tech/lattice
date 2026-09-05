// Zudo Error Page Scripts

// 404 search functionality
(function() {
  var searchBtn = document.getElementById('search-btn');
  var searchInput = document.getElementById('search-input');

  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', function() {
      var q = searchInput.value.trim();
      if (q) window.location.href = '/?q=' + encodeURIComponent(q);
    });
    searchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        var q = this.value.trim();
        if (q) window.location.href = '/?q=' + encodeURIComponent(q);
      }
    });
  }
})();

// 503 countdown
(function() {
  var el = document.getElementById('countdown');
  if (el) {
    var seconds = 30;
    var timer = setInterval(function() {
      seconds--;
      el.textContent = seconds;
      if (seconds <= 0) clearInterval(timer);
    }, 1000);
  }
})();
