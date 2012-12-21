// TODO: Use Radar search and asynchronously load markers with data
// TODO: Add slider for changing the amount of time. When slider changes, automatically update circle radius.
// TODO: Add button for user to manually update the places in the circle.
// TODO: Add menu for showing list of all available places by category.

var ViewModel = function() {
	var self = this;
	
	// Search Arrays
	this.transport = ["airport", "bicycle_store", "car_dealer", "car_rental"];
	this.food = ["convenience_store", "grocery_or_supermarket", "shopping_mall", "food"];
	this.medical = ["hospital", "health", "pharmacy"];
	this.arms = ["police", "home_goods_store"];
	this.shelter = ["church", "shopping_mall", "stadium", "movie_theater", "bar"];
	this.fuel = ["gas_station"];
	
	// Map Variables
	this.distanceCircle = null;
	this.infoWindow = null;
	this.loc = new google.maps.LatLng(54.826008, -4.086914);
	this.map = null;
	this.markers = [];
	this.radius = 0;
	this.service = null;
	this.time = 0.5;
	this.zoom = 0;
	
	// User Input
	this.locationSearch = ko.observable("KT22 9DT");
	this.transportSearch = ko.observable("foot");
	this.loading = ko.observable("");
	this.places = null;

	this.detailsSubmit = function() {
		switch(self.transportSearch())
		{
			case "foot":
				self.radius = 6;
				self.zoom = 13;
				break;
			case "bicycle":
				self.radius = 10;
				self.zoom = 12;
				break;
			case "car":
				self.radius = 30;
				self.zoom = 10;
				break;
		}

		self.getLocation(self.locationSearch(), function(lat, lng) {
			for(var x = 0; x < self.markers.length; x++) {
				self.markers[x].setMap(null);
			}

			self.loc = new google.maps.LatLng(lat, lng);
			self.map.setZoom(self.zoom);
			self.map.panTo(self.loc);
			self.drawDistanceCircle();
	
			var placesRequest = {
				types: self.transport,
				location: self.loc,
				radius: 1609 * (self.radius * self.time)
			};

			service = new google.maps.places.PlacesService(map);
			service.radarSearch(placesRequest, function(data) {
				if (self.service === null) {
					self.service = new google.maps.places.PlacesService(self.map);
				}

				self.places = data;
				self.loading("Loading...");

				for(var i in data) {
					if(self.markers.length >= data.length) {
						self.loading(null);
						return false;
					}

					var distanceFromLocation = google.maps.geometry.spherical.computeDistanceBetween(
						self.loc,
						data[i].geometry.location
					);

					if(distanceFromLocation <= 1609 * (self.radius * self.time)) {
						setTimeout("self.getPlaceData(" + i + ")", i * 250);
					}
				}
			});
		});
	};

	this.getPlaceData = function(i) {
		var placeObjIn = self.places[i];

		self.service.getDetails({ reference: placeObjIn.reference }, function(place, service) {
			if(service == "OK") {
				var marker = new google.maps.Marker({
					position: placeObjIn.geometry.location,
					map: self.map,
					title: place.name
				});

				self.addInfoWindowToMarker(marker);
				self.markers.push(marker);
			} else {
				console.log("Query limit reached");
				setTimeout("self.getPlaceData(" + i + ")", 250);
			}
		});
	};

	this.addInfoWindowToMarker = function(marker) {
		google.maps.event.addListener(marker, "click", function() {
			if(self.infoWindow !== null) {
				self.infoWindow.close();
			}
			self.infoWindow = new google.maps.InfoWindow({content: marker.title});
			self.infoWindow.open(self.map, marker);
		});
	};
	
	this.getLocation = function(location, callback) {
		$.ajax({
			url: "https://maps.googleapis.com/maps/api/geocode/json",
			dataType: "json",
			type: "GET",
			data: {
				"address": location,
				"sensor": true
			},
			crossDomain: true,
			success: function(data) {
				callback(data.results[0].geometry.location.lat, data.results[0].geometry.location.lng);
			}
		});
	};
		
	this.drawDistanceCircle = function() {
		if (self.distanceCircle !== null) {
			self.distanceCircle.setMap(null);
		}
		
		self.distanceCircle = new google.maps.Circle({
			strokeColor: "#FF0000",
			strokeOpacity: 0.8,
			strokeWeight: 2,
			fillColor: "#FF0000",
			fillOpacity: 0.075,
			map: self.map,
			center: self.loc,
			radius: 1609 * (self.radius * self.time)
		});
	};

	this.buildMap = function(lat, lng) {
		var mapOptions = {
			center: self.loc,
			overviewMapControl: false,
			mapTypeControl: false,
			zoom: 6,
			mapTypeId: google.maps.MapTypeId.HYBRID
		};
		self.map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
	};
	
	self.buildMap();
};