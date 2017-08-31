importScripts("./babel.min.js");

self.onmessage = function(e){
	var time = -1, success = false, data = e.data, ticks = Date.now();

	if(typeof data === "string"){
		Babel.transform(data, { presets: ["es2015"] });

		time = Date.now() - ticks;
		success = true;
	}

	self.postMessage({
		time: time,
		success: success
	});
};