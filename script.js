const canvas = document.getElementById('globeCanvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// Globe geometry
const globeGeometry = new THREE.SphereGeometry(5, 50, 50);
const globeMaterial = new THREE.MeshStandardMaterial({ color: 0x5bc0de, wireframe: true });
const globe = new THREE.Mesh(globeGeometry, globeMaterial);
scene.add(globe);

// Lighting
const light = new THREE.PointLight(0xffffff, 1);
light.position.set(10, 10, 10);
scene.add(light);

// Camera positioning
camera.position.z = 12;

// Particle system for visual effects
const particles = new THREE.BufferGeometry();
const particleCount = 500;
const particlePositions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
    particlePositions[i * 3] = (Math.random() - 0.5) * 20;
    particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 20;
}

particles.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
const particleMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
const particleSystem = new THREE.Points(particles, particleMaterial);
scene.add(particleSystem);

// Destination data
const destinations = [
    { name: 'Paris', description: 'The City of Lights. Romance, culture, and history await.', coordinates: [2.3522, 48.8566] },
    { name: 'Bali', description: 'Beautiful beaches, vibrant culture, and serene landscapes.', coordinates: [115.1889, -8.4095] },
    { name: 'Tokyo', description: 'High-tech city, sushi, temples, and gardens.', coordinates: [139.6917, 35.6895] }
];

// Convert lat/long to 3D coordinates
function latLongToVector3(lat, lon, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return new THREE.Vector3(
        -(radius * Math.sin(phi) * Math.cos(theta)),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
    );
}

// Add destination points with hover effect and pop-ups
const points = [];
destinations.forEach(destination => {
    const pointGeometry = new THREE.SphereGeometry(0.1, 32, 32);
    const pointMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const point = new THREE.Mesh(pointGeometry, pointMaterial);
    const [lon, lat] = destination.coordinates;
    point.position.copy(latLongToVector3(lat, lon, 5));
    point.destinationInfo = destination;
    globe.add(point);
    points.push(point);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    globe.rotation.y += 0.001; // Rotate the globe
    particleSystem.rotation.y += 0.0005; // Slowly rotate particles
    renderer.render(scene, camera);
}

animate();

// Mouse event for hover and pop-up display
const popup = document.getElementById('destinationPopup');
const popupTitle = document.getElementById('popupTitle');
const popupDescription = document.getElementById('popupDescription');

function onHover(event) {
    const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(points);

    if (intersects.length > 0) {
        const destination = intersects[0].object.destinationInfo;
        popupTitle.innerText = destination.name;
        popupDescription.innerText = destination.description;
        popup.classList.remove('hidden');
    } else {
        popup.classList.add('hidden');
    }
}

window.addEventListener('mousemove', onHover);

// Close popup button
function closePopup() {
    popup.classList.add('hidden');
}

// Handle window resize
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
