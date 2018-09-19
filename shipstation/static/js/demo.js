// Time to stay on page for pagination
let awaitingPageInterval = 15000,
    holdPageInterval = 30000;

function getAwaiting() {
    d3.json('/awaiting', (error, ordersData) => {
        if (error) throw error;

        // console.log(ordersData);

        let numAwaiting = ordersData.orders.length;

        // Configure fill gauge
        let config = {
            circleColor: '#6DA398',
            textColor: '#0E5144',
            waveTextColor: '#6DA398',
            waveColor: '#246D5F',
            circleThickness: 0.18,
            textVertPosition: 0.5,
            waveAnimateTime: 700,
            backgroundColor: 'rgba(0, 0, 0, 0)',
            valueCountUpAtStart: false,
            // waveRiseAtStart: false,
            displayPercent: false,
            minValue: 1,
            maxValue: 20
        }

        // Delete fill gauge if exists
        d3.select('#fill-gauge').remove();

        // Create fill gauge svg
        d3.select('#fill-gauge-container')
            .append('svg')
            .attr('id', 'fill-gauge')
            .attr('width', '215')
            .attr('height', '215');

        // Generate gauge
        d3.select('#fill-gauge').call(d3.liquidfillgauge, numAwaiting, config);

        // Assign table id
        let tableId = '#awaiting-table',
            limitPerPage = 8;

        // Fill table with awaiting data
        fillTable(ordersData, tableId);

        // Get page parameters
        let parameters = getParameters(tableId, limitPerPage),
            numberOfItems = parameters[0],
            numberOfPages = parameters[1];

        // Only paginate if number of items is greater than limitPerPage
        // and if window size is greather than 992px
        if ((numberOfItems > limitPerPage) && (window.matchMedia("min-width: 993px"))) {
            // console.log("Big screen");

            // Paginate
            paginate(tableId, numberOfPages, limitPerPage, awaitingPageInterval);

            // Set reset interval
            let resetInterval = (numberOfPages) * awaitingPageInterval;

            // Start pagination interval
            startPaginationInterval(tableId, numberOfPages, limitPerPage, awaitingPageInterval, resetInterval);
        }
    });
}


function getOnHold() {
    d3.json('/on-hold', (error, ordersData) => {
        if (error) throw error;

        // Assign table id
        let tableId = '#on-hold-table',
            limitPerPage = 3;

        // Fill table with awaiting data
        fillTable(ordersData, tableId);

        // Get page parameters
        let parameters = getParameters(tableId, limitPerPage),
            numberOfItems = parameters[0],
            numberOfPages = parameters[1];

        // Only paginate if number of items is greater than limitPerPage
        if ((numberOfItems > limitPerPage) && (window.matchMedia("min-width: 993px"))) {
            // Paginate
            paginate(tableId, numberOfPages, limitPerPage, holdPageInterval);

            // Set reset interval
            let resetInterval = (numberOfPages) * holdPageInterval;

            // Start pagination interval
            startPaginationInterval(tableId, numberOfPages, limitPerPage, holdPageInterval, resetInterval);
        }
    });
}


function fillTable(ordersData, tableId) {
    // Remove any existing tbody in table
    d3.select(`${tableId} tbody`).remove()

    // Generate table
    let $tbody = d3.select(`${tableId} table`).append('tbody');

    // Get today's date, and list weekdays
    let todayDate = new Date(),
        weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // console.log(todayDate);

    for (let i = 0, ii = ordersData.orders.length; i < ii; i++) {

        // Create variable for order each order
        let order = ordersData.orders[i];

        // Data fields for table
        let orderDate = new Date(order.orderDate),
            age = getAge(orderDate),
            weekday = weekdays[orderDate.getDay()],
            month = orderDate.getMonth() + 1,
            date = orderDate.getDate(),
            orderNum = order.orderNumber,
            recipient = order.shipTo.name,
            products = order.items,
            productNameList = [],
            itemName,
            numProducts = 0;

        // console.log(orderDate);

        for (let j = 0, jj = products.length; j < jj; j++) {
            if (products[j].name !== 'Total Discount') {
                numProducts += products[j].quantity;
                productNameList.push(products[j].name);
            }
        }

        if (productNameList.length === 1) {
            itemName = productNameList[0];
        }
        else if (productNameList.length >= 2) {
            itemName = '(Multiple Items)';
        }
        else {
            itemName = 'null';
        }

        // console.log(productNameList);

        $tbody.append('tr')
            .attr('class', 'text-right')
            .html(
                `<td class='text-left' style='color: ${getColor(age[0], age[1])}'><strong>${age[0]}d ${age[1]}h</strong></td><td class='text-left'>${orderNum}</td><td class='text-left'>${recipient}</td><td>${itemName}</td><td>${numProducts}</td><td>${weekday}, ${month}/${date}</td>`
            );
    }

    function getAge(orderDate) {
        let ageDay = Math.abs(todayDate - orderDate) / 8.64e7, // in days ex. 0.5215
            ageHour = Math.abs(todayDate - orderDate) / 3.6e6, // in hours ex. 12.516
            days = Math.floor(ageDay), // 0 in 0.5
            hours = Math.floor(ageHour % 24);

        return [days, hours];
    }
}

// Run getAwaiting and getOnHold on initial load
getAwaiting();
getOnHold();

// Function for color scale based age
function getColor(day, hour) {
    return day >= 2 ? '#f03b20' :
        (day >= 1 && day < 2) ? '#e6550d' :
            (day < 1 && hour >= 12) ? '#31a354' :
                '#2c7fb8';
}

// Pagination function
function getParameters(tableId, limitPerPage) {
    // Number of items and calculate number pages
    let numberOfItems = $(`${tableId} tbody tr`).length,
        numberOfPages = Math.ceil(numberOfItems / limitPerPage);

    // Place parameters in list to return
    let parameters = [numberOfItems, numberOfPages];

    return parameters;
}

function showPage(tableId, currentPage, limitPerPage) {
    $(`${tableId} tbody tr`).hide()
        .slice((currentPage - 1) * limitPerPage, currentPage * limitPerPage).show();
}

function paginate(tableId, numberOfPages, limitPerPage, pageInterval) {
    // Show initial page 1
    showPage(tableId, 1, limitPerPage);
    // console.log("Page 1")

    for (let i = 2; i <= numberOfPages; i++) {
        (function (i) {
            window.setTimeout(function () {
                showPage(tableId, i, limitPerPage);
                // console.log(`Page ${i}`);
            }, (i - 1) * pageInterval);
        }(i));
    }
}

function startPaginationInterval(tableId, numberOfPages, limitPerPage, pageInterval, resetInterval) {
    window.setInterval(function () {
        // console.log(numberOfPages)
        paginate(tableId, numberOfPages, limitPerPage, pageInterval);
    }, resetInterval);
}

document.addEventListener('DOMContentLoaded', function () {
    // Enable floating action button
    let $actionBtn = document.querySelectorAll('.fixed-action-btn');
    M.FloatingActionButton.init($actionBtn);

    // Enable tooltips
    let $toolTip = document.querySelectorAll('.tooltipped');
    M.Tooltip.init($toolTip);
});

// Run getShipments every 10 minutes
window.setInterval(function () {
    getAwaiting();
    getOnHold();
}, 6e5);


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
                .html(`${numShipped} Orders This Month`);

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
        'Click <a href="/map">here</a> for full map.',
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
        .attr('id', 'map')
        .style('z-index', '0')

    // Create map
    let myMap = L.map("map", {
        center: [39.4389, -98.6948],
        zoom: 4,
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

