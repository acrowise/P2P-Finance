var vm = new Vue({
	el: '#vue-app',
    data: {
       model:""
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
  			var curr=plus.webview.currentWebview();
			vm.getTracking(curr.Id,curr.type,curr.loanId);
  		},
	    getTracking:function(id,type,loanId){
    		var param=type==4?loanId:id;
    		setTimeout(function(){
					var w=sui.wait();
					sui.request('Loan/Tracking',{loanId:param},true,function(data){
						sui.closewait(w);
						if(data){
							var IsPass=data.IsPass;
							if(IsPass){
								data.ReturnObject?(vm.model=data.ReturnObject):sui.createtips('wujilu','暂无记录');
							}else{
								mui.toast(data.Desc);
							}
						}
				  });
			},sui.constNum());
	    }
	}
});