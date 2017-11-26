new function(Rexjs, controllerProvider, compileProvider, routeConfigs){

this.File = function(Module, forEach, q, registerController){
	/**
	 * 文件服务
	 * @param {$q} $q - Angular 参数 $q
	 */
	function File($q){
		q = $q;
	};
	File = new Rexjs(File);

	File.props({
		count: 0,
		/**
		 * 加载文件
		 * @param {String} filename - 文件名
		 */
		load: function(filename){
			var file = this, defered = q.defer();

			this.surplus++;
			this.count++;

			// 添加监听器
			new Module(filename).evalListener(function(mod){
				// 对每一个输出进行处理
				forEach(mod.exports, registerController);
				defered.resolve();

				// 如果剩余量为 0
				if(--file.surplus === 0){
					// 清零总数
					file.count = 0;
				}
			});

			return defered.promise;
		},
		surplus: 0
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
			// 如果没有控制器名称
			case typeof controllerName !== "string":
				break;

			// 如果已存在同名控制器
			case controllerProvider.has(controllerName):
				return;

			default:
				// 注册控制器
				controllerProvider.register(controllerName, member);
				return;
		}

		var directiveName = member.directiveName

		// 如果没有指令名称
		if(typeof directiveName !== "string"){
			return;
		}

		// 如果名称中存在“-”连接符
		if(directiveName.indexOf("-") > -1){
			// 重置名称
			directiveName = (
				// 对每一节进行处理
				directiveName.split("-").map(function(substring, i){
					// 如果是第一节
					if(i === 0){
						return substring;
					}

					// 首字符转为大写
					return substring[0].toUpperCase() + substring.substring(1);
				})
				.join("")
			);
		}

		// 注册指令
		compileProvider.directive(
			directiveName,
			function($state){
				return new member($state);
			}
		);
	}
);

this.NavController = function(){
	/**
	 * 网页顶部导航控制器
	 * @param {$scope} $scope - Angular 参数 $scope
	 * @param {$element} $element - Angular 参数 $element
	 * @param {$state} $state - Angular 参数 $state
	 */
	function NavController($scope, $element, $state, $file){
		$scope.$state = $state;
		$scope.$file = $file;

		// 监听元素就绪
		$element.ready(function(){
			// 显示导航内容
			$element.find("nav").removeAttr("hidden");
		});
	};
	NavController = new Rexjs(NavController);

	NavController.static({
		/**
		 * 控制器名称
		 */
		get controllerName(){
			return "nav";
		}
	});

	return NavController;
}();

this.GlobalConstants = function(GIT_USER){
	/**
	 * 全局常亮
	 * @param {Module} module - Angular 模块
	 */
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
	/**
	 * 整个项目的模块
	 */
	function Module(){
		// 注册模块
		var module = angular.module(
			app,
			["ui.router"],
			function($controllerProvider, $compileProvider){
				controllerProvider = $controllerProvider;
				compileProvider = $compileProvider;
			}
		);

		// 初始化全局常亮
		new GlobalConstants(module);

		// 模块配置
		module.config(function($stateProvider, $urlRouterProvider){
			// 遍历路由配置
			forEach(
				routeConfigs,
				function(config, name){
					// 注册路由状态
					$stateProvider.state(name, config);
				}
			);

			// 默认路径
			$urlRouterProvider.otherwise("/home");
		});

		// 注册服务
		module.service("$file", File);
		// 注册控制器
		module.controller(NavController.controllerName, NavController);

		// 启用 source map
		Rexjs.ECMAScriptParser.sourceMaps = true;
	};
	Module = new Rexjs(Module);

	Module.props({
		/**
		 * 注册控制器
		 * @param {String} name - 控制器名称
		 * @param {Function} controller - 控制器
		 */
		controller: function(name, controller){
			// 注册控制器
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
				url: "/about.md",
				templateUrl: "page/about/index.html",
				resolve: [
					"page/about/css/index.css",
					"common/ui/markdown"
				]
			},
			book: {
				url: "/book/:name/:nav.md",
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