// JavaScript source code

// Initialize the map.
const USE_SERVER_DATA = true;
var Image_Shift = 453;
//var homeCoords = [52.476089, -50.825867];
var homeCoords = [52.476089, -87.276242];

var txtFile = new XMLHttpRequest();
var parsedD = {};
var results = [];
var colours = [];

var markers = [];
var max_res_size = 12;
var curr_limit = max_res_size;

var prevMarker = 0;

//var searchbar = document.getElementById("search");
var homebutton = document.getElementById("homebtn");
var settingsBtn = document.getElementById("settingsbtn")
// var settingsPne = document.getElementById("settingspane");
var filtersBtn = settingsBtn;
var filtersPne = document.getElementById("filters_norm");
var filtersPC = document.getElementById("filters_pc");
var infoPanel = document.getElementById("items_main");

var metadataWin = document.getElementsByClassName('data_header');
var metadataWinID = document.getElementById("data_header");
var image_panel = document.getElementById("image_display");
var regionIn = document.getElementById('region_select')

var inputBars = document.getElementsByClassName("filter_input");
var FiltersActive = false;

var defaultStyle = 'https://tile.jawg.io/jawg-streets/{z}/{x}/{y}{r}.png?access-token=qYOU04zmJXYprHE89esvVcT3qGW68VsSgDdYXjXUUmZgDRBajbH3e58EHY5bONXU';
var lightStyle = 'https://tile.jawg.io/jawg-light/{z}/{x}/{y}{r}.png?access-token=qYOU04zmJXYprHE89esvVcT3qGW68VsSgDdYXjXUUmZgDRBajbH3e58EHY5bONXU';
var darkStyle = 'https://tile.jawg.io/jawg-dark/{z}/{x}/{y}{r}.png?access-token=qYOU04zmJXYprHE89esvVcT3qGW68VsSgDdYXjXUUmZgDRBajbH3e58EHY5bONXU';

var minZoomV = 3;
var maxZoomV = 18;

var map = L.map('map', {
    minZoom: minZoomV,
    maxZoom: maxZoomV,
    zoomSnap: 1,
    maxBoundsViscosity: 1.0,
    zoomControl: false
}).setView(homeCoords, minZoomV * 2);
L.control.zoom({
    position: 'bottomright'
}).addTo(map);

map.setZoom(minZoomV);

//var southWest = L.latLng(-89.98155760646617, -179); 
//var northEast = L.latLng(89.99346179538875, 180);

var southWest = L.latLng(-90, -220);
var northEast = L.latLng(90, 200);

var bounds = L.latLngBounds(southWest, northEast);

map.setMaxBounds(bounds);
map.on('drag', function () {
    map.panInsideBounds(bounds, { animate: false });
});

var mapSize = document.getElementById("map");

function adjustWin0() {

    const zoomLevel = map['_zoom'];
    const zoom_logo_mapping = {};
    zoom_logo_mapping[3] = 16500;
    zoom_logo_mapping[4] = 11500;
    zoom_logo_mapping[5] = 86000;
    zoom_logo_mapping[6] = 66200;
    zoom_logo_mapping[7] = 52000;
    zoom_logo_mapping[8] = 41400;
    zoom_logo_mapping[9] = 30000;
    zoom_logo_mapping[10] = 20000;
    zoom_logo_mapping[11] = 10000;
    zoom_logo_mapping[12] = 9000;
    zoom_logo_mapping[13] = 8000;
    zoom_logo_mapping[14] = 7000;
    zoom_logo_mapping[15] = 6000;
    zoom_logo_mapping[16] = 5000;
    zoom_logo_mapping[17] = 4000;
    zoom_logo_mapping[18] = 3000;
    console.log("adjustWin ZOOM: ", zoomLevel);

    var maxV = (18500 / (maxZoomV / minZoomV)) - 50
    console.log("adjustWin marker length: ", markers.length);
    for (var a = 0; a < markers.length; a++) {

        markers[a].setStyle({ radius: zoom_logo_mapping[zoomLevel] });

        console.log(markers[a]['_mRadius']);
    }

    map.invalidateSize(true);

}

/*
var tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
*/

