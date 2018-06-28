var vm = new Vue({
	el: '#vue-app',
    data: {
       content:"",
       isIos:false,
       show:true
    },
    mounted: function () {
    	var $this=this;
    	$this.$nextTick(function () {
    		 if(window.plus){
			     $this.plusReady();
			    }else{
			     document.addEventListener('plusready',$this.plusReady,false);
			  }	
    	});
    },
  	methods: {	
  		plusReady:function(){
  			var curr=plus.webview.currentWebview();
			vm.riskControl(curr.Id,curr.type,curr.loanId);
  		},
	    riskControl:function(id,type,loanId){
	    	if(id){
	    		var param=type==4?loanId:id;
	    		setTimeout(function(){
			    	   mui.os.ios&&(vm.isIos=true);
						var w=sui.wait();
						sui.request('Loan/RiskControl',{loanId:param},true,function(data){
							if(data){
								var IsPass=data.IsPass;
								if(IsPass){
								    vm.content=data.ReturnObject;
									sui.closewait(w);
								}else{
									mui.toast(data.Desc);
							        sui.closewait(w);
								}
							}else{
							 sui.closewait(w);
						  }
					  });
				},sui.constNum());
	    	}else{
	    		//1-房易融 2-月账户 3-年账户 4-债转
	    		vm.show=false;
	    	}
	    }
	}
});