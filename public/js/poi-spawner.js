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

        const env = document.querySelector("[trial-manager]").components["trial-manager"].envOrder[
            document.querySelector("[trial-manager]").components["trial-manager"].currentEnvIndex
        ];

        const placed = [];

        for (let i = 0; i < this.data.count; i++) {
        let x, z;
        let attempts = 0;

        do {
            const angle = Math.random() * Math.PI * 2;
            const r = 2 + Math.random() * 2;

            x = Math.cos(angle) * r;
            z = Math.sin(angle) * r;

            attempts++;
            if (attempts > 50) console.warn("POI spawn struggling to find valid location");
        } while (invalidPOIPosition(env, x, z, placed));

        placed.push({x, z});

        const poi = document.createElement("a-sphere");
        poi.setAttribute("class", "poi");
        poi.setAttribute("radius", "0.15");
        poi.setAttribute("color", "#FFC300");
        poi.setAttribute("position", `${x} 1.5 ${z}`);
        poi.setAttribute("poi-collectible", "");

        container.appendChild(poi);
        }
    }
});