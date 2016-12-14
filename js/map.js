var initLat = 37.765, initLng = -122.447;


var GoogleMap = function(locations, availableLocations, displayingLocation) {
    this.map = new google.maps.Map(document.querySelector('#map'));
    this.geocoder = new google.maps.Geocoder();
    this.places = new google.maps.places.PlacesService(this.map);
    this.locations = locations;
    this.availableLocations = availableLocations;
    this.displayingLocation = displayingLocation;
    this.infowindow = null;

    this.initMap();
};


GoogleMap.prototype.initMap = function() {
    var self = this;

    self.map.setCenter({lat: initLat, lng: initLng});
    self.map.setZoom(13);

    google.maps.event.trigger(self.map, "resize");

    self.map.addListener('click', function(e) {
        self.searchNearbyRestaurants(e.latLng);
    });
};


// animate marker and display info window when user clicks on list element
GoogleMap.prototype.clickLocationResponse = function(location)  {
    var self = this;
    var marker = location.marker();
    //self.map.panTo(location.latLng());
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function () {
        marker.setAnimation(null);
    }, 1400);
    self.displayingLocation(location);
    self.renderInfowindow();
};


GoogleMap.prototype.searchNearbyRestaurants = function(latLng)  {
    var self = this;
    self.places.nearbySearch({location: latLng, radius: 1500, type: ['restaurant']},
        function(results, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK){
                self.setAvailableLocationsList(results);
            }   else {
                alert("Couldn't find locations for this search");
            }
    });
};


// populate modal and availableLocations observableArray with search results
GoogleMap.prototype.setAvailableLocationsList = function(results) {
    var self = this;
    var i, location, availableLocationsArray = [];
    for(i = 0; i < Math.min(results.length, 5); i++){
        location = results[i];
        availableLocationsArray.push(new Location({
            name: location.name,
            address: location.vicinity,
            latLng: location.geometry.location,
            placeId: location.place_id
        }));
    }
    self.availableLocations(availableLocationsArray);
    $('#myModal').modal();
    $("#myModal input[type=radio]:first").attr('checked', true);
};


// add clicked location to locations observableArray and hide modal
GoogleMap.prototype.addLocationSelected = function() {
    var self = this;
    var i, location, selectedAddress = $('input[name="availableLocations"]:checked').val();

    for (i = 0; i < self.availableLocations().length; i++)  {
        location = self.availableLocations()[i];
        if (location.address() === selectedAddress)  {
            self.addMarker(location);
            $('#myModal').modal('hide');
            break;
        }
    }
};


// add marker at given location and push location to locations observableArray
GoogleMap.prototype.addMarker = function(location) {
    var self = this;
    var marker = new google.maps.Marker({
        position: location.latLng(),
        map: self.map,
        animation: google.maps.Animation.DROP
    });

    marker.addListener('click', function()  {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function () {
            marker.setAnimation(null);
        }, 1400);
        self.displayingLocation(location);
        self.renderInfowindow();
    });

    location.marker(marker);
    self.locations.push(location);
};


GoogleMap.prototype.renderInfowindow = function()  {
    var self = this;
    self.places.getDetails({placeId: self.displayingLocation().placeId()}, function(placeDetails, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK)  {
            self.openInfoWindow(placeDetails);
        }   else  {
            self.openInfoWindow(null);
        }
    });
};


GoogleMap.prototype.openInfoWindow = function(placeDetails)  {
    var self = this;
    //console.log(placeDetails);
    if (self.infowindow != null)  self.infowindow.close();

    if (placeDetails === null)  {
        self.infowindow = new google.maps.InfoWindow({
            content: $('#errorInfowindowContent').clone()[0]
        });
    }  else  {
        self.displayingLocation().formatted_phone_number(placeDetails.formatted_phone_number);
        self.displayingLocation().website(placeDetails.website);
        self.displayingLocation().rating(placeDetails.rating);
        self.displayingLocation().open_now(placeDetails.opening_hours.open_now);
        self.displayingLocation().open_text(placeDetails.opening_hours.weekday_text);

        self.infowindow = new google.maps.InfoWindow({
            content: $('#infowindowContent').clone()[0]
        });
    }
    self.infowindow.open(self.map, self.displayingLocation().marker());
};


GoogleMap.prototype.showAllMarkers = function() {
    var self = this;
    var i, location;
    for (i = 0; i < self.locations().length; i++)  {
        location = self.locations()[i];
        self.showMarker(location);
    }
};


// show marker of given location
GoogleMap.prototype.showMarker = function(location) {
    var self = this;
    location.marker().setMap(self.map);
    location.display(true);
};


// hide marker of given location
GoogleMap.prototype.hideMarker = function(location)  {
    var self = this;
    location.marker().setMap(null);
    location.display(false);
};
