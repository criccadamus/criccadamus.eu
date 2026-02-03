(function () {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const apply = function (isDark) {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  apply(media.matches);
  if (typeof media.addEventListener === "function") {
    media.addEventListener("change", function (e) {
      apply(e.matches);
    });
  } else if (typeof media.addListener === "function") {
    media.addListener(function (e) {
      apply(e.matches);
    });
  }
})();
