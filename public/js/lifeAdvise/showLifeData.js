/**
 *================================================================
 *Project Name : nialm web application
 *File Name : showLifeData.js
 *Version : $Id: showLifeData.js 322 2020-04-14 01:40:07Z tms002 $
 *Author(s) : $Author: tms002 $
 *Created on : Jan 30, 2019
 *Updated on : $Date: 2020-04-14 10:40:07 +0900 (2020/04/14 (火)) $
 *Copyright © THOMAS TECHNOLOGY INC. All rights Reserved.
 *================================================================
 */

var dataCanvas = document.getElementById("lifeDataChart");
var flagCanvas = document.getElementById("lifeFlagChart");
// var table = document.getElementById("dataTable");

var dataChart = Chart.Bar(dataCanvas, {
    data: {
        labels: "",
        datasets: [{
            label: "power wh",
            data: "",
            borderColor: "blue",
            backgroundColor: "blue",
            fill: false,
            type: "line",
            yAxisID: "line"
        }, {
            label: "on",
            data: "",
            backgroundColor: "rgba(255, 165, 0, 0.7)",
            yAxisID: "bar"
        },
        {
            label: "off",
            data: "",
            backgroundColor: "rgba(128, 128, 128, 0.7)",
            yAxisID: "bar"
        }
        ]
    },
    options: {
        // responsive: true,
        // maintainAspectRatio: false,
        elements: {
            line: {
                tension: 0, // disables bezier curves
            }
        },
        barValueSpacing: 20,

        scales: {
            yAxes: [{
                ticks: {
                    min: 0,
                    // max: 100
                },
                display: true,
                position: 'left',
                type: "linear",
                scaleLabel: {
                    display: true,
                    labelString: 'on/off',
                    beginAtZero: true,
                },
                id: "bar"
            }, {
                ticks: {
                    min: 0,
                },
                display: true,
                position: "right",
                type: "linear",
                scaleLabel: {
                    display: true,
                    labelString: 'power wh',
                    beginAtZero: true,
                },
                gridLines: {
                    display: false
                },
                id: "line"
            }]
        }
    }
});

var flagChart = new Chart(flagCanvas, {
    type: 'bar',
    data: {
        labels: [
            "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12",
            "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"
        ],
        datasets: [{
            data: "",
            backgroundColor: ["rgba(255, 255, 255, 1)"],
            borderColor: ["rgba(0, 0, 0, 0)"],
            borderWidth: 1.2,
        }]
    },
    options: {
        layout: {
            padding: {
                left: 50,
                right: 70,
                top: 0,
                bottom: 0
            }
        },
        legend: {
            display: false
        },
        animation: {
            duration: 0
        },
        tooltips: {
            position: 'nearest',
            callbacks: {
                title: (tooltipItem, data) => {
                    // console.log(tooltipItem)
                    return tooltipItem[0].index + "時";
                },
                label: (tooltipItem, data) => {
                    return ""
                }
            },
            custom: (tooltipModel) => {
                // console.log(tooltipModel)
                tooltipModel.titleFontSize = 16;
                tooltipModel.y = 0;
                tooltipModel.width = 45;
                // tooltipModel.xAlign = "center";
                tooltipModel.yAlign = "bottom";
            }
        },
        scales: {
            xAxes: [{
                gridLines: {
                    display: false,
                    drawTicks: true,
                },
                categoryPercentage: 1.04,
                barPercentage: 1.0
            }],
            yAxes: [{
                categoryPercentage: 1.0,
                barPercentage: 1.0,
                gridLines: {
                    color: 'rgba(0, 0, 0, 0)',
                    drawTicks: false
                },
                ticks: {
                    min: 0,
                    max: 2,
                    stepSize: 1,
                    display: false
                }
            },
            {
                ticks: {
                    min: 0,
                    max: 1,
                    stepSize: 1,
                    display: false
                },
                display: true,
                position: "right",
                gridLines: {
                    color: 'rgba(0, 0, 0, 0)',
                    drawTicks: false
                }
            }
            ]
        },
        onClick: function (event, elements) {
            // console.log(elements)
            if (elements != "") {
                var id_user = document.getElementById("user_id").innerText;
                var start_time = document.getElementById("lifePicker").value + " " + elements[0]._index + ":00";
                window.open('/lifeAdvise/lifetagplus?id_user=' + id_user + '&start_time=' + start_time, '', 'width=750,height=500');
                return false;
            }
        }
    },
});

