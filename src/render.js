import * as d3 from 'd3';

var w = 650, h = 750;

var proj = d3.geoMercator()
    .center([128.0, 35.9])
    .scale(4000 * 1.5)
    .translate([w/2, h/2]);

var path = d3.geoPath().projection(proj);
var color = ['red', 'green'];
var concentration = d3.scaleLinear().domain([50, 100]).range([0.1, 1]);

function asTable(data, container) {
    if(!container) {
        container = 'body';
    }
    // var table = d3.select('body').append('table');
    var table = d3.select(container).append('table');
    
    var columns = Object.keys(data[0].properties);
    columns.push('city');
    // console.log(columns);
    var headers = table.append('thead').append('tr').selectAll('tr')
    .data(columns)
    .enter()
        .append('th')
        .text(d => d)
        
    
    var tr = table.append('tbody').selectAll('tr').data(data)
    .enter()
        .append('tr');
        
    tr.selectAll('td')
    .data(row => {
        return columns.map(function (column) {
            return { column: column, value: row.properties[column] }
        });
    })
    .enter()
        .append('td')
        .text(d => d.value)
    
    return table;
}

function asMap(data, container) {
    if(!container) {
        container = 'body';
    }

    var svg = d3.select(container).append("svg")
        .attr("width", w)
        .attr("height", h);
        
    var g = svg.append('g');
    var g_provinces = g.selectAll('g')
        .data(data, function(d) { return d.properties.code; })
        .enter()
        .append('g')
        .attr('class', 'g_province');

    g_provinces.append('path')
        .attr('d', path)
        .attr('title', function(d) {
            return d.properties.name;
        })
        .attr('class', function(d, i) {
            return 'province ' + d.properties.name;
        })
        .attr('fill', function(d) {
            return color[d.properties.election['유력후보']];
        })
        .attr('fill-opacity', function(d) {
            return concentration(d.properties.election['득표율']);
        });
    
    return svg;
}


function asCarto(data) {
    var svg = d3.select("body").append("svg")
        .attr("width", w)
        .attr("height", h);


    var radiusMap = d3.scaleLinear()
        .domain([0,5000])
        .range([0,150]);
    
    data.forEach(it => {
        // console.log(it.properties.election['선거인수']);
        if(!!it.properties.election) {
            it.properties.value = parseInt(it.properties.election['선거인수']);    
        }
        else {
            it.properties.value = 0;
        }
        
        it.properties.r = radiusMap(Math.sqrt(it.properties.value));
        it.properties.c = path.centroid(it)
    });
    
    var force = d3.forceSimulation()
        .force('x', d3.forceX().x(d => d.properties.c[0]))
        .force('y', d3.forceY().y(d => d.properties.c[1]))
        .nodes(data)
        .on('tick', updateNetwork)
        .force('collision', d3.forceCollide(d => d.properties.r).iterations(4))

    var cont = svg.append('g');
    var dorling = cont.selectAll("path");
    dorling.data(data)
        .enter()
        .append("circle")
        // .attr('class', 'rect')
        .attr('fill', function(d) {
            return color[d.properties.election['유력후보']];
        })
        .attr('fill-opacity', function(d) {
            return concentration(d.properties.election['득표율']);
        })
        .attr("data-idx", it => it.index)
		.attr("r", function(it) { return it.properties.r;})
    
    
    function updateNetwork() {
        d3.selectAll("circle")
          .attr("cx", d => d.x )
          .attr("cy", d => d.y )
    }
}

export default {
    asTable: asTable,
    asMap: asMap,
    asCarto: asCarto
}