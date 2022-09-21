// JavaScript source code

// Initialize the map.
const USE_SERVER_DATA = true;
const Image_Shift = 553;
//var homeCoords = [52.476089, -50.825867];
var homeCoords = [52.476089, -87.276242];

var txtFile = new XMLHttpRequest();
var parsedD = {};
var results = [];

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
}).setView(homeCoords, minZoomV*2);
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
map.on('drag', function() {
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

		markers[a].setStyle({radius: zoom_logo_mapping[zoomLevel]});

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
txtFile.open("GET", "https://quincyw12.github.io/research-collaboration-map1/vis_data.csv", false);
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

// console.log(parsedD);

for (var i = 0; i < inputBars.length; i++) {
	console.log("aaa_>", i, inputBars[i].placeholder, "  ", inputBars[i].value);

	inputBars[i].addEventListener('keypress', function (keyin) {

		if (keyin.key == "Enter") {
		// Inefficient code ahead!

		for (var i = 0; i < inputBars.length; i++) {

			if (filtersPC.style.display != 'block') {
				if (i + 8 < inputBars.length) {
					inputBars[i + 8].value = inputBars[i].value?inputBars[i].value.trim():"";
				}
			}
			else {
				if (i - 8 >= 0) {
					inputBars[i - 8].value = inputBars[i].value?inputBars[i].value.trim():"";
				}
			}
		}

     //   console.log("DXXXX: ", inputBars[0].value, inputBars[1].value, inputBars[2].value, inputBars[3].value, inputBars[4].value, inputBars[5].value, inputBars[6].value, inputBars[7].value);
		filter(inputBars[0].value, inputBars[1].value, inputBars[2].value, inputBars[3].value, inputBars[4].value, inputBars[5].value, inputBars[6].value, inputBars[7].value);
		return this;
	}
	});

 

}


function disableView() {
	map.dragging.disable();
	map.touchZoom.disable();
	map.doubleClickZoom.disable();
	map.scrollWheelZoom.disable();
	map.boxZoom.disable();
	map.keyboard.disable();
	if (map.tap) map.tap.disable();
	document.getElementById('map').style.cursor='default';
}

function enableView() {
	map.dragging.enable();
	map.touchZoom.enable();
	map.doubleClickZoom.enable();
	map.scrollWheelZoom.enable();
	map.boxZoom.enable();
	map.keyboard.enable();
	if (map.tap) map.tap.enable();
	document.getElementById('map').style.cursor='grab';
}

function isHidden(element) {
	
	if (element != null) {
		const rect = element.getBoundingClientRect();
		return (
			rect.top >= 0 &&
			rect.left >= 0 &&
			rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
			rect.right <= (window.innerWidth || document.documentElement.clientWidth)
		);
	}
}
function getRelativePos(curr) {
    var inner = document.getElementsByClassName("img_collection");

    if (inner != null) {
        var container = inner[0];

		if (curr >= 0 && curr < results.length) {
			var sideL = false;
			var sideR = false;
			var sideN = false;
			if (curr - 1 >= 0 && curr - 1 < results.length)
				if (isHidden(container.children[curr - 1].children[2]) && isHidden(container.children[curr - 1].children[1]))
					return (curr - 1);

			if (curr >= 0 && curr < results.length)
				if (isHidden(container.children[curr].children[2]) && isHidden(container.children[curr].children[1]))
					return (curr);

			if (curr + 1 >= 0 && curr + 1 < results.length)
				if (isHidden(container.children[curr + 1].children[2]) && isHidden(container.children[curr + 1].children[1]))
					return (curr + 1);
		}
    }

}

function updatepos() {
	var x = image_panel;
	var ind = parseInt(x.scrollTop/Image_Shift);

	var currind = getRelativePos(ind);
	//console.log("SRL_>", x.scrollTop, x.scrollTop / Image_Shift, currind == undefined, curr_limit);
	if (currind != prevMarker && markers.length > 0) {
		if (prevMarker >= 0 && prevMarker < markers.length) {
			document.getElementById(`label_${prevMarker}`).style = "text-align:center; opacity: 0.5; color: white;background-color: #660099;width: 20px;height: 20px;border-radius: 30px; font-size: 14px;";
		}

		prevMarker = currind;
	}
	
	if (ind != null && ind != NaN) {
		
	if (currind >= curr_limit - 4) {
		curr_limit += max_res_size;
		clearCells();
		generateCell(results, curr_limit);
	}
	else if (currind < (curr_limit - (max_res_size + 3))) {
		curr_limit -= max_res_size;
		clearCells();
		generateCell(results, curr_limit);
	}
	
	//console.log("MMK: ", markers[ind]);

		if (currind >= 0 && currind < markers.length) {
			document.getElementById(`label_${currind}`).style = "text-align:center;color: white;background-color: #660099;width: 40px;height: 40px;border-radius: 30px; font-size: 28px;";
		//	document.getElementById(`label_${currind}`).style = "text-align:center;color: white;background-color: #660099;width: 40px;height: 40px;border-radius: 30px; font-size: 28px;";
			//console.log("LX", markers[currind].getElement());

			map.setView([results[currind].latitude, results[currind].longitude]);

		}
	}
	
}
function clearCells() {
    var inner = document.getElementsByClassName("img_collection");

    if (inner != null) {
        var container = inner[0];

        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

    }
	
	console.log("cleared/");
}

function generateCell(res, max_size) {

    var inner = document.getElementsByClassName("img_collection");
    //console.log("res: ", res);
	var newNode = null;
	for (var i=0;i<res.length;i++) {
    if (inner != null && res != null && i < max_size) { 

        var container = inner[0];
        
		//console.log("res1: ", res[i].Project)
		var filler = `<div id="filler" style="width: 100px; height: 100px;"></div>`;
		
		var imageD = res[i].Image_URL;
		
		console.log("sx: ", res)
		
		if (imageD == null) {
			imageD = "icons/placeholder.png"
		}
		
		var html = `<div class="img_header">
							<div id="circle_base" style="text-align: center;">
								<div id="circle" style="color: white; background-color: #660099; opacity: 0.5; border-radius: 40px; width: 25px; height: 25px;">${i+1}</div>
							</div>
                            <input type="image" style="width: 100%; height: 100%;" src="${imageD}"/>
							<div class="text_content">
                                <div id="title_header" style="padding:6px; width: 90%;">${res[i].Project}</div>
                                <div id="organization_bdy" style="padding:6px; width: 90%;">${res[i].Funder} - ${res[i]["Funding period"]}</div>
                                <div id="organization_bdy" style="padding:6px; width: 90%;">${res[i]["PI "]} (PI) - ${res[i]["Research Sites"]}</div>
                            </div>
                        </div>

		`

        var newNode = document.createRange().createContextualFragment(html);
        container.appendChild(newNode);
	    }
	}

	if (newNode != null) {
		var newNode = document.createRange().createContextualFragment(filler);
		container.appendChild(newNode);
	}

}

function filter(projectName, researchNames, piNames, copiNames, collabNames, funderName, timePeriod, keywordList) {

	//console.log("checkerL -> ", parsedD.length, projectName, researchNames, piNames, collabNames, funderName, timePeriod, keywordList);
	clearCells();
	results.length = 0;
	for (var x = 0; x < markers.length; x++) {
		map.removeLayer(markers[x]);
	}

	markers.length = 0;
	var count = 0;

	for (var i = 0; i < parsedD.length; i++) {

		var Project = parsedD[i].Project?.trim()??"";
		var PIs = parsedD[i]["PI"]?.trim()??"";
		var CoPIs = parsedD[i]["Co-PI(s)"]?.trim()??""
		var Collabs = parsedD[i]["Collaborators\n(not funders)"]?.trim()??"";
		var Funder = parsedD[i].Funder?.trim()??"";
		var TimePeriod = parsedD[i]["Funding period"]?.trim()??"";
		var keywords = parsedD[i]["Research keywords"]?.trim()??"";
		var site = parsedD[i]["Research Sites"]?.trim()??"";
		var coordsLat = parsedD[i].latitude.trim()??"";
		var coordsLong = parsedD[i].longitude.trim()??"";
		

		if (Project.toLowerCase().includes(projectName?.toLowerCase()) && 
		    site.toLowerCase().includes(researchNames?.toLowerCase()) && 
			PIs.toLowerCase().includes(piNames?.toLowerCase()) && 
			CoPIs.toLowerCase().includes(copiNames?.toLowerCase()) && 
			Collabs.toLowerCase().includes(collabNames?.toLowerCase()) &&
			Funder.toLowerCase().includes(funderName?.toLowerCase()) && 
			TimePeriod.toLowerCase().includes(timePeriod?.toLowerCase()) && 
			keywords.toLowerCase().includes(keywordList?.toLowerCase())) 
		{
			
			var labelTxt = L.divIcon({ className: 'my-div-icon', html: `<div id="label_${count}" style="text-align:center;color: white; opacity: 0.5; background-color: #660099;width: 20px;height: 20px;border-radius: 30px; font-size: 14px;">${count + 1}</div>`});
			
			
			const markerT = L.marker([parsedD[count].latitude, parsedD[count].longitude], {
				icon: labelTxt, id: count
			}).addTo(map);

			//	console.log("===>", Project, PIs, CoPIs, Collabs);
			//		console.log(markers[i]);
			// uncomment for mix of tooltip and popup
			//markerI.bindTooltip(`${i+1}`, {permanent: false, className: "my-label", offset: [0, 0] });
			//markerI.bindTooltip(metadata2, {className: 'tooltip'});

			markerT.on('click', function (e) {
			//	console.log("x: ", e.sourceTarget.options.id);
				curr_limit = (parseInt(e.sourceTarget.options.id / max_res_size) + 1) * max_res_size;
				clearCells();
				generateCell(results, curr_limit);
				image_panel.scrollTop = Image_Shift*(e.sourceTarget.options.id);
			//	console.log("XX: ", image_panel.scrollTop);
				
				// Auto lock into position
				var ind = parseInt(image_panel.scrollTop/Image_Shift);
				var currind = getRelativePos(ind);
				while (currind == undefined) {
					image_panel.scrollTop++;
				//	console.log("Scrolling!", image_panel.scrollTop);
					ind = parseInt(image_panel.scrollTop/Image_Shift);
					currind = getRelativePos(ind);
				}
			});

			markers.push(markerT);

			results.push(parsedD[count++]);
		}
	}

    generateCell(results, max_res_size);
	console.log("added #markers:",count );
}

filter("", "", "", "", "", "", "", "");
updatepos();

function changeTileType(tileURL) {
	tiles = L.tileLayer(tileURL, {}).addTo(map);
}

function zoomChange() {
	if (infoPanel.style.display != 'none') {
		infoPanel.style.display = "none";	
	}
    
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
		var PIs = parsedD[i]["PI"];
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

homebutton.addEventListener('mousedown', function (clicked) {
	homebutton.style.transform = "scale(0.75,0.75)";
});

homebutton.addEventListener('click', function (clicked) {
	map.setZoom(minZoomV);
	map.setView(homeCoords, minZoomV);
	console.log("click");
    //adjustWin();
});

homebutton.addEventListener('mouseup', function (clicked) {
	homebutton.style.transform = "scale(1,1)";
});

settingsBtn.addEventListener('mousedown', function (clicked) {
	settingsBtn.style.transform = "scale(0.75,0.75)";
});

settingsBtn.addEventListener('mouseup', function (clicked) {
	settingsBtn.style.transform = "scale(1,1)";
});

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

filtersBtn.addEventListener('click', function (clicked) {

	console.log(FiltersActive);

	if (!FiltersActive) {
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

		FiltersActive = true;

		var container1 = document.getElementById("filters_norm");
		var inputs = container1.getElementsByTagName('input');
    	for (var index = 0; index < inputs.length; ++index) {
        	inputs[index].value = '';
    	}

		var container2 = document.getElementById("filters_pc");
		var inputs = container2.getElementsByTagName('input');
    	for (var index = 0; index < inputs.length; ++index) {
        	inputs[index].value = '';
    	}
	}
	else {
		filtersPC.style.display = "none";
		filtersPne.style.display = "none";

		FiltersActive = false;
	}
	console.log("console click");

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

console.log(window.innerHeight*0.75);

console.log("main");
//adjustWin();

//navigate(redirectGMapNav, coordsToStr(homeCoords), 'Port Coquitlam')

window.addEventListener('resize', function (event) {
	console.log("resizing");
	//adjustWin();
}, true);




