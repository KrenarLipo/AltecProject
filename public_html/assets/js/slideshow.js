(function () {
  var root = document.getElementById("hero-slideshow");
  if (!root) return;

  var slides = Array.prototype.slice.call(root.querySelectorAll(".slide"));
  var dots = Array.prototype.slice.call(root.querySelectorAll(".slide-dots button"));
  var prevBtn = root.querySelector(".slide-nav.prev");
  var nextBtn = root.querySelector(".slide-nav.next");
  var current = 0;
  var timer = null;
  var AUTOPLAY_MS = 6000;

  function show(index) {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    slides[current].classList.remove("is-active");
    if (dots[current]) dots[current].classList.remove("is-active");
    current = index;
    slides[current].classList.add("is-active");
    if (dots[current]) dots[current].classList.add("is-active");

    var video = slides[current].querySelector("video");
    if (video) {
      video.currentTime = 0;
      video.play().catch(function () {});
    }
  }

  function next() { show(current + 1); resetTimer(); }
  function prev() { show(current - 1); resetTimer(); }

  function resetTimer() {
    if (timer) clearInterval(timer);
    timer = setInterval(function () { show(current + 1); }, AUTOPLAY_MS);
  }

  if (nextBtn) nextBtn.addEventListener("click", next);
  if (prevBtn) prevBtn.addEventListener("click", prev);
  dots.forEach(function (dot, i) {
    dot.addEventListener("click", function () { show(i); resetTimer(); });
  });

  if (slides.length > 1) resetTimer();
})();
