var ViewModel = function() {
	var self = this;
	
	// Search Arrays
	this.transport = ko.observableArray(["airport", "bicycle_store", "car_dealer", "car_rental", "gas_station"]);
	this.food = ko.observableArray(["convenience_store", "grocery_or_supermarket", "shopping_mall", "food"]);
	this.medical = ko.observableArray(["hospital", "health", "pharmacy"]);
	this.arms = ko.observableArray(["police"]);
	this.shelter = ko.observableArray(["church", "shopping_mall", "stadium", "movie_theater", "bar"]);
	
	// Map Variables
	this.map = null;
	this.time = 0.5;
	this.distanceCircle = null;
	this.radius = 0;
	
	// User Input
	this.locationSearch = ko.observable("London");
	this.transportSearch = ko.observable("foot");
	
	this.detailsSubmit = function() {
		var zoom = 0;
		switch(self.transportSearch())
		{
			case "foot":
				self.radius = 6;
				zoom = 13;
				break;
			case "bicycle":
				self.radius = 10;
				zoom = 12;
				break;
			case "car":
				self.radius = 30;
				zoom = 10;
				break;
		}

		self.getLocation(self.locationSearch(), function(lat, lng) {
			self.map.setZoom(zoom);
			self.map.panTo(new google.maps.LatLng(lat, lng));
			self.showDistance(lat, lng);
					
			var placesRequest = {
				types: self.transport(),
				location: new google.maps.LatLng(lat, lng),
				radius: 1609 * (self.radius * self.time)
			}
			service = new google.maps.places.PlacesService(map);
			service.nearbySearch(placesRequest, function(data) {
				console.log(data[0]);
			});
		});
	}
	
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
		})
	}
		
	this.showDistance = function(lat, lng) {
		if (self.distanceCircle != null) {
			self.distanceCircle.setMap(null);
		}
		
		self.distanceCircle = new google.maps.Circle({
			strokeColor: "#FF0000",
			strokeColor: "#FF0000",
			strokeOpacity: 0.8,
			strokeWeight: 2,
			fillColor: "#FF0000",
			fillOpacity: 0.075,
			map: self.map,
			center: new google.maps.LatLng(lat, lng),
			radius: 1609 * (self.radius * self.time)
		});
	}

	this.buildMap = function(lat, lng) {
		var mapOptions = {
			center: new google.maps.LatLng(lat, lng),
			overviewMapControl: false,
			mapTypeControl: false,
			zoom: 6,
			mapTypeId: google.maps.MapTypeId.HYBRID
		};
		self.map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
	}
	
	self.buildMap(54.826008, -4.086914);
}