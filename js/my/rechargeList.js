var vm = new Vue({
	el: '#vue-app',
    data: {
    	rechargeList:[],
    	index:1,
    	show:true,
    	elem:null
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
			setTimeout(function() {
				 mui('#pullrefresh').pullRefresh().pullupLoading();
			}, mui.os.ios?200:0);
		},
	    href:function(){
			sui.open('recharge.html','recharge.html',{},{},true,'充值',false);	 
	    },
	    pulldownRefresh:function(){
	    	   vm.elem=sui.rmovetips(vm.elem);
	    	   setTimeout(function() {
		    		sui.request('Account/RechargeList',{pageIndex:1},true,function(data){
			    		if(data){
			    			if(data.IsPass){
		    				 	if(data.ReturnList&&data.ReturnList.length){
								    vm.rechargeList=data.ReturnList;	
									vm.index=2;
									 setTimeout(function(){
										mui('#pullrefresh').pullRefresh().enablePullupToRefresh();
								        mui('#pullrefresh').pullRefresh().refresh(true);
								   },mui.os.ios?600:200);
								}else{
									 vm.show=false;
									 mui('#pullrefresh').pullRefresh().disablePullupToRefresh();
								     vm.elem=sui.createtips('wujilu','暂无记录');
								}
			    			}else{
			    				mui.toast(data.Desc);
			    			}
			    		}
			    	});
	    	},150);
	    },
	    pullupRefresh:function(){
	    	setTimeout(function() {
	    		sui.request('Account/RechargeList',{pageIndex:vm.index},true,function(data){
	    			var refresh=false;
		    		if(data){
		    			if(data.IsPass){
	    				 	if(data.ReturnList&&data.ReturnList.length){
							    vm.rechargeList=vm.rechargeList.concat(data.ReturnList);	
								vm.index++;
							}else{
								refresh=true;
								if(vm.index==1){
									vm.show=false;
									 mui('#pullrefresh').pullRefresh().disablePullupToRefresh();
								     vm.elem=sui.createtips('wujilu','暂无记录');
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
	},
	filters:{
		formatDate:function(value){
			return sui.formatDate('y-m-d h:i:s',value);
		},
		getState:function(value){
			return ['充值中','成功','失败'][value-1];
		},
		getAmount:function(value){
			return sui.rmoney(value);
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