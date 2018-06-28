var vm = new Vue({
	el: '#vue-app',
    data: {
    	loanList:[],
    	index:1,
    	type:2,
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
			vm.type=curr.type;
			setTimeout(function() {
				 mui('#pullrefresh').pullRefresh().pullupLoading();
			}, mui.os.ios?200:0);
		},
	    /*路由（跳转）tap事件绑定*/
	    href:function(id,type,name){
	    	// 状态： 6-可加入 7-撤标中 8-流标 9-已结束 10-放款中 11-还款中 12-还款完成
    		// 标的id：  type=4为债转标
			// 债转：状态：1-转让中 2-取消 3-成功 4-失败
    		sui.open('investDetail.html',sui.webviewId(),{Id:id,type:type},{},true,name,false);
	    },
	    pulldownRefresh:function(){
	    		clearTimeout(vm.loopPullDown);
				setTimeout(function() {
					sui.request('Loan/YearsLoanList',{pageIndex:1,loanType:vm.type},true,function(data){
						mui('#pullrefresh').pullRefresh().endPulldownToRefresh();
						if(data){
							var IsPass=data.IsPass;
							if(IsPass){
								var len=data.ReturnList.length;
								if(len>0){
									vm.elem=sui.rmovetips(vm.elem);
									vm.loanList=data.ReturnList;
									vm.index=2;
									vm.loopPullDown= setTimeout(function(){
										mui('#pullrefresh').pullRefresh().enablePullupToRefresh();
								        mui('#pullrefresh').pullRefresh().refresh(true);
									},mui.os.ios?600:200);
								}else{
									mui('#pullrefresh').pullRefresh().disablePullupToRefresh();
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
	    		sui.request('Loan/YearsLoanList',{pageIndex:vm.index,loanType:vm.type},true,function(data){
	    			var refresh=false;
		    		if(data){
		    			if(data.IsPass){
		    				 var len=data.ReturnList.length;
		    				 	if(len>0){
								    vm.loanList=vm.loanList.concat(data.ReturnList);
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
	    downRefresh:function(){
	    	mui('#pullrefresh').pullRefresh().scrollTo(0,0,mui.os.ios?0:100);  
	    	vm.pulldownRefresh();
		    var parent=plus.webview.currentWebview().opener();
		    parent&&parent.evalJS('vm.init();');
	    },
		getRate:function(rate,raise){
			//获取利率
			var html='';
			if(this.type==2){
				html='<b>'+rate+'</b>%';
			}else{
				html='<b>'+rate+'</b>+'+raise+'%';
			}
			return html;
		}
	},
	filters:{
		transfer:function(type){
			//2-月债 3-年债
			return type==2?"月债":"年债";
		},
		getTerm:function(periods,unit){
			//1-天 2-月 3-年 4-小时
			return periods+["天","个月","年","小时"][unit-1]; 
		},
		refundWays:function(way){
           //还款方式：1-到期还本付息 2-等额本息 3-先息后本
			return ["到期还本付息","等额本息","先息后本"][way-1]; 
		},
		loanState:function(status){
			//状态： 6-可加入 7-撤标中 8-流标 9-已结束 10-放款中 11-还款中 12-还款完成
    		return ["可加入","撤标中","借款失败","已结束","已结束","还款中","已结清"][status-6];
		}
	}
});
(function($) {
	var down= {
		callback: vm.pulldownRefresh
	};
	if(mui.os.android){
		down.style='circle';
		down.offset= '0px';
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