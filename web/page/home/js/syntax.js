import "../css/syntax.css";
import syntaxList from "../../../common/data/syntax.json";

export let { Controller } = new function(){

this.Controller = function(){
	return class Controller {
		constructor($scope){
			$scope.syntaxList = syntaxList;
		};

		static get controllerName(){
			return "home-syntax";
		};
	};
}();

}();