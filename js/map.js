'use strict';

var map;
var initLat = 37.765, initLng = -122.447;


var GoogleMap = function(locations, displayingLocation) {
    google.maps.event.trigger(map, "resize");
    this.geocoder = new google.maps.Geocoder();
    this.places = new google.maps.places.PlacesService(map);
    this.locations = locations;
    this.displayingLocation = displayingLocation;
    this.infowindow = null;

    this.searchNearbyRestaurants(new google.maps.LatLng(initLat, initLng));
};


// animate marker and display info window when user clicks on list element
GoogleMap.prototype.clickLocationResponse = function(location)  {
    var self = this;
    var marker = location.marker;
    map.panTo(location.latLng());
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function () {
        marker.setAnimation(null);
    }, 1400);
    self.displayingLocation(location);
    self.renderInfowindow();
};


GoogleMap.prototype.searchNearbyRestaurants = function(latLng)  {
    var self = this;
    self.places.nearbySearch({location: latLng, radius: 5000, type: ['restaurant']},
        function(results, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK){
                self.populateLocations(results);
            }   else {
                alert("Failed requesting from Google Places API, please try again later.");
            }
    });
};


// populate locations observableArray with search results
GoogleMap.prototype.populateLocations = function(results) {
    var self = this;
    var i, location;
    for(i = 0; i < Math.min(results.length, 5); i++){
        location = results[i];
        self.locations.push(new Location({
            name: location.name,
            address: location.vicinity,
            latLng: location.geometry.location,
            placeId: location.place_id
        }));
        self.addMarker(self.locations()[i]);
    }
};


// add marker at given location to locations observableArray
GoogleMap.prototype.addMarker = function(location) {
    var self = this;
    var marker = new google.maps.Marker({
        position: location.latLng,
        map: map,
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
    location.marker = marker;
};


// search for info from places service
GoogleMap.prototype.renderInfowindow = function()  {
    var self = this;
    self.places.getDetails({placeId: self.displayingLocation().placeId}, function(placeDetails, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK)  {
            self.openInfoWindow(placeDetails);
        }   else  {
            self.openInfoWindow(null);
        }
    });
};


// populate info window with search results returned from places service
GoogleMap.prototype.openInfoWindow = function(placeDetails)  {
    var self = this;
    if (self.infowindow != null)  self.infowindow.close();

    if (placeDetails === null)  {       // display error div if failure
        self.infowindow = new google.maps.InfoWindow({
            content: self.getErrorWindowContent()
        });
    }  else  {

        self.displayingLocation().formatted_phone_number = placeDetails.formatted_phone_number;
        self.displayingLocation().website = placeDetails.website;
        self.displayingLocation().rating = placeDetails.rating;

        self.infowindow = new google.maps.InfoWindow({
            content: self.getInfoWindowContent()
        });
    }
    self.infowindow.open(map, self.displayingLocation().marker);
};


GoogleMap.prototype.getErrorWindowContent = function()  {
    var self = this;
    var content = `
        <div class="row">
            <div class="col-xs-12">
                <h4>{0}</h4>
                <p id="error">Error getting information from Google place details service.</p>
            </div>
        </div>
        `.format(self.displayingLocation().name());
    return content;
};



GoogleMap.prototype.getInfoWindowContent = function()  {
    var self =  this;
    var curr = self.displayingLocation();
    var content = `
        <div class="row">
            <div class="col-xs-12">
                <h4>{0}</h4>
                <p>Phone&nbsp;:&nbsp;<span>{1}</span></p>
                <p>Website&nbsp;:&nbsp;<a href="{2}">{2}</a></p>
                <p>Rating&nbsp;:&nbsp;<span>{3}</span></p>
            </div>
        </div>
        `.format(curr.name(), curr.formatted_phone_number,
                curr.website, curr.rating);
    return content;
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
    location.marker.setVisible(true);
    location.display(true);
};


// hide marker of given location
GoogleMap.prototype.hideMarker = function(location)  {
    var self = this;
    location.marker.setVisible(false);
    location.display(false);
};
