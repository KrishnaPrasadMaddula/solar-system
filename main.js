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
    camera.position.set(0, 100, 200);

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
    controls.maxDistance = 1000;
    camera.lookAt(0, 0, 0);
    controls.update();

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
    
    // Remove any existing click listeners
    renderer.domElement.removeEventListener('click', onMouseClick);
    labelRenderer.domElement.removeEventListener('click', onMouseClick);
    
    // Add click listeners to both renderers
    renderer.domElement.addEventListener('click', onMouseClick, false);
    labelRenderer.domElement.addEventListener('click', onMouseClick, false);

    // Hide loading message
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }

    console.log('Initialization complete');
    animate();
}

function onMouseClick(event) {
    event.preventDefault();
    event.stopPropagation();
    
    if (isTransitioning) {
        return;
    }

    const rect = event.target.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    
    // First, try to find direct intersections with planets
    const planetMeshes = planets.map(planet => planet.mesh);
    const intersects = raycaster.intersectObjects(planetMeshes, true);

    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        const planet = planets.find(p => p.mesh === clickedObject || p.mesh.children.includes(clickedObject));
        if (planet) {
            focusOnPlanet(planet);
            return;
        }
    }

    // If no planet was found, check for the Sun
    const sunIntersects = raycaster.intersectObject(scene.children.find(obj => obj.name === 'Sun'), true);
    if (sunIntersects.length > 0) {
        const sun = scene.children.find(obj => obj.name === 'Sun');
        if (sun) {
            focusOnPlanet({ mesh: sun });
        }
    }
}

