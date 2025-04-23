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
let orbitLines = []; // Array to store orbit lines
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

// Add satellite data after planetData
const satelliteData = {
    'Moon': {
        description: 'Earth\'s only natural satellite, the Moon influences our tides and has been visited by humans.',
        diameter: '3,475 km',
        type: 'Natural Satellite',
        distanceFromPlanet: '384,400 km',
        orbitalPeriod: '27.3 Earth days',
        surfaceTemp: '-233°C to 123°C'
    },
    'Phobos': {
        description: 'The larger and inner of Mars\'s two moons, Phobos is gradually spiraling closer to Mars.',
        diameter: '22.2 km',
        type: 'Natural Satellite',
        distanceFromPlanet: '9,377 km',
        orbitalPeriod: '7.7 hours',
        surfaceTemp: '-40°C'
    },
    'Deimos': {
        description: 'The smaller and outer of Mars\'s two moons, Deimos orbits Mars every 30.3 hours.',
        diameter: '12.6 km',
        type: 'Natural Satellite',
        distanceFromPlanet: '23,460 km',
        orbitalPeriod: '30.3 hours',
        surfaceTemp: '-40°C'
    }
};

// Add expanded data objects after the existing data objects
const expandedPlanetData = {
    'Sun': {
        composition: 'Primarily hydrogen (73%) and helium (25%)',
        mass: '1.989 × 10^30 kg',
        age: '4.6 billion years',
        rotation: '27 days at equator',
        atmosphere: 'Complex layers including photosphere, chromosphere, and corona',
        magneticField: 'Extremely powerful, extends throughout solar system',
        funFacts: [
            'The Sun contains 99.86% of the solar system\'s mass',
            'The core temperature is about 15 million °C',
            'Light takes 8 minutes and 20 seconds to reach Earth'
        ]
    },
    'Mercury': {
        composition: 'Iron core (60-70%), silicate crust',
        mass: '3.285 × 10^23 kg',
        atmosphere: 'Extremely thin, composed mainly of oxygen, sodium, and hydrogen',
        magneticField: 'Weak, about 1% as strong as Earth\'s',
        craters: 'Heavily cratered surface, largest crater is Caloris Basin (1,550 km)',
        funFacts: [
            'Smallest planet in our solar system',
            'Has the largest daily temperature range of any planet',
            'Makes 3 rotations for every 2 orbits of the Sun'
        ]
    },
    'Venus': {
        composition: 'Rocky planet with thick atmosphere',
        mass: '4.867 × 10^24 kg',
        atmosphere: '96% carbon dioxide, extremely dense',
        rotation: 'Retrograde rotation (east to west)',
        volcanoes: 'Over 1,600 major volcanoes',
        funFacts: [
            'Hottest planet despite not being closest to Sun',
            'Called Earth\'s sister planet due to similar size',
            'Day is longer than its year'
        ]
    }
    // ... Add more expanded data for other planets
};

