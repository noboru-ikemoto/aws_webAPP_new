/**
 *================================================================
 *Project Name : nialm web application
 *File Name : thresholdData.js
 *Version : $Id: thresholdData.js 322 2020-04-14 01:40:07Z tms002 $
 *Author(s) : $Author: tms002 $
 *Created on : Jan 30, 2019
 *Updated on : $Date: 2020-04-14 10:40:07 +0900 (2020/04/14 (火)) $
 *Copyright © THOMAS TECHNOLOGY INC. All rights Reserved.
 *================================================================
 */

// $(document).on('click', '.number-spinner button', function() {
//     var btn = $(this),
//         oldValue = btn.closest('.number-spinner').find('input').val().trim(),
//         newVal = 0;

//     if (btn.attr('data-dir') == 'up') {
//         newVal = parseInt(oldValue) + 1;
//     } else {
//         if (oldValue > 1) {
//             newVal = parseInt(oldValue) - 1;
//         } else {
//             newVal = 0;
//         }
//     }
//     btn.closest('.number-spinner').find('input').val(newVal);
// });

var upButton = document.getElementById("high");
var downButton = document.getElementById("low");
var setButton = document.getElementById("set");
var thresholdLabel = document.getElementById("threshold_count");
var defaultCount;
// var lodingIcon = document.getElementById("threshold_spin");

upButton.addEventListener("click", () => {
    var count = parseInt(thresholdLabel.innerHTML);
    thresholdLabel.innerHTML = count - 1;
    if (thresholdLabel.innerHTML == defaultCount) {
        setButton.disabled = true;
    } else {
        setButton.disabled = false;
    }
});

downButton.addEventListener("click", () => {
    var count = parseInt(thresholdLabel.innerHTML);
    thresholdLabel.innerHTML = count + 1;
    if (thresholdLabel.innerHTML == defaultCount) {
        setButton.disabled = true;
    } else {
        setButton.disabled = false;
    }
});

setButton.addEventListener("click", () => {
    // console.log(thresholdLabel.innerHTML);
    submitThreshold(thresholdLabel.innerHTML);
});

function getThresholdData() {
    $.ajax({
        url: '/life/threshold',
        data: {
            id_user: document.getElementById("user_id").innerText
        },
        success: function (json) {
            // console.log(json)
            setButton.disabled = true;
            threshold = json.data[0].act_threshold_count;
            thresholdLabel.innerHTML = threshold;
            defaultCount = threshold;
            document.getElementById("threshold_on").innerHTML = json.data[0].act_threshold_result;
            document.getElementById("threshold_off").innerHTML = json.data[0].off_threshold_result;
            if (json.compareDate == true) {
                console.log(json.compareDate)
                document.getElementById("threshold_on").style.color = "rgba(0, 0, 0, 0.3)";
                document.getElementById("threshold_off").style.color = "rgba(0, 0, 0, 0.3)";
            } else {
                document.getElementById("threshold_on").style.color = "rgba(0, 0, 0, 1)";
                document.getElementById("threshold_off").style.color = "rgba(0, 0, 0, 1)";
            }
            // $("#threshold_edit").val(json.data[0].act_threshold_count);
        }
    })
}

function submitThreshold(count) {
    setButton.disabled = true;
    $.ajax({
        url: '/life/threshold',
        type: "POST",
        data: {
            count: count,
            id_user: document.getElementById("user_id").innerText
        },
        success: function (json) {
            getThresholdData();
            alert("変更は5分以内に適用されます");
        }
    })
}
getThresholdData();
timer = setInterval(function () {
    getThresholdData();
}, 60000);