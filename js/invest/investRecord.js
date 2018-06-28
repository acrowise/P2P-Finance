var vm = new Vue({
	el: '#vue-app',
    data: {
    	tenderList:[],
    	index:1,
    	id:0,
    	type:1,
    	show:true
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
  			vm.id=curr.Id;
  			//1-房易融 2-月账户 3-年账户 4-债转
  			vm.type=curr.type;
			setTimeout(function() {
				 mui('#pullrefresh').pullRefresh().pullupLoading();
			}, mui.os.ios?200:0);
		},
	    pullupRefresh:function(){
	    	var postUrl=vm.id?'Invest/TenderList':'Invest/YearsTenderList';
    		var param={pageIndex:vm.index,loanType:vm.type};
    		if(vm.id){
    			param.loanId=vm.id;
    		}
	    	setTimeout(function() {
	    		sui.request(postUrl,param,true,function(data){
	    			var refresh=false;
		    		if(data){
		    			if(data.IsPass){
		    				 	if(data.ReturnList && data.ReturnList.length){
								    vm.tenderList=vm.tenderList.concat(data.ReturnList);
									vm.index++;
								}else{
									refresh=true;
									if(vm.index==1){
										vm.show=false;
										 mui('#pullrefresh').pullRefresh().disablePullupToRefresh();
									     sui.createtips('wujilu','暂无记录');  
									}
								}
		    			}else{
		    				mui.toast(data.Desc);
		    			}
		    		}
		    		mui('#pullrefresh').pullRefresh().endPullupToRefresh(refresh);
		    	});
	    	},150);
	    },
	    icon:function(channel){
			//渠道：1-网站 2-微信 3-安卓 4-IOS 5-触屏版 6-运营后台 7-支付宝
		   var icon= ['icon-dashboard','icon-weixin1','icon-shouji','icon-shouji','icon-shouji','icon-dashboard','icon-zhifubao'][channel-1];
		   return icon || 'icon-dashboard';
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