function updateChartData(xyData) {
    Chart.defaults.global.legend.display = false;
    if (xyData == null || xyData.length == 0) {
        alert("データーがありません");
        return;
    }
    var x = [];
    var y = [];
    var offData = [];
    var onData = [];
    var powerwh = [];
    var yAxisMax = 0;
    for (var i = 0; i < xyData.length; i++) {
        var time = moment.utc(xyData[i].date).format("HH:00");
        x[i] = time;
        if (xyData[i].power_wh == 0) {
            continue;
        }
        powerwh[i] = xyData[i].power_wh;
        onData[i] = xyData[i].on_count;
        offData[i] = xyData[i].off_count;
        if (onData[i] > yAxisMax) {
            yAxisMax = onData[i]
        }
        if (offData[i] > yAxisMax) {
            yAxisMax = offData[i]
        }
    }
    dataChart.options.scales.yAxes[0].ticks.max = yAxisMax + 1;
    dataChart.options.scales.yAxes[1].ticks.max = 3500;
    dataChart.data.labels = x;
    dataChart.data.datasets[0].data = powerwh;
    dataChart.data.datasets[1].data = onData;
    dataChart.data.datasets[2].data = offData;
    dataChart.update();
    dataCanvas.style.visibility = "visible";
}

function updateFlagData(xyData) {
    var orange = "rgba(255, 165, 0, 0.7)";
    var gray = "rgba(128, 128, 128, 0.7)";
    var black = "rgba(0, 0, 0, 0)";
    var white = "rgba(255, 255, 255, 1)";

    for (let i = 0; i < 24; i++) {
        flagChart.data.datasets[0].borderColor[i] = black;
        flagChart.data.datasets[0].data[i] = 1;
        if (xyData[i].active_flag == -1) {
            flagChart.data.datasets[0].data[i] = 0;
            flagChart.data.datasets[0].backgroundColor[i] = white;
        } else if (xyData[i].active_flag == 1) {
            flagChart.data.datasets[0].backgroundColor[i] = orange;
        } else {
            flagChart.data.datasets[0].backgroundColor[i] = gray;
        }
    }
    flagChart.update();
    flagCanvas.style.visibility = "visible";
}

function submitDate() {
    flagCanvas.style.visibility = "hidden";
    dataCanvas.style.visibility = "hidden";
    document.getElementById("chart_spin").style.display = "block";
    var from = document.getElementById("lifePicker").value;
    $.ajax({
        url: '/lifeAdvise/data',
        data: {
            from: from,
            id_user: document.getElementById("user_id").innerText
        },
        success: function (json) {
            document.getElementById("chart_spin").style.display = "none";
            updateChartData(json.data);
            updateFlagData(json.data);
        }
    });
}

// y軸のmax値を変更するbutton
document.getElementById("power_wh_y_btn").addEventListener("click", () => {
    if (document.getElementById("power_wh_y").value) {
        dataChart.options.scales.yAxes[1].ticks.max = parseInt(document.getElementById("power_wh_y").value);
        dataChart.update();
    }
});
 
// 不在チェック
function checkAbsence() {
    $.ajax({
        url: '/lifeAdvise/absence',
        data: {
            id_user: document.getElementById("user_id").innerText
        },
        success: function (json) {
            // console.log(json)
            if (json.data[0].odekake_flag == 0) {
                document.getElementById("absence_button").disabled = false;
                document.getElementById("absence_button").innerHTML = "不在";
                document.getElementById("absence_button").classList.add("btn-outline-dark");
                document.getElementById("absence_button").classList.remove("bg-brown", "text-white");
            } else {
                document.getElementById("absence_button").disabled = true;
                document.getElementById("absence_button").innerHTML = "不在中";
                document.getElementById("absence_button").classList.add("bg-brown", "text-white");
                document.getElementById("absence_button").classList.remove("btn-outline-dark");
            }
        }
    });
}
timer = setInterval(() => {
    checkAbsence()
}, 60000);

// 不在ボタン
document.getElementById("absence_button").addEventListener("click", () => {
    $.ajax({
        url: '/lifeAdvise/absence',
        type: "POST",
        data: {
            id_user: document.getElementById("user_id").innerText
        },
        success: function (json) {
            document.getElementById("absence_button").disabled = true;
            document.getElementById("absence_button").innerHTML = "不在中";
            document.getElementById("absence_button").classList.add("bg-brown", "text-white");
            document.getElementById("absence_button").classList.remove("btn-outline-dark");
        }
    })
});

submitDate();
checkAbsence();