var vm = new Vue({
	el: '#vue-app',
    data: {
       model:{},
       isIos:false
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
			vm.getLoanUser(curr.Id,curr.type,curr.loanId);
  		},
	    getLoanUser:function(id,type,loanId){
    		var param=type==4?loanId:id;
    		setTimeout(function(){
		    	   mui.os.ios&&(vm.isIos=true);
					var w=sui.wait();
					sui.request('Loan/LoanUser',{loanId:param},true,function(data){
						sui.closewait(w);
						if(data){
							var IsPass=data.IsPass;
							if(IsPass){
							    vm.model=data.ReturnObject;
							    vm.$nextTick(function(){
							    	vm.$refs.container.classList.remove('mui-hidden');
							    });
							}else{
								mui.toast(data.Desc);
							}
						}
				  });
			},sui.constNum());
	    }
	}
});