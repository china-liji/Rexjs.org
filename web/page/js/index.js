new function(Rexjs, controllerProvider, routeConfigs){

this.File = function(Module, forEach, q, registerController){
	function File($q){
		q = $q;
	};
	File = new Rexjs(File);

	File.props({
		load: function(filename){
			var defered = q.defer();

			new Module(filename).evalListener(function(mod){
				forEach(mod.exports, registerController);
				defered.resolve();
			});

			return defered.promise;
		}
	});

	return File;
}(
	Rexjs.Module,
	Rexjs.forEach,
	// q
	null,
	// registerController
	function(member){
		var controllerName = member.controllerName;

		switch(true){
			case typeof controllerName !== "string":
				break;

			case controllerProvider.has(controllerName):
				break;

			default:
				controllerProvider.register(controllerName, member);
				break;
		}
	}
);

this.Module = function(File, angular, app, forEach){
	function Module(){
		var origin = angular.module(
			app,
			["ui.router"],
			function($controllerProvider){
				controllerProvider = $controllerProvider;
			}
		);

		origin.config(function($stateProvider, $urlRouterProvider){
			forEach(
				routeConfigs,
				function(config, name){
					$stateProvider.state(name, config);
				}
			);

			$urlRouterProvider.otherwise("/home");
		});

		origin.service("$file", File);
	};
	Module = new Rexjs(Module);

	Module.props({
		controller: function(name, controller){
			controllerProvider.register(name, controller);
		}
	});

	return Module;
}(
	this.File,
	angular,
	// app
	document.querySelector("[ng-app]").getAttribute("ng-app"),
	Rexjs.forEach
);

new this.Module();
}(
	Rexjs,
	// controllerProvider
	null,
	// routeConfigs
	Rexjs.map(
		{
			home: [
				"page/home/css/browser.css",
				"page/home/css/index.css",
				"page/home/css/learn.css",
				"common/ui/previewer",
				"page/home/js/code.js",
				"page/home/js/syntax.js",
				"page/home/js/profile.js"
			],
			feedback: [
				"page/feedback/css/index.css"
			],
			preview: [
				"page/home/js/preview.js"
			]
		},
		function(filenames, name){
			var resolve = {};

			filenames.forEach(function(filename, i){
				resolve[i] = function($file){
					return $file.load(filename);
				}
			});

			return {
				url: "/" + name,
				templateUrl: "page/" + name + "/index.html",
				resolve: resolve
			};
		}
	)
);