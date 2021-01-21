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
 

/* monthlyChart */
var solar_panel_user = document.getElementById("solar_panel_user").innerText.trim();

var canvas = document.getElementById("monthlyChart");
var chartData = {
    labels: "",
    datasets: [{
        label: "",
        data: "",
        backgroundColor: "",
    }]
};
var yTicks;
var monthlyChart = new Chart(canvas, {
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
    monthlyChart.options.scales.yAxes.splice(1, 1);

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
        monthlyChart.options.scales.xAxes.push({
            display: false,
            id: "sigX",
        })
        monthlyChart.options.scales.yAxes.push({
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
 
    monthlyChart.options.scales.yAxes[0].ticks.max = yMax;
    monthlyChart.update();
    canvas.style.visibility = "visible";
}

function submitForm() {
    canvas.style.visibility = "hidden";
    document.getElementById("dataTable").style.visibility = "hidden";

    document.getElementById("chart_spin").style.display = "block";
    document.getElementById("table_spin").style.display = "block";
    var from = moment().add(-1, 'days').format();
    var to = moment().format();
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

/* dataChart */
var solar_panel_user1 = document.getElementById("solar_panel_user").innerText.trim();

var canvas1 = document.getElementById("dataChart");
var chartData1 = {
    labels: "",
    datasets: [{
        label: "",
        data: "",
        backgroundColor: "",
    }]
};
var yTicks1;
var dataChart1 = new Chart(canvas1, {
    type: "bar",
    data: chartData1,
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
                        yTicks1 = values;
                        return value;
                    }
                },
            }]
        }
    }
});

function createTable1(tableData1, info1) {
    var talbeDataSets1 = [];
    var resultDate1;
    var columns1 = [
        { 'title': 'time' },
        { 'title': 'power(+)' },
        { 'title': 'loss' },
        { 'title': 'power(-)' },
    ];

    for (let i = 0; i < tableData1.length; i++) {

        if (info1 == "kwd") {
            resultDate1 = moment.utc(tableData1[i].date).format("YYYY-MM-DD");
        } else if (info1 == "kwm") {
            resultDate1 = moment.utc(tableData1[i].date).format("YYYY-MM");
        } else {
            resultDate1 = moment.utc(tableData1[i].date).format("YYYY-MM-DD HH:mm");
        }
        if (info1 == "wh") {
            talbeDataSets1[i] = [resultDate1, tableData1[i].value, tableData1[i].loss, 0];
        } else {
            if (solar_panel_user1 == 1 && info1 != "w") {
                talbeDataSets1[i] = [resultDate1, tableData1[i].value, 0, tableData1[i].rev];
            } else {
                talbeDataSets1[i] = [resultDate1, tableData1[i].value, 0, 0];
            }
        }
    }
    if ($.fn.dataTable.isDataTable('#dataTable1')) {
        $('#dataTable1').DataTable().destroy();
    }
    $(document).ready(() => {
        $('#dataTable1').DataTable({
            columns: columns1,
            data: talbeDataSets1,
            "createdRow": function (row, data) {
                if (data[2] > 3) {
                    $(row).css('color', 'red');
                }
            }
        });
        if (info1 == "wh") {
            $('#dataTable1').DataTable().column(2).visible(true);
        } else {
            $('#dataTable1').DataTable().column(2).visible(false);
        }
        if (solar_panel_user1 == 1 && info1 != "w") {
            $('#dataTable1').DataTable().column(3).visible(true);
        } else {
            $('#dataTable1').DataTable().column(3).visible(false);
        }
    });
    document.getElementById("dataTable1").style.visibility = "visible";
}

