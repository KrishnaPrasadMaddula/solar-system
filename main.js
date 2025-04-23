// Add error handling at the top of the file
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
});

console.log('Starting application...');

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

console.log('Imports successful');

// Initialize global variables
let scene, camera, renderer, labelRenderer, controls;
let planets = [];
let initialCameraPosition = { x: 0, y: 400, z: 0 };
let focusedPlanet = null;
let isTransitioning = false;
let isAnimationPaused = false;
let lastPlanetPositions = [];
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Planet data with descriptions
const planetData = {
    'Sun': {
        description: 'The star at the center of our Solar System, providing light and energy to all the planets.',
        diameter: '1.39 million km',
        type: 'Yellow Dwarf Star',
        distanceFromSun: '0 km (Center)',
        orbitalPeriod: 'N/A',
        surfaceTemp: '5,500°C (surface)',
        color: 0xffff00
    },
    'Mercury': {
        description: 'The smallest and innermost planet in the Solar System, heavily cratered and airless.',
        diameter: '4,879 km',
        type: 'Terrestrial Planet',
        distanceFromSun: '57.9 million km',
        orbitalPeriod: '88 Earth days',
        surfaceTemp: '-180°C to 430°C',
        color: 0x808080
    },
    'Venus': {
        description: 'Often called Earth\'s sister planet due to similar size, but has a toxic atmosphere and extreme temperatures.',
        diameter: '12,104 km',
        type: 'Terrestrial Planet',
        distanceFromSun: '108.2 million km',
        orbitalPeriod: '225 Earth days',
        surfaceTemp: '462°C',
        color: 0xffd700
    },
    'Earth': {
        description: 'Our home planet and the only known planet with life, featuring diverse ecosystems and liquid water.',
        diameter: '12,742 km',
        type: 'Terrestrial Planet',
        distanceFromSun: '149.6 million km',
        orbitalPeriod: '365.25 days',
        surfaceTemp: '-88°C to 58°C',
        color: 0x4169e1
    },
    'Mars': {
        description: 'The Red Planet, featuring massive volcanoes, deep valleys, and potential for past microbial life.',
        diameter: '6,779 km',
        type: 'Terrestrial Planet',
        distanceFromSun: '227.9 million km',
        orbitalPeriod: '687 Earth days',
        surfaceTemp: '-140°C to 20°C',
        color: 0xff4500
    },
    'Jupiter': {
        description: 'The largest planet, a gas giant with a Great Red Spot and powerful magnetic field.',
        diameter: '139,820 km',
        type: 'Gas Giant',
        distanceFromSun: '778.5 million km',
        orbitalPeriod: '11.9 Earth years',
        surfaceTemp: '-110°C (cloud top)',
        color: 0xffa500
    },
    'Saturn': {
        description: 'Famous for its spectacular ring system, composed mainly of ice particles and rocky debris.',
        diameter: '116,460 km',
        type: 'Gas Giant',
        distanceFromSun: '1.4 billion km',
        orbitalPeriod: '29.5 Earth years',
        surfaceTemp: '-140°C (cloud top)',
        color: 0xffd700
    },
    'Uranus': {
        description: 'An ice giant that rotates on its side, with a unique magnetic field and faint ring system.',
        diameter: '50,724 km',
        type: 'Ice Giant',
        distanceFromSun: '2.9 billion km',
        orbitalPeriod: '84 Earth years',
        surfaceTemp: '-195°C (cloud top)',
        color: 0x00ffff
    },
    'Neptune': {
        description: 'The windiest planet with speeds up to 2,100 km/h, featuring a dynamic atmosphere and dark spots.',
        diameter: '49,244 km',
        type: 'Ice Giant',
        distanceFromSun: '4.5 billion km',
        orbitalPeriod: '165 Earth years',
        surfaceTemp: '-200°C (cloud top)',
        color: 0x4169e1
    },
    'Pluto ☄️': {
        description: 'A dwarf planet in the Kuiper belt, featuring a heart-shaped region and multiple moons.',
        diameter: '2,377 km',
        type: 'Dwarf Planet',
        distanceFromSun: '5.9 billion km (average)',
        orbitalPeriod: '248 Earth years',
        surfaceTemp: '-230°C',
        color: 0x8B4513
    }
};

