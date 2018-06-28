var vm = new Vue({
	el: '#vue-app',
    data: {
    	coupon:[],
    	hongbao:[],
    	index:1,
    	type:2,
    	status:3,
    	name:'红包',
    	stateName:'未使用',
    	loopPullDown:null,
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
  			var curr=plus.webview.currentWebview();
  			if(curr.type&&curr.type==3){
  				vm.name="We券";
				 vm.type=3;
  			}
			setTimeout(function() {
				 mui('#pullrefresh').pullRefresh().pullupLoading();
			}, mui.os.ios?200:0);
		},
		pulldownRefresh:function(){
			   var w=sui.wait();
			   vm.elem=sui.rmovetips(vm.elem);
	    		clearTimeout(vm.loopPullDown);
				setTimeout(function() {
					sui.request('User/CouponList',{type:vm.type,status:vm.status,pageIndex:1},true,function(data){
						sui.closewait(w);
						if(data){
							var IsPass=data.IsPass;
							if(IsPass){
								if(data.ReturnList.length){
									if(vm.type==2){
										vm.coupon=[];
										vm.hongbao=data.ReturnList;
									}else{
										vm.hongbao=[];
										vm.coupon=data.ReturnList;
									}
									vm.index=2;
									vm.loopPullDown= setTimeout(function(){
										mui('#pullrefresh').pullRefresh().enablePullupToRefresh();
								        mui('#pullrefresh').pullRefresh().refresh(true);
									},mui.os.ios?600:200);
								}else{
									vm.coupon=[];
									vm.hongbao=[];
									mui('#pullrefresh').pullRefresh().disablePullupToRefresh();
									vm.elem=sui.createtips('wujilu','暂无记录');
								}
							}else{
								mui.toast(data.Desc);
							}
						}
					});
				}, 150);
	    },
	    pullupRefresh:function(){
	    	setTimeout(function() {
	    		sui.request('User/CouponList',{type:vm.type,status:vm.status,pageIndex:vm.index},true,function(data){
	    			var refresh=false;
		    		if(data){
		    			if(data.IsPass){
		    				 	if(data.ReturnList.length){
		    				 		if(vm.type==2){
										 vm.hongbao=vm.hongbao.concat(data.ReturnList);
									}else{
										 vm.coupon=vm.coupon.concat(data.ReturnList);
									}
									 vm.index++;
								}else{
									if(vm.index==1){
										 refresh=true;
										 mui('#pullrefresh').pullRefresh().disablePullupToRefresh();
									     vm.elem=sui.createtips('wujilu','暂无记录');
									}else{
										 refresh=true;
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
	    quanType:function(){
    		var bts=[{title:"红包"},{title:"We券"}];
		    plus.nativeUI.actionSheet({cancel:"取消",buttons:bts},function(e){
				if (e.index ==1&&vm.type!=2) {
			       	 vm.type=2;
			       	 vm.name="红包"
			       	 vm.pulldownRefresh();
				}else if(e.index==2&&vm.type!=3){
			       	vm.name="We券";
				    vm.type=3;
			       	vm.pulldownRefresh();
				}
			 });
	    },
	    quanStatus:function(){
	    	var bts=[{title:"未使用"},{title:"已使用"},{title:"已过期"}];
		    plus.nativeUI.actionSheet({cancel:"取消",buttons:bts},function(e){
				if (e.index ==1 && vm.status!=3) {
			       vm.stateName="未使用"
			       vm.status=3;
			       vm.pulldownRefresh();
				}else if(e.index==2 && vm.status!=4){
					vm.stateName="已使用";
					vm.status=4;
					vm.pulldownRefresh();
				}else if(e.index==3 && vm.status!=5){
					vm.stateName="已过期";
					vm.status=5;
					vm.pulldownRefresh();
				}
			 });
	    }
	},
	filters:{
        getAmount:function(value){
        	return value?sui.rmoney(value):'0.00';
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