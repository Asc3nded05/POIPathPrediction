AFRAME.registerComponent("data-logger", {
	init: function () {		
		this.data = [];
		this.isLogging = false;
		this.currentEnv = null;
		this.currentTrial = null;

		this.lastPos = new THREE.Vector3();
		this.lastTime = performance.now();

		// Start 50ms timer (independent of framerate)
		this.intervalID = setInterval(() => {
			if (this.isLogging) this.logSample();
		}, 50);
	},

	startTrial(env, trial) {
		this.currentEnv = env;
		this.currentTrial = trial;
		this.isLogging = true;

		this.lastTime = performance.now();
		const cam = document.querySelector("#camera");
		this.lastPos.copy(cam.object3D.position);

		console.log(`Logging started for Env ${env}, Trial ${trial}`);
	},

	endTrial() {
		this.isLogging = false;
		console.log("Logging stopped for this trial.");
	},

	logSample: function () {
		const cam = document.querySelector("#camera");
		const pos = cam.object3D.position;
		const rot = cam.object3D.rotation;

		const now = performance.now();

		// Compute velocity
		const dt = (now - this.lastTime) / 1000;
		const vx = (pos.x - this.lastPos.x) / dt;
		const vz = (pos.z - this.lastPos.z) / dt;

		this.lastPos.copy(pos);
		this.lastTime = now;

		// Compute POI distances + relative angles
		const poiData = computePOIFeatures(pos, rot);

		// if (this.data.length > 0) {
		// 	const prev = this.data[this.data.length - 1].time;
		// 	console.log("Δt =", now - prev);
		// }

		// Store sample
		this.data.push({
			time: now,
			env: this.currentEnv,
			trial: this.currentTrial,
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
	
	// autoExport: function () {
	// 	console.log("Auto-exporting data…");

	// 	const blob = new Blob([JSON.stringify(this.data)], {
	// 		type: "application/json"
	// 	});
	// 	const url = URL.createObjectURL(blob);

	// 	const a = document.createElement("a");
	// 	a.href = url;
	// 	a.download = "vr_data.json";
	// 	a.click();
	// }

	autoExport: function () {
		console.log("Exporting Data");
		
		fetch("https://poipathpredictionbackend.onrender.com/upload", {
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify(this.data)
		})
		.then(res => res.json())
		.then(result => console.log("Upload result:", result))
		.catch(err => console.error("Upload failed:", err));
	}
});