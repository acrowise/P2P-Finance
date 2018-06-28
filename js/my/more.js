  var vm = new Vue({
	el: '#vue-app',
    data: {
    	vesions:'3.2.0'
    },
    mounted: function () {
    	this.$nextTick(function () {
    		if(window.plus){
    			 vm.plusReady();
    		}else{
    			 document.addEventListener('plusready',vm.plusReady,false);
    		}
    	});
    },
  	methods: {	
  		plusReady:function(){
  			  plus.runtime.getProperty( plus.runtime.appid, function (wgtinfo) {
               vm.vesions=wgtinfo.version;
			    });
  		},
	    href:function(data){
	    	if(!sui.IsNullOrEmpty(data.name)){
	    		sui.open(data.url,data.id,{},{},true,data.name,false);	
	    	}else{
	    		 sui.open(data.url,data.id,{},{});	
	    	}
	    },
	}
});