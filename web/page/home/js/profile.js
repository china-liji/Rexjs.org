import "../css/profile.css";

export let { Controller } = new function(workerSupported, origin){

this.Controller = function(Worker, document, configs, secs, sizes, codeOf){
	return class Controller {
		constructor($scope, $element){
			var svgElement = $element[0].querySelector("svg");

			$scope.secs = secs;
			$scope.sizes = sizes;
			$scope.surplus = 0;
			$scope.canWork = workerSupported;
			$scope.configs = configs;
			$scope.description = "";

			codeOf(100);

			$scope.start = () => {
				var times = configs.length;

				$scope.surplus = sizes.length * 3;
				svgElement.innerHTML = "";

				configs.forEach((config, i) => {
					this.test(config.type, svgElement, config.color);
				});
			};
			
			this.$scope = $scope;
		};

		static get controllerName(){
			return "home-profile";
		};

		test(type, svgElement, color, _callback){
			var i = 0, $scope = this.$scope, worker = new Worker(`page/home/js/${type}-worker.js`),
			
				{ clientWidth: width, clientHeight: height } = svgElement, x1 = 0, y1 = height;

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
	// Worker
	workerSupported ? Worker : null,
	document,
	// configs
	[{
		type: "babel",
		color: "blue",
		version: "6.25.0",
		size: 765,
		min: true,
		href: "https://unpkg.com/babel-standalone@6/babel.min.js"
	}, {
		type: "traceur",
		color: "green",
		version: "0.0.112",
		size: 1400,
		min: false,
		href: "https://google.github.io/traceur-compiler/bin/traceur.js"
	}, {
		type: "rexjs",
		color: "red",
		version: "1.0.0",
		size: 205,
		min: true,
		href: "http://rexjs.org/rex.min.js"
	}],
	// secs
	[10, 7.5, 5, 2.5, 0],
	// sizes
	[0, 50, 100, 200, 500, 1000, 2000],
	// codeOf
	function(size){
		var code = origin;

		for(var i = 0, j = size * 1024 / origin.length - 1;i < j;i++){
			code += "\n" + origin;
		}

		return code;
	}
);

}(
	// workerSupported
	typeof Worker === "function",
	// origin
	Rexjs
		.Module
		.cache[
			new Rexjs.ModuleName("/page/home/js/profile.js").href
		]
		.origin
		// 当前引入的 traceur 不支持模块解析
		.replace(
			/^[\s\S]*?export\s+let\s+\{[^\}]*\}\s*=/,
			""
		)
);