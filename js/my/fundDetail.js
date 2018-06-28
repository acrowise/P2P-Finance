var vm = new Vue({
	el: '#vue-app',
    data: {
    	fundList:[],
    	index:1,
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
			setTimeout(function() {
				 mui('#pullrefresh').pullRefresh().pullupLoading();
			}, mui.os.ios?200:0);
		},
	    pullupRefresh:function(){
	    	setTimeout(function() {
	    		sui.request('Account/FundDetailList',{pageIndex:vm.index},true,function(data){
	    			var refresh=false;
		    		if(data){
		    			if(data.IsPass){
	    				 	if(data.ReturnList && data.ReturnList.length){
							    vm.fundList=vm.fundList.concat(data.ReturnList);	
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
	},
	filters:{
		formatDate:function(value){
			return sui.formatDate('y-m-d h:i:s',value);
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