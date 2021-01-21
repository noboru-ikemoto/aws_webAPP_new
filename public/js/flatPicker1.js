/**
 *================================================================
 *Project Name : nialm web application
 *File Name : flatPicker.js
 *Version : $Id: flatPicker.js 322 2020-04-14 01:40:07Z tms002 $
 *Author(s) : $Author: tms002 $
 *Created on : Jan 30, 2019
 *Updated on : $Date: 2020-04-14 10:40:07 +0900 (2020/04/14 (火)) $
 *Copyright © THOMAS TECHNOLOGY INC. All rights Reserved.
 *================================================================
 */

const months1 = [' 1月', ' 2月', ' 3月', ' 4月', ' 5月', ' 6月', ' 7月', ' 8月', ' 9月', '10月', '11月', '12月'];
const buttons1 = months1.map((month) => {
    return { label: month };
});

var fromPicker1, toPicker1;

function setPicker1(now) {
    fromPicker1 = flatpickr('#fromPicker1', {
        enableTime: true,
        time_24hr: true,
        dateFormat: "Y-m-d H:i",
        disableMobile: "true",
        allowInput: true,
        minuteIncrement: 1,
        defaultDate: moment(now).subtract(24, 'hour').format('YYYY-MM-DD HH:mm'),
        maxDate: now,
        "locale": "ja",
        onChange: function (selectedDates, dateStr, instance) {
            toPicker.set('minDate', dateStr);
        }
    });
    toPicker1 = flatpickr('#toPicker1', {
        enableTime: true,
        time_24hr: true,
        dateFormat: "Y-m-d H:i",
        disableMobile: "true",
        allowInput: true,
        minuteIncrement: 1,
        defaultDate: moment(now).subtract(1, 'minute').format('YYYY-MM-DD HH:mm'),
        maxDate: now,
        "locale": "ja",
    });
}

function setPicker2(now) {
    fromPicker1 = flatpickr('#fromPicker1', {
        enableTime: true,
        time_24hr: true,
        dateFormat: "Y-m-d H:00",
        disableMobile: "true",
        allowInput: true,
        minuteIncrement: 60,
        defaultDate: moment(now).subtract(70, 'minute').format('YYYY-MM-DD HH:00'),
        maxDate: moment(now).subtract(70, 'minute').format('YYYY-MM-DD HH:00'),
        "locale": "ja",
        onChange: function (selectedDates, dateStr, instance) {
            toPicker1.set('minDate', dateStr);
        }
    });
    toPicker1 = flatpickr('#toPicker1', {
        enableTime: true,
        time_24hr: true,
        dateFormat: "Y-m-d H:00",
        disableMobile: "true",
        allowInput: true,
        minuteIncrement: 60,
        defaultDate: moment(now).subtract(70, 'minute').format('YYYY-MM-DD HH:00'),
        maxDate: moment(now).subtract(70, 'minute').format('YYYY-MM-DD HH:00'),
        "locale": "ja",
    });
}

function setPicker3(now) {
    fromPicker1 = flatpickr('#fromPicker1', {
        dateFormat: "Y-m-d",
        disableMobile: "true",
        allowInput: true,
        defaultDate: moment(now).format('YYYY-MM-DD'),
        maxDate: now,
        "locale": "ja",
        onChange: function (selectedDates, dateStr, instance) {
            toPicker1.set('minDate', dateStr);
        }
    });
    toPicker1 = flatpickr('#toPicker1', {
        dateFormat: "Y-m-d",
        disableMobile: "true",
        allowInput: true,
        defaultDate: moment(now).format('YYYY-MM-DD'),
        maxDate: now,
        "locale": "ja",
    });
}

function setPicker4(now) {
    fromPicker1 = flatpickr('#fromPicker1', {
        plugins: [
            ShortcutButtonsPlugin({
                button: buttons1,
                onClick: (index, fp) => {
                    const date = new Date();
                    date.setDate(1);
                    date.setMonth(index);
                    date.setYear(fp.currentYear);
                    fp.setDate(date);
                }
            })
        ],
        dateFormat: "Y-m-d",
        disableMobile: "true",
        allowInput: true,
        defaultDate: moment(now).format('YYYY-MM-dd'),
        maxDate: now,
        "locale": "ja",
        disable: [
            function (date) {
                return (date.getDate() > 1);
            }
        ],
        onChange: function (selectedDates, dateStr, instance) {
            toPicker1.set('minDate', dateStr);
        }
    });
    toPicker1 = flatpickr('#toPicker1', {
        plugins: [
            ShortcutButtonsPlugin({
                button: buttons1,
                onClick: (index, fp) => {
                    const date = new Date();
                    date.setDate(1);
                    date.setMonth(index);
                    date.setYear(fp.currentYear);
                    fp.setDate(date);
                }
            })
        ],
        dateFormat: "Y-m-d",
        disableMobile: "true",
        allowInput: true,
        defaultDate: moment(now).format('YYYY-MM-dd'),
        maxDate: now,
        "locale": "ja",
        disable: [
            function (date) {
                return (date.getDate() > 1);
            }
        ]
    });
}

$('#fromPicker1').val(moment().subtract(1, 'hour').utcOffset("+09:00").format('YYYY-MM-DD HH:mm'));
$('#toPicker1').val(moment().add(-1, 'minutes').utcOffset("+09:00").format('YYYY-MM-DD HH:mm'));
$("#selectBox1").bind("change", () => {
    fromPicker.clear();
    toPicker.clear();
    var value = $("#selectBox1 option:selected").val();
    if (value == "w") {
        setPicker1(now);
    } else if (value == "wh" || value == "kwh") {
        setPicker2(now);
    } else if (value == "kwd") {
        setPicker3(now);
    } else if (value == "kwm") {
        setPicker4(now);
    }
});
var now = new moment().format("YYYY-MM-DD HH:mm");
setPicker1(now);

timer = setInterval(function () {
    now = new moment().format("YYYY-MM-DD HH:mm");
   /*  toPicker1.set('maxDate', now); */
}, 60000);
