/**
 *================================================================
 *Project Name : nialm web application
 *File Name : showLifeTag.js
 *Version : $Id: showLifeTag.js 322 2020-04-14 01:40:07Z tms002 $
 *Author(s) : $Author: tms002 $
 *Created on : Jan 30, 2019
 *Updated on : $Date: 2020-04-14 10:40:07 +0900 (2020/04/14 (火)) $
 *Copyright © THOMAS TECHNOLOGY INC. All rights Reserved.
 *================================================================
 */

import * as tagModule from '../tagModule.js';

document.getElementById("prev").style.display = "none";
document.getElementById("next").style.display = "none";
document.getElementById("now").style.display = "none";

function getTagData() {
    document.getElementById("loding_spin").style.display = "block";
    $.ajax({
        url: '/life/lifetagplus/tagicons',
        data: {
            start_time: document.getElementById("taginfo").children[0].innerHTML.trim(),
            id_user: document.getElementById("taginfo").children[1].innerHTML.trim()
        },
        success: function (json) {
            // console.log(json)
            document.getElementById("loding_spin").style.display = "none";
            document.getElementById("show_graph").disabled = false;
            document.getElementById("date").innerText = json.data[0].start_time;
            let card_element = tagModule.init();
            tagModule.createTagDisplay(json, card_element);
            tagModule.drawChart(json.chartData);
        }
    });
}
getTagData();