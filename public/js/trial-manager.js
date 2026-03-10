AFRAME.registerComponent("trial-manager", {
  init: function () {
    this.environments = ["A", "B", "C"];
    this.envOrder = this.shuffle(this.environments.slice());
    this.currentEnvIndex = 0;
    this.currentTrial = 0;
    this.totalTrialsPerEnv = 15;

    this.isTrialRunning = false;

    this.poiCount = 5;

    this.logger = document.querySelector("[data-logger]").components["data-logger"];

    // Hook up Start Trial button
    document.querySelector("#startTrial")
      .addEventListener("click", () => this.startTrial());
  },

  startTrial: function () {
    if (this.isTrialRunning) return;

    // If all environments done
    if (this.currentEnvIndex >= this.envOrder.length) {
      alert("All trials complete! Export your data.");
      return;
    }

    // If environment finished
    if (this.currentTrial >= this.totalTrialsPerEnv) {
      this.currentEnvIndex++;
      this.currentTrial = 0;

      if (this.currentEnvIndex >= this.envOrder.length) {
        alert("All trials complete! Export your data.");
        return;
      }

      this.loadEnvironment(this.envOrder[this.currentEnvIndex]);
    }

    this.isTrialRunning = true;
    this.currentTrial++;

    console.log(`Starting Trial ${this.currentTrial} in Environment ${this.envOrder[this.currentEnvIndex]}`);

    // Reset user position
    const rig = document.querySelector("#rig");
    rig.setAttribute("position", "0 1.6 0");

    // Spawn POIs
    const spawner = document.querySelector("#poi-container");
    spawner.innerHTML = "";
    this.spawnPOIs();

    // Start logging
    this.logger.startTrial(this.envOrder[this.currentEnvIndex], this.currentTrial);

    // Begin monitoring POI collection
    this.checkPOIs();
  },

  spawnPOIs: function () {
    const container = document.querySelector("#poi-container");

    for (let i = 0; i < this.poiCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 2 + Math.random() * 2;

      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;

      const poi = document.createElement("a-sphere");
      poi.setAttribute("class", "poi");
      poi.setAttribute("radius", "0.15");
      poi.setAttribute("color", "#FFC300");
      poi.setAttribute("position", `${x} 1.5 ${z}`);
      poi.setAttribute("poi-collectible", "");

      container.appendChild(poi);
    }
  },

  checkPOIs: function () {
    const interval = setInterval(() => {
      if (!this.isTrialRunning) {
        clearInterval(interval);
        return;
      }

      const remaining = document.querySelectorAll(".poi").length;

      if (remaining === 0) {
        clearInterval(interval);
        this.endTrial();
      }
    }, 200);
  },

  endTrial: function () {
    console.log("Trial complete.");

    this.isTrialRunning = false;

    // Stop logging
    this.logger.endTrial();

    // Clear POIs
    document.querySelector("#poi-container").innerHTML = "";

    alert(`Trial ${this.currentTrial} complete. Press Start Trial to continue.`);
  },

  loadEnvironment: function (envName) {
    console.log("Switching to environment:", envName);

    // You can later replace this with actual environment switching
    // For now, just change wall colors to visualize the change
    const walls = document.querySelectorAll("a-plane[color]");
    walls.forEach(w => {
      if (envName === "A") w.setAttribute("color", "steelblue");
      if (envName === "B") w.setAttribute("color", "darkslateblue");
      if (envName === "C") w.setAttribute("color", "midnightblue");
    });
  },

  shuffle: function (arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
});