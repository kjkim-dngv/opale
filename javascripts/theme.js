$(function () {
  "use strict";

  // StatusWrapper
  document.querySelectorAll(".list.issues td.status").forEach(function (el) {
    if (!el.querySelector("span")) {
      var text = el.textContent.trim();
      if (text) {
        el.innerHTML = "<span>" + text + "</span>";
      }
    }
  });
});
