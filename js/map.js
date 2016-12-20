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
        position: location.latLng(),
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
    self.places.getDetails({placeId: self.displayingLocation().placeId()}, function(placeDetails, status) {
        if (self.infowindow != null)  self.infowindow.close();

        // populate info window with search results returned from places service
        if (status == google.maps.places.PlacesServiceStatus.OK)  {
            self.displayingLocation().placesServiceSuccess(true);
            self.displayingLocation().formatted_phone_number(placeDetails.formatted_phone_number);
            self.displayingLocation().website(placeDetails.website);
            self.displayingLocation().rating(placeDetails.rating);
            self.displayingLocation().open_now(placeDetails.opening_hours.open_now);
            Foursquare.prototype.getResults(self.displayingLocation(), self.openInfoWindow, self);
        }   else  {
            self.displayingLocation().placesServiceSuccess(false);
            self.openInfoWindow([], self);
        }
    });
};


GoogleMap.prototype.openInfoWindow = function(foursquareResults, googleMap)  {
    var self = googleMap;
    if (foursquareResults.length > 0)  {
        self.displayingLocation().foursquareSuccess(true);
        self.displayingLocation().foursquareResults(foursquareResults);
    }   else {
        self.displayingLocation().foursquareSuccess(false);
        self.displayingLocation().foursquareResults([]);
    }

    self.infowindow = new google.maps.InfoWindow({
        //content: $('#infowindowContent').html()
        content: self.getInfoWindowContent()
    });
    self.infowindow.open(map, self.displayingLocation().marker);
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


GoogleMap.prototype.getInfoWindowContent = function()  {
    var self =  this;
    var curr = self.displayingLocation(), i, venue;
    var content = `
        <div class="row">
            <div class="col-xs-12">`;

        content += '<h4>{0}</h4>'.format(curr.name());

        if (curr.placesServiceSuccess())  {
            content += '<p>Phone&nbsp;:&nbsp;<span>{0}</span></p>'.format(curr.formatted_phone_number());
            content += '<p>Website&nbsp;:&nbsp;<a href="{0}">{0}</a></p>'.format(curr.website());
            content += '<p>Rating&nbsp;:&nbsp;<span>{0}</span></p>'.format(curr.rating());
            if (curr.foursquareSuccess())  {
                content += '<ul>';
                for (i = 0; i < curr.foursquareResults().length; i++) {
                    venue = curr.foursquareResults()[i];
                    content += '<li>';
                    content += '<div>{0}</div>'.format(venue.name);
                    content += '<div>Checkins on Foursquare&nbsp;:&nbsp;<span>{0}</span></div>'.format(venue.checkins);
                    content += '<div>Website&nbsp;:&nbsp;<a href="{0}">{0}</a></div>'.format(venue.url);
                    content += '</li>';
                }
                content += '</ul>';
            }   else {
                content += '  <p class="error">Error getting information from Foursquares service.</p>';
            }
        }   else {
            content += '<p class="error">Error getting information from Google place details service.</p>';
        }
        content += `
            </div>
        </div>
        `;

    return content;
};
