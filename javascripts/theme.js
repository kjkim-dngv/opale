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

  // 간트차트 페이지인지 확인
  if ($('body').hasClass('controller-gantts')) {

    // ========== 간트차트 토글 모듈 ==========
    const GanttToggle = (function() {
      // ========== 상수 ==========
      const EXPANDER_WIDTH = 18;

      // ========== Private 변수 ==========
      let taskBarsMap = {};
      let selectedColumnsMap = {};
      const parsedJsonCache = new WeakMap();
      let subjectsArray = [];
      const subjectIndexMap = new WeakMap();
      const subjectDataMap = new WeakMap();

      // ========== 헬퍼 함수 ==========
      const getCacheKey = (objId, numberOfRows) => objId + '_' + numberOfRows;

      function getParsedJson(el) {
        if (parsedJsonCache.has(el)) {
          return parsedJsonCache.get(el);
        }
        const jsonStr = el.dataset.collapseExpand;
        let parsed = {};
        try {
          parsed = jsonStr ? JSON.parse(jsonStr) : {};
        } catch(e) {}
        parsedJsonCache.set(el, parsed);
        return parsed;
      }

      function populateMap(selector, map) {
        document.querySelectorAll(selector).forEach((el) => {
          const parsed = getParsedJson(el);
          const key = getCacheKey(parsed.obj_id || el.dataset.collapseExpand, el.dataset.numberOfRows);
          if (!map[key]) map[key] = [];
          map[key].push(el);
        });
      }

      function toggleIcon(element, collapse) {
        const expander = element.firstElementChild;
        if (expander && expander.classList.contains('expander')) {
          expander.classList.toggle('icon-expanded', !collapse);
          expander.classList.toggle('icon-collapsed', collapse);
          const svg = expander.querySelector('svg');
          if (svg) updateSVGIcon(expander, collapse ? 'angle-right' : 'angle-down');
        }
        element.classList.toggle('open', !collapse);
      }

      function updateRelatedElements(cacheKey, newTop, shouldHide) {
        const taskBars = taskBarsMap[cacheKey];
        if (taskBars) {
          for (let i = 0, len = taskBars.length; i < len; i++) {
            const task = taskBars[i];
            if (newTop !== null) task.style.top = newTop + 'px';
            if (shouldHide !== null && !task.classList.contains('tooltip')) {
              task.style.display = shouldHide ? 'none' : '';
            }
          }
        }

        const selectedColumns = selectedColumnsMap[cacheKey];
        if (selectedColumns) {
          for (let i = 0, len = selectedColumns.length; i < len; i++) {
            const col = selectedColumns[i];
            if (newTop !== null) col.style.top = newTop + 'px';
            if (shouldHide !== null) col.style.display = shouldHide ? 'none' : '';
          }
        }
      }

      // ========== 캐시 구축 ==========
      function buildCache() {
        taskBarsMap = {};
        selectedColumnsMap = {};
        subjectsArray = [];

        populateMap('#gantt_area form > div[data-collapse-expand]', taskBarsMap);
        populateMap('td.gantt_selected_column div[data-collapse-expand]', selectedColumnsMap);

        document.querySelectorAll('.gantt_subjects div[data-collapse-expand]').forEach((el, index) => {
          const firstChild = el.firstElementChild;
          const json = getParsedJson(el);
          const numberOfRows = el.dataset.numberOfRows;

          subjectsArray.push(el);
          subjectIndexMap.set(el, index);
          subjectDataMap.set(el, {
            left: parseInt(el.style.left) || 0,
            hasExpander: firstChild && firstChild.classList.contains('expander'),
            topIncrement: json.top_increment || 0,
            cacheKey: getCacheKey(json.obj_id, numberOfRows)
          });
        });
      }

      // ========== 토글 처리 ==========
      function processChildren(startIdx, subjectLeft, collapse) {
        let targetShown = null;
        let targetTop = 0;
        let totalHeight = 0;
        let outsideIdx = -1;
        const arrLen = subjectsArray.length;

        for (let idx = startIdx; idx < arrLen; idx++) {
          const el = subjectsArray[idx];
          const data = subjectDataMap.get(el);
          const elLeft = data.left - (data.hasExpander ? 0 : EXPANDER_WIDTH);

          // 외부 요소 도달
          if (elLeft <= subjectLeft) {
            if (targetShown === null) break;
            outsideIdx = idx;
            break;
          }

          const visible = el.style.display !== 'none';
          const top = parseInt(el.style.top) || 0;

          if (targetShown === null) {
            targetShown = visible;
            targetTop = top;
          }

          if (visible === targetShown) {
            const newTop = targetTop + totalHeight;

            if (!targetShown) el.style.top = newTop + 'px';
            el.style.display = targetShown ? 'none' : '';
            toggleIcon(el, collapse);

            updateRelatedElements(data.cacheKey, targetShown ? null : newTop, targetShown);
            totalHeight += data.topIncrement;
          }
        }

        return { targetShown, totalHeight, outsideIdx };
      }

      function adjustOutsidePositions(startIdx, heightDelta) {
        const arrLen = subjectsArray.length;
        for (let j = startIdx; j < arrLen; j++) {
          const el = subjectsArray[j];
          const data = subjectDataMap.get(el);
          const newTop = (parseInt(el.style.top) || 0) + heightDelta;

          el.style.top = newTop + 'px';
          updateRelatedElements(data.cacheKey, newTop, null);
        }
      }

      function handleToggle(e) {
        const subjectEl = e.currentTarget.parentElement;
        const clickedIndex = subjectIndexMap.get(subjectEl);
        const subjectData = subjectDataMap.get(subjectEl);
        const subjectLeft = subjectData ? subjectData.left : 0;
        const isOpen = subjectEl.classList.contains('open');

        toggleIcon(subjectEl, isOpen);

        const { targetShown, totalHeight, outsideIdx } = processChildren(clickedIndex + 1, subjectLeft, isOpen);

        if (outsideIdx >= 0) {
          const heightDelta = totalHeight * (targetShown ? -1 : 1);
          adjustOutsidePositions(outsideIdx, heightDelta);
        }

        requestAnimationFrame(drawGanttHandler);
      }

      // ========== 이벤트 바인딩 ==========
      function bindEvents() {
        document.addEventListener('click', (e) => {
          const expander = e.target.closest('div.gantt_subjects .expander');
          if (expander) {
            e.stopImmediatePropagation();
            e.stopPropagation();
            handleToggle({ currentTarget: expander });
          }
        }, true);
      }

      function init() {
        buildCache();
        bindEvents();
        console.log("간트차트에 테마의 커스텀 토글 핸들러가 적용되었습니다.");
      }

      // ========== Public API ==========
      return {
        init: init,
        rebuildCache: buildCache
      };
    })();

    GanttToggle.init();
  }
});
