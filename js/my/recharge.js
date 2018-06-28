var vm = new Vue({
	el: '#vue-app',
    data: {
    	amount:0,
    	kind:1,
    	wAmount:'',
    	minAmount:0,
    	isIos:false,
    	w:null
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
			setTimeout(function(){
               mui.os.ios && (vm.isIos=true);
    		   vm.init();
			},sui.constNum());
		},
	    init:function(){
	    	var w=sui.wait();
	    	sui.request('Account/RechargeInfo',{},true,function(data){
	    		sui.closewait(w);
	    		if(data){
	    			if(data.IsPass){
	    				var rdata=data.ReturnObject;
	    			    vm.amount=rdata.AvailBal;
	    			    vm.minAmount=rdata.MinAmount; 
	    			}else{
	    				mui.toast(data.Desc);
	    			}
	    		}
	    	});
	    },
	    btnCommit:function(){
	    	if(sui.IsNullOrEmpty(vm.wAmount)){
	    		mui.toast("请输入充值金额");
	   			return;
	    	}else if(typeof(vm.wAmount)!='number' && !vm.wAmount.isFloat()){
	   			mui.toast("充值金额格式错误，必须为数字且允许保留两位小数");
	   			return;
	   		}else if(parseFloat(vm.wAmount)<vm.minAmount){
	   			mui.toast("充值金额不能小于 "+sui.rmoney(vm.minAmount));
	   			return;
		   	}
	   	    vm.w=sui.wait(true,true,'请稍候...');
	    	var postData={
	    		Amount: vm.wAmount,
    			RechargeKind:vm.kind,
    			Channel:mui.os.android?3:4
	    	};
	    	sui.request('Account/Recharge',postData,false,function(data){
	    		vm.w=sui.closewait(vm.w,true);
	    		if(data){
	    			if(data.IsPass){
	    			    //跳转到汇付充值
	    			   // sui.open('../huifu/recharges.html','recharges.html',{view:data.ReturnObject});
	    			    sui.open('../bank/checkPayPwd.html','checkPayPwd.html',{page:"recharge",pageUrl:data.ReturnObject});
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
						}else if(sCode=='S2032'){
							 mui.alert(data.Desc,function(){
						    	plus.webview.currentWebview().close();
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
		},
		getLimit:function(value){
			return value?sui.rmoney(value):"不限额";
		}
	}
});