var Foursquare = function(name, checkins, url)  {
    this.name = name;
    this.checkins = checkins;
    this.url = url;
};


/*
    Given a knockout observable location,
    searches nearby foursquare locoations at that location,
    and populates location's foursquareResults array,
    or sets foursquareSuccess to false if error happens.
*/
Foursquare.prototype.getResults = function(location, callback, googleMap)  {
    var self = this;
    var ll = location.latLng().lat() + ',' + location.latLng().lng();
    foursquareResults = [];


    $.ajax({
        method: 'GET',
        dataType: 'jsonp',
        url: 'https://api.foursquare.com/v2/venues/trending',
        data: {
            oauth_token: 'OFREDHZW2VF3DVRJ00UE1DPDGTNSDSI5M3NSFZBHEUJ05US0',
            ll: ll,
            v: 20161219
        },
    })
    .done(function(data) {
        var trendingVenues = data.response.venues;
        var i, venue, checkinsCount;
        for (i = 0; i < Math.min(trendingVenues.length, 5); i++)  {
            venue = trendingVenues[i];
            checkinsCount = 0;
            if (venue.stats)  checkinsCount = venue.stats.checkinsCount;

            foursquareResults.push(new Foursquare(
                venue.name, checkinsCount, venue.url
            ));
        }
        console.log(foursquareResults);
        console.log(foursquareResults.length);
        callback(foursquareResults, googleMap);
    })
    .fail(function(){
        //location.foursquareSuccess(false);
        alert('There was an error trying to get venues from Foursquare');
    });


};
