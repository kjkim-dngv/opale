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

  // 간트차트 페이지인지 확인 (URL에 /gantt가 포함되어 있는지 체크)
  if ($('body').hasClass('controller-gantts')) {

    // 캡처링 단계에서 이벤트 잡기 (gantt.js 핸들러보다 먼저 실행)
    document.addEventListener('click', function(e) {
      var expander = e.target.closest('div.gantt_subjects .expander');
      if (expander) {
        e.stopImmediatePropagation();
        e.stopPropagation();
        customGanttEntryClick({ currentTarget: expander });
      }
    }, true); // true = 캡처링 단계

    // 수정된 간트차트 토글 함수
    function customGanttEntryClick(e){
      var icon_expander = e.currentTarget;
      var subject = $(icon_expander.parentElement);
      // var subject_left = parseInt(subject.css('left')) + parseInt(icon_expander.offsetWidth);
      var subject_left = parseInt(subject.css('left')); // expander width를 더하지 않음

      var target_shown = null;
      var target_top = 0;
      var total_height = 0;
      var out_of_hierarchy = false;
      var iconChange = null;
      if(subject.hasClass('open'))
        iconChange = function(element){
          var expander = $(element).find('.expander')
          expander.switchClass('icon-expanded', 'icon-collapsed');
          $(element).removeClass('open');
          if (expander.find('svg').length === 1) {
            updateSVGIcon(expander[0], 'angle-right')
          }
        };
      else
        iconChange = function(element){
          var expander = $(element).find('.expander')
          expander.find('.expander').switchClass('icon-collapsed', 'icon-expanded');
          $(element).addClass('open');
          if (expander.find('svg').length === 1) {
            updateSVGIcon(expander[0], 'angle-down')
          }
        };
      iconChange(subject);
      subject.nextAll('div').each(function(_, element){
        var el = $(element);
        var json = el.data('collapse-expand');
        var number_of_rows = el.data('number-of-rows');
        var el_task_bars = '#gantt_area form > div[data-collapse-expand="' + json.obj_id + '"][data-number-of-rows="' + number_of_rows + '"]';
        var el_selected_columns = 'td.gantt_selected_column div[data-collapse-expand="' + json.obj_id + '"][data-number-of-rows="' + number_of_rows + '"]';

        // 다음 요소의 left 값을 정규화
        var el_left = parseInt(el.css('left'));
        var el_has_expander = el.find('.expander').length > 0;

        // expander가 없는 요소는 left에서 expander 공간(약 18px)을 빼서 비교
        if (!el_has_expander) {
          el_left -= 18; // 또는 icon_expander.offsetWidth
        }

        // if(out_of_hierarchy || parseInt(el.css('left')) <= subject_left){
        if(out_of_hierarchy || el_left <= subject_left){
          out_of_hierarchy = true;
          if(target_shown == null) return false;
          var new_top_val = parseInt(el.css('top')) + total_height * (target_shown ? -1 : 1);
          el.css('top', new_top_val);
          $([el_task_bars, el_selected_columns].join()).each(function(_, el){
            $(el).css('top', new_top_val);
          });
          return true;
        }
        var is_shown = el.is(':visible');
        if(target_shown == null){
          target_shown = is_shown;
          target_top = parseInt(el.css('top'));
          total_height = 0;
        }
        if(is_shown == target_shown){
          $(el_task_bars).each(function(_, task) {
            var el_task = $(task);
            if(!is_shown)
              el_task.css('top', target_top + total_height);
            if(!el_task.hasClass('tooltip'))
              el_task.toggle(!is_shown);
          });
          $(el_selected_columns).each(function (_, attr) {
            var el_attr = $(attr);
            if (!is_shown)
              el_attr.css('top', target_top + total_height);
              el_attr.toggle(!is_shown);
          });
          if(!is_shown)
            el.css('top', target_top + total_height);
          iconChange(el);
          el.toggle(!is_shown);
          total_height += parseInt(json.top_increment);
        }
      });
      drawGanttHandler();
    }

    console.log("간트차트 토글 핸들러가 이벤트 위임 방식으로 적용되었습니다.");
  }
});
