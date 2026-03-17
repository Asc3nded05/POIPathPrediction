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

    // Sort by distance and take nearest 3
    return results.sort((a, b) => a.distance - b.distance).slice(0, 3);
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

function insidePillar(x, z) {
    const pillars = [
        {x: -2, z: -2},
        {x:  2, z: -2},
        {x: -2, z:  2},
        {x:  2, z:  2}
    ];

    const radius = 0.5;
    const buffer = 0.6; // realistic VR buffer

    const R = radius + buffer;

    return pillars.some(p => {
        const dx = x - p.x;
        const dz = z - p.z;
        return dx*dx + dz*dz < R*R;
    });
}

function insideWall(x, z) {
    const thickness = 0.1;
    const halfLength = 3; // from z = -3 to +3
    const buffer = 0.6;

    // Wall at x = 3
    if (Math.abs(x - 3) < thickness/2 + buffer &&
        Math.abs(z) < halfLength + buffer) return true;

    // Wall at x = -3
    if (Math.abs(x + 3) < thickness/2 + buffer &&
        Math.abs(z) < halfLength + buffer) return true;

    return false;
}

function invalidPOIPosition(env, x, z, existingPOIs) {
    if (tooCloseToOtherPOIs(x, z, existingPOIs)) return true;

    if (env === "B" && insidePillar(x, z)) return true;
    if (env === "C" && insideWall(x, z)) return true;

    return false;
}

window.computePOIFeatures = computePOIFeatures;