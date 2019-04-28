$(function () {
    if ($('.gantt_hdr').length == 0)
        return;
    var month = $('.gantt_hdr a').first().parent();
    var desc = month.children('a').text();
    var parts = desc.match(/([0-9]{4})-([0-9]+)/);
    if (!parts)
        return;
    var nYear = parts[2];
    var nMonth = parts[2];
    var nDays = new Date(nYear, nMonth, 0).getDate();
    var day_width = month.width() / nDays;

    $('div.tooltip').draggable({
        axis: 'x',
        grid: [day_width, 0],
        start: function (event, ui)
        {
			if (Math.abs(event.pageX - $(this).offset().left)  <= 3) {
				$(this).data('move_mode', 'start_date');
			} else if(Math.abs(event.pageX - ($(this).offset().left + $(this).width())) <= 3) {
				$(this).data('move_mode', 'due_date'); 
			} else {
				$(this).data('move_mode', 'both_date');
			}
            var sp = $('#gantt_area').scrollLeft();
            var task = $(this).prevUntil('.tooltip');
			task.each(function () {
				var $t = $(this);
				$t.data('left', $t.position().left + sp);
                $t.data('start_width', $t.width());
			});
            $(this).data('start_width', $(this).width());
            $(this).data('start_pos', ui.position);
        },
        drag: function (event, ui)
        {
			var start_width = $(this).data('start_width');
            var start_pos = $(this).data('start_pos');
            var diff = ui.position.left - start_pos.left;
            var task = $(this).prevUntil('.tooltip');			
            var days = Math.round(diff / day_width);
			var IsStartDateMoveMode = $(this).data('move_mode') === 'start_date';
			var IsDueDateMoveMode   = $(this).data('move_mode') === 'due_date';
			var issue_start_days = Math.round(start_width / day_width);
			if(IsStartDateMoveMode && (days >= issue_start_days)){
				days = issue_start_days - 1;
			}
			if(IsDueDateMoveMode && ((-days) >= issue_start_days)){
				days = - (issue_start_days - 1);
			}
			diff = days * day_width;
			
			if (IsStartDateMoveMode) {
				$(this).css('width', (start_width - diff) + 'px');
			} else if(IsDueDateMoveMode) {
				$(this).css('width', (start_width + diff) + 'px');
			}
			task.each(function () {
				var $t = $(this);
				if (IsStartDateMoveMode) {
					$t.css('width', ($t.data('start_width') - diff) + 'px');
					if (!$t.hasClass("label")) {
						$t.css('left', ($t.data('left') + diff) + 'px');
					}
				} else if(IsDueDateMoveMode) {
					$t.css('width', ($t.data('start_width') + diff) + 'px');
					if ($t.hasClass("label")) {
						$t.css('left', ($t.data('left') + diff) + 'px');
					}
				} else {
					$t.css('left', ($t.data('left') + diff) + 'px');
				}
                		if ($t.hasClass('task_todo'))
					return false;
			});
        },
        stop: function (event, ui)
        {
            var $t = $(this);
			var start_width = $t.data('start_width');
            var start_pos = $t.data('start_pos');
            var diff = ui.position.left - start_pos.left;
            var days = Math.round(diff / day_width);
			var IsStartDateMoveMode = $(this).data('move_mode') === 'start_date';
			var IsDueDateMoveMode   = $(this).data('move_mode') === 'due_date';
			var issue_start_days = Math.round(start_width / day_width);
			if(IsStartDateMoveMode && (days >= issue_start_days)){
				days = issue_start_days - 1;
			}
			if(IsDueDateMoveMode && ((-days) >= issue_start_days)){
				days = - (issue_start_days - 1);
			}
			diff = days * day_width;
            $t.removeData('start_pos');
            $t.removeData('orig_html');
			$t.removeData('start_width');
			var task = $(this).prevUntil('.tooltip');
			if (IsStartDateMoveMode) {
				$(this).css('width', (start_width - diff) + 'px');
			} else if(IsDueDateMoveMode) {
				$(this).css('width', (start_width + diff) + 'px');
			}
			task.each(function () {
				var $t = $(this);
				if (IsStartDateMoveMode) {
					$t.css('width', ($t.data('start_width') - diff) + 'px');
					if (!$t.hasClass("label")) {
						$t.css('left', ($t.data('left') + diff) + 'px');
					}
				} else if(IsDueDateMoveMode) {
					$t.css('width', ($t.data('start_width') + diff) + 'px');
					if ($t.hasClass("label")) {
						$t.css('left', ($t.data('left') + diff) + 'px');
					}
				} else {
					$t.css('left', ($t.data('left') + diff) + 'px');
				}
                		if ($t.hasClass('task_todo'))
					return false;
			});
			task.each(function () {
				$t.removeData('start_width');
			});
			if(IsStartDateMoveMode){
				$(this).css('left', (start_pos.left + (days * day_width)) + 'px');
			}
			if(IsDueDateMoveMode){
				$(this).css('left', (start_pos.left) + 'px');
			}
			
			if(days === 0){
				return;
			}

            // Acquire Issue ID
            var url = $(this).find('a.issue').attr('href');
            url += '/move';

            // Send update to server
            $.post(url, {days: days, move_mode: $(this).data('move_mode'), authenticity_token: AUTH_TOKEN},
                    function (response) {
                        response = response[0];
                        if (response.status == "ok")
                        {
                            console.log("Issue moved to " + response.start_date + "-" + response.due_date);
                        }
                        else
                        {
                            alert(response.error);
                        }
                    }, 
                    "json"
                )
                .error(function () {
                    alert('Saving issue failed!');      
                });
            drawGanttHandler();
        }
    });
});
