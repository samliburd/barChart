import * as d3 from "d3";

// Load data
const jsonData = await d3.json("../data/GDP-data.json");
const data = jsonData.data;

// Define sizes and constants
const size = {
  width: 875,
  height: 600,
  padding: 50,
  barWidth: null
};

const tooltipSize = {
  width: 250,
  height: 50,
  padding: 5,
  offset: 25,
  borderRadius: 5,
};

size.barWidth = (size.width / data.length);

// Calculate domains
const calculateDomain = (data) => {
  const dateExtent = d3.extent(data.map((d) => new Date(d[0])));
  const gdpExtent = d3.extent(data.map((d) => d[1]));
  // Adjust the end date by adding 3 months
  dateExtent[1] = new Date(dateExtent[1].setMonth(dateExtent[1].getMonth() + 3));

  return [dateExtent, gdpExtent];
};

const [dateDomain, gdpDomain] = calculateDomain(data);

// Create scales
const xScale = d3.scaleTime()
  .domain(dateDomain)
  .range([size.padding, size.width]);

const yScale = d3.scaleLinear()
  .domain(gdpDomain).nice()
  .range([size.height - size.padding, size.padding]);



const invertScale = (d) => {
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return [xScale.invert(d[0]).toLocaleString('en-GB', options), Math.round(yScale.invert(d[1]))];
};

let currencyFormat = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'});

// Create axes
const xAxis = d3.axisBottom(xScale)
  .ticks(20)
  .tickSizeOuter(0)
  .tickPadding(5);

const yAxis = d3.axisLeft(yScale)
  .ticks(10);

// Create container and tooltip
const container = d3.select("div")
  .style("width", `${size.width}px`)
  .style("height", `${size.height}px`)
  .style("background-color", "#EEE");

const renderTooltip = (t) => {
  const { width, height, padding, offset, borderRadius } = t;
  const styles = {
    position: "absolute",
    opacity: 0,
    width: `${t.width}px`,
    height: `${t.height}px`,
    padding: `${t.padding}px`,
    "border-radius": "5px",  // Note: in JavaScript object keys, it's camelCase, not kebab-case
    "background-color": "#CCC"
  }

  const tooltip = d3.select('.container')
    .append('div')
    .attr('id', 'tooltip')
    // .style("position", "absolute")
    // .style('opacity', 0)
    // .style("width", `${t.width}px`)
    // .style("height", `${t.height}px`)
    // .style("padding", `${t.padding}px`)
    // .style("border-radius", "5px")
    // .style("background-color", "#CCC");
  Object.entries(styles).forEach(([prop,val]) => d3.select("#tooltip").style(prop,val))

  return tooltip
};

// Render SVG and its components
const renderSVG = () => {
  const parsedData = data.map((d) => {
    return [xScale(new Date(d[0])), yScale(d[1])];
  });
  const tooltip = renderTooltip(tooltipSize);

  const renderAxes = (svg) => {
    svg.append("g")
      .attr("transform", `translate(0, ${size.height - size.padding})`)
      .call(xAxis);

    svg.append("g")
      .attr("transform", `translate(${size.padding}, ${0})`)
      .call(yAxis);
  };

  const handleMouseOver = function (event, d) {
    let dataValueDate = this.getAttribute("data-value-date");
    let dataValueGdp = this.getAttribute("data-value-gdp");
    let { width, height, padding, offset, borderRadius } = tooltipSize;
    let pageX = event.pageX;
    let tooltipX = pageX - width - padding - (size.padding * 2);

    tooltip.style("opacity", 1)
      .html(`<strong>Date: </strong>${dataValueDate}<br/><strong>GDP: </strong>${currencyFormat.format(Number(dataValueGdp))}`)
      .style("top", `${event.pageY - 100}px`)
      .style("height", "fit-content")
      .attr("pageX", pageX)
      .attr("tooltipX", tooltipX);

    if (tooltipX < 10) {
      tooltip.style("left", `${pageX + size.padding}px`);
    } else {
      tooltip.style("left", `${pageX - width - padding - size.padding}px`);
    }
  };

  const plotBars = (svg) => {
    svg.selectAll("rect")
      .data(parsedData)
      .enter()
      .append("rect")
      .attr("width", size.barWidth)
      .attr("height", (d) => size.height - d[1] - size.padding)
      .attr("x", (d) => d[0])
      .attr("y", (d) => d[1] - 1)
      .attr("index", (d, i) => i)
      .attr("data-value-date", (d) => `${invertScale(d)[0]}`)
      .attr("data-value-gdp", (d) => `${invertScale(d)[1]}`)
      .attr("fill", (d, i) => (i % 2 === 0 ? "#CCC" : "#AAA"))
      .on("mouseover", handleMouseOver)
      .on("mouseout", function () {
        tooltip.style("opacity", 0);
      });
  };

  const svg = container
    .append("svg")
    .attr("width", size.width + 50)
    .attr("height", size.height);

  renderAxes(svg);
  plotBars(svg);
};

renderSVG();
