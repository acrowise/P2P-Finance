var vm = new Vue({
	el: '#vue-app',
    data: {
    	amount:0,
    	fee:0,
    	kind:2,
    	wAmount:'',
    	minAmount:0,
    	isIos:false,
    	doLoop:null
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
	    href:function(){
			sui.open('withdrawalsExplain.html','withdrawalsExplain.html',{},{},true,'提现说明',false);	 
	    },
		plusReady:function(){
			setTimeout(function(){
              mui.os.ios && (vm.isIos=true);
    		  vm.init();
			},sui.constNum());
		},
	    init:function(){
	    	var w=sui.wait();
	    	sui.request('Account/CanWithdrawAmount',{},true,function(data){
	    		sui.closewait(w);
	    		if(data){
	    			if(data.IsPass){
	    			    vm.amount=data.ReturnObject;
	    			    vm.minAmount=data.ReturnObject2;
	    			}else{
	    				mui.toast(data.Desc);
	    			}
	    		}
	    	});
	    },
	    //输入金额后校验
	    countFee:function(){
	    	clearTimeout(vm.doLoop);
	    	vm.doLoop=setTimeout(function(){
	    		if(sui.IsNullOrEmpty(vm.wAmount)&&!vm.wAmount.isFloat() || vm.wAmount<vm.minAmount){
	    			vm.fee=0;
	    			return;
		    	}else if(vm.wAmount>vm.amount){
		    		vm.wAmount=vm.amount;
		    	}
	    		 vm.getFee();
	    	},500);
	    },
	    //提现手续费
	    getFee:function(){
	    	sui.request('Account/CountFee',{amount:vm.wAmount,kind:vm.kind},true,function(data){
	    		if(data){
	    			if(data.IsPass){
	    			    vm.fee=data.ReturnObject;
	    			}else{
	    				mui.toast(data.Desc);
	    			}
	    		}
	    	});
	    },
	    //提现操作
	    btnWithdraw:function(){
		    	if(sui.IsNullOrEmpty(vm.wAmount)){
		    		mui.toast("请输入提现金额");
		   			return;
		    	}else if(typeof(vm.wAmount)!='number' && !vm.wAmount.isFloat()){
		   			mui.toast("提现金额格式不正确，必须为数字且允许保留两位小数");
		   			return;
		   		}else if(parseFloat(vm.wAmount)<vm.minAmount){
		   			mui.toast("提现金额不能小于 "+sui.rmoney(vm.minAmount));
		   			return;
		   		}else if(parseFloat(vm.wAmount)>vm.amount){
		   			mui.toast("提现金额不能大于可提现金额");
		   			return;
		   		}
		   		var w=sui.wait(true,true,'请稍候...');
		    	sui.request('Account/Withdraw',{Amount: vm.wAmount,WithdrawKind:vm.kind,Channel:mui.os.android?3:4},false,function(data){
		    		w=sui.closewait(w,true);
		    		if(data){
		    			if(data.IsPass){
		    			    //跳转到汇付
		    			    //sui.open('../huifu/withdraw.html','withdraw.html',{view:data.ReturnObject});
		    			     sui.open('../bank/checkPayPwd.html','checkPayPwd.html',{page:"withdraw",pageUrl:data.ReturnObject});
							 setTimeout(function(){
				    			  plus.webview.currentWebview().close('none',0);
				    		 },1000);
		    			}else{
		    				var sCode=data.StatusCode;
		    				if(sCode=='S0014'){
								//您还没有开通银行存管账户
								mui.confirm('您还没有开通银行存管账户，请先开通','',['取消','立即开通'],function(e){
				    				if(e.index==1){
				    					sui.open('../bank/openingAccount.html','openingAccount.html',{},{},true,'开通银行存管',false);
				    					//sui.open('../huifu/realAuth.html','realAuth.html');
	                                    setTimeout(function(){
				    						 plus.webview.currentWebview().close('none',0);
				    					},1000);
				    				}else{
			    						plus.webview.currentWebview().close();
				    				}
				    			},'div');
							}else if(sCode=='S0052'){
								//设置交易密码
								mui.confirm('您还未设置宜宾银行交易密码，请先设置','',['取消','立即设置'],function(e){
				    				if(e.index==1){
				    					sui.open('../bank/setPayPwd.html','setPayPwd.html',{},{});
				    					//sui.open('../huifu/realAuth.html','realAuth.html');
	                                    setTimeout(function(){
				    						 plus.webview.currentWebview().close('none',0);
				    					},1000);
				    				}else{
			    						plus.webview.currentWebview().close();
				    				}
				    			},'div');
							}else if(sCode=='S2024'){
								//绑定银行卡
								mui.confirm('您还没有绑定银行卡，请先绑卡','',['取消','立即绑定'],function(e){
				    				if(e.index==1){
				    					 //先校验交易密码
			    	                     vm.checkPayPwd("B01","bindCard");
				    				}else{
			    						plus.webview.currentWebview().close();
				    				}
				    			},'div');
							}else{
								mui.toast(data.Desc);
							}
		    			}
		    		}
		    	});
	    },
	    checkPayPwd:function(operType,page){
	    	vm.w=sui.wait();
	    	var postData={operType:operType};
	    	sui.request('User/CheckPayPassword', postData,true,function(data) {
				sui.closewait(vm.w);
				if(data) {
					var IsPass = data.IsPass;
					if(IsPass) {
						sui.open('../bank/checkPayPassword.html','checkPayPassword.html',{page:page,pageUrl:data.ReturnObject});
						setTimeout(function(){
    						 plus.webview.currentWebview().close('none',0);
    					},1000);
					} else {
						mui.toast(data.Desc);
					}
				} 
			});
	    }
	},
	filters:{
		getAmount:function(value){
			return sui.rmoney(value);
		}
	}
});