var tiles = L.tileLayer(lightStyle, {}).addTo(map);
map.attributionControl.addAttribution("<a href=\"https://www.jawg.io\" target=\"_blank\">&copy; Jawg</a> - <a href=\"https://www.openstreetmap.org\" target=\"_blank\">&copy; OpenStreetMap</a>&nbsp;contributors")

if (USE_SERVER_DATA) {
    txtFile.open("GET", "https://quincyw12.github.io/research-collaboration-map1/plot_data.csv", false);
    txtFile.onload = function (e) {
        if (txtFile.readyState === 4) {
            if (txtFile.status === 200) {
                var csvData = txtFile.responseText;

                parsedD = $.csv.toObjects(csvData);

                console.log("CSV Obtained successfully.")
            } else {
                console.error(txtFile.statusText);
            }
        }
    };
    txtFile.onerror = function (e) {
        console.error(txtFile.statusText);
    };

    txtFile.send();
}
else {
    csvData = document.getElementById("csv_data").innerHTML;
    parsedD = $.csv.toObjects(csvData);
}

Region_Sel = "ALL";
maxM = 2022
minM = 2010

function adjustReg() {
    Region_Sel = regionIn.value;

    console.log("Selected: ", Region_Sel)
    filter_v2(Region_Sel, minM, maxM)
}

$(function () {
    $("#val_left").text(minM);
    $("#val_right").text(maxM);
    $("#slider-range").append(`<div class="my-handle ui-slider-handle" style="width: 13px; height: 13px; background: white url(./images/Selector_1.png) no-repeat scroll 50% 50%;
    border-radius: 24px; border: 3px solid black;"></div>`);
    $("#slider-range").append(`<div class="my-handle_2 ui-slider-handle" style="width: 13px; height: 13px;background: white url(./images/Selector_1.png) no-repeat scroll 50% 50%;
    border-radius: 24px; border: 3px solid black;"></div>`);

    $("#slider-range").slider({
        range: true,
        min: 2010,
        max: 2022,
        values: [2010, 2022],
        slide: function (event, ui) {
            $("#amount").val("$" + ui.values[0] + " - $" + ui.values[1]);
            console.log("XX", $("#val_left").text())
            $("#val_left").text(ui.values[0]);
            $("#val_right").text(ui.values[1]);

            minM = ui.values[0]
            maxM = ui.values[1]

            adjustReg()
        }
    });
    $("#amount").val("$" + $("#slider-range").slider("values", 0) +
        " - $" + $("#slider-range").slider("values", 1));
});

// console.log(parsedD);

function strToColour(str) {
    var res = str.charCodeAt(0);
    for (var i = 1; i < str.length; i++) {
        res -= str.charCodeAt(i);
    }

    if (res < 0)
        return -res;

    return res;
}

function generateColours(maxList) {
    var colours = [];
    for (var i = 0; i < 3; i++) {
        for (var x = 0; x < 250; x++) {
            for (var y = 0; y < 250; y++) {

                if (colours.length < maxList) {
                    if (i == 0)
                        colours.push([Math.random() * 220, Math.random() * 220, Math.random() * 220]);

                    if (i == 1)
                        colours.push([Math.random() * 220, Math.random() * 220, Math.random() * 220]);

                    if (i == 2)
                        colours.push([Math.random() * 220, Math.random() * 220, Math.random() * 220]);
                }
                else {
                    return colours;
                }
            }
        }
    }

    return colours;
}


function init() {
    colours = generateColours(parsedD.length);
    filter_v2("ALL", minM, maxM)

}



function disableView() {
    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();
    if (map.tap) map.tap.disable();
    document.getElementById('map').style.cursor = 'default';
}

function enableView() {
    map.dragging.enable();
    map.touchZoom.enable();
    map.doubleClickZoom.enable();
    map.scrollWheelZoom.enable();
    map.boxZoom.enable();
    map.keyboard.enable();
    if (map.tap) map.tap.enable();
    document.getElementById('map').style.cursor = 'grab';
}

function loadDefault(element_id) {
    var image_n = document.getElementById(element_id);

    image_n.src = "icons/placeholder.png";

    console.log("ERRO!")
}