// Moon data
const moonData = {
    'Earth': ['Moon'],
    'Mars': ['Phobos', 'Deimos'],
    'Jupiter': ['Io', 'Europa', 'Ganymede', 'Callisto'],
    'Saturn': ['Titan', 'Rhea', 'Iapetus', 'Enceladus', 'Dione', 'Tethys'],
    'Uranus': ['Titania', 'Oberon', 'Umbriel', 'Ariel', 'Miranda'],
    'Neptune': ['Triton', 'Nereid', 'Naiad'],
    'Pluto ☄️': ['Charon', 'Nix', 'Hydra']
};

function init() {
    console.log('Initializing application...');

    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 300, 0); // Position camera directly above
    camera.lookAt(0, 0, 0);

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    // Label renderer setup
    labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    document.body.appendChild(labelRenderer.domElement);

    // Controls setup
    controls = new OrbitControls(camera, labelRenderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 20;
    controls.maxDistance = 500;
    controls.maxPolarAngle = Math.PI / 2; // Limit rotation to prevent going below the plane
    controls.minPolarAngle = 0; // Allow full rotation to top view
    controls.update();

    // Store initial camera position for reset
    initialCameraPosition = { x: 0, y: 300, z: 0 };

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    console.log('Setting up celestial bodies...');

    // Create celestial bodies
    createSun();
    createPlanets();
    createMoons();

    // Event listeners
    console.log('Setting up event listeners...');
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('click', onMouseClick);

    // Hide loading message
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }

    console.log('Initialization complete');
    animate();
}

function onMouseClick(event) {
    console.log('Click detected');
    
    // Calculate mouse position
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Get all meshes in the scene that could be clicked
    const clickableMeshes = [];
    scene.traverse((object) => {
        if (object.isMesh) {
            clickableMeshes.push(object);
        }
    });

    // Calculate intersections
    const intersects = raycaster.intersectObjects(clickableMeshes, true);
    console.log('Intersections found:', intersects.length);

    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        console.log('Clicked object:', clickedObject.name);

        // Find the corresponding planet or sun
        if (clickedObject.name === 'Sun') {
            showPlanetInfo({ mesh: clickedObject });
        } else {
            const planet = planets.find(p => 
                p.mesh === clickedObject || 
                p.mesh.children.includes(clickedObject) ||
                (p.satellites && p.satellites.some(s => s.mesh === clickedObject))
            );
            if (planet) {
                console.log('Found planet:', planet.mesh.name);
                showPlanetInfo(planet);
            }
        }
    }
}

function createSun() {
    const sunGeometry = new THREE.SphereGeometry(20, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffdd00,
        emissive: 0xffff00,
        emissiveIntensity: 0.5
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.name = 'Sun';
    scene.add(sun);

    const sunLabel = createLabel('Sun');
    sunLabel.position.x = 22;
    sunLabel.position.y = 0;
    sun.add(sunLabel);
}

function createPlanets() {
    const planetConfigs = [
        { name: 'Mercury', radius: 7.0, color: 0xa5a5a5, orbit: 28, speed: 0.004 },
        { name: 'Venus', radius: 7.0, color: 0xffd085, orbit: 40, speed: 0.003 },
        { name: 'Earth', radius: 7.0, color: 0x2b34b2, orbit: 55, speed: 0.002 },
        { name: 'Mars', radius: 7.0, color: 0xc1440e, orbit: 75, speed: 0.0016 },
        { name: 'Jupiter', radius: 7.0, color: 0xd8ca9d, orbit: 100, speed: 0.001 },
        { name: 'Saturn', radius: 7.0, color: 0xead6b8, orbit: 138, speed: 0.0008 },
        { name: 'Uranus', radius: 7.0, color: 0x82b3d1, orbit: 176, speed: 0.0006 },
        { name: 'Neptune', radius: 7.0, color: 0x2b67b2, orbit: 200, speed: 0.0004 },
        { name: 'Pluto ☄️', radius: 7.0, color: 0x7c6a5c, orbit: 230, speed: 0.0002 }
    ];

    planets = planetConfigs.map(config => {
        const planet = createPlanet(
            config.name,
            config.radius,
            config.color,
            config.orbit,
            config.speed
        );
        createOrbitLine(config.orbit);
        return planet;
    });
}

function createLabel(name) {
    const div = document.createElement('div');
    div.className = 'label';
    div.style.color = 'white';
    div.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
    div.style.padding = '2px 6px';
    div.style.borderRadius = '3px';
    div.style.fontSize = '12px';
    div.textContent = name;
    return new CSS2DObject(div);
}

function createOrbitLine(radius) {
    const curve = new THREE.EllipseCurve(
        0, 0,
        radius, radius,
        0, 2 * Math.PI,
        false,
        0
    );

    const points = curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ 
        color: 0x666666,
        transparent: true,
        opacity: 0.5
    });
    const ellipse = new THREE.Line(geometry, material);
    ellipse.rotation.x = Math.PI / 2;
    scene.add(ellipse);
    return ellipse;
}