function createSun() {
    const sunGeometry = new THREE.SphereGeometry(8, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.name = 'Sun';
    scene.add(sun);

    const sunLabel = createLabel('Sun');
    sunLabel.position.x = 10;
    sunLabel.position.y = 0;
    sun.add(sunLabel);
}

function createPlanets() {
    const planetConfigs = [
        { name: 'Mercury', radius: 2, color: 0x808080, orbit: 20, speed: 0.002 },
        { name: 'Venus', radius: 3, color: 0xffd700, orbit: 35, speed: 0.0015 },
        { name: 'Earth', radius: 3, color: 0x4169e1, orbit: 50, speed: 0.001 },
        { name: 'Mars', radius: 2.5, color: 0xff4500, orbit: 65, speed: 0.0008 },
        { name: 'Jupiter', radius: 6, color: 0xffa500, orbit: 85, speed: 0.0005 },
        { name: 'Saturn', radius: 5, color: 0xffd700, orbit: 100, speed: 0.0004 },
        { name: 'Uranus', radius: 4, color: 0x00ffff, orbit: 115, speed: 0.0003 },
        { name: 'Neptune', radius: 4, color: 0x4169e1, orbit: 130, speed: 0.0002 },
        { name: 'Pluto ☄️', radius: 1.5, color: 0x8B4513, orbit: 150, speed: 0.0001 }
    ];

    planets = planetConfigs.map(config => {
        const planet = createPlanet(config.name, config.radius, config.color, config.orbit, config.speed);
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
    const material = new THREE.LineBasicMaterial({ color: 0x666666 });
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
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;

    const planet = {
        mesh: mesh,
        orbitRadius: orbitRadius,
        angle: Math.random() * Math.PI * 2,
        speed: orbitSpeed,
        satellites: []
    };

    // Add planet label
    const label = createLabel(name);
    label.position.x = radius + 2;
    label.position.y = 0;
    planet.mesh.add(label);

    scene.add(planet.mesh);
    return planet;
}

function createMoons() {
    // Add Earth's moon
    createSatellite(planets[2], '', 1, 0xcccccc, 8, 0.002);

    // Add Mars' moons
    createSatellite(planets[3], '', 0.5, 0xcccccc, 4, 0.0025);
    createSatellite(planets[3], '', 0.4, 0xcccccc, 6, 0.002);

    // Add Jupiter's moons
    for (let i = 0; i < 4; i++) {
        createSatellite(planets[4], '', 1.2, 0xcccccc, 12 + i * 3, 0.0015);
    }

    // Add Saturn's moons
    const saturnMoonData = [
        { radius: 1.6, orbit: 13, speed: 0.0012 },
        { radius: 1.0, orbit: 16, speed: 0.001 },
        { radius: 0.9, orbit: 19, speed: 0.0009 },
        { radius: 0.8, orbit: 11, speed: 0.0014 },
        { radius: 0.9, orbit: 14, speed: 0.0011 },
        { radius: 0.8, orbit: 17, speed: 0.001 }
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
    if (!planet || isTransitioning) {
        console.log('Focus cancelled:', !planet ? 'no planet' : 'transition in progress');
        return;
    }
    
    console.log('Focusing on:', planet.mesh.name);
    isTransitioning = true;
    focusedPlanet = planet;

    // Show planet info
    showPlanetInfo(planet.mesh.name);

    // Calculate new camera position
    const radius = planet.mesh.geometry.parameters.radius;
    const distance = radius * (planet.mesh.name === 'Sun' ? 15 : 10);
    const newPosition = {
        x: planet.mesh.position.x,
        y: distance,
        z: planet.mesh.position.z + distance
    };

    // Store current camera position
    const startPosition = { ...camera.position };
    const duration = 1000;
    const startTime = Date.now();

    // Pause animation and store positions
    isAnimationPaused = true;
    storePlanetPositions();

    function animateCamera() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        camera.position.x = startPosition.x + (newPosition.x - startPosition.x) * easeProgress;
        camera.position.y = startPosition.y + (newPosition.y - startPosition.y) * easeProgress;
        camera.position.z = startPosition.z + (newPosition.z - startPosition.z) * easeProgress;

        camera.lookAt(planet.mesh.position);
        controls.target.copy(planet.mesh.position);

        if (progress < 1) {
            requestAnimationFrame(animateCamera);
        } else {
            isTransitioning = false;
            const backButton = document.getElementById('backButton');
            if (backButton) backButton.style.display = 'block';
            console.log('Focus complete on:', planet.mesh.name);
        }
    }

    animateCamera();
}

function returnToSolarSystem() {
    if (isTransitioning) return;

    isTransitioning = true;

    // Hide planet info panel
    const infoPanel = document.getElementById('planetInfoPanel');
    if (infoPanel) infoPanel.style.display = 'none';

    const startPosition = { ...camera.position };
    const duration = 1000;
    const startTime = Date.now();

    function animateCamera() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        camera.position.x = startPosition.x + (initialCameraPosition.x - startPosition.x) * easeProgress;
        camera.position.y = startPosition.y + (initialCameraPosition.y - startPosition.y) * easeProgress;
        camera.position.z = startPosition.z + (initialCameraPosition.z - startPosition.z) * easeProgress;

        camera.lookAt(0, 0, 0);
        controls.target.set(0, 0, 0);

        if (progress < 1) {
            requestAnimationFrame(animateCamera);
        } else {
            isTransitioning = false;
            focusedPlanet = null;
            
            const backButton = document.getElementById('backButton');
            if (backButton) backButton.style.display = 'none';
            
            // Resume animation
            isAnimationPaused = false;
        }
    }

    animateCamera();
}

function showPlanetInfo(planetName) {
    const planet = planetData[planetName];
    if (!planet) return;

    const infoPanel = document.getElementById('planetInfoPanel');
    document.getElementById('planetTitle').textContent = planetName;
    document.getElementById('planetType').textContent = planet.type;
    document.getElementById('planetDiameter').textContent = planet.diameter;
    document.getElementById('planetDistance').textContent = planet.distanceFromSun;
    document.getElementById('planetPeriod').textContent = planet.orbitalPeriod;
    document.getElementById('planetTemp').textContent = planet.surfaceTemp;
    document.getElementById('planetDescription').textContent = planet.description;

    // Display moons if any
    const moonsList = document.getElementById('planetMoons');
    moonsList.innerHTML = '';
    const moons = moonData[planetName] || [];
    if (moons.length > 0) {
        moons.forEach(moon => {
            const li = document.createElement('li');
            li.textContent = moon;
            moonsList.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = 'No moons';
        moonsList.appendChild(li);
    }

    infoPanel.style.display = 'block';
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