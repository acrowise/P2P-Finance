var vm=new Vue({
	el: '#vue-app',
    data: {
    	tips:""
    },
    mounted: function () {
    	this.$nextTick(function () {
    		var name=localStorage.getItem('qhlead_userMobile')||"";
    		if(sui.IsNullOrEmpty(name)){
    			vm.tips="你正在重置宜宾银行交易密码";
    		}else{
    			vm.tips="你正在为"+sui.formatMobile(name)+"重置交易密码";
    		}
    	});
    },
  	methods: {	
	    href:function(data){
	    	sui.open(data.url,data.id,{},{});
	    }
	}
});