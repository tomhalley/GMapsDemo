// TODO: Add slider for changing the amount of time. When slider changes, automatically update circle radius.
// TODO: Add button for user to manually update the places in the circle.
// TODO: Add menu for showing list of all available places by category.

var ViewModel = function() {
	var self = this;
	
	// Search Arrays
	this.transport = ko.observableArray(["airport", "bicycle_store", "car_dealer", "car_rental"]);
	this.food = ko.observableArray(["convenience_store", "grocery_or_supermarket", "shopping_mall", "food"]);
	this.medical = ko.observableArray(["hospital", "health", "pharmacy"]);
	this.arms = ko.observableArray(["police", "home_goods_store"]);
	this.shelter = ko.observableArray(["church", "shopping_mall", "stadium", "movie_theater", "bar"]);
	this.fuel = ko.observableArray(["gas_station"]);
	
	// Map Variables
	this.map = null;
	this.loc = new google.maps.LatLng(54.826008, -4.086914);
	this.time = 0.5;
	this.distanceCircle = null;
	this.radius = 0;
	this.markers = [];
	this.zoom = 0;
	
	// User Input
	this.locationSearch = ko.observable("KT22 9DT");
	this.transportSearch = ko.observable("foot");
	
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
			self.showDistance();
	
			var placesRequest = {
				types: self.transport(),
				location: self.loc,
				radius: 1609 * (self.radius * self.time)
			};
			service = new google.maps.places.PlacesService(map);
			service.radarSearch(placesRequest, function(data) {
				for(var i = 0; i < data.length; i++) {
					var markerLocation =
						new google.maps.LatLng(data[i].geometry.location.Ya, data[i].geometry.location.Za);
					var distanceFromLocation = google.maps.geometry.spherical.computeDistanceBetween(
						self.loc,
						markerLocation
					);

					if(distanceFromLocation <= 1609 * (self.radius * self.time)) {
						var marker = new google.maps.Marker({
							position: markerLocation,
							map: self.map,
							title: data[i].name
						});
						self.markers.push(marker);
					}
				}
			});
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
		
	this.showDistance = function() {
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