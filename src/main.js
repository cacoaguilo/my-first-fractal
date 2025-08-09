import * as THREE from 'three';
import { scene, camera, renderer, clock, orbitControls } from './scene.js';
import { generateSubdivisionTrigger } from './fractal.js';
import { initGUI, controlParams } from './gui.js';

let currentMesh = null;

function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime(); // Get total time elapsed

    orbitControls.update(); // Update camera controls

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

function main() {
    initGUI();
    controlParams.generateSubdivisionTrigger = () => {
        generateSubdivisionTrigger(controlParams.subdivisionDepth, (mesh) => {
            currentMesh = mesh;
        });
    }
    controlParams.generateSubdivisionTrigger();
    animate();
}

main();
