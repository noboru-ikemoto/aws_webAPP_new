/**
*================================================================
*Project Name : nialm web application
*File Name : showPowerData.js
*Version : $Id: showPowerData.js 322 2020-04-14 01:40:07Z tms002 $
*Author(s) : $Author: tms002 $
*Created on : Jan 30, 2019
*Updated on : $Date: 2020-04-14 10:40:07 +0900 (2020/04/14 (火)) $
*Copyright © THOMAS TECHNOLOGY INC. All rights Reserved.
*================================================================
*/

var solar_panel_user = document.getElementById("solar_panel_user").innerText.trim();

var canvas = document.getElementById("dataChart");
var chartData = {
    labels: "",
    datasets: [{
        label: "",
        data: "",
        backgroundColor: "",
    }]
};
var yTicks;
var dataChart = new Chart(canvas, {
    type: "bar",
    data: chartData,
    options: {
        elements: {
            line: {
                tension: 0,
            }
        },
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                    callback: function (value, index, values) {
                        yTicks = values;
                        return value;
                    }
                },
            }]
        }
    }
});

function createTable(tableData, info) {
    var talbeDataSets = [];
    var resultDate;
    var columns = [
        { 'title': 'time' },
        { 'title': 'power(+)' },
        { 'title': 'loss' },
        { 'title': 'power(-)' },
    ];

    for (let i = 0; i < tableData.length; i++) {

        if (info == "kwd") {
            resultDate = moment.utc(tableData[i].date).format("YYYY-MM-DD");
        } else if (info == "kwm") {
            resultDate = moment.utc(tableData[i].date).format("YYYY-MM");
        } else {
            resultDate = moment.utc(tableData[i].date).format("YYYY-MM-DD HH:mm");
        }
        if (info == "wh") {
            talbeDataSets[i] = [resultDate, tableData[i].value, tableData[i].loss, 0];
        } else {
            if (solar_panel_user == 1 && info != "w") {
                talbeDataSets[i] = [resultDate, tableData[i].value, 0, tableData[i].rev];
            } else {
                talbeDataSets[i] = [resultDate, tableData[i].value, 0, 0];
            }
        }
    }
    if ($.fn.dataTable.isDataTable('#dataTable')) {
        $('#dataTable').DataTable().destroy();
    }
    $(document).ready(() => {
        $('#dataTable').DataTable({
            columns: columns,
            data: talbeDataSets,
            "createdRow": function (row, data) {
                if (data[2] > 3) {
                    $(row).css('color', 'red');
                }
            }
        });
        if (info == "wh") {
            $('#dataTable').DataTable().column(2).visible(true);
        } else {
            $('#dataTable').DataTable().column(2).visible(false);
        }
        if (solar_panel_user == 1 && info != "w") {
            $('#dataTable').DataTable().column(3).visible(true);
        } else {
            $('#dataTable').DataTable().column(3).visible(false);
        }
    });
    document.getElementById("dataTable").style.visibility = "visible";
}

