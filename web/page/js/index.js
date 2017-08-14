new function(Rexjs, controllerProvider, compileProvider, routeConfigs){

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
				return;

			default:
				controllerProvider.register(controllerName, member);
				return;
		}

		var directiveName = member.directiveName

		if(typeof directiveName !== "string"){
			return;
		}

		if(directiveName.indexOf("-") > -1){
			directiveName = (
				directiveName.split("-").map(function(substring, i){
					if(i === 0){
						return substring;
					}

					return substring[0].toUpperCase() + substring.substring(1);
				})
				.join("")
			);
		}

		compileProvider.directive(
			directiveName,
			function(){
				return new member();
			}
		);
	}
);

this.Module = function(File, angular, app, forEach){
	function Module(){
		var origin = angular.module(
			app,
			["ui.router"],
			function($controllerProvider, $compileProvider){
				controllerProvider = $controllerProvider;
				compileProvider = $compileProvider;
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
	// compileProvider
	null,
	// routeConfigs
	Rexjs.forEach(
		{
			home: {
				url: "/home",
				templateUrl: "page/home/index.html",
				resolve: [
					"page/home/css/browser.css",
					"page/home/css/index.css",
					"page/home/css/code.css",
					"page/home/css/learn.css",
					"page/home/css/profile.css",
					"common/ui/previewer",
					"common/ui/syntax-list",
					"page/home/js/code.js",
					"page/home/js/learn.js",
					"page/home/js/profile.js"
				]
			},
			feedback: {
				url: "/feedback",
				templateUrl: "page/feedback/index.html",
				resolve: [
					"page/feedback/css/index.css"
				]
			},
			preview: {
				url: "/preview",
				templateUrl: "page/preview/index.html",
				params: {
					name: ""
				},
				resolve: [
					"page/preview/css/nav.css",
					"page/preview/css/details.css",
					"common/ui/syntax-list",
					"common/ui/previewer",
					"page/preview/js/index.js",
					"page/preview/js/nav.js",
					"page/preview/js/details.js"
				]
			}
		},
		function(state){
			var resolve = {};

			state.resolve.forEach(function(filename, i){
				resolve[i] = function($file){
					return $file.load(filename);
				}
			});

			state.resolve = resolve;
		}
	)
);