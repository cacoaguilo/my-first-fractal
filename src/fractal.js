import * as THREE from 'three';
import { scene } from './scene.js';

let currentMesh = null; // Reference to the displayed mesh
const subdivisionMaterial = new THREE.MeshStandardMaterial({
    color: 0x0099ff, metalness: 0.3, roughness: 0.6, flatShading: false, side: THREE.DoubleSide
});

export function generateSubdivisionTrigger(targetDepth, onMeshCreated) {
    console.log(`Generating Subdivision: Depth = ${targetDepth}`);
    if (currentMesh) {
        scene.remove(currentMesh);
        currentMesh.geometry.dispose();
        currentMesh = null; // Clear reference
    }

    const worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });

    worker.onmessage = function(e) {
        const { vertices, faces, vertexCount } = e.data;
        console.log(`Worker finished. Vertices: ${vertexCount}, Faces: ${faces.length / 3}`);
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setIndex(faces);
        geometry.computeVertexNormals();
        currentMesh = new THREE.Mesh(geometry, subdivisionMaterial);
        scene.add(currentMesh);
        console.log("Mesh created and added to scene.");
        onMeshCreated(currentMesh);
        worker.terminate();
    }

    const startTime = performance.now();
    worker.postMessage({ targetDepth });
    console.log(`Subdivision data generation started in worker...`);
}
