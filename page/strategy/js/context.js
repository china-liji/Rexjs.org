export let { Directive } = new function(reset){

this.Directive = function(defineProperty){
	return class Directive {
		constructor($state){
			this.$state = $state;
			this.replace = true;
		};

		static get directiveName(){
			return "strategy-context";
		};

		get templateUrl(){
			return `page/strategy/html/${this.$state.params.nav}.html`;
		};

		set templateUrl(value){
			defineProperty(
				this,
				"templateUrl",
				{
					value,
					enumerable: true,
					writable: true,
					configurable: true
				}
			);
		};
	};
}(
	Object.defineProperty
);

}();