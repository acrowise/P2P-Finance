var vm=new Vue({
	el:"#vue-app",
	data:{
	},
	mounted:function(){
	    this.$nextTick(function () {
		});
	},
	methods:{
		btnOpening:function(type){
	    	if(type==1){
	    		sui.open('../bank/personalOpening.html','personalOpening.html',{},{},true,'个人开户',false);
	    	}else{
	    		sui.open('../bank/businessOpening.html','businessOpening.html',{},{},true,'企业开户',false);
	    	}
	    }
	}
});
