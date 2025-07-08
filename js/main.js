const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });

const container = document.getElementById('scene-container');

renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 3, 5);
scene.add(directionalLight);

// Camera position
camera.position.z = 30;

// Orbit controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Clock for animations
const clock = new THREE.Clock();

// Solar system planets
const planets = [
    { name: 'Sun', radius: 5, distance: 0, color: 0xffff00, speed: 0, rotationSpeed: 0.005 },
    { name: 'Mercury', radius: 0.4, distance: 7, color: 0xa9a9a9, speed: 0.04, rotationSpeed: 0.004 },
    { name: 'Venus', radius: 0.6, distance: 9, color: 0xffa500, speed: 0.015, rotationSpeed: 0.002 },
    { name: 'Earth', radius: 0.6, distance: 12, color: 0x1a66ff, speed: 0.01, rotationSpeed: 0.02 },
    { name: 'Mars', radius: 0.5, distance: 15, color: 0xff3300, speed: 0.008, rotationSpeed: 0.018 },
    { name: 'Jupiter', radius: 1.3, distance: 20, color: 0xffcc99, speed: 0.002, rotationSpeed: 0.04 },
    { name: 'Saturn', radius: 1.1, distance: 25, color: 0xffdb58, speed: 0.0009, rotationSpeed: 0.038, hasRing: true },
    { name: 'Uranus', radius: 0.9, distance: 30, color: 0x66ccff, speed: 0.0004, rotationSpeed: 0.03 },
    { name: 'Neptune', radius: 0.8, distance: 35, color: 0x3366ff, speed: 0.0001, rotationSpeed: 0.032 }
];

function createStars() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.1,
        transparent: true
    });

    const starsVertices = [];
    for (let i = 0; i < 5000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
}

createStars();

// Create planets
const planetObjects = [];
const orbitPaths = [];

planets.forEach((planet, index) => {
    // Create planet
    const geometry = new THREE.SphereGeometry(planet.radius, 32, 32);
    const material = new THREE.MeshPhongMaterial({ 
        color: planet.color,
        shininess: 10
    });
    const planetMesh = new THREE.Mesh(geometry, material);
    
    if (planet.name === 'Sun') {
        // Make the sun emissive
        material.emissive = new THREE.Color(0xffff00);
        material.emissiveIntensity = 0.5;
    }
    
    scene.add(planetMesh);
    
    // Create orbit path
    if (planet.name !== 'Sun') {
        const orbitGeometry = new THREE.BufferGeometry();
        const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x555555 });
        
        const points = [];
        const segments = 64;
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            points.push(new THREE.Vector3(
                Math.cos(angle) * planet.distance,
                0,
                Math.sin(angle) * planet.distance
            ));
        }
        
        orbitGeometry.setFromPoints(points);
        const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
        scene.add(orbit);
        orbitPaths.push(orbit);
    }
    
    planetObjects.push({
        name: planet.name,
        mesh: planetMesh,
        distance: planet.distance,
        speed: planet.speed,
        rotationSpeed: planet.rotationSpeed,
        angle: Math.random() * Math.PI * 2, // Random starting position
        hasRing: planet.hasRing || false
    });
    
    // Add rings for Saturn
    if (planet.hasRing) {
        const ringGeometry = new THREE.RingGeometry(planet.radius * 1.5, planet.radius * 2, 32);
        const ringMaterial = new THREE.MeshPhongMaterial({
            color: 0xddddbb,
            side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        planetMesh.add(ring);
    }
});

let isPaused = false;

