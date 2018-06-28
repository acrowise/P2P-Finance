var vm = new Vue({
	el: '#vue-app',
    data: {
    	model:{}
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
		 	if(sui.isLogin()){
		 		setTimeout(function(){
		 			var w=sui.wait();
		 			sui.request('User/GetMessageSet',{},true,function(data){
		 				sui.closewait(w);
			    		if(data){
			    			if(data.IsPass){
			    			    vm.model=data.ReturnObject || {};
			    			}else{
			    				mui.toast(data.Desc);
			    			}
			    		}
			    	});
		 		},sui.constNum());
		 	}
		 },
		 btnSwitch:function(event,dom){
		 	vm.setMsg(dom,event.detail.isActive);
		 },
	  	 setMsg:function(fileds, filedsValue){
	  	 	sui.request('User/SetUserMessage',{fileds:fileds,filedsValue:filedsValue},true,function(data){});
	  	}
  	}
});