var bingKey = "AvEQ1m7_88IHqh6gFAaKUTUuuqbz_zrvMU7HEEu_vX6qXguJOWIQk4WqS-01xSAq";
function GeoCode(query) {
    var geocoderURL = "https://dev.virtualearth.net/REST/v1/Locations/" + query + "?" + "o=json&key=" + bingKey;

    var getLatLong = new XMLHttpRequest();
    var coords = null

    getLatLong.open("GET", geocoderURL, false);

    getLatLong.onload = function (e) {
        if (getLatLong.readyState == 4) {
            if (getLatLong.status == 200) {
                var data = JSON.parse(getLatLong.responseText);

                if (data.authenticationResultCode == "ValidCredentials") {
                    var points = data.resourceSets;

                    if (points.length > 0) {
                        if (points[0].resources.length > 0) {
                            coords = points[0].resources[0]
                        }
                    }
                }
            }

        }
        else {
            console.error(getLatLong.statusText);
        }
    }

    getLatLong.onerror = function (e) {
        console.error(getLatLong.statusText);
    };

    //getLatLong.send();

    return coords;
}

function getRegion(name) {

    /*
     <option value="ALL">All</option>
                        <option value="NA">North America</option>
                        <option value="SA">South America</option>
                        <option value="EUR">Europe</option>
                        <option value="ASIA">Asia</option>
                        <option value="ME">Middle East</option>
                        <option value="AFR">Africa</option>
                        <option value="OCEANIA">Oceania</option>
     */
    switch (name) {
        case "North America":
            return "NA"
        case "South America":
            return "SA"
        case "Europe":
            return "EUR"
        case "Asia":
            return "ASIA"
        case "Middle East":
            return "ME"
        case "Africa":
            return "AFR"
        case "Oceania":
            return "OCEANIA"
        default:
            return "ALL"
            break;
    }
}

function filter_v2(RegionS, startY, endY) {

    // Clear the board.
    results.length = 0;
    for (var x = 0; x < markers.length; x++) {
        map.removeLayer(markers[x]);
    }

    markers.length = 0;
    var count = 0;

    console.log("-->", parsedD)

    for (var i = 0; i < parsedD.length; i++) {
        var Project = parsedD[i]["Publication title"].substring(0, 127) ?? "";
        var PIs = parsedD[i]["Faculty of Education Author(s)"]?.trim() ?? "";
        var CoPIs = parsedD[i]["Co-author(s)"]?.trim() ?? ""
        var institution = parsedD[i].Institution.trim() ?? "";
        var coordsLat = parsedD[i].Latitude.trim() ?? "";
        var coordsLong = parsedD[i].Longitude.trim() ?? "";
        var References = parsedD[i].References.trim() ?? "";
        var Region = getRegion(parsedD[i].Region.trim()??"")
        var Year = parseInt(parsedD[i].Year.trim() ?? "");

        

        if (Year >= startY && Year <= endY && (Region == RegionS || RegionS == "ALL")) {

            console.log(Year, startY, endY, Region)
            // plot points here, same code as P1.
            var colourV = strToColour(Project);

            colourV = colourV % colours.length;

            var labelTxt = L.divIcon({ className: 'my-div-icon', html: `<div id="label_${count}" style="text-align:center;color:white; opacity: 0.8; background-color: rgba(${colours[colourV][0]},${colours[colourV][1]},${colours[colourV][2]},0.4);width: 20px;height: 20px; border:2px solid black; border-radius: 30px; font-size: 14px;"></div>` });

            const markerT = L.marker([coordsLat, coordsLong], {
                icon: labelTxt, id: count
            }).addTo(map);

            //	console.log("===>", Project, PIs, CoPIs, Collabs);
            //		console.log(markers[i]);
            // uncomment for mix of tooltip and popup

            const metadata2 =
                `
			<div class="popup_header" style="font-weight: 600;">
				<div id="title">Publication title: ${Project}</div>
				<div id="author">Authors: ${PIs}</div>
				<div id="year">Year: ${Year}</div>
				<div id="institution">Institution: ${institution}</div>
				<div id="co-authors">Co-author with: ${CoPIs}</div>
				<div id="references">References: ${References}</div>
			</div>
			`;
            markerT.bindTooltip(`${i + 1}`, { permanent: false, className: "my-label", offset: [0, 0] });
            markerT.bindTooltip(metadata2, { className: 'tooltip' });

            markers.push(markerT);

            results.push(parsedD[count++]);
        }
    }
}

