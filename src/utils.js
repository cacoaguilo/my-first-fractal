export let finalVertices = [];
export let finalFaces = [];
export let vertexCache = new Map();
export let nextVertexIndex = 0;

export function addVertex(vertex) {
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

export function addFace(v1Index, v2Index, v3Index) {
    finalFaces.push(v1Index, v2Index, v3Index);
}

export function clearCache() {
    finalVertices = [];
    finalFaces = [];
    vertexCache.clear();
    nextVertexIndex = 0;
}
