function generateMap() {
    d3.json('static/json/states.json', (error, statesData) => {
        if (error) throw error;

        // console.log(statesData);

        // Get this year and month
        let date = new Date()
            .toISOString()
            .slice(0, 7);

        let dateQuery = `${date}-01 00:00:00`;

        d3.json(`/shipped/${dateQuery}`, (error, shippedData) => {
            if (error) throw error;

            // console.log(shippedData);

            // List to hold markers
            let orderMarkers = [];

            // Creating a new marker cluster group
            let clusterMarkers = L.markerClusterGroup();

            // Get shipped orders length
            let numShipped = shippedData.orders.length;

            // Remove h1 if it exists
            d3.select('#total-order-number')
                .remove();

            // Display number of shipped orders
            d3.select('#total-order')
                .append('h1')
                .attr('id', 'total-order-number')
                .html(`${numShipped}`);

            for (let i = 0, ii = numShipped; i < ii; i++) {

                // Create variable for order each order shipTos
                let order = shippedData.orders[i].shipTo;

                // Get data fields
                let state = order.state,
                    custName = order.name,
                    custCompany = order.company,
                    city = order.city;

                for (let j = 0, jj = statesData.length; j < jj; j++) {

                    if (state === statesData[j].abbreviation) {

                        let lat = statesData[j].latitude,
                            lon = statesData[j].longitude;

                        // Create marker and bind a pop-up
                        let orderMarker = L.marker([lat, lon])
                            .bindPopup(
                                `<h4>${custName}</h4><p>${custCompany}</p><p>${city}, ${state}</p>`
                            );

                        // Push markers to list
                        orderMarkers.push(orderMarker);

                        // Add layer to clusterMarkers
                        clusterMarkers.addLayer(orderMarker);

                    }
                }
            }

            // console.log(orderMarkers);

            // Create marker layer
            let orderLocations = L.layerGroup(orderMarkers);

            // console.log(orderLocations);

            // Send earthquakes layer to createMap function
            createMap(orderLocations, clusterMarkers);
        });
    });
}


// Run generateMap on initial load
generateMap();


function createMap(orderLocations, clusterMarkers) {
    // Mapbox wordmark
    let mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>, ' +
        'Click <a href="/map" target="_blank">here</a> for full map.',
        mbKey = 'pk.eyJ1IjoiamF5bGVoIiwiYSI6ImNqaDFhaWo3MzAxNTQycXFtYzVraGJzMmQifQ.JbX9GR_RiSKxSwz9ZK4buw',
        mbUrl = `https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=${mbKey}`,
        mbStyleUrl = `https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/256/{z}/{x}/{y}?access_token=${mbKey}`;

    // Define light layer
    let light = L.tileLayer(mbUrl, { id: 'mapbox.light', attribution: mbAttr }),
        streets = L.tileLayer(mbStyleUrl, { id: 'streets-v10', attribution: mbAttr }),
        dark = L.tileLayer(mbUrl, { id: 'mapbox.dark', attribution: mbAttr }),
        naviNight = L.tileLayer(mbStyleUrl, { id: 'navigation-preview-night-v2', attribution: mbAttr }),
        satellite = L.tileLayer(mbUrl, { id: 'mapbox.satellite', attribution: mbAttr });

    // Define baseMaps object to hold our base layers
    let baseMaps = {
        Light: light,
        Streets: streets,
        Dark: dark,
        Night: naviNight,
        Satellite: satellite
    };

    // Create overlay object to hold overlay layer
    let overlayMaps = {
        'Cluster Groups': clusterMarkers,
        'All Order Locations': orderLocations
    };

    // Remove map if it exists
    d3.select('#map')
        .remove();

    // Append new div for map
    d3.select('#map-container')
        .append('div')
        .attr('id', 'map');

    // Create map
    let myMap = L.map("map", {
        center: [39.8283, -98.5795],
        zoom: 3,
        layers: [streets, clusterMarkers]
    });

    // Create layer control
    L.control
        .layers(baseMaps, overlayMaps, {
            collapsed: true
        })
        .addTo(myMap);
}


// Run getShipments every 10 minutes
window.setInterval(function () {
    generateMap();
}, 6e5);