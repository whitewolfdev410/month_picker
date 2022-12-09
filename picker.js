function padToTwo(number) {
  if (number <= 9999) {
    number = ("0" + number).slice(-2);
  }
  return number;
}

(function($) {
  $.fn.monthly = function(options) {
    var months = options.months || [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
      ],
      Monthly = function(el) {
        this.year = 0;
        this.monthIndex = 0;
        this.day = 0;
        this._el = $(el);
        this._init();
        this._render();
        this._renderYears();
        this._renderMonths();
        this._bind();
      };

    Monthly.prototype = {
      _init: function() {
        this._el.val(months[new Date().getMonth()] + " " + options.years[50]);
        this.year = options.years[50];
      },

      _render: function() {
        var linkPosition = this._el.offset(),
          cssOptions = {
            display: "none",
            position: "absolute",
            top:
              linkPosition.top + this._el.height() + (options.topOffset || 0),
            left: linkPosition.left
          };
        this._container = $('<div class="monthly-wrp">')
          .css(cssOptions)
          .appendTo($("body"));
        this._monthContainer = $('<div id="month_arrow">')
          .appendTo($("body"));
      },

      _bind: function() {
        var self = this;
        this._el.on("click", $.proxy(this._show, this));
        $(document).on("click", $.proxy(this._hide, this));
        this._yearsSelect.on("click", function(e) {
          e.stopPropagation();
        });
        this._container.on("click", "button", 
          $.proxy(this._selectMonth, this)
          );
      },

      _show: function(e) {
        e.preventDefault();
        e.stopPropagation();
        this._container.css("display", "inline-block");
      },

      _hide: function() {
        this._container.css("display", "none");
      },

      _selectMonth: function(e, showCalendar = true) {
        var monthIndex = $(e.target).data("value"),
          month = months[monthIndex],
          year = this._yearsSelect.val();
        this.monthIndex = monthIndex;
        this._el.html(month + " " + year);
        if (options.onMonthSelect) {
          options.onMonthSelect(monthIndex, month, year);
        }
        this._renderMonthArrow(monthIndex,year);
        if(showCalendar) {
          this._renderMonthCalendar(year, monthIndex);
        }
      },
      _renderMonthArrow:function(monthIndex,year){
        var self = this;
        let html = ''
        if(monthIndex==0){
          // lastyear = year - 1
          html += '<div><button data-value="'+(parseInt(year)-1)+'">' + (parseInt(year)-1) + '</button><button data-value="'+year+'">' + year + '</button></div>'
        }else if(monthIndex == 11){
          html += '<div><button data-value="'+year+'">' + year + '</button><button data-value="'+(parseInt(year)+1)+'">' + (parseInt(year)+1) + '</button></div>'
        }

        else{
          html += '<div></button><button data-value="'+year+'">' + year + '</button></div>'
        }
        html+='<div><button id="prev_month"><</button>'
        for(i=monthIndex-1;i<=monthIndex+1;i++){
          if(i<0){
            html += '<button class="btn_mon" data-value="11">' + months[11] + '</button>'
          }
          else if(i==12){
            html += '<button class="btn_mon" data-value="0">' + months[0] + '</button>'
          }
          else{
            html += '<button class="btn_mon" data-value="' + i + '">' + months[i] + '</button>'
          }
        }
        html += '<button id="next_month">></button></div>'
        // var _monthArrow = $(html).appendTo(this._monthContainer)
        document.getElementById('month_arrow').innerHTML = html
        $('#prev_month').on("click", self._prevMonth.bind(this));
        $('#next_month').on("click", self._nextMonth.bind(this));
      },
      _prevMonth: function(ev, showCalendar = true) {
        if(this.monthIndex === 0) {
          $(".years select").val($(".years select").val() - 1);
          this.year = $(".years select").val();
          this._selectMonth({target: $(`<button data-value="11"></button>`)}, showCalendar);
        } else {
          this._selectMonth({target: $(`<button data-value="${this.monthIndex-1}"></button>`)}, showCalendar);
        }
      },
      _nextMonth: function(ev, showCalendar = true) {
        console.log(showCalendar);
        if(this.monthIndex === 11) {
          $(".years select").val(parseInt($(".years select").val()) + 1);
          this.year = $(".years select").val();
          this._selectMonth({target: $(`<button data-value="0"></button>`)}, showCalendar);
        } else {
          this._selectMonth({target: $(`<button data-value="${this.monthIndex+1}"></button>`)}, showCalendar);
        }
      },
      _renderMonthCalendar: function(year, month) {
        $("#month_calendar").show();
        var self=this;
        var markup = ["<table id='calendar'>", "<tr>"];
        var date = new Date(year, month, 1);
        var countOfDays = new Date(year, month+1, 0).getDate();
        var startDate = date.getDay();
        var days = [...Array(countOfDays)].map((_, index) => index+1);
        days.unshift(...(''.padStart(startDate, ' ').split("")));
        $.each(days, function(index, day) {
          if (index > 0 && index % 7 === 0) {
            markup.push("</tr>");
            markup.push("<tr>");
          }
          markup.push(
            '<td><button class="btn_day" data-value="' + day + '"' +(day === ' ' ? "disabled" : "")+'>' + day + "</button></td>"
          );
        });
        markup.push("</tr>");
        markup.push("</table>");
        $("#month_calendar").html(markup.join(""));
        $(".btn_day").on("click", function(e) {
          var d = $(e.target).data("value");
          if(parseInt(d)) {
            self._renderDayArrow.bind(self)(year, month, d);
          }
        })
      },
      _renderDayArrow: function(year, month, day) {
        $("#month_calendar").hide();
        this.day = day;
        let html = ''
        html+='<div><button id="prev_day"><</button>'
        for(i=day-1;i<=day+1;i++){
          if(i===0){
            html += '<button class="btn_day--arrow" data-value="'+(new Date(year, month, 0).getDate())+'">' + (new Date(year, month, 0).getDate())+'-'+months[((month+12)-1)%12] + '</button>'
          }
          else if(i==(new Date(year, month+1, 0).getDate())+1){
            html += '<button class="btn_day--arrow" data-value="1">' + 1 +'-'+months[(month+1)%12]+ '</button>'
          }
          else{
            html += '<button class="btn_day--arrow" data-value="' + i + '">' + i +'-'+months[month] + '</button>'
          }
        }
        html += '<button id="next_day">></button></div>'
        // var _monthArrow = $(html).appendTo(this._monthContainer)
        document.getElementById('day_arrow').innerHTML = html
        $('#prev_day').on("click", this._prevDay.bind(this));
        $('#next_day').on("click", this._nextDay.bind(this));
      },
      _prevDay: function() {
            if(this.day === 1) {
              this._prevMonth();
              this.day = new Date(this.year, this.monthIndex+1, 0).getDate();
            } else {
              this.day = this.day - 1;
            }
            this._renderDayArrow(this.year, this.monthIndex, this.day);
        },
      _nextDay: function() {
            if(this.day === new Date(this.year, this.monthIndex+1, 0).getDate()) {
              this._nextMonth();
              this.day = 1;
            } else {
              this.day = this.day + 1;
            }
            this._renderDayArrow(this.year, this.monthIndex, this.day);
        },

      _renderYears: function() {
        var markup = $.map(options.years, function(year) {
          if(year === new Date().getFullYear()) return "<option selected>" + year + "</option>";
          return "<option>" + year + "</option>";
        });
        var yearsWrap = $('<div class="years">').appendTo(this._container);
        this._yearsSelect = $("<select>")
          .html(markup.join(""))
          .appendTo(yearsWrap);
      },

      _renderMonths: function() {
        var markup = ["<table>", "<tr>"];
        $.each(months, function(i, month) {
          if (i > 0 && i % 4 === 0) {
            markup.push("</tr>");
            markup.push("<tr>");
          }
          markup.push(
            '<td><button data-value="' + i + '">' + month + "</button></td>"
          );
        });
        markup.push("</tr>");
        markup.push("</table>");
        this._container.append(markup.join(""));
      }
    };

    return this.each(function() {
      return new Monthly(this);
    });
  };
})(jQuery);

$(function() {
  $("#selection").monthly({
    years: [...Array(100)].map((_, index) => index-50+(new Date().getFullYear())),
    topOffset: 28,
    onMonthSelect: function(mi, m, y) {
      mi = padToTwo(mi);
      $("#selection").val(m + " " + y);
    }
  });
});
