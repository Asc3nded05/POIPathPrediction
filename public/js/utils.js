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

window.computePOIFeatures = computePOIFeatures;