import "./index.css";
import template from "./index.html";
import syntaxList from "../../data/syntax.json";

export let { Directive } = new function(){

this.Controller = function(){
	return class Controller {
		constructor($scope, $state){
			$scope.syntaxList = syntaxList;

			$scope.go = (name) => {
				if($scope.$emit("syntax-list-go", name).defaultPrevented){
					return;
				}

				$state.go("preview", { name });
			};
		};
	};
}();

this.Directive = function(Controller){
	return class Directive {
		constructor(){};

		static get directiveName(){
			return "syntax-list"
		};

		get replace(){
			return true;
		};

		get controller(){
			return Controller;
		};

		get template(){
			return template;
		};
	};
}(
	this.Controller
);

}();