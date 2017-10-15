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
			function($state){
				return new member($state);
			}
		);
	}
);

this.NavController = function(){
	function NavController($scope, $state){
		$scope.$state = $state;
	};
	NavController = new Rexjs(NavController);

	NavController.static({
		get controllerName(){
			return "nav";
		}
	});

	return NavController;
}();

this.GlobalConstants = function(GIT_USER){
	function GlobalConstants(module){
		module.constant("GIT_USER", GIT_USER);
		module.constant("GIT_REPO", GIT_USER + "/Rexjs");
	};
	GlobalConstants = new Rexjs(GlobalConstants);
	
	return GlobalConstants;
}(
	// GIT_USER
	"https://github.com/china-liji"
);

this.Module = function(File, NavController, GlobalConstants, angular, app, forEach){
	function Module(){
		var module = angular.module(
			app,
			["ui.router"],
			function($controllerProvider, $compileProvider){
				controllerProvider = $controllerProvider;
				compileProvider = $compileProvider;
			}
		);

		new GlobalConstants(module);

		module.config(function($stateProvider, $urlRouterProvider){
			forEach(
				routeConfigs,
				function(config, name){
					$stateProvider.state(name, config);
				}
			);

			$urlRouterProvider.otherwise("/home");
		});

		module.service("$file", File);
		module.controller(NavController.controllerName, NavController);

		Rexjs.ECMAScriptParser.sourceMaps = true;
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
	this.NavController,
	this.GlobalConstants,
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
			about: {
				url: "/about",
				templateUrl: "page/about/index.html",
				resolve: [
					"page/about/css/index.css",
					"common/ui/markdown"
				]
			},
			book: {
				url: "/book/:name/:nav",
				templateUrl: "page/book/index.html",
				resolve: [
					"page/book/css/index.css",
					"page/book/css/nav.css",
					"page/book/css/context.css",
					"page/book/js/nav.js",
					"page/book/js/context.js",
					"common/ui/previewer",
					"common/ui/markdown"
				]
			},
			feedback: {
				url: "/feedback",
				templateUrl: "page/feedback/index.html",
				resolve: [
					"page/feedback/css/index.css",
					"page/feedback/js/index.js"
				]
			},
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