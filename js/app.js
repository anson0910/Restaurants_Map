'use strict';

var Location = function(data)  {

    this.name = ko.observable(data.name);
    // whether or not display this location
    this.display = ko.observable(true);
    this.marker = null;

    // places service information
    this.address = data.address;
    this.latLng = data.latLng;
    this.placeId = data.placeId;
    this.formatted_phone_number = null;
    this.website = '';
    this.rating = 0;    
};


var ViewModel = function()  {
    var self = this;

    self.locations = ko.observableArray([]);
    // current location with info window open
    self.displayingLocation = ko.observable();
    self.available = ko.observable(true);
    self.googleMap = new GoogleMap(self.locations, self.displayingLocation);
    self.searchInput = ko.observable('');
    this.displayAlert = ko.computed(function()  {
        return self.locations().length > 0;
    }, this);

    /*
    self.init = function()  {
    };*/


    // response when user clicks on list item in restaurant list
    self.clickLocationResponse = function(location)  {
        self.googleMap.clickLocationResponse(location);
    };


    // filter markers and list elements according to search input
    self.filterList = function()  {
        var str = self.searchInput().toLowerCase(), location, name;
        if (str === '')  {
            self.googleMap.showAllMarkers();
        }   else  {
            for (i = 0; i < self.locations().length; i++)  {
                location = self.locations()[i];
                name = location.name().toLowerCase();
                if (name.indexOf(str) == -1)  {
                    self.googleMap.hideMarker(location);
                }   else  {
                    self.googleMap.showMarker(location);
                }
            }
        }
    };

};


// Initialization funciton called after google map api is called
var init = function()  {

    // Initialize map
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: initLat, lng: initLng},
        zoom: 13
    });

    ko.applyBindings(new ViewModel());
};


var googleError = function()  {
    alert('Google maps failed to load, please try again later.');
};
