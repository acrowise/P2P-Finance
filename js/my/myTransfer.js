var vm = new Vue({
	el: '#vue-app',
    data: {
    	loopPullDown:null,
    	activeTap:0,
    	can:{refresh:true,index:1,list:[]},//可转让
    	transfer:{refresh:true,index:1,list:[]},//转让记录
    	farmIn:{refresh:true,index:1,list:[]},//受让
    	elem:null,
    	isRefresh:false
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
  			vm.activeTap=curr.tap || 0;
  			setTimeout(function() {
				mui('#pullrefresh').pullRefresh().pulldownLoading();
			}, mui.os.ios?200:0);
		},
	    href:function(id,type,name){
    	    sui.open('../invest/investDetail.html',sui.webviewId(),{Id:id,type:type},{},true,name,false);
	    },
	    tapEvent:function(index){
	    	//tap切换，暂未处理切换过快的情况
	    	 if(vm.activeTap==index){
			 	mui('#pullrefresh').pullRefresh().scrollTo(0,0,200);  
			 	return;
			 }
	    	vm.elem=sui.rmovetips(vm.elem);
			mui('#pullrefresh').pullRefresh().scrollTo(0,0,mui.os.ios?0:100);  
			vm.activeTap=index;
			var page=[vm.can.index,vm.transfer.index,vm.farmIn.index][index];
			var refresh=[vm.can.refresh,vm.transfer.refresh,vm.farmIn.refresh][index];
			if(page==1 || refresh){
				mui('#pullrefresh').pullRefresh().disablePullupToRefresh();
				mui('#pullrefresh').pullRefresh().pulldownLoading();
			}else{ 
				setTimeout(function(){
					//避免上拉加载字样出现太快
					mui('#pullrefresh').pullRefresh().enablePullupToRefresh();
		    		mui('#pullrefresh').pullRefresh().refresh(true);
				},200);
			}
	    },
	    pulldownRefresh:function(){
	    	   vm.elem=sui.rmovetips(vm.elem);
	    	   vm.isRefresh=true;
	    	    var index=vm.activeTap;
	    		clearTimeout(vm.loopPullDown);
				setTimeout(function() {
					var postUrl="Transfer/"+["CanTransferList","UserTransferList","FarmInList"][index];
					sui.request(postUrl,{pageIndex:1},true,function(data){
						mui('#pullrefresh').pullRefresh().endPulldownToRefresh();
						 vm.isRefresh=false;
						if(data){
							var IsPass=data.IsPass;
							if(IsPass){
								if(data.ReturnList && data.ReturnList.length){
									if(index==0){
										vm.can.list=data.ReturnList;
										vm.can.index=2;
										vm.can.refresh=false;
									}else if(index==1){
										vm.transfer.list=data.ReturnList;
										vm.transfer.index=2;
										vm.transfer.refresh=false;
									}else{
										vm.farmIn.list=data.ReturnList;
										vm.farmIn.index=2;
										vm.farmIn.refresh=false;
									}
									vm.loopPullDown= setTimeout(function(){
										mui('#pullrefresh').pullRefresh().enablePullupToRefresh();
								        mui('#pullrefresh').pullRefresh().refresh(true);
								  },mui.os.ios?600:200);
								}else{
									if(index==0){
										vm.can.list=[];
									}else if(index==1){
										vm.transfer.list=[];
									}else{
										vm.farmIn.list=[];
									}
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
	    	vm.isRefresh=true;
	    	var index=vm.activeTap;
	    	setTimeout(function() {
	    		var postUrl="Transfer/"+["CanTransferList","UserTransferList","FarmInList"][index];
	    		var page=[vm.can.index,vm.transfer.index,vm.farmIn.index][index];
	    		sui.request(postUrl,{pageIndex:page},true,function(data){
	    			var refresh=false;
	    			 vm.isRefresh=false;
		    		if(data){
		    			if(data.IsPass){
		    				 	if(data.ReturnList && data.ReturnList.length){
		    				 		if(index==0){
										vm.can.list=vm.can.list.concat(data.ReturnList);
										vm.can.index++;
									}else if(index==1){
										vm.transfer.list=vm.transfer.list.concat(data.ReturnList);
										vm.transfer.index++;
									}else{
										vm.farmIn.list=vm.farmIn.list.concat(data.ReturnList);
										vm.farmIn.index++;
									}
								}else{
									//这里未处理第一页的情况
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
	    btnTransfer:function(id,e){
	    	//转让
	    	e.stopPropagation();
	    	sui.open('transfer.html','transfer.html',{Id:id},{},true,'转让',false,true,'\ue705',function(){
		 	 var transfer=plus.webview.getWebviewById('transfer.html');
		  	 transfer&&transfer.evalJS('vm.hidden();');
	     	 sui.open('transferRules.html','transferRules.html',{},{},true,'转让规则',false);
	      });
	    	//sui.open('transfer.html','transfer.html',{Id:id});
	    },
	    transferDetail:function(id,e){
	    	//转让详情
	    	e.stopPropagation();
	    	sui.open('transferDetail.html','transferDetail.html',{Id:id},{},true,'转让详情',false);
	    },
	    farmInDetail:function(id,detailId,e){
	    	//受让详情
	    	e.stopPropagation();
	    	sui.open('transfereeDetail.html','transfereeDetail.html',{Id:id,detailId:detailId},{},true,'受让详情',false);
	    },
	    downRefresh:function(tap){
	    	mui('#pullrefresh').pullRefresh().scrollTo(0,0,mui.os.ios?0:100);  
	    	vm.pulldownRefresh();
            tap==0?(vm.transfer.refresh=true):(vm.can.refresh=true);
	    }
	},
	filters:{
		getAmount:function(value){
			return value?sui.rmoney(value):'0.00';
		},
		getRate:function(rate,raise){
			return rate?(raise?rate.toFixed(1)+'+'+raise.toFixed(1):rate.toFixed(1)):'0.0';
		}
	}
});

(function($) {
	var down= {
		callback: vm.pulldownRefresh
	};
	if(mui.os.android){
		down.style='circle';
		down.offset= '44px';
	}
	$.init({
		pullRefresh: {
			container: '#pullrefresh',
			down: down,
			up: {
				callback: vm.pullupRefresh
			}
		}
	});
})(mui);