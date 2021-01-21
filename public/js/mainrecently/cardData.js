/**
 *================================================================
 *Project Name : nialm web application
 *File Name : cardData.js
 *Version : $Id: cardData.js 340 2020-06-15 01:30:37Z tms002 $
 *Author(s) : $Author: tms002 $
 *Created on : Jan 30, 2019
 *Updated on : $Date: 2020-06-15 10:30:37 +0900 (2020/06/15 (月)) $
 *Copyright © THOMAS TECHNOLOGY INC. All rights Reserved.
 *================================================================
 */

var solar_panel_user = document.getElementById("solar_panel_user").innerText.trim();
var sigLevel, sigLevelButton1, sigLevelButton2, sigLevelButton3, sigLevelLabel;

var wCount = new CountUp('label_w', 0, 0, 1, 2.5, options);
var kwhCount = new CountUp('label_wh', 0, 0, 1, 2.5, options);
var kwdCount = new CountUp('label_kwd', 0, 0, 1, 2.5, options);
var kwmCount = new CountUp('label_kwm', 0, 0, 1, 2.5, options);
var foreCount = new CountUp('label_fore', 0, 0, 1, 2.5, options);
var basePowerCount = new CountUp('label_base_power', 0, 0, 1, 2.5, options);
var powerMaxCount = new CountUp('label_power_max', 0, 0, 1, 2.5, options);
var options = {
    useEasing: true,
    useGrouping: true,
    separator: ',',
    decimal: '.',
};

function init() {

    /* document.getElementById("w_spin").style.display = "none"; */
    /* document.getElementById("wh_spin").style.display = "none"; */
    document.getElementById("kwd_spin").style.display = "none";
    document.getElementById("kwm_spin").style.display = "none";
    sigLevel = document.getElementById("sig_level");
    sigLevelButton1 = document.createElement("button");
    sigLevelButton1.classList.add(".col-xs-4", "btn", "ml-1");
    // sigLevelButton1.style.width = "0.1em";
    sigLevelButton1.style.height = "2em";
    sigLevelButton1.style.display = "none";
    sigLevelButton1.style.backgroundColor = "rgba(220, 220, 220, 0.7)";
    sigLevelButton2 = sigLevelButton1.cloneNode(true);
    sigLevelButton3 = sigLevelButton1.cloneNode(true);

    sigLevelLabel = document.createElement("button");
    sigLevelLabel.classList.add(".col-xs-4", "btn", "ml-1", "align-middle");
    // sigLevelLabel.style.width = "10em";
    sigLevelLabel.style.height = "2em";
    sigLevelLabel.style.display = "none";
    sigLevelLabel.style.backgroundColor = "rgba(255, 255, 255, 0)";
    sigLevelLabel.style.fontSize = "16px";

    /* sigLevel.appendChild(sigLevelLabel); */
    /* sigLevel.appendChild(sigLevelButton1); */
    /* sigLevel.appendChild(sigLevelButton2); */
    /* sigLevel.appendChild(sigLevelButton3); */

    if (solar_panel_user == 0) {
        /* document.getElementById("fore_spin").style.display = "none"; */
        /* document.getElementById("base_power_spin").style.display = "none"; */
        /* document.getElementById("power_max_spin").style.display = "none"; */
    }
}

function forSolarPanelUser(json) {
    var w = json.w.value;
    var kwh = json.kwh.value;
    var kwd = json.kwd.value;
    var kwm = json.kwm.value;
    var kwh_rev = json.kwh.rev;
    var kwd_rev = json.kwd.rev;
    var kwm_rev = json.kwm.rev;

    var kwhRevCount = new CountUp('label_wh_rev', 0, 0, 1, 2.5, options);
    var kwdRevCount = new CountUp('label_kwd_rev', 0, 0, 1, 2.5, options);
    var kwmRevCount = new CountUp('label_kwm_rev', 0, 0, 1, 2.5, options);
    document.getElementById("label_wh_rev").parentElement.style.display = "";
    document.getElementById("label_kwd_rev").parentElement.style.display = "";
    document.getElementById("label_kwm_rev").parentElement.style.display = "";

    document.getElementById("date_label_w").innerHTML = json.w.date;
    document.getElementById("date_label_wh").innerHTML = json.kwh.date;
    document.getElementById("date_label_kwd").innerHTML = json.kwd.date;
    document.getElementById("date_label_kwm").innerHTML = json.kwm.date;

    document.getElementById("label_wh").nextSibling.nextSibling.innerHTML = "KWh (+)";
    document.getElementById("label_kwd").nextSibling.nextSibling.innerHTML = "KWh (+)";
    document.getElementById("label_kwm").nextSibling.nextSibling.innerHTML = "KWh (+)";

    wCount.update(w);
    kwhCount.update(kwh);
    kwdCount.update(kwd);
    kwmCount.update(kwm);

    kwhRevCount.update(kwh_rev);
    kwdRevCount.update(kwd_rev);
    kwmRevCount.update(kwm_rev);

    try {
        wCount.start();
        kwhCount.start();
        kwdCount.start();
        kwmCount.start();

        kwhRevCount.start();
        kwdRevCount.start();
        kwmRevCount.start();
    } catch (err) {
        console.log(err);
    } finally {
        document.getElementById("w_spin").style.display = "none";
        document.getElementById("wh_spin").style.display = "none";
        document.getElementById("kwd_spin").style.display = "none";
        document.getElementById("kwm_spin").style.display = "none";
    }
    var sigLevelNum = null;
    console.log(json.sigLevel[0])
    if (json.sigLevel != null) {
        sigLevelNum = json.sigLevel[0].sig_level;
    }
    if (sigLevelNum != null) {
        for (const iterator of sigLevel.childNodes) {
            iterator.style.display = "inline";
        }
        sigLevelLabel.innerHTML = "受信電界強度 : " + sigLevelNum;

        if (sigLevelNum <= -85) { // 0
            // do nothing
        } else if (sigLevelNum > -85) {
            sigLevel.getElementsByTagName("button")[1].style.backgroundColor = "rgba(255, 120, 0, 1)";
            if (sigLevelNum > -82) {
                sigLevel.getElementsByTagName("button")[2].style.backgroundColor = "rgba(255, 120, 0, 1)";
                if (sigLevelNum >= -79) {
                    sigLevel.getElementsByTagName("button")[3].style.backgroundColor = "rgba(255, 120, 0, 1)";
                }
            }
        }
    }
}

