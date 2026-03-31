AFRAME.registerComponent("poi-collectible", {
  tick: function () {
    const cam = document.querySelector("#camera");
    const pos = cam.object3D.position;
    const myPos = this.el.object3D.position;

    const dx = pos.x - myPos.x;
    const dz = pos.z - myPos.z;

    const dist = Math.sqrt(dx*dx + dz*dz);

    if (dist < 0.5) {
      document.querySelector("#pickupSound").components.sound.playSound();
      this.el.parentNode.removeChild(this.el);
    }
  }
});