function changeTileType(tileURL) {
    tiles = L.tileLayer(tileURL, {}).addTo(map);
}

function zoomChange() {
    // Tooltip only
    document.querySelectorAll(".leaflet-tooltip-pane").forEach(a => a.style.display = "block");
    // or mix of popup and tooltip
    /* if (map['_zoom'] < 10 ) {
        //document.getElementsByTagName("STYLE").display = "none";
        //document.className("tooltioWin").style("display") = "none";
        document.querySelectorAll(".leaflet-tooltip-pane").forEach(a => a.style.display = "none");
    } else {
        // document.getElementsByTagName("STYLE").display = "block";
        // document.className("tooltioWin").style("display") = "none";
        document.querySelectorAll(".leaflet-tooltip-pane").forEach(a => a.style.display = "block");
    }
    */

    console.log("zoom level: ", map['_zoom']);
    //adjustWin();
}


function searchLocalDB(query) {
    for (var i = 0; i < parsedD.length; i++) {
        var Project = parsedD[i].Project;
        var PIs = parsedD[i].PI;
        var CoPIs = parsedD[i]["Co-PI(s)"];
        var Collabs = parsedD[i]["Collaborators(not funders)"];
        var Funder = parsedD[i].Funder;
        var TimePeriod = parsedD[i]["Funding period"];
        var keywords = parsedD[i]["Research keywords"];
        var site = parsedD[i]["Research Sites"];
        var coordsLat = parsedD[i].latitude;
        var coordsLong = parsedD[i].longitude;

        if (Project.includes(query) || Funder.includes(query) || TimePeriod.includes(query) || site.includes(query)) {
            return parsedD[i];
        }
    }

    return null;
}

init();

map.on('zoomend', zoomChange)

window.addEventListener('resize', function (meta) {
    if (FiltersActive) {
        if (window.innerWidth / window.innerHeight >= (4 / 3)) {
            filtersPC.style.display = "block";
            filtersPne.style.display = "none";
        }
        else {
            filtersPne.style.display = "block";
            filtersPC.style.display = "none";
        }

    }
});

function restorePreviousView() {
    if (FiltersActive) {
        if (window.innerWidth / window.innerHeight >= (4 / 3)) {
            filtersPC.style.display = "block";
            filtersPne.style.display = "none";
            console.log("standard window, ratio:", window.innerWidth / window.innerHeight);
        }
        else {
            filtersPne.style.display = "block";
            filtersPC.style.display = "none";
            console.log("vertical window, ratio:", window.innerWidth / window.innerHeight);
        }

        // FiltersActive = true;

        // var container1 = document.getElementById("filters_norm");
        // var inputs = container1.getElementsByTagName('input');
        // for (var index = 0; index < inputs.length; ++index) {
        // 	inputs[index].value = '';
        // }

        // var container2 = document.getElementById("filters_pc");
        // var inputs = container2.getElementsByTagName('input');
        // for (var index = 0; index < inputs.length; ++index) {
        // 	inputs[index].value = '';
        // }
    }
    else {
        filtersPC.style.display = "none";
        filtersPne.style.display = "none";

        // FiltersActive = false;
    }
    console.log("view restored");
}
function coordsToStr(coords) {
    return coords[0] + ',' + coords[1];
}

function navigate(webNav, src, dest) {
    window.open(webNav + src + '/' + dest + '/');
}

function failure() {
    alert("Failed to obtain your location. Check your permissions and try again.");
    homebutton.src = "HomeIcon.png";
    sw_Location.checked = false;
}

console.log(window.innerHeight * 0.75);

console.log("main");
//adjustWin();

//navigate(redirectGMapNav, coordsToStr(homeCoords), 'Port Coquitlam')

window.addEventListener('resize', function (event) {
    console.log("resizing");
    //adjustWin();
}, true);




