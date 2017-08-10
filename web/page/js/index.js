new function(Rexjs, controllerProvider, routeConfigs){

this.File = function(Module, forEach, registerController){
	function File($q){
		this.defered = $q.defer();
	};
	File = new Rexjs(File);

	File.props({
		load: function(filename){
			var defered = this.defered;

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
// window.rexjsAngularModule = new this.Module();
}(
	Rexjs,
	// controllerProvider
	null,
	// routeConfigs
	{
		home: {
			url: "",
			templateUrl: "page/home/index.html",
			resolve: {
				browser: function($file){
					return $file.load("page/home/css/browser.css");
				},
				code: function($file){
					return $file.load("page/home/js/code.js");
				},
				index: function($file){
					return $file.load("page/home/css/index.css");
				},
				learn: function($file){
					return $file.load("page/home/css/learn.css");
				},
				previewer: function($file){
					return $file.load("common/ui/previewer");
				},
				profile: function($file){
					return $file.load("page/home/js/profile.js");
				},
				syntax: function($file){
					return $file.load("page/home/css/syntax.css");
				}
			}
		},
		feedback: {
			url: "/feedback",
			templateUrl: "page/feedback/index.html",
			resolve: {
				index: function($file){
					return $file.load("page/feedback/css/index.css");
				}
			}
		}
	}
);