const expandedSatelliteData = {
    'Moon': {
        composition: 'Rocky body with iron-rich core',
        mass: '7.34767309 × 10^22 kg',
        gravity: '1.62 m/s²',
        atmosphere: 'Extremely thin, technically an "exosphere"',
        formation: 'Likely formed from Earth debris after giant impact',
        exploration: 'First visited by humans in 1969 (Apollo 11)',
        features: [
            'Mare (dark basaltic plains)',
            'Highland regions',
            'Impact craters',
            'Rilles and valleys'
        ],
        funFacts: [
            'Always shows the same face to Earth',
            'Has moonquakes',
            'Contains water ice in permanently shadowed craters'
        ]
    },
    'Phobos': {
        composition: 'Possibly captured asteroid',
        mass: '1.06 × 10^16 kg',
        gravity: '0.0057 m/s²',
        features: [
            'Heavily cratered surface',
            'Covered in regolith',
            'Notable Stickney crater'
        ],
        funFacts: [
            'Will eventually crash into Mars or break apart',
            'Orbits Mars faster than Mars rotates',
            'Creates solar eclipses on Mars almost daily'
        ]
    },
    'Deimos': {
        composition: 'Similar to C-type asteroids',
        mass: '1.48 × 10^15 kg',
        gravity: '0.003 m/s²',
        features: [
            'Smooth surface with regolith',
            'Two main craters: Voltaire and Swift'
        ],
        funFacts: [
            'May escape Mars\'s gravity in the future',
            'Takes 30.3 hours to orbit Mars',
            'Appears almost stationary from Mars\'s surface'
        ]
    }
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
    controls.dampingFactor = 0.15;
    controls.minDistance = 10;
    controls.maxDistance = 500;
    controls.rotateSpeed = 0.5;
    controls.zoomSpeed = 0.8;
    controls.panSpeed = 0.5;
    controls.maxPolarAngle = Math.PI * 0.85;
    controls.minPolarAngle = 0.1;
    controls.enablePan = true;
    controls.update();

    // Store initial camera position for reset
    initialCameraPosition = { x: 0, y: 300, z: 0 };

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Add a hemisphere light for better overall illumination
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
    scene.add(hemisphereLight);

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
    if (isTransitioning) return;
    
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

        // Check if clicked object is a satellite
        if (clickedObject.name && satelliteData[clickedObject.name]) {
            showSatelliteInfo(clickedObject.name);
            return;
        }

        // Find the corresponding planet or sun
        if (clickedObject.name === 'Sun') {
            focusOnPlanet({ mesh: clickedObject });
        } else {
            const planet = planets.find(p => 
                p.mesh === clickedObject || 
                p.mesh.children.includes(clickedObject) ||
                (p.satellites && p.satellites.some(s => s.mesh === clickedObject))
            );
            if (planet) {
                console.log('Found planet:', planet.mesh.name);
                focusOnPlanet(planet);
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
    // Create the main orbit line
    const curve = new THREE.EllipseCurve(
        0, 0,
        radius, radius,
        0, 2 * Math.PI,
        false,
        0
    );

    const points = curve.getPoints(200); // More points for smoother line
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    // Create the main visible line
    const material = new THREE.LineBasicMaterial({ 
        color: 0x00ffff,
        transparent: true,
        opacity: 0.6,
        linewidth: 2
    });
    const ellipse = new THREE.Line(geometry, material);
    ellipse.rotation.x = Math.PI / 2;

    // Create a wider glow line
    const glowMaterial = new THREE.LineBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.2,
        linewidth: 4
    });
    const glowLine = new THREE.Line(geometry, glowMaterial);
    glowLine.rotation.x = Math.PI / 2;
    glowLine.scale.multiplyScalar(1.002); // Slightly larger radius for glow effect

    // Create group to hold both lines
    const orbitGroup = new THREE.Group();
    orbitGroup.add(ellipse);
    orbitGroup.add(glowLine);
    
    // Store reference to materials for animation
    orbitGroup.userData = {
        mainMaterial: material,
        glowMaterial: glowMaterial,
        pulseTime: Math.random() * Math.PI * 2 // Random start time for each orbit
    };

    scene.add(orbitGroup);
    orbitLines.push(orbitGroup); // Add to array for animation
    return orbitGroup;
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

function createSatellite(planet, name, radius, color, orbitRadius, orbitSpeed) {
    if (!scene || !planet) return;

    // Simple satellite size relative to planet
    const satelliteRadius = planet.mesh.geometry.parameters.radius * 0.2;
    
    // Keep satellites at a good distance from their planet
    const adjustedOrbitRadius = planet.mesh.geometry.parameters.radius * 2.5;

    const satellite = {
        mesh: new THREE.Mesh(
            new THREE.SphereGeometry(satelliteRadius, 32, 32),
            new THREE.MeshPhongMaterial({ 
                color: color,
                shininess: 30
            })
        ),
        orbitRadius: adjustedOrbitRadius,
        angle: Math.random() * Math.PI * 2,
        speed: orbitSpeed * 0.5 // Moderate speed
    };
    
    satellite.mesh.name = name || 'moon';
    scene.add(satellite.mesh);
    
    if (!planet.satellites) {
        planet.satellites = [];
    }
    planet.satellites.push(satellite);

    // Create orbit line for satellite
    const curve = new THREE.EllipseCurve(
        0, 0,
        adjustedOrbitRadius, adjustedOrbitRadius,
        0, 2 * Math.PI,
        false,
        0
    );

    const points = curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ 
        color: 0x666666,
        transparent: true,
        opacity: 0.3
    });
    const orbitLine = new THREE.Line(geometry, material);
    orbitLine.rotation.x = Math.PI / 2;
    planet.mesh.add(orbitLine);
}

