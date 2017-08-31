importScripts("../../../rex-api.min.js");

var parser = new Rexjs.ECMAScriptParser();

parser.parse(
	new Rexjs.File("test", "")
);

self.onmessage = function(e){
	var time = -1, success = false, data = e.data, ticks = Date.now();

	if(typeof data === "string"){
		parser.parse(
			new Rexjs.File("test", data)
		);

		time = Date.now() - ticks;
		success = true;
	}

	self.postMessage({
		time: time,
		success: success
	});
};