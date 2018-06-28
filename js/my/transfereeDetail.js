var vm = new Vue({
	el: '#vue-app',
    data: {
       model:{},
       isIos:false
    },
    mounted: function () {
    	var $this=this;
    	$this.$nextTick(function () {
    		 if(window.plus){
			     $this.plusReady();
			    }else{
			     document.addEventListener('plusready',vm.plusReady,false);
			  }	
    	});
    },
  	methods: {	
  		plusReady:function(){
  			var curr=plus.webview.currentWebview();
		    vm.acquirerDetail(curr.Id,curr.detailId);
  		},
	    acquirerDetail:function(id,detailId){
	    	setTimeout(function(){
	    		mui.os.ios&&(vm.isIos=true);
				var w=sui.wait();
				sui.request('Transfer/AcquirerDetail',{transferId:id,tenderDetailId:detailId},true,function(data){
					sui.closewait(w);
					if(data){
						var IsPass=data.IsPass;
						if(IsPass){
						    vm.model=data.ReturnObject;
						}else{
							mui.toast(data.Desc);
						}
					}
			  });
			},sui.constNum());
	    }
	}
});