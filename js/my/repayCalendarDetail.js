var vm = new Vue({
	el: '#vue-app',
    data: {
    	model:{
		  RefundPlan:[]
    	},
    	checkedIds:[],
    	isIos:false,
    	currDate:null,
    	navBar:false,
    	checkAll:false,
    	availBal:0,
    	refundAmt:0,
    	refundId:null
    },
    mounted: function () {
    	this.$nextTick(function () {
    		if(window.plus) {
				vm.plusReady();
			} else {
				document.addEventListener('plusready', vm.plusReady, false);
			}
    	});
    },
  	methods: {	
  		plusReady:function(){
  			this.currDate=plus.webview.currentWebview().d;
  			setTimeout(function(){
  				vm.init(vm.currDate);
    			mui.os.ios && (vm.isIos=true);
    		},sui.constNum());
  		},
	    href:function(pageUrl,pageId,title){
	    	if(pageId=='recharge.html'){
	    		mui("#repayopt").popover('toggle');
	    	}
	    	 sui.open(pageUrl,pageId,{},{},true,title,false);
	    },
	      investDetail:function(id,type,name){
    	    sui.open('../invest/investDetail.html',sui.unique(),{Id:id,type:type},{},true,name,false);
	    },
	    refundDetail:function(loanId){
	    	sui.open('repayDetail.html','repayDetail.html',{loanId:loanId},{},true,"还款详情",false);
	    },
	    init:function(currDate){
	    	var w=sui.wait();
	    	sui.request('Refund/CurrentRefundPlan',{currDate:currDate},true,function(data){
	    		if(data){
	    			if(data.IsPass){
	    			  vm.model=data.ReturnObject;
	    			  /* 此版本不做还款功能，暂时注释
						for(var i=0,item;item=data.ReturnObject.RefundPlan[i++];){
							//还款状态：1-待还 2-还款中 3-已还 4-提前还款 5-逾期 6-逾期还款 7-垫付
							if(item.State==1 || item.State==5 || item.State==7){
								vm.navBar=true;
								break;
							}
						}
						*/
	    			}else{
	    				mui.toast(data.Desc);
	    			}
	    		}
	    		sui.closewait(w);
	    	});
	    },
	    btnChecked:function(e){
	    	e.stopPropagation();
	    },
	    checkEvent:function(e){
	    	//全选 测试一下快速点击会不会出现bug
	    	e.stopPropagation();
	    	if(vm.checkAll){
	    		 vm.model.RefundPlan.forEach(function(item){
	    			//还款状态：1-待还 2-还款中 3-已还 4-提前还款 5-逾期 6-逾期还款 7-垫付
					if((item.State==1 || item.State==5 || item.State==7) && !~vm.checkedId.indexOf(item)){
						vm.checkedId.push(item.Id);
					}
	    		});
	    	}else{
	    	   vm.checkedIds=[];
	    	}
	    },
	    btnRefund:function(refundId){
	    	//还款   暂时无法批量还款
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
	    					mui("#repayopt").popover('toggle');
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
	    					//mui("#repayopt").popover('toggle');
	    					var calendar=plus.webview.getWebviewById('repayCalendar.html');
	    					var myloan=plus.webview.getWebviewById('myLoan.html');
	    					calendar&&calendar.evalJS('vm.refresh();');
	    					myloan&&myloan.evalJS('vm.pulldownRefresh();');
	    					setTimeout(function(){
	    						plus.webview.currentWebview().close();
	    					},150);
	    				}else{
	    					mui.toast(data.Desc);
	    				}
	    			}
	    		});
	    	//}else{
	    		//mui.toast('请选择需要还款的项目');
	    	//}
	    }
	},
	filters:{
		format:function(value){
			return value?sui.rmoney(value):'0.00';
		},
		getDate:function(value){
			//格式化日期
			return value?sui.formatDate('y-m-d',value):"-";
		},
		getState:function(value){
			 //还款状态：1-待还 2-还款中 3-已还 4-提前还款 5-逾期 6-逾期还款 7-代偿
			 return ["待还款","还款中","已还款","提前还款","逾期","逾期还款","代偿"][value-1];
		}
	}
});