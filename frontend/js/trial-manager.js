AFRAME.registerComponent("trial-manager", {
	init: function () {
		this.environments = ["A", "B", "C"];
		this.envOrder = this.shuffle(this.environments.slice());
		this.currentEnvIndex = 0;
		this.currentTrial = 0;
		this.totalTrialsPerEnv = 5;
		this.isTrialRunning = false;
		this.poiCount = 5;

		this.logger = this.el.components["data-logger"];

		this.loadEnvironment(this.envOrder[this.currentEnvIndex]);

		// Hook up Start Trial button
		document.querySelector("#startTrial")
		.addEventListener("click", () => this.startTrial());
	},

	startTrial: function () {
		if (this.isTrialRunning) return;

		// Hide start trial button when clicked
		document.querySelector('#startTrial').setAttribute('visible', 'false');

		this.isTrialRunning = true;
		this.currentTrial++;
		this.currentPoiColor = this.randomPoiColor();

		console.log(`Starting Trial ${this.currentTrial} in Environment ${this.envOrder[this.currentEnvIndex]} with POI color ${this.currentPoiColor}`);

		// Reset user position
		const rig = document.querySelector("#rig");
		rig.setAttribute("position", "0 0 0");

		// Spawn POIs
		const spawner = document.querySelector("#poi-container");
		spawner.innerHTML = "";
		this.spawnPOIs();

		// Start logging
		console.log("Logger:", this.logger);
		this.logger.startTrial(this.envOrder[this.currentEnvIndex], this.currentTrial);

		// Begin monitoring POI collection
		this.checkPOIs();
	},

	spawnPOIs: function () {
		const container = document.querySelector("#poi-container");
		const env = this.envOrder[this.currentEnvIndex];
		const placed = [];

		for (let i = 0; i < this.poiCount; i++) {
			let x, z;
			let attempts = 0;

			do {
				x = (Math.random() * 4) - 2;      // x in [-2, 2]
				z = (Math.random() * 7.5) - 3.75; // z in [-3.75, 3.75]

				attempts++;
				if (attempts > 50) {
					console.warn("POI spawn struggling to find valid location");
					break;
				}
			} while (invalidPOIPosition(env, x, z, placed));

			placed.push({x, z});

			const poi = document.createElement("a-sphere");
			poi.setAttribute("class", "poi");
			poi.setAttribute("radius", "0.15");
			poi.setAttribute("color", this.currentPoiColor || "#FFC300");
			poi.setAttribute("position", `${x} 1.5 ${z}`);
			poi.setAttribute("poi-collectible", "");

			container.appendChild(poi);
		}
	},

	randomPoiColor: function () {
		const colors = ["#FFC300", "#FF5733", "#33FF57", "#3380FF", "#FF33D4", "#33FFF0"];
		return colors[Math.floor(Math.random() * colors.length)];
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
		
		// If there are more trials to run for the current environment
		if (this.currentTrial < this.totalTrialsPerEnv) {
			this.startTrial();
		}
		// If the environment is finished
		else if (this.currentTrial == this.totalTrialsPerEnv) {
			this.currentEnvIndex++;
			this.currentTrial = 0;

			// If trials have been run in all environments
			if (this.currentEnvIndex >= this.envOrder.length) {
				console.log("All Environments complete!");

				this.logger.autoExport();

				return;
			};
			
			// Make start trial button visible
			document.querySelector('#startTrial').setAttribute('visible', 'true');
			// Load the next environment
			this.loadEnvironment(this.envOrder[this.currentEnvIndex]);
		}
	},

	loadEnvironment: function (envName) {
		console.log("Switching to environment:", envName);

		// Hide all environments
		document.querySelector("#envA").setAttribute("visible", false);
		document.querySelector("#envB").setAttribute("visible", false);
		document.querySelector("#envC").setAttribute("visible", false);

		// Show the selected one
		if (envName === "A") document.querySelector("#envA").setAttribute("visible", true);
		if (envName === "B") document.querySelector("#envB").setAttribute("visible", true);
		if (envName === "C") document.querySelector("#envC").setAttribute("visible", true);
	},

	shuffle: function (arr) {
		for (let i = arr.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[arr[i], arr[j]] = [arr[j], arr[i]];
		}
		return arr;
	}
});