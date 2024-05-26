import * as d3 from 'd3';
import { feature } from 'topojson-client';
import land_data from './data/land-110m.json';

const dataPath = '/data/land-110m.json';


// Dimensions and projection
let width = window.innerWidth, height = window.innerHeight;

const projection = d3.geoOrthographic()
    .scale(height / 1.5) // Adjust scale based on height for a farther out view
    .translate([width / 2, height / 1.3])
    .clipAngle(90);

const path = d3.geoPath().projection(projection);

// SVG container
const svg = d3.select('#world').append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('background', 'radial-gradient(circle, rgba(48,16,255,1) 0%, rgba(0,0,0,1) 100%)'); // Space skybox effect

// Load and display the World
d3.json(dataPath).then(world => {
    svg.selectAll('path')
        .data(feature(world, world.objects.land).features)
        .enter().append('path')
        .attr('d', path)
        .attr('fill', 'steelblue');

    // Call the initial zoom function
    zoomToSanFrancisco();
});

// Zoom to San Francisco function
function zoomToSanFrancisco() {
    const sanFrancisco = [-122.4194, 37.7749]; // Longitude, Latitude
    const initialRotation = [-33.5837, 22.2087];


    svg.transition()
        .duration(1000) // Additional transition to zoom to San Francisco
        .tween('rotate', () => {
            const rotate = d3.interpolate(initialRotation, [-sanFrancisco[0], -sanFrancisco[1]]);
            return t => {
                projection.rotate(rotate(t));
                svg.selectAll('path').attr('d', path);
            };
        })
        .on('end', () => {
            addMarker(sanFrancisco);
            setTimeout(startRotationLoop, 5000); // Show the marker for 3 seconds before continuing

        });
}

// Add marker function
function addMarker(coordinates) {
    const [x, y] = projection(coordinates);

    const [x_offset, y_offset] = [-126, -125]

    // Group for marker elements
    const markerGroup = svg.append('g')
        .attr('class', 'marker-group')
        .datum({ coordinates })
        .attr('transform', `translate(${x}, ${y})`)
        .style('cursor', 'pointer');

    markerGroup.append('circle')
        .attr('r', 12)
        .attr('fill', 'rgba(120, 81, 169, 0.8)')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);

    const textBox = markerGroup.append('rect')
        .attr('x', 15 + x_offset)
        .attr('y', -20 + y_offset)
        .attr('width', 216)
        .attr('height', 115)
        .attr('fill', 'rgba(0, 0, 0, 0.8)')
        .attr('stroke', 'black')
        .attr('stroke-width', 1)
        .attr('rx', 5)
        .attr('ry', 5);

    const text = markerGroup.append('text')
        .attr('x', 20 + x_offset)
        .attr('y', -5 + y_offset)
        .attr('fill', 'white')
        .style('font-size', '16px')
        .style('font-family', 'Roboto, sans-serif');

    const text_x = 30 + x_offset
    text.append('tspan')
        .attr('x', text_x)
        .attr('dy', '1.2em')
        .text('MAXWELL VOLZ');

    text.append('tspan')
        .attr('x', text_x)
        .attr('dy', '1.2em')
        .text('-122.419, 37.774');

    text.append('tspan')
        .attr('x', text_x)
        .attr('dy', '1.2em')
        .text('SOFTWARE ENGINEER');

    text.append('tspan')
        .attr('x', text_x)
        .attr('dy', '1.2em')
        .text('PROJECT // GLOBESITE');

    markerGroup.on('mouseover', () => {
        textBox.attr('fill', 'white')
        text.attr('fill', 'black')
    });
    markerGroup.on('mouseout', () => {
        textBox.attr('fill', 'black')
        text.attr('fill', 'white')
    });
    // markerGroup.on('click', () => {
    //     window.open('https://github.com/maxwellvolz', '_blank');
    // });

}

// Remove marker function
function removeMarker() {
    svg.selectAll('.marker-group').remove();
}

// Start rotation loop function
function startRotationLoop() {
    const rotateAmount = 360; // +/- 360 degrees for random location
    const taperDuration = 2000; // Taper duration for easing in and out
    const delayDuration = 5000; // Delay duration between rotations

    // Load random coordinates from file
    d3.json('/data/random-coords.json').then(data => {
        const coordinates = data.coordinates;

        function getRandomCoordinates() {
            const index = Math.floor(Math.random() * coordinates.length);
            return coordinates[index];
        }

        function rotateToLocation(location, callback) {
            svg.transition()
                .duration(3000)
                .ease(d3.easeSinInOut)
                .tween('rotate', () => {
                    const currentRotation = projection.rotate();
                    const rotate = d3.interpolate(currentRotation, [-location[0], -location[1]]);
                    return t => {
                        projection.rotate(rotate(t));
                        svg.selectAll('path').attr('d', path);
                    };
                })
                .on('end', callback);
        }

        function rotateLoop() {
            const randomLocation = getRandomCoordinates();
            const sanFrancisco = [-122.4194, 37.7749];

            // Remove the marker before starting the rotation
            removeMarker();

            // Rotate to random location
            rotateToLocation(randomLocation, () => {
                // Delay before rotating back to San Francisco
                setTimeout(() => {
                    // Rotate back to San Francisco and show the marker
                    rotateToLocation(sanFrancisco, () => {
                        addMarker(sanFrancisco);
                        // Delay before starting the next loop
                        setTimeout(rotateLoop, delayDuration);
                    });
                }, delayDuration);
            });
        }

        rotateLoop(); // Start the rotation loop
    });
}

// Function to resize the SVG and projection
function resize() {
    width = window.innerWidth;
    height = window.innerHeight;

    projection
        .scale(height / 3)
        .translate([width / 2, height / 2]);

    svg
        .attr('width', width)
        .attr('height', height);

    svg.selectAll('path').attr('d', path);
    svg.selectAll('.marker-group').attr('transform', d => {
        const [x, y] = projection(d.coordinates);
        return `translate(${x}, ${y})`;
    });
}
// Listen for resize events
window.addEventListener('resize', resize);

