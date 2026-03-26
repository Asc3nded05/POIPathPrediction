AFRAME.registerComponent("poi-spawner", {
    schema: {
        count: { default: 5 },
        radius: { default: 3 }
    },

    init: function () {
        this.spawnPOIs();
    },

    spawnPOIs: function () {
        const trialManager = document.querySelector("[trial-manager]").components["trial-manager"];
        const poiColor = trialManager.currentPoiColor;
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
            x = (Math.random() * 4) - 2;      // x in [-2, 2]
            z = (Math.random() * 6.5) - 3.25; // z in [-3.25, 3.25]

            attempts++;
            if (attempts > 50) console.warn("POI spawn struggling to find valid location");
        } while (invalidPOIPosition(env, x, z, placed));

        placed.push({x, z});

        const poi = document.createElement("a-sphere");
        poi.setAttribute("class", "poi");
        poi.setAttribute("radius", "0.15");
        poi.setAttribute("color", poiColor);
        poi.setAttribute("position", `${x} 1.25 ${z}`);
        poi.setAttribute("poi-collectible", "");

        container.appendChild(poi);
        }
    }
});