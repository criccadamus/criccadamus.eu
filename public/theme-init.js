function applyTheme(isDark) {
  if (isDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

(function () {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  applyTheme(media.matches);
  if (typeof media.addEventListener === "function") {
    media.addEventListener("change", function (e) {
      applyTheme(e.matches);
    });
  } else if (typeof media.addListener === "function") {
    media.addListener(function (e) {
      applyTheme(e.matches);
    });
  }
})();
