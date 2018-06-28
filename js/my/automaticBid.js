var vm = new Vue({
	el: '#vue-app',
    data: {
    	model:{}, 
    	ruleModel:{},
    	title:"开启",
    	orclose:true,
    	isReset:true,
    	safeCode:'',
    	webView:null
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
	    href:function(data){
	    	sui.open(data.url,data.id,{"ruleId":vm.ruleModel.Id},{},true,data.name,false);		
	    },	
	    plusReady:function(){
	    	/*
	    		if(mui.os.ios){
					// 解决在ios上fixed元素focusin时位置出现错误的问题 
					document.addEventListener('DOMContentLoaded',function(){
						var footerDom = document.getElementById('openbid');
						document.addEventListener('focusin', function() {
							footerDom.style.position = 'absolute';
						});
						document.addEventListener('focusout', function() {
							footerDom.style.position = 'fixed'; 
						});
					});
				}
	      */
	       setTimeout(function(){
	         var w=sui.wait();
		      vm.init(w);
		   },sui.constNum());
	    },
	    init:function(w){
	    	sui.request('Invest/RuleList',{},true,function(data){
	    		w&&sui.closewait(w);
	    		if(data){
    				if(data.IsPass){
	    			    vm.model=data.ReturnObject; 
	    			    vm.ruleModel=data.ReturnList[0];
    			    	if(!vm.model.IsRealAuth){
    			    		mui.confirm('您还没有实名认证，请先实名认证','',['取消','立即认证'],function(e){
			    				if(e.index==1){
			    					sui.open('../huifu/realAuth.html','realAuth.html');
                                    setTimeout(function(){
			    						plus.webview.currentWebview().close('none',0);
			    					},800);
			    				}else{
		    						plus.webview.currentWebview().close();
			    				}
			    			},'div');
			    			return;
    			    	}
    			    	if(!vm.model.IsOpenTenderPlan){
	    			    	mui.confirm('您还没有授权自动投标计划，请先授权','',['取消','立即授权'],function(e){
			    				if(e.index==1){
			    					sui.open('../huifu/authAutoTender.html','authAutoTender.html');
			    					setTimeout(function(){
			    						plus.webview.currentWebview().close('none',0);
			    					},800);
			    				}else{
		    						plus.webview.currentWebview().close();
			    				}
			    			},'div');
    			    	}
	    			}else{
	    				mui.toast(data.Desc);
	    			}
	    		}
	    	});
	   },
	    btnSwitch:function(event){
			vm.safeCode="";
	    	if(vm.$refs.btnSwitch.classList.contains('mui-active')){ 
	    		vm.title="关闭";	 
	    		vm.orclose=false;
	    	}else{
	    		vm.title="开启";
	    		vm.orclose=true;
	    	}	    	
	    	mui('#openbid').popover('toggle');
	    },
	    btnCommit:function(event){
	    	event.detail.gesture.preventDefault();//阻止默认事件
            //var dom=document.getElementById("txtsafeCode");
	    	// dom.focus();
	    	if(sui.IsNullOrEmpty(vm.safeCode.trim())){
	    		mui.toast("请输入安全码");
	    		return;
	    	}
	    	var w=sui.wait();
	    	sui.request('Invest/TenderSet',{isOpen:vm.orclose,payPassword:vm.safeCode},true,function(data){
	    		vm.safeCode="";		
	    		sui.closewait(w);
	    		if(data){
	    			if(data.IsPass){
	    				document.activeElement.blur(); 
	    				mui('#openbid').popover('toggle');
	    				mui.toast('设置成功');
	    				vm.$refs.setSwitch.setAttribute('style','');
	    	            vm.$refs.btnSwitch.classList[vm.orclose?'add':'remove']('mui-active');
	    			}else{
	    				mui.toast(data.Desc);
	    			}
	    		}
	    	});
	    },
	    hidden:function(){
	    	document.activeElement.blur(); 
	    }
	},
	filters:{
		getAmount:function(value){
			return value?sui.rmoney(value):'0.00';
		},
		loanType:function(value){
			return value?value.replace('1','房易融').replace('2','月账户').replace('3','年账户'):'';
		},
		getCoupon:function(value){
			return value? ['现金券','红包','We券'][value-1]:"";
		}
	}
});
//mui('body').on('touchmove','.mui-backdrop',function(e){
//	e.returnValue = true;
//});

		
