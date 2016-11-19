var c = ["#fff7ec", "#fee8c8", "#fdd49e", "#fdbb84",
    "#fc8d59", "#ef6548", "#d7301f", "#b30000", "#7f0000"];
/*
c = ["1a208c", "351f7b", "421e73", "501e6b", "5e1d63", "791d53", "871c4a", "941c42", "a21b3a", "b01b32"]
*/
var width = 1325,
    height = 580;
var formatNumber = d3.format(",d");
var projection = d3.geo.albersUsa()
    .scale(4200)
    .translate([width / 2 + 1200, height / 2 - 700]);
    
var path = d3.geo.path()
    .projection(projection);
var color = d3.scale.threshold()
    .domain([1, 10, 50, 100, 500, 1000, 2000, 5000])
    .range([c[0], c[1], c[2], c[3], c[4],
            c[5], c[6], c[7], c[8]]);
// A position encoding for the key only.
var x = d3.scale.linear()
    .domain([0, 5100])
    .range([0, 480]);
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickSize(13)
    .tickValues(color.domain())
    .tickFormat(function(d) { return d >= 100 ? formatNumber(d) : null; });
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);
var g = svg.append("g")
    .attr("class", "key")
    .attr("transform", "translate(440,40)");
g.selectAll("rect")
    .data(color.range().map(function(d, i) {
      return {
        x0: i ? x(color.domain()[i - 1]) : x.range()[0],
        x1: i < color.domain().length ? x(color.domain()[i]) : x.range()[1],
        z: d
      };
    }))
  .enter().append("rect")
    .attr("height", 8)
    .attr("x", function(d) { return d.x0; })
    .attr("width", function(d) { return d.x1 - d.x0; })
    .style("fill", function(d) { return d.z; });
g.call(xAxis).append("text")
    .attr("class", "caption")
    .attr("y", -6)
    .text("Population per square mile");
d3.json("ak.json", function(error, ak) {
  if (error) throw error;
  var tracts = topojson.feature(ak, ak.objects.tracts);
  // Clip tracts to land.
  svg.append("defs").append("clipPath")
      .attr("id", "clip-land")
    .append("path")
      .datum(topojson.feature(ak, ak.objects.counties))
      .attr("d", path);
  // Group tracts by color for faster rendering.
  svg.append("g")
      .attr("class", "tract")
      .attr("clip-path", "url(#clip-land)")
    .selectAll("path")
      .data(d3.nest()
        .key(function(d) { return color(d.properties.population / d.properties.area * 2.58999e6); })
        .entries(tracts.features.filter(function(d) { return d.properties.area; })))
    .enter().append("path")
      .style("fill", function(d) { return d.key; })
      .attr("d", function(d) { return path({type: "FeatureCollection", features: d.values}); });
  // Draw county borders.
  svg.append("path")
      .datum(topojson.mesh(ak, ak.objects.counties, function(a, b) { return a !== b; }))
      .attr("class", "county-border")
      .attr("d", path);
});
d3.select(self.frameElement).style("height", height + "px");
