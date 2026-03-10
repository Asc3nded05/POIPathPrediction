AFRAME.registerComponent("poi-spawner", {
  schema: {
    count: { default: 5 },
    radius: { default: 3 }
  },

  init: function () {
    this.spawnPOIs();
  },

  spawnPOIs: function () {
    const container = document.querySelector("#poi-container");
    container.innerHTML = "";

    for (let i = 0; i < this.data.count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = this.data.radius;

      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;

      const poi = document.createElement("a-sphere");
      poi.setAttribute("class", "poi");
      poi.setAttribute("radius", "0.15");
      poi.setAttribute("color", "#FFC300");
      poi.setAttribute("position", `${x} 1.5 ${z}`);

      container.appendChild(poi);
    }
  }
});