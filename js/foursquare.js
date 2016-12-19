'use strict';

var Foursquare = function(name, checkins, url)  {
    this.name = name;
    this.checkins = checkins;
    this.url = url;
};


/*
    Given a knockout observable location,
    searches nearby foursquare locoations at that location,
    and calls  infoWindowCallback function
    with populated array of Foursquare objects,
    or empty array if error happens.
*/
Foursquare.prototype.getResults = function(location, openInfoWindowCallback, googleMap)  {
    var self = this;
    var ll = location.latLng().lat() + ',' + location.latLng().lng();

    $.ajax({
        method: 'GET',
        dataType: 'jsonp',
        url: 'https://apii.foursquare.com/v2/venues/trending',
        data: {
            oauth_token: 'OFREDHZW2VF3DVRJ00UE1DPDGTNSDSI5M3NSFZBHEUJ05US0',
            ll: ll,
            v: 20161219
        },
    })
    .done(function(data) {
        var trendingVenues = data.response.venues;
        var i, venue, checkinsCount, foursquareResults = [];;
        for (i = 0; i < Math.min(trendingVenues.length, 5); i++)  {
            venue = trendingVenues[i];
            checkinsCount = 0;
            if (venue.stats)  checkinsCount = venue.stats.checkinsCount;

            foursquareResults.push(new Foursquare(
                venue.name, checkinsCount, venue.url
            ));
        }
        openInfoWindowCallback(foursquareResults, googleMap);
    })
    .fail(function(){
        openInfoWindowCallback([], googleMap);
    });


};
