AFRAME.registerComponent("data-logger", {
	init: function () {
		this.lastLog = 0;
		this.logInterval = 50; // ms
		this.data = [];
		this.lastPos = new THREE.Vector3();
		this.lastTime = performance.now();
		this.isLogging = false;
		this.currentEnv = null;
		this.currentTrial = null;

		document.querySelector("#exportButton")
		.addEventListener("click", () => this.exportData());
	},

	startTrial(env, trial) {
		this.currentEnv = env;
		this.currentTrial = trial;
		this.isLogging = true;

		console.log(`Logging started for Env ${env}, Trial ${trial}`);
	},

	endTrial() {
		this.isLogging = false;
		console.log("Logging stopped for this trial.");
	},

	tick: function (time, delta) {
		if (!this.isLogging) return;

		if (time - this.lastLog < this.logInterval) return;
		this.lastLog = time;

		const cam = document.querySelector("#camera");
		const pos = cam.object3D.position;
		const rot = cam.object3D.rotation;

		// Compute velocity
		const dt = (time - this.lastTime) / 1000;
		const vx = (pos.x - this.lastPos.x) / dt;
		const vz = (pos.z - this.lastPos.z) / dt;

		this.lastPos.copy(pos);
		this.lastTime = time;

		// Compute POI distances + relative angles
		const poiData = computePOIFeatures(pos, rot);

		this.data.push({
		time,
		user: {
			x: pos.x,
			z: pos.z,
			vx,
			vz,
			yaw: rot.y
		},
		pois: poiData
		});
	},

	exportData: function () {
		const blob = new Blob([JSON.stringify(this.data)], {
		type: "application/json"
		});
		const url = URL.createObjectURL(blob);

		const a = document.createElement("a");
		a.href = url;
		a.download = "vr_data.json";
		a.click();
	}
});