/**
 *================================================================
 *Project Name : nialm web application
 *File Name : tagModule.js
 *Version : $Id: tagModule.js 322 2020-04-14 01:40:07Z tms002 $
 *Author(s) : $Author: tms002 $
 *Created on : Jan 30, 2019
 *Updated on : $Date: 2020-04-14 10:40:07 +0900 (2020/04/14 (火)) $
 *Copyright © THOMAS TECHNOLOGY INC. All rights Reserved.
 *================================================================
 */

export const tag_node_list = [];

let powerWhLowerThanTotalPower;
let isClusterWh = true;


// tagicon element初期化
export function init() {
    isClusterWh = true;
    let card_element = document.getElementById('img_card');
    let child_node = card_element.children[0].cloneNode(true);
    child_node.style.backgroundColor = "";
    child_node.style.display = "none";
    child_node.getElementsByClassName('card-header')[0].innerHTML = "";
    child_node.getElementsByTagName('img')[0].src = "";
    while (card_element.firstChild) {
        card_element.removeChild(card_element.firstChild);
    }
    card_element.appendChild(child_node);
    return card_element;
}

export function createTagDisplay(json, card_element) {
    document.getElementById("base_power").innerHTML = json.data[0].adp1 + " Wh";
    if (json.data[0].power_wh) {
        document.getElementById("power_wh").innerHTML = json.data[0].power_wh + " Wh";
    }
    // データがない場合
    if (json.data.length == 0 || json.data[0].id_internal == "undefined" || json.data[0].id_internal == null) {
        document.getElementById("change_power_label").disabled = true;
        let imgNode = document.createElement("img");
        imgNode.src = "../tag_images/userdefine.png";
        card_element.classList.add("justify-content-center");
        card_element.appendChild(imgNode);
    } else {
        // 既存にあるcard elementをコピーして使用する
        card_element.classList.remove("justify-content-center");
        document.getElementById("change_power_label").disabled = false;
        for (let i = 0; i < json.data.length; i++) {
            let child_node = card_element.children[0].cloneNode(true);
            child_node.style.display = "block";
            child_node.getElementsByClassName('card-header')[0].innerHTML = json.data[i].device_type_name;
            let imgName;
            if (json.data[i].icon_user.charAt(0) == "h") {
                if (json.data[i].icon_user.charAt(2) == "h") { // icon name = hmh
                    imgName = "../tag_images/hm_high/" + json.data[i].icon_user + ".png";
                } else if (json.data[i].icon_user.charAt(2) == "m") { // icon name = hmm
                    imgName = "../tag_images/hm_middle/" + json.data[i].icon_user + ".png";
                } else {
                    imgName = "../tag_images/high/" + json.data[i].icon_user + ".png";
                }
            } else if (json.data[i].icon_user.charAt(0) == "m") {
                imgName = "../tag_images/middle/" + json.data[i].icon_user + ".png";
            } else if (json.data[i].icon_user.charAt(0) == "l") {
                imgName = "../tag_images/low/" + json.data[i].icon_user + ".png";
            } else {
                imgName = "../tag_images/" + json.data[i].icon_user + ".png";
            }

            // 数字が1以上だと小数点以下は切り捨て、1未満は1桁まで出す
            let cluster_wh_app = json.data[i].cluster_wh_app;
            if (cluster_wh_app < 1) {
                cluster_wh_app = (cluster_wh_app - 0.05).toFixed(1);
            } else {
                cluster_wh_app = Math.floor(cluster_wh_app);
            }
            child_node.getElementsByTagName('img')[0].src = imgName;
            child_node.getElementsByTagName('img')[0].id = json.data[i].id_internal;
            child_node.getElementsByTagName('img')[0].setAttribute("value", json.data[i].device_table_id_internal);
            child_node.getElementsByClassName('card-footer')[0].
                getElementsByTagName('input')[0].value = json.data[i].cluster_power + "W";
            child_node.getElementsByClassName('card-footer')[0].getElementsByTagName('div')[0].innerHTML =
                "icon: " + json.data[i].icon_user + " power: <span>" + cluster_wh_app + "Wh</span>";
            child_node.getElementsByTagName("input")[1].value = json.data[i].icon_default;
            card_element.appendChild(child_node);
            tag_node_list.push(child_node);
        }

        // 既存にあるcard elementは最後の順に入れてその他として使う
        let etcPower = json.data[0].power_wh - json.data[0].total_wh_app;
        if (etcPower > 0) {
            powerWhLowerThanTotalPower = false;
            // event listenerにかからないようにname削除
            card_element.children[0].getElementsByTagName('img')[0].name = "";
            card_element.children[0].getElementsByTagName('img')[0].classList.remove("btn");
            card_element.children[0].getElementsByTagName('img')[0].src = "../tag_images/othersrev.png";
            card_element.children[0].getElementsByClassName('card-header')[0].innerHTML = "その他";
            card_element.children[0].getElementsByClassName('card-footer')[0].getElementsByTagName('div')[0].innerHTML = Math.floor(etcPower) + "Wh";
            // card_element.children[0].classList.add("ml-auto");
            card_element.children[0].style.display = "block";
        } else {
            // total_wh_appがpower_whより大きい場合power表示を変更
            powerWhLowerThanTotalPower = true;
            for (let i = 1; i < card_element.children.length; i++) {
                let powerLabel = card_element.children[i].getElementsByClassName('card-footer')[0].
                    getElementsByTagName('div')[0].getElementsByTagName('span')[0];
                let power = powerLabel.innerHTML.substring(0, powerLabel.innerHTML.length - 2);
                powerLabel.innerHTML = Math.round((power / json.data[0].total_wh_app) * json.data[0].power_wh) + "Wh";
            }
        }
        card_element.insertBefore(card_element.children[0], null);
    }
}