function updateChart(json) {
    var xyData = json.data;
    var label = json.label;

    Chart.defaults.global.legend.display = false;
    if (xyData == null) {
        return;
    }

    // datasetsからsolar_panel削除(初期化)
    chartData.datasets.splice(1, 1);
    dataChart.options.scales.yAxes.splice(1, 1);

    var x = [];
    var y = [];
    var rev = [];

    for (var i = 0; i < xyData.length; i++) {
        if (label == "kwd") {
            var time = moment.utc(xyData[i].date).format("YYYY-MM-DD");
        } else if (label == "kwm") {
            time = moment.utc(xyData[i].date).format("YYYY-MM");
        } else {
            time = moment.utc(xyData[i].date).format("HH:mm");
        }
        x[i] = time;
        y[i] = xyData[i].value;
        if (solar_panel_user == 1) {
            rev[i] = xyData[i].rev;
            // rev[i] = 2;
        }
    }
    chartData.labels = x;
    chartData.datasets[0].data = y;

    var brown = "rgba(153, 102, 51, 0.8)";
    var yellow = "rgba(240, 173, 78, 0.8)";
    var green = "rgba(92, 184, 92, 0.8)";

    if (json.sigLevel) {
        var sigLevelData = json.sigLevel;
        var sigLevel = [];
        var index = 0;
        var tempSigLevel = sigLevelData[index++].sig_level;
        var pointRadiusList = [];
    }


    for (let i = 0; i < chartData.labels.length; i++) {
        if (label == "w") {
            if (json.sigLevel) {
                for (let j = index; j < sigLevelData.length; j++) {
                    if (chartData.labels[i] == sigLevelData[j].date) {
                        sigLevel.push(sigLevelData[j].sig_level);
                        tempSigLevel = sigLevelData[j].sig_level;
                        pointRadiusList.push(3);
                        index++;
                        break;
                    } else {
                        if (sigLevelData[j] && sigLevelData[j].sig_level == -999) {
                            sigLevel.push(-999);
                        } else {
                            sigLevel.push(tempSigLevel);
                        }
                        pointRadiusList.push(0);
                        break;
                    }
                }
            }
            chartData.datasets[0].type = "line"
            chartData.datasets[0].label = "W"
            chartData.datasets[0].backgroundColor = "rgba(0, 0, 255, 0.2)";
            chartData.datasets[0].borderColor = "rgba(0, 0, 255, 1)";
        } else {
            if (label == "wh") {
                chartData.datasets[0].label = "Wh(瞬時値積算)"
                chartData.datasets[0].backgroundColor = green;
            } else if (label == "kwh") {
                chartData.datasets[0].label = "KWh"
                chartData.datasets[0].backgroundColor = green;
            } else if (label == "kwd") {
                chartData.datasets[0].label = "KWh"
                chartData.datasets[0].backgroundColor = yellow;
            } else if (label == "kwm") {
                chartData.datasets[0].label = "KWh"
                chartData.datasets[0].backgroundColor = brown;
            }
            chartData.datasets[0].type = "bar"
            chartData.datasets[0].borderColor = "rgba(255, 255, 255, 1)";
        }
    }

    if (label == "w") {
        chartData.datasets.push({
            label: "Sig Level",
            data: sigLevel,
            borderColor: "#ff9900",
            backgroundColor: "transparent",
            pointRadius: pointRadiusList,
            pointBackgroundColor: "#ff9900",
            type: "line",
            yAxisID: "sigY"
        });
        dataChart.options.scales.xAxes.push({
            display: false,
            id: "sigX",
        })
        dataChart.options.scales.yAxes.push({
            ticks: { min: -100, max: -40 },
            display: true,
            position: "right",
            type: "linear",
            scaleLabel: {
                display: true,
                labelString: 'Sig Level',
            },
            gridLines: {
                display: false,
            },
            id: "sigY"
        })
    }

    var yMax = Math.max.apply(null, chartData.datasets[0].data)

    // solarユーザ
    if (chartData.datasets[0].label == "KWh" && solar_panel_user == 1) {
        chartData.datasets[0].label = "KWh(+)"
        chartData.datasets.push({
            label: "KWh(-)",
            data: rev,
            backgroundColor: "rgba(128, 128, 128, 0.7)",
        });
        yMax = yMax > Math.max.apply(null, chartData.datasets[1].data) ?
            yMax : Math.max.apply(null, chartData.datasets[1].data)
    }
    yMax = (yMax * 1.2).toFixed(2);
    if (yMax > 2) {
        yMax = Math.ceil(yMax);
    } else if (yMax < 0) {
        yMax = 0;
    }

    dataChart.options.scales.yAxes[0].ticks.max = yMax;
    dataChart.update();
    canvas.style.visibility = "visible";
}

function submitForm() {
    canvas.style.visibility = "hidden";
    document.getElementById("dataTable").style.visibility = "hidden";

    document.getElementById("chart_spin").style.display = "block";
    document.getElementById("table_spin").style.display = "block";
    var from = document.getElementById("fromPicker").value;
    var to = document.getElementById("toPicker").value;
    var sel = document.getElementById("selectBox");
    var info = sel.options[sel.selectedIndex].value;
    $.ajax({
        url: '/main/chart',
        data: {
            from: from,
            to: to,
            info: info,
            id_user: document.getElementById("user_id").innerText
        },
        success: function (json) {
            // console.log(json)
            document.getElementById("chart_spin").style.display = "none";
            document.getElementById("table_spin").style.display = "none";
            createTable(json.data, json.label);
            updateChart(json);
        }
    });
}

submitForm();