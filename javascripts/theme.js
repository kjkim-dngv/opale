$(function () {
  "use strict";

  // StatusWrapper
  document.querySelectorAll(".list.issues td.status").forEach((el) => {
    if (!el.querySelector("span")) {
      const text = el.textContent.trim();
      if (text) {
        el.innerHTML = "<span>" + text + "</span>";
      }
    }
  });
});
