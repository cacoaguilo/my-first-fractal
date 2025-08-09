import { GUI } from 'dat.gui';
import { directionalLight } from './scene.js';
import { generateSubdivisionTrigger } from './fractal.js';

export const controlParams = {
    subdivisionDepth: 3,
    directionalIntensity: 1.5,
    generateSubdivisionTrigger: () => generateSubdivisionTrigger(controlParams.subdivisionDepth),
    // === Add Motion Parameters ===
    rotationSpeedX: 0.002,
    rotationSpeedY: 0.003,
    pulsate: false,
    pulsateSpeed: 0.8,
    pulsateAmount: 0.03 // Max scale change (e.g., 1.0 +/- 0.03)
};

export function initGUI() {
    const gui = new GUI();

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
}
