import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'dat.gui';

// --- Core Three.js Setup ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111122); // Dark blue background
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(3, 4, 5);
camera.lookAt(0, 0, 0);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// === Add Clock for Animation Timing ===
const clock = new THREE.Clock();

// --- Lighting ---
const ambientLight = new THREE.AmbientLight(0xaaaaaa, 1.0);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// Orbit Controls
const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;
orbitControls.dampingFactor = 0.05;
orbitControls.target.set(0, 0, 0);

// --- Finite Subdivision Logic ---
// (Helper functions: addVertex, addFace, subdivideTetrahedron remain the same as before)
let finalVertices = [];
let finalFaces = [];
let vertexCache = new Map();
let nextVertexIndex = 0;

function addVertex(vertex) {
    const key = `${vertex.x.toFixed(6)},${vertex.y.toFixed(6)},${vertex.z.toFixed(6)}`;
    if (vertexCache.has(key)) {
        return vertexCache.get(key);
    } else {
        const index = nextVertexIndex++;
        finalVertices.push(vertex.x, vertex.y, vertex.z);
        vertexCache.set(key, index);
        return index;
    }
}

function addFace(v1Index, v2Index, v3Index) {
    finalFaces.push(v1Index, v2Index, v3Index);
}

function subdivideTetrahedron(v1, v2, v3, v4, currentDepth, targetDepth) {
    if (currentDepth === targetDepth) {
        const i1 = addVertex(v1);
        const i2 = addVertex(v2);
        const i3 = addVertex(v3);
        const i4 = addVertex(v4);
        addFace(i1, i2, i3); addFace(i1, i3, i4); addFace(i1, i4, i2); addFace(i2, i4, i3);
        return;
    }
    const m12 = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);
    const m13 = new THREE.Vector3().addVectors(v1, v3).multiplyScalar(0.5);
    const m14 = new THREE.Vector3().addVectors(v1, v4).multiplyScalar(0.5);
    const m23 = new THREE.Vector3().addVectors(v2, v3).multiplyScalar(0.5);
    const m24 = new THREE.Vector3().addVectors(v2, v4).multiplyScalar(0.5);
    const m34 = new THREE.Vector3().addVectors(v3, v4).multiplyScalar(0.5);
    const nextDepth = currentDepth + 1;
    subdivideTetrahedron(v1, m12, m13, m14, nextDepth, targetDepth);
    subdivideTetrahedron(m12, v2, m23, m24, nextDepth, targetDepth);
    subdivideTetrahedron(m13, m23, v3, m34, nextDepth, targetDepth);
    subdivideTetrahedron(m14, m24, m34, v4, nextDepth, targetDepth);
}

// --- Geometry Creation and Scene Update ---
let currentMesh = null; // Reference to the displayed mesh
const subdivisionMaterial = new THREE.MeshStandardMaterial({
    color: 0x0099ff, metalness: 0.3, roughness: 0.6, flatShading: false, side: THREE.DoubleSide
});

function generateSubdivisionTrigger() {
    const targetDepth = controlParams.subdivisionDepth;
    console.log(`Generating Subdivision: Depth = ${targetDepth}`);
    if (currentMesh) {
        scene.remove(currentMesh);
        currentMesh.geometry.dispose();
        currentMesh = null; // Clear reference
    }
    finalVertices = []; finalFaces = []; vertexCache.clear(); nextVertexIndex = 0;
    const size = 3;
    const T0_v1 = new THREE.Vector3(size, size, size);
    const T0_v2 = new THREE.Vector3(-size, -size, size);
    const T0_v3 = new THREE.Vector3(-size, size, -size);
    const T0_v4 = new THREE.Vector3(size, -size, -size);
    const startTime = performance.now();
    subdivideTetrahedron(T0_v1, T0_v2, T0_v3, T0_v4, 0, targetDepth);
    const generationTime = performance.now() - startTime;
    console.log(`Subdivision data generated in ${generationTime.toFixed(2)} ms`);
    console.log(`Vertices: ${nextVertexIndex}, Faces: ${finalFaces.length / 3}`);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(finalVertices, 3));
    geometry.setIndex(finalFaces);
    geometry.computeVertexNormals();
    currentMesh = new THREE.Mesh(geometry, subdivisionMaterial);
    scene.add(currentMesh);
    console.log("Mesh created and added to scene.");
}

// --- dat.GUI Controls ---
const gui = new GUI();
const controlParams = {
    subdivisionDepth: 3,
    directionalIntensity: 1.5,
    generateSubdivisionTrigger: generateSubdivisionTrigger,
    // === Add Motion Parameters ===
    rotationSpeedX: 0.002,
    rotationSpeedY: 0.003,
    pulsate: false,
    pulsateSpeed: 0.8,
    pulsateAmount: 0.03 // Max scale change (e.g., 1.0 +/- 0.03)
};

// Subdivision Folder
const subFolder = gui.addFolder('Subdivision');
subFolder.add(controlParams, 'subdivisionDepth', 0, 6, 1).name('Depth');
subFolder.add(controlParams, 'generateSubdivisionTrigger').name("Generate");
subFolder.open(); // Keep this folder open by default

// Motion Folder
const motionFolder = gui.addFolder('Motion');
motionFolder.add(controlParams, 'rotationSpeedX', 0, 0.01, 0.001).name('Rotation X Speed');
motionFolder.add(controlParams, 'rotationSpeedY', 0, 0.01, 0.001).name('Rotation Y Speed');
motionFolder.add(controlParams, 'pulsate').name('Pulsate Scale');
motionFolder.add(controlParams, 'pulsateSpeed', 0.1, 2.0, 0.1).name('Pulsate Speed');
motionFolder.add(controlParams, 'pulsateAmount', 0.0, 0.1, 0.005).name('Pulsate Amount');
// motionFolder.open();

// Lighting Folder
const lightFolder = gui.addFolder('Lighting');
lightFolder.add(controlParams, 'directionalIntensity', 0, 3, 0.1)
   .name('Light Intensity')
   .onChange(value => { directionalLight.intensity = value; });
// lightFolder.open();


// --- Handle Window Resize ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}, false);

// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime(); // Get total time elapsed

    orbitControls.update(); // Update camera controls

    // === Apply Motion if Mesh Exists ===
    if (currentMesh) {
        // Apply Rotation
        currentMesh.rotation.x += controlParams.rotationSpeedX;
        currentMesh.rotation.y += controlParams.rotationSpeedY;

        // Apply Pulsating Scale
        if (controlParams.pulsate) {
            // Calculate scale factor using a sine wave
            const scaleFactor = 1.0 + controlParams.pulsateAmount * Math.sin(controlParams.pulsateSpeed * elapsedTime);
            currentMesh.scale.set(scaleFactor, scaleFactor, scaleFactor);
        } else {
            // Ensure scale is reset if pulsation is turned off
            currentMesh.scale.set(1, 1, 1);
        }
    }

    renderer.render(scene, camera); // Render the scene
}

// --- Initial Setup ---
generateSubdivisionTrigger(); // Generate the initial structure
animate(); // Start the animation loop