export let { Controller } = new function(babelWorker, traceurWorker, rexjsWorker, origin){

this.Controller = function(document, configs, secs, sizes, workerSupported, isMobile, confirm, codeOf){
	return class Controller {
		constructor($scope, $element){
			var svgElement = $element[0].querySelector("svg");

			$scope.secs = secs;
			$scope.sizes = sizes;
			$scope.surplus = 0;
			$scope.canWork = workerSupported;
			$scope.configs = configs;
			$scope.description = "";

			$scope.start = () => {
				if(isMobile){
					if(!confirm("该性能测试比较耗内存，若内存不够，会导致页面重新加载，是否要继续？")){
						return;
					}
				}

				var times = configs.length;

				$scope.surplus = sizes.length * 3;
				svgElement.innerHTML = "";

				configs.forEach((config, i) => {
					this.test(config.worker, config.type, svgElement, config.color);
				});
			};
			
			this.$scope = $scope;
		};

		static get controllerName(){
			return "home-profile";
		};

		test(worker, type, svgElement, color, _callback){
			var i = 0, $scope = this.$scope, { width, height } = svgElement.getBoundingClientRect(), x1 = 0, y1 = height;

			worker.onmessage = (e) => {
				var time = e.data.time, x2 = i / (sizes.length - 1) * width, y2 = height - time / secs[0] / 1000 * height;

				if(i > 0){
					var lineElement = document.createElementNS("http://www.w3.org/2000/svg", "line");
				
					lineElement.style.stroke = color;
					
					lineElement.setAttribute("x1", x1);
					lineElement.setAttribute("y1", y1);

					lineElement.setAttribute("x2", x2);
					lineElement.setAttribute("y2", y2);

					svgElement.appendChild(lineElement);
				}

				$scope.description = `${type} - ${sizes[i]}kb：${time}ms`;
				$scope.surplus--;

				$scope.$apply();

				i++;
				x1 = x2;
				y1 = y2;
			};

			sizes.forEach((size) => {
				worker.postMessage(codeOf(size));
			});
		}
	};
}(
	document,
	// configs
	[{
		type: "babel",
		color: "blue",
		version: "6.25.0",
		size: 765,
		min: true,
		href: "https://unpkg.com/babel-standalone@6/babel.min.js",
		get worker(){
			if(!babelWorker){
				babelWorker = new Worker(`./page/home/js/${this.type}-worker.js`);
			}

			return babelWorker;
		}
	}, {
		type: "traceur",
		color: "green",
		version: "0.0.112",
		size: 1400,
		min: false,
		href: "https://google.github.io/traceur-compiler/bin/traceur.js",
		get worker(){
			if(!traceurWorker){
				traceurWorker = new Worker(`./page/home/js/${this.type}-worker.js`);
			}

			return traceurWorker;
		}
	}, {
		type: "rexjs",
		color: "red",
		version: "1.5.3",
		size: 229,
		min: true,
		href: "https://raw.githubusercontent.com/china-liji/Rexjs/master/dist/rex.min.js",
		get worker(){
			if(!rexjsWorker){
				rexjsWorker = new Worker(`./page/home/js/${this.type}-worker.js`);
			}

			return rexjsWorker;
		}
	}],
	// secs
	[10, 7.5, 5, 2.5, 0],
	// sizes
	[0, 5, 10, 20, 50, 100, 200, 500, 1000, 2000],
	// workerSupported
	typeof Worker !== "undefined",
	// isMobile
	!!navigator.userAgent.match(/(?:^|\W)(?:iPhone|iPad|Android|Windows Phone|iPod)(?:\W|$)/i),
	confirm,
	// codeOf
	function(size){
		var code = "";

		for(var i = 0, j = size * 1024 / origin.length - 1;i < j;i++){
			code += "\n" + origin;
		}

		return code;
	}
);

}(
	// babelWorker
	null,
	// traceurWorker
	null,
	// rexjsWorker
	null,
	// origin
	Rexjs
		.Module
		.cache[
			new Rexjs.ModuleName("./page/home/js/profile.js").href
		]
		.origin
		// 当前引入的 traceur 不支持模块解析
		.replace(
			/^[\s\S]*?export\s+let\s+\{[^\}]*\}\s*=/,
			""
		)
);