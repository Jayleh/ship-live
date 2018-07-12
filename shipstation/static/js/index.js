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
            .attr('width', '275')
            .attr('height', '275');

        // Generate gauge
        d3.select('#fill-gauge').call(d3.liquidfillgauge, numAwaiting, config);

        let $gauge = d3.select('#fill-gauge');

        $gauge.on('click', _ => {
            // Straight up page refresh to update orders
            location.reload();
        });

        // Get on hold table id
        let tableId = '#awaiting-table';

        // Fill table with awaiting data
        fillTable(ordersData, tableId);

        // Create pagination
        if (numAwaiting > 11) {
            paginate();
        }
    });
}


function getOnHold() {
    d3.json('/on-hold', (error, ordersData) => {

        console.log(ordersData);

        // Get on hold table id
        let tableId = '#on-hold-table';

        fillTable(ordersData, tableId);

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
function paginate() {

    function getPageList(totalPages, page, maxLength) {
        if (maxLength < 5) throw 'maxLength must be at least 5';

        function range(start, end) {
            return Array.from(Array(end - start + 1), (_, i) => i + start);
        }

        let sideWidth = maxLength < 9 ? 1 : 2;
        let leftWidth = (maxLength - sideWidth * 2 - 3) >> 1;
        let rightWidth = (maxLength - sideWidth * 2 - 2) >> 1;

        if (totalPages <= maxLength) {
            // no breaks in list
            return range(1, totalPages);
        }
        else if (page <= maxLength - sideWidth - 1 - rightWidth) {
            // no break on left of page
            return range(1, maxLength - sideWidth - 1)
                .concat([0])
                .concat(range(totalPages - sideWidth + 1, totalPages));
        }
        else if (page >= totalPages - sideWidth - 1 - rightWidth) {
            // no break on right of page
            return range(1, sideWidth)
                .concat([0])
                .concat(range(totalPages - sideWidth - 1 - rightWidth - leftWidth, totalPages));
        }
        // Breaks on both sides
        return range(1, sideWidth)
            .concat([0])
            .concat(range(page - leftWidth, page + rightWidth))
            .concat([0])
            .concat(range(totalPages - sideWidth + 1, totalPages));
    }

    $(function () {
        // Number of items and limits the number of items per page
        let numberOfItems = $('#awaiting-table tbody tr').length;

        let limitPerPage = 10;
        // Total pages rounded upwards
        let totalPages = Math.ceil(numberOfItems / limitPerPage);
        // Number of buttons at the top, not counting prev/next,
        // but including the dotted buttons.
        // Must be at least 5:
        let paginationSize = 5;
        let currentPage;

        function showPage(whichPage) {
            if (whichPage < 1 || whichPage > totalPages) {
                return false;
            }
            currentPage = whichPage;
            $('#awaiting-table tbody tr').hide()
                .slice((currentPage - 1) * limitPerPage, currentPage * limitPerPage).show();

            // Replace the navigation items (not prev/next):            
            $('.pagination li').slice(1, -1).remove();
            getPageList(totalPages, currentPage, paginationSize).forEach(item => {
                $('<li>').addClass('page-item')
                    .addClass(item ? 'current-page' : 'disabled')
                    .toggleClass('active', item === currentPage).append(
                        $('<a>').addClass('page-link').attr({
                            href: 'javascript:void(0)'
                        }).text(item || '...')
                    ).insertBefore('#next-page');
            });
            // Disable prev/next when at first/last page:
            $('#previous-page').toggleClass('disabled', currentPage === 1);
            $('#next-page').toggleClass('disabled', currentPage === totalPages);
            return true;
        }

        // Include the prev/next buttons if greater than page limit
        if (numberOfItems > 10) {
            $('.pagination').append(
                $('<li>').addClass('page-item').attr({ id: 'previous-page' }).append(
                    $('<a>').addClass('page-link').attr({
                        href: 'javascript:void(0)'
                    }).html('&laquo;')
                ),
                $('<li>').addClass('page-item').attr({ id: 'next-page' }).append(
                    $('<a>').addClass('page-link').attr({
                        href: 'javascript:void(0)'
                    }).html('&raquo;')
                )
            );
        }

        // Show the page links
        $('#awaiting-table').show();
        showPage(1);

        // Use event delegation, as these items are recreated later    
        $(document).on('click', '.pagination li.current-page:not(.active)', function () {
            return showPage(+$(this).text());
        });

        $('#next-page').on('click', function () {
            return showPage(currentPage + 1);
        });

        $('#previous-page').on('click', function () {
            return showPage(currentPage - 1);
        });
    });
}


// Run getShipments every 10 minutes
window.setInterval(function () {
    getAwaiting();
    getOnHold();
}, 6e5);