function getData() {
    /* document.getElementById("w_spin").style.display = "block"; */
    /* document.getElementById("wh_spin").style.display = "block"; */
    document.getElementById("kwd_spin").style.display = "block";
    document.getElementById("kwm_spin").style.display = "block";
    if (solar_panel_user == 0) {
        /* document.getElementById("fore_spin").style.display = "block"; */
        /* document.getElementById("base_power_spin").style.display = "block"; */
        /* document.getElementById("power_max_spin").style.display = "block"; */
    }
    $.ajax({
        url: '/mainrecently/card',
        data: {
            id_user: document.getElementById("user_id").innerText,
            solar_panel_user: solar_panel_user
        },
        success: function (json) {
            if (solar_panel_user == 1) {
                forSolarPanelUser(json);
                return;
            }
            var w = json.w.value;
            var kwh = json.kwh.value;
            var kwd = json.kwd.value;
            var kwm = json.kwm.value;

            var forecastKwh = json.forecastData.power;
            var adp1 = json.adp1;
            var powerMax = json.powerMax;

            /* document.getElementById("date_label_w").innerHTML = json.w.date; */
            /* document.getElementById("date_label_wh").innerHTML = json.kwh.date; */
            document.getElementById("date_label_kwd").innerHTML = json.kwd.date;
            document.getElementById("date_label_kwm").innerHTML = json.kwm.date;
            if (json.forecastData.action_time == null) {
                document.getElementById("date_label_fore").innerHTML = "-";
            } else {
                /* document.getElementById("date_label_fore").innerHTML = json.forecastData.action_time + " <b>から" + json.forecastData.time + "分後</b>"; */
            }
            /* document.getElementById("date_label_base_power").innerHTML = moment.tz(new Date(), "Asia/Tokyo").format("YYYY-MM-DD"); */
            /* document.getElementById("date_label_power_max").innerHTML = json.maxDate; */

            wCount.update(w);
            kwhCount.update(kwh);
            kwdCount.update(kwd);
            kwmCount.update(kwm);
            foreCount.update(forecastKwh);
            basePowerCount.update(adp1);
            powerMaxCount.update(powerMax);

            try {
                wCount.start();
                kwhCount.start();
                kwdCount.start();
                kwmCount.start();
                foreCount.start();
                basePowerCount.start();
                powerMaxCount.start();
            } catch (err) {
                console.log(err);
            } finally {
                /* document.getElementById("w_spin").style.display = "none"; */
                /* document.getElementById("wh_spin").style.display = "none"; */
                document.getElementById("kwd_spin").style.display = "none";
                document.getElementById("kwm_spin").style.display = "none";
                /* document.getElementById("fore_spin").style.display = "none"; */
                /* document.getElementById("base_power_spin").style.display = "none"; */
                /* document.getElementById("power_max_spin").style.display = "none"; */
            }

            var sigLevelNum = null;
            if (json.sigLevel != null) {
                sigLevelNum = json.sigLevel;
            }
            if (sigLevelNum != null) {
                /* for (const iterator of sigLevel.childNodes) {
                    iterator.style.display = "inline";
                } */
                sigLevelLabel.innerHTML = "受信電界強度 : " + sigLevelNum;

                if (sigLevelNum <= -85) { // 0
                    // do nothing
                } else if (sigLevelNum > -85) {
                    /* sigLevel.getElementsByTagName("button")[1].style.backgroundColor = "rgba(255, 120, 0, 1)"; */
                    if (sigLevelNum > -82) {
                        /* sigLevel.getElementsByTagName("button")[2].style.backgroundColor = "rgba(255, 120, 0, 1)"; */
                        if (sigLevelNum >= -79) {
                            /* sigLevel.getElementsByTagName("button")[3].style.backgroundColor = "rgba(255, 120, 0, 1)"; */
                        }
                    }
                }
            }
        }
    })
}

init();
getData();
timer = setInterval(function () {
    getData();
}, 60000);