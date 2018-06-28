var vm = new Vue({
	el: '#vue-app',
    data: {
    	bankList:[],
    	isRealAuth:false,
    	mli:null,
    	index:0,
    	w:null,
    	isIos:false,
    	elem:null,
    	canBind:false,
    	isSetBankPwd:false,
    	//银行icon
    	iconObj:{
    		"ICBC":"gongshangyinhang",
    		"ABC":"zhongguonongyeyinhang",
    		"CMB":"zhaoshangyinhang",
    		"CCB":"jiansheyinhang",
    		"BCCB ":"yinhang-beijingyinhang-",
    		"BJRCB ":"changyonglogo09",
    		"BOC":"104100000004",
    		"BOCOM":"jiaotongyinhang",
    		"CMBC":"minshengyinhang",
    		"BOS":"shanghai",
    		"CBHB":"bohaiyinhang",
    		"CEB":"guangdayinhang",
    		"CIB":"xingyeyinhang",
    		"CITIC":"zhongxinyinhang",
    		"CZB":"yinhang-zheshangyinhang-",
    		"GDB":"guangfayinhang",
    		"HKBEA":"dongyayinhang-",
    		"HXB":"huaxiayinhang",
    		"NJCB":"changyonglogo20",
    		"PINGAN":"pinganyinhang",
    		"PSBC":"youzhengyinhang",
    		"SDB":"shenzhenfazhanyinhang-",
    		"SPDB":"pufayinhang",
    		"SRCB":"shanghainongshangyinhang",
    		 "YINLIAN":"yinlian"
    	}
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
  			   mui.os.ios&&(vm.isIos=true);
  				vm.w=sui.wait();
	    		vm.init();
	    	},sui.constNum());
  		},
  		init:function(){
  			sui.request('User/BankCardList',{},true,function(data){
  				sui.closewait(vm.w);
	    		if(data){
	    			if(data.IsPass){
	    				vm.elem=sui.rmovetips(vm.elem);
	    				vm.isRealAuth=data.ReturnObject.IsRealAuth;
	    				vm.canBind=data.ReturnObject.AuthType==2?false:true;
	    				vm.isSetBankPwd=data.ReturnObject.IsSetBankPassword || false;
    				 	if(data.ReturnList&&data.ReturnList.length){
    				 		if(data.ReturnList.length>=5){
    				 			vm.canBind=false;
    				 		}
						    vm.bankList=data.ReturnList;	
						}else{
							vm.elem=sui.createtips('wujilu','暂无记录');								
						}
	    			}else{
	    				mui.toast(data.Desc);
	    			}
	    		}
		    });
  		},
	    deleteBank:function(index,cardNo,event){		
	    	var mli = event.target.parentNode.parentNode;
	    	if(!vm.canBind){
	    		mui.toast('企业用户暂不能解绑银行卡');
				setTimeout(function() {
					mui.swipeoutClose(mli);
				}, 0);
	    		return;
	    	}
			var bts=[{title:"确认",style:"destructive"}];
		    plus.nativeUI.actionSheet({title:"确认解绑该银行卡吗？",cancel:"取消",buttons:bts},function(e){
				if (e.index == 1) {
					 vm.mli=mli;
					 vm.index=index;
					 vm.checkPayPwd("B02","unbindCard",cardNo);
				}else{
					vm.mli=null;
					setTimeout(function() {
						mui.swipeoutClose(mli);
					}, 0);
				}
			 });
	    },
	    defaultCard:function(index,cardId,event){
	    	var mli = event.target.parentNode.parentNode;
			var bts=[{title:"确认",style:"destructive"}];
		    plus.nativeUI.actionSheet({title:"确认要将该银行卡设为默认卡吗？",cancel:"取消",buttons:bts},function(e){
				if (e.index == 1) {
					 vm.mli=mli;
					 vm.index=index;
					 vm.w=sui.wait();
					 sui.request('User/SetDefaultBankCard', {id:cardId},true,function(data) {
						sui.closewait(vm.w);
						if(data) {
							var IsPass = data.IsPass;
							if(IsPass) {
								  mui.toast("设置成功");
								  vm.mli=null;
								  setTimeout(function() {
										mui.swipeoutClose(mli);
										vm.init();
									}, 0);
							} else {
								mui.toast(data.Desc);
							}
						} 
					});
				}else{
					vm.mli=null;
					setTimeout(function() {
						mui.swipeoutClose(mli);
					}, 0);
				}
			 });
	    },
	    addBank:function(){ 
	    	if(!vm.isRealAuth){
	    		mui.confirm('您还没有开通银行存管账户，请先开通','',['取消','立即开通'],function(e){
					if(e.index==1){
						sui.open('../bank/openingAccount.html','openingAccount.html',{},{},true,'开通银行存管',false);
	                    setTimeout(function(){
							plus.webview.currentWebview().close('none',0);
						},1000);
					}
				},'div');
	    	}else if(!vm.isSetBankPwd){
	    		mui.confirm('您还未设置宜宾银行交易密码，请先设置','',['取消','立即设置'],function(e){
					if(e.index==1){
						sui.open('../bank/setPayPwd.html','setPayPwd.html');
					}
				},'div');
	    	}else{
	    		//先校验交易密码
		    	 vm.checkPayPwd("B01","bindCard");
	    		//sui.open('../bank/bindBankCard.html','bindBankCard.html');
	    	}
	    },
	    checkPayPwd:function(operType,page,cardNo){
	    	vm.w=sui.wait();
	    	var postData={operType:operType};
	    	if(operType=="B02"){
	    		postData.cardNo=cardNo;
	    	}
	    	sui.request('User/CheckPayPassword', postData,true,function(data) {
				sui.closewait(vm.w);
				if(data) {
					var IsPass = data.IsPass;
					if(IsPass) {
						  sui.open('../bank/checkPayPassword.html','checkPayPassword.html',{page:page,pageUrl:data.ReturnObject});
					} else {
						mui.toast(data.Desc);
					}
				} 
			});
	    },
	    getIcon:function(code){	 
    		return '#icon-'+vm.iconObj[code];
	    },
	    callback:function(seqNo){
			vm.w=sui.wait(true,true,'请稍候...');
			sui.request('User/CustomerUntie',{businessSeqNo:seqNo,busiTradeType:"B02"},false,function(data){		
				vm.w=sui.closewait(vm.w,true);
				if(data){
					if(data.IsPass){	
				        mui.swipeoutClose(vm.mli);
						vm.bankList.splice(vm.index,1);
						mui.toast("解绑成功");
						if(!vm.bankList.length){
							vm.elem=sui.createtips('wujilu','暂无记录');
						}
		    	}else{
			        	mui.swipeoutClose(vm.mli);
		    			mui.toast(data.Desc);
		    		}	
				}
			});	
	    }
	},
	filters:{
		formatCardNo:function(value){
			if(~value.indexOf('*')){
				return value;
			}else{
				return value.replace(/^\d{12}/,'•••• •••• •••• ');
			}
		}
	}
});