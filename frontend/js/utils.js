function computePOIFeatures(userPos, userRot) {
    const pois = Array.from(document.querySelectorAll(".poi"));
    const forward = new THREE.Vector3(0, 0, -1)
        .applyEuler(userRot)
        .normalize();

    const results = pois.map(poi => {
        const p = poi.object3D.position;
        const dx = p.x - userPos.x;
        const dz = p.z - userPos.z;

        const distance = Math.sqrt(dx * dx + dz * dz);

        const toPOI = new THREE.Vector3(dx, 0, dz).normalize();
        const angle = signedAngle(forward, toPOI);

        return { distance, angle };
    });

    // Sort by distance and take nearest 5
    return results.sort((a, b) => a.distance - b.distance).slice(0, 5);
}

function signedAngle(v1, v2) {
    const angle = v1.angleTo(v2);
    const cross = v1.clone().cross(v2).y;
    return cross >= 0 ? angle : -angle;
}

function tooCloseToOtherPOIs(x, z, existing, minDist = 0.25) {
    return existing.some(p => {
        const dx = p.x - x;
        const dz = p.z - z;
        return Math.sqrt(dx*dx + dz*dz) < minDist;
    });
}

function tooCloseToUser(x, z, minDist = 0.5) {
    return Math.sqrt(x*x + z*z) < minDist;
}

function outsideRoom(x, z) {
    const halfWidth = 2.0;
    const halfDepth = 3.25;
    const buffer = 0.2;
    return Math.abs(x) > halfWidth - buffer || Math.abs(z) > halfDepth - buffer;
}

function insidePillar(x, z) {
    const pillars = [
        {x: -1, z: -1.5},
        {x:  1, z: -1.5},
        {x: -1, z:  1.5},
        {x:  1, z:  1.5}
    ];

    const radius = 0.5;
    const buffer = 0.25; 

    const R = radius + buffer;

    return pillars.some(p => {
        const dx = x - p.x;
        const dz = z - p.z;
        return dx*dx + dz*dz < R*R;
    });
}

function insideWall(x, z) {
    const thickness = 0.1;
    const halfLength = 2; // from z = -2 to +2 for C
    const buffer = 0.25;

    // Wall at x = 1.2
    if (Math.abs(x - 1.2) < thickness/2 + buffer &&
        Math.abs(z) < halfLength + buffer) return true;

    // Wall at x = -1.2
    if (Math.abs(x + 1.2) < thickness/2 + buffer &&
        Math.abs(z) < halfLength + buffer) return true;

    return false;
}

function insideMazeWall(x, z) {
    const thickness = 0.1;
    const buffer = 0.25;

    // Wall 1: position="-1.5 2.5 -1.0" width="1.0" depth="0.1"
    // X: -2.0 to -1.0, Z: -1.0
    if (Math.abs(z - (-1.0)) < thickness/2 + buffer &&
        x >= -2.0 - buffer && x <= -1.0 + buffer) return true;

    // Wall 2: position="0.0 2.5 -2.0" width="2.5" depth="0.1"
    // X: -1.25 to 1.25, Z: -2.0
    if (Math.abs(z - (-2.0)) < thickness/2 + buffer &&
        x >= -1.25 - buffer && x <= 1.25 + buffer) return true;

    // Wall 3: position="1.0 2.5 1.5" width="2.0" depth="0.1"
    // X: 0.0 to 2.0, Z: 1.5
    if (Math.abs(z - 1.5) < thickness/2 + buffer &&
        x >= 0.0 - buffer && x <= 2.0 + buffer) return true;

    // Wall 4: position="0.0 2.5 2.5" width="2.5" depth="0.1"
    // X: -1.25 to 1.25, Z: 2.5
    if (Math.abs(z - 2.5) < thickness/2 + buffer &&
        x >= -1.25 - buffer && x <= 1.25 + buffer) return true;

    // Wall 5: position="1.25 2.5 -0.75" rotation="0 90 0" width="2.5" depth="0.1"
    // X: 1.25, Z: -2.0 to 0.5
    if (Math.abs(x - 1.25) < thickness/2 + buffer &&
        z >= -2.0 - buffer && z <= 0.5 + buffer) return true;

    // Wall 6: position="-1.25 2.5 1.25" rotation="0 90 0" width="2.5" depth="0.1"
    // X: -1.25, Z: 0.0 to 2.5
    if (Math.abs(x - (-1.25)) < thickness/2 + buffer &&
        z >= 0.0 - buffer && z <= 2.5 + buffer) return true;

    return false;
}

function invalidPOIPosition(env, x, z, existingPOIs) {
    if (tooCloseToOtherPOIs(x, z, existingPOIs)) return true;
    if (tooCloseToUser(x, z)) return true;
    if (outsideRoom(x, z)) return true;

    if (env === "B" && insidePillar(x, z)) return true;
    if (env === "C" && insideWall(x, z)) return true;
    if (env === "D" && insideMazeWall(x, z)) return true;

    return false;
}

window.computePOIFeatures = computePOIFeatures;