function createMoons() {
    // Add Earth's moon
    createSatellite(planets[2], 'Moon', 1.5, 0xcccccc, 8, 0.003);

    // Add Mars' moons
    createSatellite(planets[3], 'Phobos', 1.2, 0xcccccc, 4, 0.004);
    createSatellite(planets[3], 'Deimos', 1.2, 0xcccccc, 6, 0.003);

    // Add Jupiter's moons
    for (let i = 0; i < 4; i++) {
        createSatellite(planets[4], 'Moon ' + (i + 1), 1.5, 0xcccccc, 12 + i * 3, 0.002);
    }

    // Add Saturn's moons
    const saturnMoonData = [
        { radius: 1.5, orbit: 13, speed: 0.002 },
        { radius: 1.2, orbit: 16, speed: 0.0015 },
        { radius: 1.2, orbit: 19, speed: 0.001 },
        { radius: 1.2, orbit: 11, speed: 0.0025 },
        { radius: 1.2, orbit: 14, speed: 0.002 },
        { radius: 1.2, orbit: 17, speed: 0.0015 }
    ];

    saturnMoonData.forEach((moon, index) => {
        createSatellite(planets[5], 'Moon ' + (index + 1), moon.radius, 0xcccccc, moon.orbit, moon.speed);
    });
}

