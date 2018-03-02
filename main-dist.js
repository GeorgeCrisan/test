'use strict';

var dataMet = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json';
var theMap = "https://d3js.org/world-50m.v1.json";

var width = 1000,
    height = 850;

function app(error, worldObj, meteoriteDataObj) {

  if (error) throw error;

  var projection = function projection() {

    return d3.geoMercator().scale(140).translate([width / 2, height / 2]);
  }; // end of projection

  var svg = d3.select('.container-app').append('svg').attr('width', width).attr('height', height);

  var tooltip = d3.select('.container-app').append('div').attr('class', 'tooltip').style('opacity', 0);

  var path = d3.geoPath();

  var massRadius = function massRadius(mass) {
    var radius = 1;
    var counter = 100;

    for (var i = 1; i <= 7; i++) {
      if (mass < counter) return radius;
      counter = counter * 10;
      radius = radius * 1.8;
    }
  }; // end of massRadius

  var massColor = function massColor(mass) {
    var counter = 100;
    var colors = ['#cc6600', '#994c00', '#e57300', '#b20000', '#e50000', '#ff4c4c', '#d81111'];
    for (var i = 1; i <= 7; i++) {
      if (mass < counter) return colors[i - 1];

      counter = counter * 10;
    }
  }; //end of massColor

  var zoom = d3.zoom().scaleExtent([1, 35]).translateExtent([[-100, -100], [width + 90, height + 100]]).on('zoom', zoomed);

  function zoomed() {
    countriesSvg.attr('transform', d3.event.transform);
    markersSvg.attr('transform', d3.event.transform);
  }

  svg.call(zoom);

  var countries = topojson.feature(worldObj, worldObj.objects.countries).features;
  var meteorite = meteoriteDataObj.features.filter(function (feature) {
    return feature.geometry !== null;
  });
  var countriesSvg = svg.append('g').attr('class', 'countries');
  var markersSvg = svg.append('g').attr('class', 'markers');

  countriesSvg.selectAll("path").data(countries).enter().append('path').attr("d", function (d) {
    return path.projection(projection())(d);
  }).attr("class", "country").attr("fill", '#3e915e').attr('stroke', "black").attr('stroke-width', "1");

  markersSvg.selectAll("circle").data(meteorite).enter().append("circle").attr("cx", function (d) {
    return projection()(d.geometry.coordinates)[0];
  }).attr("cy", function (d) {
    return projection()(d.geometry.coordinates)[1];
  }).attr("r", function (d) {
    return massRadius(d.properties.mass);
  }).attr("class", "marker").attr("fill", function (d) {
    return massColor(d.properties.mass);
  }).attr("opacity", "0.5").attr("stroke", "#000").attr("stroke-width", "0.5").on("mouseover", function (d) {
    tooltip.transition().duration(100).style("opacity", 1);
    tooltip.html('<p><b>Name:</b> ' + d.properties.name + '</p>\n                             <p><b>Mass:</b> ' + d.properties.mass + '</p>\n                             <p><b>Fall:</b> ' + d.properties.fall + '</p>\n                             <p><b>Year:</b> ' + new Date(d.properties.year).toDateString() + '</p>\n                             <p><b>Reclat:</b> ' + d.properties.reclat + '</p>\n                             <p><b>Recclass:</b> ' + d.properties.recclass + '</p>').style("left", d3.event.pageX + 10 + "px").style("top", d3.event.pageY - 28 + "px");
  }).on("mouseout", function (d) {
    tooltip.transition().duration(100).style("opacity", 0);
  });
} // end of app

d3.queue().defer(d3.json, theMap).defer(d3.json, dataMet).await(app);