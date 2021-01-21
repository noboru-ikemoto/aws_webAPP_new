/**
 *================================================================
 *Project Name : nialm web application
 *File Name : tagPlusData.js
 *Version : $Id: tagplusData.js 333 2020-04-30 05:53:30Z tms002 $
 *Author(s) : $Author: tms002 $
 *Created on : Jan 30, 2019
 *Updated on : $Date: 2020-04-30 14:53:30 +0900 (2020/04/30 (木)) $
 *Copyright © THOMAS TECHNOLOGY INC. All rights Reserved.
 *================================================================
 */

import * as tagModule from '../tagModule.js';

let offset = parseInt(document.getElementById("offset").value);
let iconList = document.getElementById('icon_list');
let tagImgId = 0;
let iconNum = "";

// 時刻検索ボタン
document.getElementById('search_button_group').addEventListener('click', (e) => {
    // 1時間前
    let dateString = document.getElementById("date").innerHTML;
    document.getElementById("default_img").style.backgroundColor = "";
    if (e.target.id == "prev") {
        if (dateString != "") {
            dateString = moment(dateString).subtract(1, 'hours').format('YYYY-MM-DD HH:mm');
        }
        offset += 1;
        getTagplusData(offset);
        document.getElementById("next").disabled = false;
        document.getElementById("now").disabled = false;
    }
    // 現在
    if (e.target.id == "now") {
        offset = 0;
        getTagplusData(offset);
        document.getElementById("next").disabled = true;
        document.getElementById("now").disabled = true;
    }
    // 1時間後
    if (e.target.id == "next") {
        if (dateString != "") {
            dateString = moment(dateString).add(1, 'hours').format('YYYY-MM-DD HH:mm');
        }
        if (offset > 0) {
            offset -= 1;
            getTagplusData(offset);
        }
        if (offset == 0) {
            document.getElementById("next").disabled = true;
            document.getElementById("now").disabled = true;
        }
    }
    document.getElementById("offset").value = offset;
    document.getElementById('btn_config').style.display = "none";
    document.getElementById('change_icon_list').style.display = "none";
});


document.getElementById('change_icon_list').addEventListener('click', (e) => {
    // iconリストを選択
    if (e.target.className == "tag-image-button") {
        iconNum = e.target.id;
        document.getElementById("edit_ok").disabled = false;
        document.getElementById("default_img").style.backgroundColor = "";
        if (iconNum == document.getElementById("default_img").getElementsByTagName('img')[0].id) {
            document.getElementById("default_img").style.backgroundColor = "rgba(0, 0, 0, 0.2)";
        } else {
            document.getElementById("default_img").style.backgroundColor = "";
        }
        for (let i = 0; i < iconList.children.length; i++) {
            if (iconNum != iconList.children[i].getElementsByTagName("img")[0].id) {
                iconList.children[i].style.backgroundColor = "";
            } else {
                iconList.children[i].style.backgroundColor = "rgba(0, 0, 0, 0.2)";
            }
        }
    }
    // icon変更実行
    if (e.target.id == "edit_ok") {
        if (tagImgId != 0 && iconNum != "") {
            document.getElementById('btn_config').style.display = "none";
            document.getElementById('change_icon_list').style.display = "none";
            document.getElementById("default_img").style.backgroundColor = "";
            changeIcon(document.getElementById(tagImgId).getAttribute("value"), iconNum);
        }
        for (let i = 0; i < iconList.children.length; i++) {
            iconList.children[i].style.backgroundColor = "";
        }
    }
    // icon menu閉
    if (e.target.id == "edit_cancel") {
        tagImgId = "";
        iconNum = "";
        document.getElementById('btn_config').style.display = "none";
        document.getElementById('change_icon_list').style.display = "none";
        document.getElementById("edit_ok").disabled = true;
        document.getElementById("default_img").style.backgroundColor = "";
        tagModule.tag_node_list.forEach(element => {
            element.style.backgroundColor = "";
        });
        for (let i = 0; i < iconList.children.length; i++) {
            iconList.children[i].style.backgroundColor = "";
        }
    }
});

document.getElementById('tag_list_card_body').addEventListener('click', (e) => {
    // tagリスト
    document.getElementById("default_img").style.backgroundColor = "";
    if (e.target.name == "tag_icon") {
        tagImgId = e.target.id;
        document.getElementById('btn_config').style.display = "block";
        document.getElementById("edit_ok").disabled = true;
        tagModule.tag_node_list.forEach(element => {
            if (element.getElementsByTagName('img')[0].id == tagImgId) {
                element.style.backgroundColor = "rgba(0, 0, 0, 0.2)";
                // set default icon
                document.getElementById('default_img').getElementsByTagName('img')[0].src =
                    "../tag_images/" + element.getElementsByTagName('input')[1].value + ".png";
                document.getElementById('default_img').getElementsByTagName('img')[0].id =
                    element.getElementsByTagName('input')[1].value;
            } else {
                element.style.backgroundColor = "";
            }
        });

        for (let i = 0; i < iconList.children.length; i++) {
            iconList.children[0].style.backgroundColor = "";
        }
    }
    // 変更ボタン
    if (e.target.id == "btn_config") {
        iconNum = "";
        document.getElementById('change_icon_list').style.display = "block";
    }
});

// icon変更実行
function changeIcon(tagImgId, iconNum) {
    tagModule.init();
    document.getElementById("loding_spin").style.display = "block";
    document.getElementById('btn_config').style.display = "none";
    $.ajax({
        url: '/tagplus/tagplusData',
        type: "POST",
        data: {
            tagImgId: tagImgId,
            iconNum: iconNum,
            id_user: document.getElementById("user_id").innerText
        },
        success: function (json) {
            getTagplusData(offset);
        }
    });
}

// tagplusデータをDBに要請
function getTagplusData(offset) {

    // document.getElementById("now").disabled = true;
    // document.getElementById("next").disabled = true;
    document.getElementById('dataChart').style.display = "none";
    document.getElementById("loding_spin").style.display = "block";
    document.getElementById('btn_config').style.display = "none";
    document.getElementById("change_power_label").disabled = true;
    document.getElementById("show_graph").disabled = true;
    document.getElementById("date").innerHTML = "";
    document.getElementById("img_card").style.display = "none";

    $.ajax({
        url: '/tagplus/tagplusData',
        data: {
            offset: offset,
            id_user: document.getElementById("user_id").innerText
        },
        success: function (json) {
            let card_element = tagModule.init();
            let dateString = moment.utc(json.data[0].start_time).format("YYYY-MM-DD HH:00");
            document.getElementById('loding_spin').style.display = "none";
            document.getElementById("img_card").style.display = "flex";
            document.getElementById("date").innerHTML = dateString;
            document.getElementById("power_wh").style.display = "block";
            document.getElementById("base_power").style.display = "block";
            document.getElementById("change_power_label").disabled = false;
            document.getElementById("show_graph").disabled = false;

            tagModule.createTagDisplay(json, card_element);
            tagModule.drawChart(json.chartData);
        }
    });
}

getTagplusData(offset);