function focusOnPlanet(planet) {
    if (!planet || isTransitioning) return;
    
    console.log('Focusing on planet:', planet.mesh.name);
    isTransitioning = true;
    focusedPlanet = planet;

    // Calculate target position for camera
    const planetPosition = planet.mesh.position.clone();
    const radius = planet.mesh.geometry.parameters.radius;
    const zoomDistance = radius * 4; // Slightly further for smoother feel
    
    // Calculate camera position with a more dynamic angle
    const targetPosition = new THREE.Vector3(
        planetPosition.x + zoomDistance * Math.cos(Math.PI / 4),
        zoomDistance * Math.sin(Math.PI / 4),
        planetPosition.z + zoomDistance * Math.cos(Math.PI / 4)
    );

    // Store initial camera position and rotation
    const startPosition = camera.position.clone();
    const startRotation = camera.rotation.clone();

    // Calculate target rotation to look at planet
    const tempCamera = camera.clone();
    tempCamera.position.copy(targetPosition);
    tempCamera.lookAt(planetPosition);
    const targetRotation = tempCamera.rotation.clone();

    // Animation duration in milliseconds
    const duration = 1800; // Longer duration for smoother feel
    const startTime = Date.now();

    function animateCamera() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Custom easing function for smoother acceleration and deceleration
        const easing = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

        // Interpolate position with easing
        camera.position.lerpVectors(startPosition, targetPosition, easing);

        // Interpolate rotation with easing
        camera.rotation.x = startRotation.x + (targetRotation.x - startRotation.x) * easing;
        camera.rotation.y = startRotation.y + (targetRotation.y - startRotation.y) * easing;
        camera.rotation.z = startRotation.z + (targetRotation.z - startRotation.z) * easing;

        if (progress < 1) {
            requestAnimationFrame(animateCamera);
        } else {
            isTransitioning = false;
            controls.target.copy(planetPosition);
            controls.update();
            
            // Show planet info after animation
            showPlanetInfo(planet);
        }
    }

    animateCamera();
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
        <button class="view-more-button" onclick="showExpandedInfo('${planet.mesh.name}', 'planet')">View More Details</button>
    `;

    infoContainer.innerHTML = content;
    document.body.appendChild(infoContainer);

    // Add styles for the view more button
    const style = document.createElement('style');
    style.textContent = `
        .view-more-button {
            background-color: #4a9eff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 15px;
            font-size: 14px;
            transition: background-color 0.3s;
            width: 100%;
        }

        .view-more-button:hover {
            background-color: #357abd;
        }
    `;
    document.head.appendChild(style);
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
    console.log('Closing info panel and returning to top view');
    const infoPanel = document.querySelector('.planet-info');
    if (infoPanel) {
        // Add fade-out animation
        infoPanel.style.transition = 'opacity 0.5s ease-out';
        infoPanel.style.opacity = '0';
        setTimeout(() => infoPanel.remove(), 500);
    }
    
    // Return to top view
    if (isTransitioning) return;
    
    isTransitioning = true;
    
    // Store initial camera position and rotation
    const startPosition = camera.position.clone();
    const startRotation = camera.rotation.clone();
    
    // Target position is directly above
    const targetPosition = new THREE.Vector3(0, 300, 0);
    
    // Calculate target rotation (looking straight down)
    const tempCamera = camera.clone();
    tempCamera.position.copy(targetPosition);
    tempCamera.lookAt(new THREE.Vector3(0, 0, 0));
    const targetRotation = tempCamera.rotation.clone();

    // Animation duration in milliseconds
    const duration = 1800;
    const startTime = Date.now();

    function animateCamera() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Custom easing function for smoother acceleration and deceleration
        const easing = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

        // Interpolate position with smooth easing
        camera.position.lerpVectors(startPosition, targetPosition, easing);

        // Interpolate rotation with smooth easing
        camera.rotation.x = startRotation.x + (targetRotation.x - startRotation.x) * easing;
        camera.rotation.y = startRotation.y + (targetRotation.y - startRotation.y) * easing;
        camera.rotation.z = startRotation.z + (targetRotation.z - startRotation.z) * easing;

        if (progress < 1) {
            requestAnimationFrame(animateCamera);
        } else {
            isTransitioning = false;
            focusedPlanet = null;
            controls.target.set(0, 0, 0);
            controls.update();
        }
    }

    animateCamera();
}

function showSatelliteInfo(satelliteName) {
    console.log('Showing info for satellite:', satelliteName);
    const satelliteInfo = satelliteData[satelliteName];
    if (!satelliteInfo) {
        console.error('No data found for satellite:', satelliteName);
        return;
    }

    // Remove any existing info panel
    const existingInfo = document.querySelector('.satellite-info');
    if (existingInfo) {
        existingInfo.remove();
    }

    const infoContainer = document.createElement('div');
    infoContainer.className = 'satellite-info';
    
    const content = `
        <div class="satellite-info-header">
            <h2>${satelliteName}</h2>
            <button class="close-info-button" onclick="closeSatelliteInfo()">×</button>
        </div>
        <p><strong>Type:</strong> ${satelliteInfo.type}</p>
        <p><strong>Diameter:</strong> ${satelliteInfo.diameter}</p>
        <p><strong>Distance from Planet:</strong> ${satelliteInfo.distanceFromPlanet}</p>
        <p><strong>Orbital Period:</strong> ${satelliteInfo.orbitalPeriod}</p>
        <p><strong>Temperature:</strong> ${satelliteInfo.surfaceTemp}</p>
        <p>${satelliteInfo.description}</p>
        <button class="view-more-button" onclick="showExpandedInfo('${satelliteName}', 'satellite')">View More Details</button>
    `;

    infoContainer.innerHTML = content;
    document.body.appendChild(infoContainer);

    // Add styles for the view more button
    const style = document.createElement('style');
    style.textContent = `
        .view-more-button {
            background-color: #4a9eff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 15px;
            font-size: 14px;
            transition: background-color 0.3s;
            width: 100%;
        }

        .view-more-button:hover {
            background-color: #357abd;
        }
    `;
    document.head.appendChild(style);
}

// Add closeSatelliteInfo function to window object
window.closeSatelliteInfo = function() {
    const infoPanel = document.querySelector('.satellite-info');
    if (infoPanel) {
        infoPanel.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
        infoPanel.style.opacity = '0';
        infoPanel.style.transform = 'translateX(100%)';
        setTimeout(() => infoPanel.remove(), 300);
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

    // Animate orbit lines
    const time = Date.now() * 0.001; // Current time in seconds
    orbitLines.forEach((orbitGroup) => {
        const pulseFactor = Math.sin(time * 2 + orbitGroup.userData.pulseTime) * 0.2 + 0.8; // Pulsing between 0.6 and 1.0
        orbitGroup.userData.mainMaterial.opacity = 0.6 * pulseFactor;
        orbitGroup.userData.glowMaterial.opacity = 0.2 * pulseFactor;
    });

    if (!isTransitioning && !focusedPlanet) {
        // Only animate planets when not focused on any planet
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
        // When focused on a planet, only animate its moons
        focusedPlanet.satellites?.forEach(satellite => {
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

window.returnToSolarSystem = function() {
    if (isTransitioning) return;
    
    isTransitioning = true;
    
    // Store initial camera position and rotation
    const startPosition = camera.position.clone();
    const startRotation = camera.rotation.clone();
    
    // Target position is the initial overview position
    const targetPosition = new THREE.Vector3(0, 300, 0);
    
    // Calculate target rotation (looking down at solar system)
    const tempCamera = camera.clone();
    tempCamera.position.copy(targetPosition);
    tempCamera.lookAt(new THREE.Vector3(0, 0, 0));
    const targetRotation = tempCamera.rotation.clone();

    // Animation duration in milliseconds
    const duration = 1500;
    const startTime = Date.now();

    function animateCamera() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Smooth easing function
        const easing = progress < 0.5
            ? 2 * progress * progress
            : -1 + (4 - 2 * progress) * progress;

        // Interpolate position
        camera.position.lerpVectors(startPosition, targetPosition, easing);

        // Interpolate rotation
        camera.rotation.x = startRotation.x + (targetRotation.x - startRotation.x) * easing;
        camera.rotation.y = startRotation.y + (targetRotation.y - startRotation.y) * easing;
        camera.rotation.z = startRotation.z + (targetRotation.z - startRotation.z) * easing;

        if (progress < 1) {
            requestAnimationFrame(animateCamera);
        } else {
            isTransitioning = false;
            focusedPlanet = null;
            controls.target.set(0, 0, 0);
            controls.update();

            // Remove planet info panel
            const infoPanel = document.querySelector('.planet-info');
            if (infoPanel) {
                infoPanel.remove();
            }
        }
    }

    animateCamera();
}

// Add showExpandedInfo function to window object
window.showExpandedInfo = function(name, type) {
    console.log('Showing expanded info for:', name, type);
    const data = type === 'planet' ? expandedPlanetData[name] : expandedSatelliteData[name];
    if (!data) {
        console.log('No expanded data found for:', name);
        return;
    }

    // Remove any existing expanded info panel
    const existingPanel = document.querySelector('.expanded-info');
    if (existingPanel) {
        existingPanel.remove();
    }

    const panel = document.createElement('div');
    panel.className = 'expanded-info';

    let content = `
        <div class="expanded-info-header">
            <h2>${name} - Detailed Information</h2>
            <button class="close-expanded-info" onclick="closeExpandedInfo()">×</button>
        </div>
        <div class="expanded-info-content">
    `;

    // Add all available data fields
    for (const [key, value] of Object.entries(data)) {
        if (Array.isArray(value)) {
            content += `<div class="info-section">
                <h3>${key.charAt(0).toUpperCase() + key.slice(1)}</h3>
                <ul>
                    ${value.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>`;
        } else {
            content += `<div class="info-section">
                <h3>${key.charAt(0).toUpperCase() + key.slice(1)}</h3>
                <p>${value}</p>
            </div>`;
        }
    }

    content += `</div>`;
    panel.innerHTML = content;
    document.body.appendChild(panel);

    // Add styles for expanded info panel if they don't exist
    if (!document.querySelector('#expanded-info-styles')) {
        const style = document.createElement('style');
        style.id = 'expanded-info-styles';
        style.textContent = `
            .expanded-info {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 80%;
                max-width: 800px;
                max-height: 90vh;
                background-color: rgba(0, 0, 0, 0.95);
                color: white;
                padding: 30px;
                border-radius: 15px;
                font-family: Arial, sans-serif;
                z-index: 2000;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                animation: fadeIn 0.3s ease-out;
                overflow-y: auto;
            }

            .expanded-info-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                position: sticky;
                top: 0;
                background-color: rgba(0, 0, 0, 0.95);
                padding: 10px 0;
                z-index: 2001;
            }

            .expanded-info h2 {
                margin: 0;
                color: #4a9eff;
                font-size: 24px;
            }

            .expanded-info-content {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
            }

            .info-section {
                background-color: rgba(255, 255, 255, 0.1);
                padding: 15px;
                border-radius: 10px;
                margin-bottom: 10px;
            }

            .info-section h3 {
                color: #4a9eff;
                margin: 0 0 10px 0;
            }

            .info-section ul {
                margin: 0;
                padding-left: 20px;
                list-style-type: disc;
            }

            .info-section li {
                margin: 5px 0;
                color: #ffffff;
            }

            .info-section p {
                margin: 0;
                color: #ffffff;
                line-height: 1.4;
            }

            .close-expanded-info {
                background: none;
                border: none;
                color: #4a9eff;
                font-size: 24px;
                cursor: pointer;
                padding: 5px 10px;
                transition: color 0.3s;
            }

            .close-expanded-info:hover {
                color: #fff;
            }

            @keyframes fadeIn {
                from {
                    opacity: 0;
                    transform: translate(-50%, -45%);
                }
                to {
                    opacity: 1;
                    transform: translate(-50%, -50%);
                }
            }

            @keyframes fadeOut {
                from {
                    opacity: 1;
                    transform: translate(-50%, -50%);
                }
                to {
                    opacity: 0;
                    transform: translate(-50%, -45%);
                }
            }

            .view-more-button {
                background-color: #4a9eff;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                margin-top: 15px;
                font-size: 14px;
                transition: background-color 0.3s;
                width: 100%;
            }

            .view-more-button:hover {
                background-color: #357abd;
            }
        `;
        document.head.appendChild(style);
    }
}

// Add closeExpandedInfo function to window object
window.closeExpandedInfo = function() {
    const panel = document.querySelector('.expanded-info');
    if (panel) {
        panel.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => panel.remove(), 300);
    }
} 