function updateChart1(json) {
    var xyData1 = json.data;
    var label1 = json.label;

    Chart.defaults.global.legend.display = false;
    if (xyData1 == null) {
        return;
    }

    // datasetsからsolar_panel削除(初期化)
    chartData1.datasets.splice(1, 1);
    dataChart1.options.scales.yAxes.splice(1, 1);

    var x1 = [];
    var y1 = [];
    var rev1 = [];

    for (var i = 0; i < xyData1.length; i++) {
        if (label1 == "kwd") {
            var time1 = moment.utc(xyData1[i].date).format("YYYY-MM-DD");
        } else if (label1 == "kwm") {
            time1 = moment.utc(xyData1[i].date).format("YYYY-MM");
        } else {
            time1 = moment.utc(xyData1[i].date).format("HH:mm");
        }
        x1[i] = time1;
        y1[i] = xyData1[i].value;
        if (solar_panel_user1 == 1) {
            rev1[i] = xyData1[i].rev;
            // rev1[i] = 2;
        }
    }
    chartData1.labels = x1;
    chartData1.datasets[0].data = y1;

    var brown1 = "rgba(153, 102, 51, 0.8)";
    var yellow1 = "rgba(240, 173, 78, 0.8)";
    var green1 = "rgba(92, 184, 92, 0.8)";

    if (json.sigLevel) {
        var sigLevelData1 = json.sigLevel;
        var sigLevel1 = [];
        var index1 = 0;
        var tempSigLevel1 = sigLevelData1[index++].sig_level;
        var pointRadiusList1 = [];
    }


    for (let i = 0; i < chartData1.labels.length; i++) {
        if (label1 == "w") {
            if (json.sigLevel) {
                for (let j = index1; j < sigLevelData1.length; j++) {
                    if (chartData1.labels[i] == sigLevelData1[j].date) {
                        sigLevel1.push(sigLevelData1[j].sig_level);
                        tempSigLevel1 = sigLevelData1[j].sig_level;
                        pointRadiusList1.push(3);
                        index1++;
                        break;
                    } else {
                        if (sigLevelData1[j] && sigLevelData1[j].sig_level == -999) {
                            sigLevel1.push(-999);
                        } else {
                            sigLevel1.push(tempSigLevel1);
                        }
                        pointRadiusList1.push(0);
                        break;
                    }
                }
            }
            chartData1.datasets[0].type = "line"
            chartData1.datasets[0].label = "W"
            chartData1.datasets[0].backgroundColor = "rgba(0, 0, 255, 0.2)";
            chartData1.datasets[0].borderColor = "rgba(0, 0, 255, 1)";
        } else {
            if (label1 == "wh") {
                chartData1.datasets[0].label = "Wh(瞬時値積算)"
                chartData1.datasets[0].backgroundColor = green1;
            } else if (label1 == "kwh") {
                chartData1.datasets[0].label = "KWh"
                chartData1.datasets[0].backgroundColor = green1;
            } else if (label1 == "kwd") {
                chartData1.datasets[0].label = "KWh"
                chartData1.datasets[0].backgroundColor = yellow1;
            } else if (label1 == "kwm") {
                chartData1.datasets[0].label = "KWh"
                chartData1.datasets[0].backgroundColor = brown1;
            }
            chartData1.datasets[0].type = "bar"
            chartData1.datasets[0].borderColor = "rgba(255, 255, 255, 1)";
        }
    }

    if (label1 == "w") {
        chartData1.datasets.push({
            label1: "Sig Level",
            data: sigLevel1,
            borderColor: "#ff9900",
            backgroundColor: "transparent",
            pointRadius: pointRadiusList1,
            pointBackgroundColor: "#ff9900",
            type: "line",
            yAxisID: "sigY"
        });
        dataChart1.options.scales.xAxes.push({
            display: false,
            id: "sigX",
        })
        dataChart1.options.scales.yAxes.push({
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

    var yMax1 = Math.max.apply(null, chartData1.datasets[0].data)

    // solarユーザ
    if (chartData1.datasets[0].label1 == "KWh" && solar_panel_user1 == 1) {
        chartData1.datasets[0].label1 = "KWh(+)"
        chartData1.datasets.push({
            label: "KWh(-)",
            data: rev1,
            backgroundColor: "rgba(128, 128, 128, 0.7)",
        });
        yMax1 = yMax1 > Math.max.apply(null, chartData1.datasets[1].data) ?
            yMax1 : Math.max.apply(null, chartData1.datasets[1].data)
    }
    yMax1 = (yMax1 * 1.2).toFixed(2);
    if (yMax1 > 2) {
        yMax1 = Math.ceil(yMax1);
    } else if (yMax1 < 0) {
        yMax1 = 0;
    }

    dataChart1.options.scales.yAxes[0].ticks.max = yMax1;
    dataChart1.update();
    canvas1.style.visibility = "visible";
}

function submitForm1() {
    canvas1.style.visibility = "hidden";
    document.getElementById("dataTable1").style.visibility = "hidden";
 
    document.getElementById("chart_spin1").style.display = "block";
    document.getElementById("table_spin1").style.display = "block";
    var from1 = moment().startOf('year').format("YYYY/MM/DD HH:mm");
    var to1 = document.getElementById("toPicker1").value;
    var sel1 = document.getElementById("selectBox1");
    var info1 = sel1.options[sel1.selectedIndex].value;
    $.ajax({
        url: '/main/chart',
        data: {
            from: from1,
            to: to1,
            info: info1,
            id_user: document.getElementById("user_id").innerText
        },
        success: function (json) {
            //console.log(json)
            document.getElementById("chart_spin1").style.display = "none";
            document.getElementById("table_spin1").style.display = "none";
            createTable1(json.data, json.label);
            updateChart1(json);
        }
    });
}


window.addEventListener('load',()=>{
    submitForm();
    submitForm1();
}, false);


/* クリック時切替 */
function changeTitle(){
    var chartTitle1 = document.getElementById("chartTitle1");
    chartTitle1.innerHTML = "本年の積算電力量";
};

function changeItem(){
    document.dataForm.item.selectedIndex = 1;
};

document.getElementById("dataChart")
        .addEventListener('click',
            function() {
                canvas1.style.visibility = "hidden";
                document.getElementById("dataTable1").style.visibility = "hidden";
             
                document.getElementById("chart_spin1").style.display = "block";
                document.getElementById("table_spin1").style.display = "block";
                var from1 = moment().startOf('year').format("YYYY/MM/DD HH:mm");
                var to1 = document.getElementById("toPicker1").value;
                changeTitle();
                changeItem();
                var sel1 = document.getElementById("selectBox1");
                var info1 = sel1.options[sel1.selectedIndex].value;
                $.ajax({
                    url: '/main/chart',
                    data: {
                        from: from1,
                        to: to1,
                        info: info1,
                        id_user: document.getElementById("user_id").innerText
                    },
                    success: function (json) {
                        //console.log(json)
                        document.getElementById("chart_spin1").style.display = "none";
                        document.getElementById("table_spin1").style.display = "none";
                        createTable1(json.data, json.label);
                        updateChart1(json);
                    }
                });
            }
        );
