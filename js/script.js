var worker = cw(function(url,cb,that){
    var request = new XMLHttpRequest();
	request.open("GET", url);
	request.onreadystatechange = function() {
		var json;
		if (request.readyState === 4 && request.status === 200) {
			json = JSON.parse(request.responseText);
			console.log(json.features.length,' features');
			json.features.forEach(function(a){
				that.fire('geojson',a);
			});
			that.fire('done');
		}
	};
	request.send();
	}
);
var m = L.map("map",{zoomControl:false}).setView([42.37176642783951, -71.10875129699707],14);
var url = 'http://otile{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.jpeg';

var attributionText = 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

var mapquestSubdomains = '1234';

var optionsObject = {
    attribution : attributionText,
    subdomains : mapquestSubdomains
}

var mq=L.tileLayer(url, optionsObject).addTo(m);

//make the map
var options = {
	onEachFeature:function(feature, layer) {
		if (feature.properties) {
			layer.bindPopup(Object.keys(feature.properties).map(function(k){
				return k + ": " + feature.properties[k] ;
			}).join("<br />"),{maxHeight:200});
    	}
	}
};
var clusters= new L.MarkerClusterGroup();
clusters.addTo(m);
var markers=[];
m.spin(true);
worker.on('geojson',function(a){
	var marker = L.marker([a.geometry.coordinates[1],a.geometry.coordinates[0]]);
	options.onEachFeature(a,marker);
	markers.push(marker);
});
worker.on('done',function(){
	clusters.addLayers(markers);
	m.spin(false);
	worker.close();
});
worker.data(cw.makeUrl('DPW_StreetTrees.geojson'));
