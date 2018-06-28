var vm = new Vue({
	el: '#vue-app',
    data: {
    	model:{
		  RefundDetailList:[]
    	},
    	isIos:false,
    	loanId:null,
    	navBar:false,
    	refundAmt:0,
    	w:null,
    	operType:1, //操作类型 1.还当期 2.还全部 
    	refundTitle:"还当期",
        availBal:0
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
  			this.loanId=plus.webview.currentWebview().loanId;
  			setTimeout(function(){
  				vm.w=sui.wait();
  				vm.init(vm.loanId);
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
	    init:function(loanId){
	    	sui.request('Refund/RefundPlanDetail',{loanId:loanId},true,function(data){
	    		sui.closewait(vm.w);
	    		if(data){
	    			if(data.IsPass){
	    				var obj=data.ReturnObject;
	    			   vm.model=obj;
	    			   if(obj.AllRefundAmount>0 || obj.IsReturn || obj.IsAll){
	    			   	  vm.navBar=true;
	    			   }
	    			}else{
	    				mui.toast(data.Desc);
	    			}
	    		}
	    	});
	    },
	    isAuth:function(){
	    	mui.confirm('您尚未进行业务授权，授权确认方可进行下一步操作。',' ',['取消','立即授权'],function(e){
				if(e.index==1){
					sui.open('../bank/businessAuth.html','businessAuth.html',{},{},true,'业务授权',false);
					setTimeout(function(){
						plus.webview.currentWebview().close('none',0);
					},1000);
				}else{
					plus.webview.currentWebview().close();
				}
			},'div');
	    },
	    btnRefund:function(type){
	    	//1.还当期 2.还全部
	    	if(!vm.model.IsAuth){
	    		vm.isAuth();
	    		return;
	    	}
	    	vm.refundTitle=["还当期","全部还清"][type-1];
	    	vm.operType=type;
	    	vm.refundAmt=[vm.model.CurrentRefundAmount,vm.model.AllRefundAmount][type-1];
    		var w=sui.wait();
    		sui.request('User/UserCenter',{},true,function(data){
    			sui.closewait(w);
    			if(data){
    				if(data.IsPass){
    					vm.availBal=data.ReturnObject.AvailAmount ||0;
    					mui("#repayopt").popover('toggle');
    				}else{
    					mui.toast(data.Desc);
    				}
    			}
    		});
	    },
	    btnSure:function(){
	    		if(vm.availBal<=0 || vm.availBal<vm.refundAmt){
	    			mui.toast('账户余额不足，请先充值');
	    			return;
	    		}
	    		vm.w=sui.wait();
	    		sui.request('Refund/SaveUserRefund',{LoanId:vm.loanId,OperType:vm.operType},false,function(data){
	    			//sui.closewait(vm.w);
	    			if(data){
	    				if(data.IsPass){
	    					//还款成功处理
	    					mui.toast('还款成功');
	    					mui("#repayopt").popover('toggle');
	    					vm.init(vm.loanId);
	    					var calendar=plus.webview.getWebviewById('repayCalendar.html');
	    					var myloan=plus.webview.getWebviewById('myLoan.html');
	    					calendar&&calendar.evalJS('vm.refresh();');
	    					myloan&&myloan.evalJS('vm.pulldownRefresh();');
	    				}else{
		    				if(data.StatusCode=='S1034'){
								vm.isAuth();
							}else{
								mui.toast(data.Desc);
							}
	    				}
	    			}
	    		});
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