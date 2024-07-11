import * as d3 from "d3";
import { colours } from './colours.js';

const size = {
  width: 875,
  height: 600,
  padding: 50,
  barWidth: 875 / 275
}

function applyProperties(properties, selection, type) {
  Object.entries(properties).forEach(([prop, val]) => {
    if (type === "style") {
      selection.style(prop, val);
    } else if (type === "attr") {
      selection.attr(prop, val);
    }
  });
};

function parseData(data) {
  const dates = data.map(d => new Date(d[0]));
  const gdp = data.map(d => d[1]);
  return {dates, gdp}
}

function createScales(data, size) {
  function calculateDomain(data) {
    return d3.extent(data)
  }

  const extent = {
    x: calculateDomain(data.dates),
    y: calculateDomain(data.gdp)
  }
  return {
    x: d3.scaleTime().domain(extent.x).range([size.padding, size.width]),
    y: d3.scaleLinear().domain(extent.y).range([size.height - size.padding, size.padding])
  }

}

function draw(scale) {
  const container = d3.select("div")
  const svg = container.append("svg")
    .attr("width", size.width)
    .attr("height", size.height)
  const xAxis = d3.axisBottom(scale.x)
  const yAxis = d3.axisLeft(scale.y)
  svg.append("g")
    .attr("transform", `translate(0, ${size.height - size.padding})`)
    .call(xAxis)
    .selectAll("text")
    .style("fill", colours["Dark Teal"]); // Set axis text colour

  svg.append("g")
    .attr("transform", `translate(${size.padding}, ${0})`)
    .call(yAxis)
    .selectAll("text")
    .style("fill", colours["Dark Teal"]); // Set axis text colour

}

async function loadData() {
  // Load data
  const jsonData = await d3.json("../data/GDP-data.json");
  return jsonData.data;
}


loadData()
  .then(data => {

    const scale = createScales(parseData(data), size)
    // console.log(scale.x(new Date(data[0][0])))
    draw(scale)
  })

