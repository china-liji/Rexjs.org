new function(fs, path, contentTypes, error){

this.Server = function(DIR_NAME, http, readFile){
	return class Server {
		constructor(){
			var server = http.createServer((incomingMessage, serverResponse) => {
				var fullPath, url = incomingMessage.url, p = path.parse(url);

				if(p.ext === ""){
					url += "/index.html";
					p = path.parse(url);
				}

				fullPath = DIR_NAME + url;

				serverResponse.setHeader("charset", "utf8");

				fs.stat(
					fullPath,
					(err, stats) => {
						if(err || !stats.isFile()){
							error(serverResponse);
							return;
						}

						readFile(fullPath, p, serverResponse);
					}
				);
			});

			server.listen(
				"2017",
				() => {
					console.log("服务器开启，端口：2017");
				}
			);
		};
	};
}(
	// DIR_NAME
	path.resolve(__dirname, "../"),
	require("http"),
	// readFile
	(fullPath, path, serverResponse) => {
		var contentType = contentTypes[path.ext];

		if(!contentType){
			console.log(path);
			error(serverResponse);
			return;
		}

		fs.readFile(
			fullPath,
			contentType.encoding,
			(err, content) => {
				if(err){
					error(serverResponse);
					return;
				}

				serverResponse.setHeader("Content-Type", `${contentType.type};charset=utf-8;`);
				serverResponse.writeHead(200);
				serverResponse.write(content);
  				serverResponse.end();
			}
		);
	}
);

new this.Server();

}(
	require("fs"),
	require("path"),
	// contentTypes
	{
		".txt": {
			type: "text/plain",
			encoding: "utf8"
		},
		".js": {
			type: "text/javascript",
			encoding: "utf8"
		},
		".html": {
			type: "text/html",
			encoding: "utf8"
		},
		".css": {
			type: "text/css",
			encoding: "utf8"
		},
		".json": {
			type: "application/json",
			encoding: "utf8"
		},
		".xml": {
			type: "text/xml",
			encoding: "utf8"
		},
		".md": {
			type: "text/plain",
			encoding: "utf8"
		},
		".png": {
			type: "text/xml",
			encoding: null
		}
	},
	// error
	(serverResponse) => {
		serverResponse.setHeader("Content-Type", "text/plain;charset=utf-8;");
		serverResponse.writeHead(404);
		// serverResponse.write("找不到指定文件！");
		serverResponse.end();
	}
);