var Location = function(data)  {
    this.name = ko.observable(data.name);
    this.address = ko.observable(data.address);
    this.latLng = ko.observable(data.latLng);
    this.placeId = ko.observable(data.placeId);
    this.formatted_phone_number = ko.observable();
    this.website = ko.observable();
    this.rating = ko.observable();
    this.open_now = ko.observable();
    this.open_text = ko.observableArray([]);

    this.marker = ko.observable('');
    this.display = ko.observable(true);
    this.text = ko.computed(function()  {
        return this.name() + ',\xa0\xa0\xa0\xa0' + this.address();
    }, this);
};


var viewModel = function()  {
    var self = this;

    self.locations = ko.observableArray([]);
    self.availableLocations = ko.observableArray([]);
    // current location with info window open
    self.displayingLocation = ko.observable();
    self.available = ko.observable(true);
    self.googleMap = new GoogleMap(self.locations, self.availableLocations, self.displayingLocation);
    self.searchInput = ko.observable('');
    this.displayAlert = ko.computed(function()  {
        return self.locations().length > 0;
    }, this);


    self.init = function()  {
        // click event for modal button
        $('#btnAddAvailableLocation').click(function(event) {
            self.googleMap.addLocationSelected();
            event.preventDefault();
        });
    };


    // delete location and marker when user clicks on list's trashcan span
    self.removeLocation = function(location)  {
        self.googleMap.hideMarker(location);
        self.locations.remove(location);
    };


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


    self.init();
};


ko.applyBindings(new viewModel());
