var vm = new Vue({
	el: '#vue-app',
    data: {
       model:{},
       acquirer:{index:1,list:[]},
       id:null
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
  			vm.id=curr.Id;
		    vm.transferDetail(vm.id);
		    setTimeout(function() {
				 mui('#pullrefresh').pullRefresh().pullupLoading();
			}, mui.os.ios?200:0);
  		},
	    transferDetail:function(id){
	    	setTimeout(function(){
				var w=sui.wait();
				sui.request('Transfer/UserTransferDetail',{transferId:id},true,function(data){
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
	   },
	    pullupRefresh:function(){
	    	setTimeout(function() {
	    		sui.request('Invest/TenderList',{loanId:vm.id,loanType:4,pageIndex:vm.acquirer.index},true,function(data){
	    			var refresh=false;
		    		if(data){
		    			if(data.IsPass){
		    				 var len=data.ReturnList.length;
		    				 	if(len>0){
								    vm.acquirer.list=vm.acquirer.list.concat(data.ReturnList);
									 vm.acquirer.index++;
								}else{
									refresh=true;
								}
		    			}else{
		    				mui.toast(data.Desc);
		    			}
		    		}
		    		mui('#pullrefresh').pullRefresh().endPullupToRefresh(refresh);
		    	});
	    	},150);
	    },
	    btnCancle:function(){
	    		var bts=[{title:"确认",style:"destructive"}];
			    plus.nativeUI.actionSheet({title:"确认取消转让吗?",cancel:"取消",buttons:bts},function(e){
					if (e.index == 1) {
						var w=sui.wait(true,true,'请稍候...');
						sui.request('Transfer/CancelTransfer',{transferId:vm.id},true,function(data){
							w=sui.closewait(w,true);
							if(data){
								var IsPass=data.IsPass;
								if(IsPass){		
									var curr=plus.webview.currentWebview();
									var parent=curr.opener();
									parent&&parent.evalJS('vm.downRefresh(1);');
									setTimeout(function(){
										mui.toast('取消成功');
										curr.close();
									},200);
								}else{
									mui.toast(data.Desc);
								}
							}
					  });
					}
				 });
	    }
	},
	filters:{
		getState:function(value){
			//状态：1-转让中 2-取消 3-成功 4-失败
			return value?["转让中","已取消","转让成功","转让失败"][value-1]:"";
		}
	}
});

(function($) {
	$.init({
		pullRefresh: {
			container: '#pullrefresh',
			up: {
				callback: vm.pullupRefresh
			}
		}
	});
})(mui);