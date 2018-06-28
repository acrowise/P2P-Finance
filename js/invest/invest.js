var vm = new Vue({
	el: '#vue-app',
    data: {
    	loopPullDown:null,
    	activeTap:1,
    	years:{refresh:true,index:1,list:[]},
    	loan:{refresh:true,index:1,list:[]},
    	transfer:{refresh:true,index:1,list:[]},
    	elem:null,
    	isRefresh:false,
    	isLogin:sui.isLogin(),
    	riskLevel:0
    },
    mounted: function () {
    	this.$nextTick(function () {
    	});
    },
  	methods: {	
  		login:function(){
  			this.isLogin=sui.isLogin();
		},
	    href:function(id,type,name){
	    	// state：6-可加入 7-撤标中 8-流标 9-已结束 10-放款中 11-还款中 12-还款完成
    		//标的id： 0-false表示年月账户资金池明细  type=4为债转标
    		if(this.riskLevel==0 && this.isLogin){
    			sui.open('views/my/riskEvaluation.html','riskEvaluation.html',{},{},true,'风险测评',false);
    		}else{
    			sui.open('views/invest/investDetail.html',sui.webviewId(),{Id:id,type:type},{},true,name,false);
    		}
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
			var page=[vm.years.index,vm.loan.index,vm.transfer.index][index];
			var refresh=[vm.years.refresh,vm.loan.refresh,vm.transfer.refresh][index];
			if(page==1 || refresh){
				mui('#pullrefresh').pullRefresh().disablePullupToRefresh();
				mui('#pullrefresh').pullRefresh().pulldownLoading();
			}else{
				 if(index==0){
						mui('#pullrefresh').pullRefresh().disablePullupToRefresh();
						return;
					} 
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
					var postUrl=["Loan/YearsLoan","Loan/LoanList","Transfer/TransferList"][index];
					var param=[{},{pageIndex:1},{pageIndex:1}][index];
					sui.request(postUrl,param,true,function(data){
						mui('#pullrefresh').pullRefresh().endPulldownToRefresh();
						 vm.isRefresh=false;
						if(data){
							var IsPass=data.IsPass;
							if(IsPass){
								if(index==0){
									  vm.years.list=[];
									  data.ReturnObject&&vm.years.list.push(data.ReturnObject);
									  data.ReturnObject2&&vm.years.list.push(data.ReturnObject2);
									  if(vm.years.list.length){
									  	 vm.years.index=2;
									  	 vm.years.refresh=false;
									  }else{
									  	//mui('#pullrefresh').pullRefresh().disablePullupToRefresh();
									  	 vm.elem=sui.createtips('wujilu','暂无记录');
									  }
									  return;
								}
								if(data.ReturnList.length){
									if(index==1){
										vm.loan.list=data.ReturnList;
										vm.riskLevel=data.ReturnObject;
										vm.loan.index=2;
										vm.loan.refresh=false;
									}else{
										vm.transfer.list=data.ReturnList;
										vm.riskLevel=data.ReturnObject;
										vm.transfer.index=2;
										vm.transfer.refresh=false;
									}
									vm.loopPullDown= setTimeout(function(){
										if(index!=0 && vm.activeTap!=0){
											mui('#pullrefresh').pullRefresh().enablePullupToRefresh();
								            mui('#pullrefresh').pullRefresh().refresh(true);
										}
								  },mui.os.ios?600:200);
								}else{
									if(index==1){
										vm.loan.list=[];
									}else if(index==2){
										vm.transfer.list=[];
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
	    	var index=vm.activeTap;
	    	if(index==0){
    			 mui('#pullrefresh').pullRefresh().endPullupToRefresh(true);
	             mui('#pullrefresh').pullRefresh().disablePullupToRefresh();
	             return;
	    	}
	    	setTimeout(function() {
	    		var postUrl=["Loan/LoanList","Transfer/TransferList"][index-1];
	    		var page=[vm.loan.index,vm.transfer.index][index-1];
	    		sui.request(postUrl,{pageIndex:page},true,function(data){
	    			var refresh=false;
		    		if(data){
		    			if(data.IsPass){
		    				 	if(data.ReturnList.length){
		    				 		if(index==1){
										vm.loan.list=vm.loan.list.concat(data.ReturnList);
										vm.riskLevel=data.ReturnObject;
										vm.loan.index++;
									}else{
										vm.transfer.list=vm.transfer.list.concat(data.ReturnList);
										vm.riskLevel=data.ReturnObject;
										vm.transfer.index++;
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
    	yearsRate:function(min,max,raise,type){
    		//借款类型：1-房易融 2-月账户 3-年账户 4-债转
    		if(type==2){
    			 return min+'<span class="bigspan">~'+max+'%</span>';
    		}else{
    			return '<span class="bigspan">'+min+'</span>+'+raise+'%';
    		}
    	},
		getRate:function(rate,raise){
			return '<span class="bigspan">'+(parseFloat(rate)+parseFloat(raise)).toFixed(1)+'</span>%';
		},
		btnRisk:function(){
			if(this.riskLevel==0 && this.isLogin){
    			sui.open('views/my/riskEvaluation.html','riskEvaluation.html',{},{},true,'风险测评',false);
    		}
		}
	},
	computed:{
		riskTips:function(){
				var showTxt="按国家互联网金融监管有关规定，需您先完成“风险测评”。测评完成，方可进行下一步操作。";
				if(this.isLogin && this.riskLevel>0){
					showTxt="您当前风险测评等级为“"+["保守型","保守型","稳健型","积极型"][this.riskLevel]+"”，可出借的项目风险级别包括："+["AA、A","AA、A","AA、A、B","AA、A、B、C、D"][this.riskLevel];
				}
				return showTxt;
			}
	},
	filters:{
		getAmount:function(value){
			return sui.rmoney(value);
		},
		getTerm:function(periods,unit){
			//1-天 2-月 3-年 4-小时
			return periods+["天","个月","年","小时"][unit-1]; 
		},
		yearsTerm:function(min,unit,max){
			var result="";
			//1-天 2-月 3-年 4-小时
			var termUnit =["天","个月","年","小时"][unit-1];
			if(!max || min==max){
				result=min+termUnit;
			}else{
				result=min+"-"+max+termUnit;
			}
			return result;
    	},
    	refundWays:function(value){
    		//还款方式：1-到期还本付息 2-等额本息 3-先息后本
    		return ["到期还本付息","等额本息","先息后本"][value-1];
    	},
    	statusDesc:function(status){
    		//状态： 6-可加入 7-撤标中 8-流标 9-已结束 10-放款中 11-还款中 12-还款完成
    		return ["可加入","撤标中","借款失败","已结束","已结束","还款中","已结清"][status-6];
    	},
    	transferDesc:function(status){
    		//状态：1-转让中 2-取消 3-成功 4-失败
    		return ["转让中","已取消","转让成功","转让失败"][status-1];
    	}
	}
});

(function($) {
	var down= {
		callback: vm.pulldownRefresh
	};
	if(mui.os.android){
		down.style='circle';
		down.offset=(statusBar+44)+ 'px';
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
//监听事件
window.addEventListener('invest', function(event) {
	vm.login();
	//-1 从出借进页面，其余从其他页面跳进相应页面
	var index=event.detail.index;
	var refresh=event.detail.refresh;
	if(index >=0){
		vm.activeTap=index;
	}
	if(index==-2){
		vm.loan.refresh=true;
		vm.transfer.refresh=true;
	}
	var page=[vm.years.index,vm.loan.index,vm.transfer.index][vm.activeTap];
	if(page==1||refresh){
		vm.elem=sui.rmovetips(vm.elem);
		mui('#pullrefresh').pullRefresh().scrollTo(0,0,mui.os.ios?0:100);  
		mui('#pullrefresh').pullRefresh().disablePullupToRefresh();
		mui('#pullrefresh').pullRefresh().pulldownLoading();
	}
});	