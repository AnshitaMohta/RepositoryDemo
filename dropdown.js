var width = 960,
    height = 700,
    radius = Math.min(width, height) / 2;
var b = {
  w: 130, h: 30, s: 3, t: 10
};

var x = d3.scale.linear()
    .range([0, 2 * Math.PI]);

var y = d3.scale.sqrt()
    .range([0, radius]);
var changeArray = [100,80,60,0, -60, -80, -100];
var colorArray = ["#67000d", "#b73e43", "#d5464a", "#f26256", "#fb876e", "#fca78e", "#fcbba1", "#fee0d2", "#fff5f0"];

var svg = d3.select("#diagram").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + (height / 2 + 10) + ")");

var partition = d3.layout.partition()
                  .value(function(d) { return d.Total; });

var arc = d3.svg.arc()
            .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
            .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
            .innerRadius(function(d) { return Math.max(0, y(d.y)); })
            .outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });
            console.log(arc)

    function checkIt(error, root){
      initializeBreadcrumbTrail();

      //intilaize dropdown
      if (error) throw error;

      var g = svg.selectAll("g")
             .data(partition.nodes(root))
            .enter().append("g");

     var path = g.append("path")
    .attr("d", arc)
    .style("fill", function(d) { var color;
                if(d.Total_Change > 100)
                             {color = colorArray[0]

                         }
                else if(d.Total_Change > 0 && d.Total_Change < 100)
                             {color = colorArray[1]

                         }
                   else
                 {
                    color = colorArray[2]
                     }
                d.color = color;
                return color})
    .on("click", click)
    .on("mouseover", mouseover);

    var tooltip = d3.select("body")
                     .append("div")
                     .attr("id", "tooltips")
                     .style("position", "absolute")
                     .style("background-color", "#fff")
                     .style("z-index", "10")
                     .style("visibility", "hidden");
      g.on("mouseover", function(d){return tooltip.style("visibility", "visible")
                                                   .html("<div class=" + "tooltip_container>"+"<h4 class=" + "tooltip_heading>" +d.name.replace(/[_-]/g, " ") +"</h4>" +"<br>" + "<p> Emissions 2013:" + " " + "<br>" + d.Total + " " +"<span>in Million Tons</span></p>"+ "<br>"+ "<p> Change in Emissions: <span>" + (d.Total_Change/d.Total*100).toPrecision(3) + "%" + "</span></p>"+"</div>" );})
       .on("mousemove", function(){return tooltip.style("top",(d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
       .on("mouseout", function(){return tooltip.style("visibility", "hidden");});
        
 //creating a dropdown
        
    var dropDown = d3.select("#dropdown_container")
                   .append("select")
                   .attr("class", "selection")
                    .attr("name", "country-list");
        
    var nodeArr = partition.nodes(root);
    var options = dropDown.selectAll("option")
                  .data(nodeArr)
                  .enter()
                  .append("option");
    
	options.text(function (d) {
            var prefix = new Array(d.depth + 1);
			var dropdownValues =  d.name.replace(/[_-]/g, " ");
			return dropdownValues;
		}).attr("value", function (d) {
			var dropdownValues = d.name;
            return dropdownValues;
		});
    
	
        
// transition on click
  function click(d) {
    // fade out all text elements

    path.transition()
      .duration(750)
      .attrTween("d", arcTween(d))
      .each("end", function(e, i) {
          // check if the animated element's data e lies within the visible angle span given in d
          if (e.x >= d.x && e.x < (d.x + d.dx)) {
            // get a selection of the associated text element
            var arcText = d3.select(this.parentNode).select("text");
            // fade in the text element and recalculate positions
            arcText.transition().duration(750)
              .attr("opacity", 1)
              .attr("transform", function() { return "rotate(" + computeTextRotation(e) + ")" })
              .attr("x", function(d) { return y(d.y); });
          }
      });

    };
d3.select(".selection").on("change", function changePie() {
		var value = this.value;
		var index = this.selectedIndex;
		var dataObj = nodeArr[index];
        path[0].forEach(function(p){
            var data = d3.select(p).data();//get the data from the path
            if (data[0].name === value){
                var d = data[0];
                path.transition()
      .duration(750)
      .attrTween("d", arcTween(d))
      .each("end", function(e, i) {
          // check if the animated element's data e lies within the visible angle span given in d
          if (e.x >= d.x && e.x < (d.x + d.dx)) {
            // get a selection of the associated text element
            var arcText = d3.select(this.parentNode).select("text");
            // fade in the text element and recalculate positions
            arcText.transition().duration(750)
              .attr("opacity", 1)
              .attr("transform", function() { return "rotate(" + computeTextRotation(e) + ")" })
              .attr("x", function(d) { return y(d.y); });
          }
      });

            }
        });
		console.log(this.value + " :c " + dataObj["Iron and steel"] + " in " + (dataObj.parent && dataObj.parent.name));
	});


};

d3.json("https://gist.githubusercontent.com/heenaI/cbbc5c5f49994f174376/raw/55c672bbca7991442f1209cfbbb6ded45d5e8c8e/data.json", checkIt);

d3.select(self.frameElement).style("height", height + "px");

// Interpolate the scales!
function arcTween(d) {
  var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
      yd = d3.interpolate(y.domain(), [d.y, 1]),
      yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
  return function(d, i) {
    return i
        ? function(t) { return arc(d); }
        : function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); return arc(d); };
  };
}

function initializeBreadcrumbTrail() {
  // Add the svg area.
  var trail = d3.select("#sequence").append("svg:svg")
      .attr("width", width)
      .attr("height", 50)
      .attr("id", "trail");
  // Add the label at the end, for the percentage.
  trail.append("svg:text")
    .attr("id", "endlabel")
    .style("fill", "#000");
}

function breadcrumbPoints(d, i) {
  var points = [];
  points.push("0,0");
  points.push(b.w + ",0");
  points.push(b.w + b.t + "," + (b.h / 2));
  points.push(b.w + "," + b.h);
  points.push("0," + b.h);
  if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
    points.push(b.t + "," + (b.h / 2));
  }
  return points.join(" ");
}

// Update the breadcrumb trail to show the current sequence and percentage.
function updateBreadcrumbs(nodeArray) {

  // Data join; key function combines name and depth (= position in sequence).
  var g = d3.select("#trail")
      .selectAll("g")
      .data(nodeArray, function(d) { return d.name.replace(/[_-]/g, " ") + d.Total; });

  // Add breadcrumb and label for entering nodes.
  var entering = g.enter().append("svg:g");

  entering.append("svg:polygon")
      .attr("points", breadcrumbPoints)
      .style("fill", "#d3d3d3");

  entering.append("svg:text")
      .attr("x", (b.w + b.t) / 2)
      .attr("y", b.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text(function(d) { return d.name.replace(/[_-]/g, " "); });

  // Set position for entering and updating nodes.
  g.attr("transform", function(d, i) {
    return "translate(" + i * (b.w + b.s) + ", 0)";
  });

  // Remove exiting nodes.
  g.exit().remove();

  // Now move and update the percentage at the end.
  d3.select("#trail").select("#endlabel")
      .attr("x", (nodeArray.length + 0.5) * (b.w + b.s))
      .attr("y", b.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle");

  // Make the breadcrumb trail visible, if it's hidden.
  d3.select("#trail")
      .style("visibility", "");
}
function getAncestors(node) {
  var path = [];
  var current = node;
  while (current.parent) {
    path.unshift(current);
    current = current.parent;
  }
  return path;
}

function mouseover(d) {

var sequenceArray = getAncestors(d);
updateBreadcrumbs(sequenceArray);}