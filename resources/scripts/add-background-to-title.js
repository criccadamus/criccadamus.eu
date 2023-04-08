var timer;
var isStreamsFixed = false;
var isLinksFixed = false;

window.addEventListener('scroll', function() {
  clearTimeout(timer);
  timer = setTimeout(function() {
    var stickyDivs = document.querySelectorAll('.streams-title, .links-title');
    for (var i = 0; i < stickyDivs.length; i++) {
      var stickyDiv = stickyDivs[i];
      var stickyPosition = stickyDiv.offsetTop;
      if (stickyDiv.classList.contains('streams-title')) {
        if (window.pageYOffset >= stickyPosition && !isStreamsFixed) {
          stickyDiv.classList.add('sticky-fixed');
          isStreamsFixed = true;
        } else if (window.pageYOffset < stickyPosition && isStreamsFixed) {
          stickyDiv.classList.remove('sticky-fixed');
          isStreamsFixed = false;
        }
      } else if (stickyDiv.classList.contains('links-title')) {
        if (window.pageYOffset >= stickyPosition && !isLinksFixed) {
          stickyDiv.classList.add('sticky-fixed');
          isLinksFixed = true;
        } else if (window.pageYOffset < stickyPosition && isLinksFixed) {
          stickyDiv.classList.remove('sticky-fixed');
          isLinksFixed = false;
        }
      }
    }
  }, 50);
});