// No longer import THREE, as workers don't see the importmap
import { addVertex, addFace, clearCache, finalVertices, finalFaces, nextVertexIndex } from './utils.js';

// --- Simple Vector3-like implementation to remove THREE dependency ---
function vec3(x, y, z) {
    return { x, y, z };
}

function addVectors(v1, v2) {
    return vec3(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
}

function multiplyScalar(v, s) {
    return vec3(v.x * s, v.y * s, v.z * s);
}
// ---

function subdivideTetrahedron(v1, v2, v3, v4, currentDepth, targetDepth) {
    if (currentDepth === targetDepth) {
        const i1 = addVertex(v1);
        const i2 = addVertex(v2);
        const i3 = addVertex(v3);
        const i4 = addVertex(v4);
        addFace(i1, i2, i3); addFace(i1, i3, i4); addFace(i1, i4, i2); addFace(i2, i4, i3);
        return;
    }
    const m12 = multiplyScalar(addVectors(v1, v2), 0.5);
    const m13 = multiplyScalar(addVectors(v1, v3), 0.5);
    const m14 = multiplyScalar(addVectors(v1, v4), 0.5);
    const m23 = multiplyScalar(addVectors(v2, v3), 0.5);
    const m24 = multiplyScalar(addVectors(v2, v4), 0.5);
    const m34 = multiplyScalar(addVectors(v3, v4), 0.5);
    const nextDepth = currentDepth + 1;
    subdivideTetrahedron(v1, m12, m13, m14, nextDepth, targetDepth);
    subdivideTetrahedron(m12, v2, m23, m24, nextDepth, targetDepth);
    subdivideTetrahedron(m13, m23, v3, m34, nextDepth, targetDepth);
    subdivideTetrahedron(m14, m24, m34, v4, nextDepth, targetDepth);
}

self.onmessage = function(e) {
    const { targetDepth } = e.data;
    clearCache();
    const size = 3;
    // Use the custom vec3 function
    const T0_v1 = vec3(size, size, size);
    const T0_v2 = vec3(-size, -size, size);
    const T0_v3 = vec3(-size, size, -size);
    const T0_v4 = vec3(size, -size, -size);

    subdivideTetrahedron(T0_v1, T0_v2, T0_v3, T0_v4, 0, targetDepth);

    self.postMessage({
        vertices: finalVertices,
        faces: finalFaces,
        vertexCount: nextVertexIndex
    });
}