const chart = document.getElementById('dataChart');

const myChart = new Chart(chart, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            data: [],
            backgroundColor: ["rgba(0, 0, 255, 0.2)"],
            borderColor: ["rgba(0, 0, 255, 1)"],
        }]
    },
    options: {
        legend: {
            display: false
        },
        elements: {
            line: {
                tension: 0,
            }
        },
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
});

export function drawChart(chartData) {
    let labels = [];
    let datasets = [{
        data: [],
        backgroundColor: ["rgba(0, 0, 255, 0.2)"],
        borderColor: ["rgba(0, 0, 255, 1)"],
    }];
    chartData.forEach(e => {
        labels.push(e.input_date);
        datasets[0].data.push(e.input_power);
    });
    myChart.data.labels = labels;
    myChart.data.datasets = datasets;

    myChart.update();
}

document.getElementById("show_graph").addEventListener("click", () => {
    if (chart.style.display == "block") {
        chart.style.display = "none";
    } else {
        chart.style.display = "block";
    }
});

// powerデータ表示変更ボタン
document.getElementById("change_power_label").addEventListener("click", () => {
    let tagCardList = document.getElementById("img_card").children;
    if (isClusterWh) {
        tagCardList[tagCardList.length - 1].style.display = "none";
        isClusterWh = false;
    } else {
        if (!powerWhLowerThanTotalPower) {
            tagCardList[tagCardList.length - 1].style.display = "block";
            isClusterWh = true;
        }
    }
    // 最後のelementはその他なので設定しない
    for (let i = 0; i < tagCardList.length - 1; i++) {
        // tagCardList[i].style.backgroundColor = "";
        let cardFooter = tagCardList[i].getElementsByClassName("card-footer")[0];
        let temp = cardFooter.getElementsByTagName("input")[0].value;

        cardFooter.getElementsByTagName("input")[0].value =
            cardFooter.getElementsByTagName("div")[0].getElementsByTagName("span")[0].innerHTML;
        cardFooter.getElementsByTagName("div")[0].getElementsByTagName("span")[0].innerHTML = temp;

        // データ変更アニメーション効果
        $(cardFooter).css('backgroundColor', '#adb5bd');
        $(cardFooter).animate({
            'opacity': '0.5'
        }, 300, function () {
            $(cardFooter).css({
                'backgroundColor': '#f8f9fa',
                'opacity': '1'
            });
        });
    }
});