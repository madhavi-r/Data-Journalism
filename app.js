// @TODO: YOUR CODE HERE!

var svgWidth = 860;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 150,
  left: 150
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "obesity";

// function used for updating x-scale & y-scale var upon click on axis label
function xScale(Data, chosenXAxis){
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(Data, d => d[chosenXAxis]) * 0.9,
              d3.max(Data, d => d[chosenXAxis]) * 1.1])      
      .range([0, width]);
    return xLinearScale;
}
function yScale(Data, chosenYAxis){
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(Data, d => d[chosenYAxis]) * 0.75, 
              d3.max(Data, d => d[chosenYAxis]) * 1.25])
      .range([height, 0]);
    return yLinearScale;
}

// function used for updating xAxis & yAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
    return xAxis;
  }
function renderYaxes(newYScale, yAxis){
  var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  return yAxis; 
}
// function used for updating circles group with a transition to
// new circles
function renderXCircles(tGroup, newXScale, chosenXAxis) {
    tGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]));
    return tGroup;
}
function renderXText(textGroup, newXScale, chosenXAxis){
    textGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]));
    return textGroup; 
}
function renderYCircles(tGroup, newYScale, chosenYAxis) {
  tGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));
  return tGroup;
}
function renderYText(textGroup, newYScale, chosenYAxis) {
  textGroup.transition()
    .duration(1000)
    .attr("y", d => newYScale(d[chosenYAxis]));
  return textGroup; 
}
    
// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv")
.then(function(Data){
    // if (err) throw err;

    // Step 1: Parse Data/Cast as numbers
    // ==============================
    Data.forEach(function(d) {
      d.poverty = +d.poverty;
      d.age = +d.age;
      d.income = +d.income;
      d.healthcare = +d.healthcare;
      d.smokes = +d.smokes;
      d.obesity = +d.obesity;
    });
  
    // xLinearScale function above csv import
    // =======================================
    var xLinearScale = xScale(Data, chosenXAxis);

    // Create y scale function
    var yLinearScale = yScale(Data, chosenYAxis);

    // Step 3: Create axis functions
    // ==============================
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Step 4: Append Axes to the chart
    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
        .call(leftAxis);

    // Step 5: append initial circles
    // ==============================
    var circlesGroup = chartGroup.selectAll("circle")
    .data(Data)
    .enter()
    
    var tGroup = circlesGroup.append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", "10").attr("fill", "lightblue")
    .attr("opacity", ".5");

    var textGroup = circlesGroup.selectAll("null")
    .data(Data)
    .enter()
    .append("text")
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    .attr("text-anchor","middle")
    .attr("font-size", 8)
    .attr("text-color","black")
    .text(d => d.abbr)
    .on("mouseover",function(x1){
      toolTip.show(x1, this)
     }).on("mouseout",function(x1){
      toolTip.hide(x1)
     });

     var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(function(data) {
        return (`${data.state}<br>${chosenXAxis} : ${data[chosenXAxis]}<br>${chosenYAxis} : ${data[chosenYAxis]}%`);
      });
   
    chartGroup.call(toolTip);

    tGroup.on("mouseover", function(data) {
        toolTip.show(data,this);
      })
        // onmouseout event
        .on("mouseout", function(data, index) {
          toolTip.hide(data);
        });
    
    var xlabelsGroup = chartGroup.append("g")
          .attr("transform", `translate(${width / 2}, ${height + 20})`);
    
    var ylabelsGroup = chartGroup.append("g");
           
    var povertyLabel = xlabelsGroup
      .append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .text("In Poverty (%)");

    var ageLabel = xlabelsGroup
      .append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age") // value to grab for event listener
      .classed("inactive", true)
      .text("Age (Median)");

    var incomeLabel = xlabelsGroup
      .append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "income") // value to grab for event listener
      .classed("inactive", true)
      .text("Household Income (Median)");

    // append y axis 
    var obesityLabel = ylabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 40)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("value","obesity")
      .classed("active", true)
      .text("Obesity (%)");

    var smokesLabel = ylabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 60)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("value","smokes")
      .classed("inactive", true)
      .text("Smokes (%)");

    var healthcareLabel = ylabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 80)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("value","healthcare")
      .classed("inactive", true)
      .text("Lacks HealthCare (%)");

    // x axis labels event listener
    xlabelsGroup.selectAll("text")
      .on("click", function() {
    // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        chosenXAxis = value;
        
        console.log(chosenXAxis);
        console.log(chosenYAxis);
        xLinearScale = xScale(Data, chosenXAxis);
        
        xAxis = renderAxes(xLinearScale, xAxis);
    
      // updates circles with new x values
        tGroup = renderXCircles(tGroup, xLinearScale, chosenXAxis);
        textGroup = renderXText(textGroup, xLinearScale, chosenXAxis);

      // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
              .classed("active", false)
              .classed("inactive", true);
        }
        else if (chosenXAxis === "age"){
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
              .classed("active", false)
              .classed("inactive", true);
        }
        else {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
              .classed("active", true)
              .classed("inactive", false);
        }
      }
    });
    
    ylabelsGroup.selectAll("text")
      .on("click", function() {
    // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {

      // replaces chosenYAxis with value
        chosenYAxis = value;
        yLinearScale = yScale(Data, chosenYAxis);
        yAxis = renderYaxes(yLinearScale, yAxis);

      // updates circles with new x values
        tGroup = renderYCircles(tGroup, yLinearScale, chosenYAxis);
        textGroup = renderYText(textGroup, yLinearScale, chosenYAxis);
         
        if (chosenYAxis === "obesity") {
            obesityLabel
              .classed("active", true)
              .classed("inactive", false);
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
            healthcareLabel
                .classed("active", false)
                .classed("inactive", true);
          }
          else if (chosenYAxis === "smokes") {
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
            smokesLabel
              .classed("active", true)
              .classed("inactive", false);
            healthcareLabel
                .classed("active", false)
                .classed("inactive", true);
          }
          else {
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
            healthcareLabel
              .classed("active", true)
              .classed("inactive", false);
          }
      }
    });
});