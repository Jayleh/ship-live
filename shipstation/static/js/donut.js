// Get shipped orders for this month
function getMonthlyOrders() {

    // Get this year and month
    let date = new Date()
        .toISOString()
        .slice(0, 7);

    let dateQuery = `${date}-01 00:00:00`;

    d3.json(`/shipped/${dateQuery}`, (error, shippedData) => {

        console.log(shippedData);

        let dataset = [],
            countries = [];

        for (let i = 0, ii = shippedData.orders.length; i < ii; i++) {

            // Create variable for order each order
            let order = shippedData.orders[i];

            // Get data fields
            let country = order.shipTo.country;

            // console.log(country);

            countries.push(country);
        }

        // Create unique array from countries list
        let uniqueCountries = [... new Set(countries)];

        // console.log(uniqueCountries);

        for (let j = 0, jj = uniqueCountries.length; j < jj; j++) {

            let data = {},
                count = 0;

            data['name'] = uniqueCountries[j];

            for (let k = 0, kk = shippedData.orders.length; k < kk; k++) {

                // Create variable for order each order
                let order = shippedData.orders[k];

                // Get data fields
                let country = order.shipTo.country;

                if (data.name === country) {

                    count++
                }
            }

            percentage = count / shippedData.orders.length * 100;

            data['value'] = percentage;

            dataset.push(data);
        }

        console.log(dataset);

        let margin = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        }
        let svgWidth = 350,
            svgHeight = 350,
            chartWidth = svgWidth - margin.left - margin.right,
            chartHeight = svgHeight - margin.top - margin.bottom,
            radius = chartWidth / 2;

        let $svg = d3.select('#donut');

        // Create chart group
        let chartGroup = $svg.append('g')
            .attr('width', chartWidth)
            .attr('height', chartHeight)
            .attr('transform', `translate(${chartWidth / 2}, ${chartHeight / 2})`);

        // Arc generator
        let arc = d3.arc()
            .outerRadius(radius)
            .innerRadius(radius - 35);

        let labelArc = d3.arc()
            .outerRadius(radius - 20)
            .innerRadius(radius - 20);

        // Pie generator
        let pie = d3.pie()
            .sort(null)
            .value(d => d.value);

        // Append main text group
        let totalGroup = chartGroup.append('g')
            .append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '.35em')
            .style('font-size', '90px')
            .style('font-weight', 'bolder')
            .style('fill', '#0E5144')
            .text(`${shippedData.orders.length}`)

        // Append g elements
        let arcGroup = chartGroup.selectAll('.arc')
            .data(pie(dataset))
            .enter()
            .append('g')
            .attr('class', 'arc');

        // Append arc path
        arcGroup.append('path')
            .attr('d', arc)
            .style('fill', '#6DA398');

        // Append the arc labels
        arcGroup.append('text')
            .attr('transform', function (d) {
                return `translate(${labelArc.centroid(d)})`;
            })
            .attr('dy', '.35em')
            .text(d => d.data.name)
            .style("fill", "#fff");
    });
}


// getMonthlyOrders();