function createPlanet(name, radius, color, orbitRadius, orbitSpeed) {
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.MeshPhongMaterial({ 
        color: color,
        shininess: 30,
        specular: new THREE.Color(0x333333)
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;

    // Add rings for Saturn
    if (name === 'Saturn') {
        const ringGeometry = new THREE.RingGeometry(radius * 1.4, radius * 2.2, 64);
        const ringMaterial = new THREE.MeshPhongMaterial({
            color: 0xc5a880,
            side: THREE.DoubleSide,
            opacity: 0.8,
            transparent: true
        });
        const rings = new THREE.Mesh(ringGeometry, ringMaterial);
        rings.rotation.x = Math.PI / 2;
        mesh.add(rings);
    }

    const planet = {
        mesh: mesh,
        orbitRadius: orbitRadius,
        angle: Math.random() * Math.PI * 2,
        speed: orbitSpeed,
        satellites: []
    };

    const label = createLabel(name);
    label.position.x = radius + 2;
    label.position.y = 0;
    planet.mesh.add(label);

    scene.add(planet.mesh);
    return planet;
}

function createMoons() {
    // Add Earth's moon
    createSatellite(planets[2], '', 1.5, 0xcccccc, 8, 0.004);

    // Add Mars' moons
    createSatellite(planets[3], '', 1.2, 0xcccccc, 4, 0.005);
    createSatellite(planets[3], '', 1.2, 0xcccccc, 6, 0.004);

    // Add Jupiter's moons
    for (let i = 0; i < 4; i++) {
        createSatellite(planets[4], '', 1.5, 0xcccccc, 12 + i * 3, 0.003);
    }

    // Add Saturn's moons
    const saturnMoonData = [
        { radius: 1.5, orbit: 13, speed: 0.0024 },
        { radius: 1.2, orbit: 16, speed: 0.002 },
        { radius: 1.2, orbit: 19, speed: 0.0018 },
        { radius: 1.2, orbit: 11, speed: 0.0028 },
        { radius: 1.2, orbit: 14, speed: 0.0022 },
        { radius: 1.2, orbit: 17, speed: 0.002 }
    ];

    saturnMoonData.forEach(moon => {
        createSatellite(planets[5], '', moon.radius, 0xcccccc, moon.orbit, moon.speed);
    });
}

function createSatellite(planet, name, radius, color, orbitRadius, orbitSpeed) {
    if (!scene || !planet) return;

    const satellite = {
        mesh: new THREE.Mesh(
            new THREE.SphereGeometry(radius, 32, 32),
            new THREE.MeshPhongMaterial({ 
                color: color,
                shininess: 30
            })
        ),
        orbitRadius: orbitRadius,
        angle: Math.random() * Math.PI * 2,
        speed: orbitSpeed
    };
    
    scene.add(satellite.mesh);
    if (!planet.satellites) {
        planet.satellites = [];
    }
    planet.satellites.push(satellite);
}

function focusOnPlanet(planet) {
    if (!planet || isTransitioning) return;
    
    // Don't change camera or planet positions
    isTransitioning = true;
    focusedPlanet = planet;

    // Show planet info
    showPlanetInfo(planet);

    isTransitioning = false;
}

function createMoonSystem(planet) {
    // Clear any existing moon orbits
    scene.children.forEach(child => {
        if (child.isMoonOrbit) {
            scene.remove(child);
        }
    });

    if (!planet.satellites || planet.satellites.length === 0) return;

    // Create orbit paths for moons
    planet.satellites.forEach((moon, index) => {
        // Create orbit line
        const curve = new THREE.EllipseCurve(
            0, 0,
            moon.orbitRadius, moon.orbitRadius,
            0, 2 * Math.PI,
            false,
            0
        );

        const points = curve.getPoints(50);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ 
            color: 0x4444ff,
            opacity: 0.5,
            transparent: true 
        });
        
        const orbitLine = new THREE.Line(geometry, material);
        orbitLine.rotation.x = Math.PI / 2;
        orbitLine.isMoonOrbit = true;
        scene.add(orbitLine);

        // Position moon
        moon.mesh.position.set(
            moon.orbitRadius * Math.cos(moon.angle),
            0,
            moon.orbitRadius * Math.sin(moon.angle)
        );
    });
}

