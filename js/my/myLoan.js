var vm = new Vue({
	el: '#vue-app',
    data: {
    	loopPullDown:null,
    	activeTap:0,
    	loan:{refresh:true,index:1,list:[]},//借款记录
    	refund:{refresh:true,index:1,list:[]},//还款记录
    	elem:null,
    	isRefresh:false,
    	checkedIds:[],
    	navBar:false,
    	availBal:0,
    	refundAmt:0,
    	checkAll:false,
    	refundId:null
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
  			//显示指定选项卡
  			vm.activeTap=curr.tap || 0;
  			setTimeout(function() {
				mui('#pullrefresh').pullRefresh().pulldownLoading();
			}, mui.os.ios?200:0);
		},
	    investDetail:function(id,type,name){
    	    sui.open('../invest/investDetail.html',sui.webviewId(),{Id:id,type:type},{},true,name,false);
	    },
	    refundDetail:function(loanId){
	    	sui.open('repayDetail.html','repayDetail.html',{loanId:loanId},{},true,"还款详情",false);
	    },
	    href:function(pageUrl,pageId,title){
	    	if(pageId=='recharge.html'){
	    		mui("#myLoanOpt").popover('toggle');
	    	}
	    	sui.open(pageUrl,pageId,{},{},true,title,false);
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
			var page=[vm.loan.index,vm.refund.index][index];
			var refresh=[vm.loan.refresh,vm.refund.refresh][index];
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
					var postUrl=["Loan/LoanRecord","Refund/RepaymentList"][index];
					sui.request(postUrl,{pageIndex:1},true,function(data){
						mui('#pullrefresh').pullRefresh().endPulldownToRefresh();
						 vm.isRefresh=false;
						if(data){
							var IsPass=data.IsPass;
							if(IsPass){
								if(data.ReturnList && data.ReturnList.length){
									if(index==0){
										vm.loan.list=data.ReturnList;
										vm.loan.index=2;
										vm.loan.refresh=false;
									}else{
										vm.refund.list=data.ReturnList;
										vm.refund.index=2;
										vm.refund.refresh=false;
										/* 此版本不做还款功能，暂时注释
										if(!vm.navBar){
											for(var i=0,item;item=data.ReturnList[i++];){
												//还款状态：1-待还 2-还款中 3-已还 4-提前还款 5-逾期 6-逾期还款 7-垫付
												if(item.State==1 || item.State==5 || item.State==7){
													vm.navBar=true;
													break;
												}
											}
										}
										*/
									}
									vm.loopPullDown= setTimeout(function(){
										mui('#pullrefresh').pullRefresh().enablePullupToRefresh();
								        mui('#pullrefresh').pullRefresh().refresh(true);
								  },mui.os.ios?600:200);
								}else{
									if(index==0){
										vm.loan.list=[];
									}else{
										vm.refund.list=[];
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
	    		var postUrl=["Loan/LoanRecord","Refund/RepaymentList"][index];
	    		var page=[vm.loan.index,vm.refund.index][index];
	    		sui.request(postUrl,{pageIndex:page},true,function(data){
	    			var refresh=false;
	    			 vm.isRefresh=false;
		    		if(data){
		    			if(data.IsPass){
		    				 	if(data.ReturnList && data.ReturnList.length){
		    				 		if(index==0){
										vm.loan.list=vm.loan.list.concat(data.ReturnList);
										vm.loan.index++;
									}else{
										vm.refund.list=vm.refund.list.concat(data.ReturnList);
										vm.refund.index++;
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
	    btnChecked:function(e){
	    	e.stopPropagation();
	    },
	    checkEvent:function(e){
	    	//全选 测试一下快速点击会不会出现bug
           e.stopPropagation();
	    	if(vm.checkAll){
	    		vm.refund.list.forEach(function(item){
	    			//还款状态：1-待还 2-还款中 3-已还 4-提前还款 5-逾期 6-逾期还款 7-垫付
					if((item.State==1 || item.State==5 || item.State==7) && !~vm.checkedId.indexOf(item)){
						vm.checkedId.push(item.RefundPlanId);
					}
	    		});
	    	}else{
	    		vm.checkedIds=[];
	    	}
	    },
	    btnRefund:function(refundId){
	    	//还款
	    	//if(vm.checkedIds.length){
	    		//此版本不做还款功能，暂时隐藏
	    		vm.refundId=refundId;
	    		var w=sui.wait();
	    		sui.request('Refund/RefundAmount',{refundIds:refundId},true,function(data){
	    			sui.closewait(w);
	    			if(data){
	    				if(data.IsPass){
	    					vm.availBal=data.ReturnObject||0;
	    					vm.refundAmt=data.ReturnObject2||0;
	    					mui("#myLoanOpt").popover('toggle');
	    				}else{
	    					mui.toast(data.Desc);
	    				}
	    			}
	    		});
	    	//}else{
	    		//mui.toast('请选择需要还款的项目');
	    	//}
	    },
	    btnSure:function(){
	    	//if(vm.checkedIds.length){
	    		//此版本不做还款功能，暂时隐藏
	    		if(vm.availBal<=0 || vm.availBal<vm.refundAmt){
	    			mui.toast('账户余额不足，请先充值');
	    			return;
	    		}
	    		var w=sui.wait();
	    		sui.request('Refund/SaveUserRefund',{RefundIds:vm.refundId},false,function(data){
	    			sui.closewait(w);
	    			if(data){
	    				if(data.IsPass){
	    					//还款成功处理
	    					mui.toast('还款成功');
	    					mui("#myLoanOpt").popover('toggle');
	    					vm.downRefresh();
	    				}else{
	    					mui.toast(data.Desc);
	    				}
	    			}
	    		});
	    	//}else{
	    		//mui.toast('请选择需要还款的项目');
	    	//}
	    },
	    downRefresh:function(){
	    	mui('#pullrefresh').pullRefresh().scrollTo(0,0,mui.os.ios?0:100);  
	    	vm.pulldownRefresh();
            vm.activeTap==0?(vm.refund.refresh=true):(vm.loan.refresh=true);
	    }
	},
	filters:{
		getAmount:function(value){
			return sui.rmoney(value);
		},
		getState:function(value){
			//6-可加入 7-撤标中 8-流标 9-已结束 10-放款中 11-还款中 12-还款完成
			return ["可加入","撤标中","流标","已结束","已结束","还款中","已还完"][status-6];
		},
		getRate:function(value){
			//利率
			return value?value.toFixed(1):'0.0';
		},
		getTerm:function(term,unit){
			//借款期限 1-天 2-月 3-年 4-小时
			return term+["天","个月","年","小时"][unit-1]; 
		},
		getDate:function(value){
			return value?sui.formatDate('y-m-d',value):"-";
		},
		getFeeRate:function(rate,method){
			//管理费收取方式：1-一次性，2-分期
			return method==2?rate.toFixed(1)+"%/期":rate.toFixed(1)+"%";
		}
	}
});

(function($) {
	var down= {
		callback: vm.pulldownRefresh
	};
	if(mui.os.android){
		down.style='circle';
		down.offset= (statusBar+88)+'px';
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