function initControls() {
    const speedControlsContainer = document.querySelector('.speed-controls');
    const pauseResumeBtn = document.getElementById('pause-resume');
    const resetSpeedsBtn = document.getElementById('reset-speeds');
    const toggleDarkBtn = document.getElementById('toggle-dark');

    planetObjects.forEach((planet, index) => {
        if (index === 0) return;

        const controlDiv = document.createElement('div');
        controlDiv.className = 'planet-control';
        
        const label = document.createElement('label');
        label.textContent = planet.name;
        label.htmlFor = `speed-${planet.name.toLowerCase()}`;
        
        const sliderContainer = document.createElement('div');
        sliderContainer.className = 'slider-container';
        
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.id = `speed-${planet.name.toLowerCase()}`;
        slider.min = '0';
        slider.max = '0.1';
        slider.step = '0.001';
        slider.value = planet.speed;
        
        const valueDisplay = document.createElement('span');
        valueDisplay.textContent = planet.speed.toFixed(3);
        
        sliderContainer.appendChild(slider);
        sliderContainer.appendChild(valueDisplay);
        
        controlDiv.appendChild(label);
        controlDiv.appendChild(sliderContainer);
        
        speedControlsContainer.appendChild(controlDiv);
        
        slider.addEventListener('input', () => {
            const newSpeed = parseFloat(slider.value);
            planet.speed = newSpeed;
            valueDisplay.textContent = newSpeed.toFixed(3);
        });
    });

    // Pause/Resume 
    pauseResumeBtn.addEventListener('click', () => {
        isPaused = !isPaused;
        pauseResumeBtn.textContent = isPaused ? 'Resume' : 'Pause';
    });

    // Reset speeds
    resetSpeedsBtn.addEventListener('click', () => {
        planetObjects.forEach((planet, index) => {
            if (index === 0) return;
            
            
            const originalSpeed = planets[index].speed;
            planet.speed = originalSpeed;
            
            const slider = document.getElementById(`speed-${planet.name.toLowerCase()}`);
            const valueDisplay = slider.nextElementSibling;
            
            slider.value = originalSpeed;
            valueDisplay.textContent = originalSpeed.toFixed(3);
        });
    });

    // Dark mode toggle
    toggleDarkBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        toggleDarkBtn.textContent = document.body.classList.contains('dark-mode') 
            ? 'Light Mode' 
            : 'Dark Mode';
    });

    // Add hover labels (bonus feature)
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    document.body.appendChild(tooltip);

    // Raycaster for hover detection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onMouseMove(event) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        
        raycaster.setFromCamera(mouse, camera);
        
        
        const intersects = raycaster.intersectObjects(
            planetObjects.map(p => p.mesh).filter(mesh => mesh !== planetObjects[0].mesh)
        );
        
        if (intersects.length > 0) {
            const planetMesh = intersects[0].object;
            const planet = planetObjects.find(p => p.mesh === planetMesh);
            
            tooltip.textContent = planet.name;
            tooltip.style.display = 'block';
            tooltip.style.left = `${event.clientX + 10}px`;
            tooltip.style.top = `${event.clientY + 10}px`;
        } else {
            tooltip.style.display = 'none';
        }
    }

    window.addEventListener('mousemove', onMouseMove, false);

    const tooltipStyle = document.createElement('style');
    tooltipStyle.textContent = `
        .tooltip {
            position: absolute;
            padding: 5px 10px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            border-radius: 4px;
            pointer-events: none;
            display: none;
            z-index: 100;
        }
    `;
    document.head.appendChild(tooltipStyle);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    
    if (!isPaused) {
        planetObjects.forEach((planet, index) => {
            if (index === 0) return; // Skip the Sun
            
            // Update orbit position
            planet.angle += planet.speed * delta;
            planet.mesh.position.x = Math.cos(planet.angle) * planet.distance;
            planet.mesh.position.z = Math.sin(planet.angle) * planet.distance;
            
            // Rotate planet
            planet.mesh.rotation.y += planet.rotationSpeed * delta;
        });
    }
    
    // Update orbit controls
    controls.update();
    
    renderer.render(scene, camera);
}

// Handle window resize
function onWindowResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

window.addEventListener('resize', onWindowResize);

// Initialize controls and start animation
initControls();
animate();