function showPlanetInfo(planet) {
    console.log('Showing info for:', planet.mesh.name);
    const planetInfo = planetData[planet.mesh.name];
    if (!planetInfo) {
        console.error('No data found for planet:', planet.mesh.name);
        return;
    }

    // Remove any existing info panel
    const existingInfo = document.querySelector('.planet-info');
    if (existingInfo) {
        existingInfo.remove();
    }

    const infoContainer = document.createElement('div');
    infoContainer.className = 'planet-info';
    
    const content = `
        <div class="planet-info-header">
            <h2>${planet.mesh.name}</h2>
            <button class="close-info-button" onclick="closeInfo()">×</button>
        </div>
        <p><strong>Type:</strong> ${planetInfo.type}</p>
        <p><strong>Diameter:</strong> ${planetInfo.diameter}</p>
        <p><strong>Distance from Sun:</strong> ${planetInfo.distanceFromSun}</p>
        <p><strong>Orbital Period:</strong> ${planetInfo.orbitalPeriod}</p>
        <p><strong>Temperature:</strong> ${planetInfo.surfaceTemp}</p>
        <p>${planetInfo.description}</p>
        ${createMoonsList(planet.mesh.name)}
    `;

    infoContainer.innerHTML = content;
    document.body.appendChild(infoContainer);
    console.log('Info panel added to document');
}

function createMoonsList(planetName) {
    const moons = moonData[planetName];
    if (!moons || moons.length === 0) return '<p>No moons</p>';

    return `
        <div class="moons-list">
            <h3>Major Moons:</h3>
            <ul>
                ${moons.map(moon => `<li>${moon}</li>`).join('')}
            </ul>
        </div>
    `;
}

// Add closeInfo function to window object
window.closeInfo = function() {
    console.log('Closing info panel');
    const infoPanel = document.querySelector('.planet-info');
    if (infoPanel) {
        infoPanel.remove();
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    if (!isAnimationPaused) {
        planets.forEach(planet => {
            planet.angle += planet.speed;
            planet.mesh.position.x = Math.cos(planet.angle) * planet.orbitRadius;
            planet.mesh.position.z = Math.sin(planet.angle) * planet.orbitRadius;
            
            planet.satellites?.forEach(satellite => {
                satellite.angle += satellite.speed;
                const satelliteX = Math.cos(satellite.angle) * satellite.orbitRadius;
                const satelliteZ = Math.sin(satellite.angle) * satellite.orbitRadius;
                satellite.mesh.position.x = planet.mesh.position.x + satelliteX;
                satellite.mesh.position.z = planet.mesh.position.z + satelliteZ;
            });
        });
    } else if (focusedPlanet) {
        // Keep only the focused planet's moons rotating
        focusedPlanet.satellites.forEach(satellite => {
            satellite.angle += satellite.speed;
            const satelliteX = Math.cos(satellite.angle) * satellite.orbitRadius;
            const satelliteZ = Math.sin(satellite.angle) * satellite.orbitRadius;
            satellite.mesh.position.x = focusedPlanet.mesh.position.x + satelliteX;
            satellite.mesh.position.z = focusedPlanet.mesh.position.z + satelliteZ;
        });
    }

    controls.update();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}

// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', init); 