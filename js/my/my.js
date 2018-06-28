var vm = new Vue({
	el: '#vue-app',
    data: {
    	pic:"images/my-logo.png",
    	userName:"请登录",
    	amount:"0.00",//账户余额
    	isRealAuth:false, //是否实名认证
    	msgNum:0, //未读消息数量
    	mask:true,
    	isSetPwd:false, //是否设置了银行的交易密码
    	isBandCard:false //是否绑定银行卡
    },
    mounted: function () {
    	this.$nextTick(function () {
    	});
    },
  	methods: {	
	    /*路由（跳转）tap事件绑定*/
	    href:function(data){
			if(sui.isLogin() || data.id=="more.html"){
				if(data.id=='message.html'){
					vm.msgNum=0;
				}else if(data.id=='recharge.html' || data.id=='withdrawals.html'){
					if(!vm.isRealAuth){
				    		vm.mask=false;
				    		return;
				     }else if(!vm.isSetPwd){
							//设置交易密码
							mui.confirm('您还未设置宜宾银行交易密码，请先设置','',['取消','立即设置'],function(e){
			    				if(e.index==1){
			    					sui.open('views/bank/setPayPwd.html','setPayPwd.html',{},{});
			    				}
			    			},'div');
			    			return;
						}else if(!vm.isBandCard){
							//绑定银行卡
							mui.confirm('您还没有绑定银行卡，请先绑卡','',['取消','立即绑定'],function(e){
			    				if(e.index==1){
			    					 //先校验交易密码
		    	                     vm.checkPayPwd("B01","bindCard");
			    				}
			    			},'div');
			    			return;
						}
				}
				 var param=data.id=='set.html'?{isSetPwd:vm.isSetPwd}:{};
				 data.title? sui.open(data.url,data.id,param,{},true,data.name,false):sui.open(data.url,data.id);
			}else{
				 sui.open('views/root/login.html','login.html',{},{},true,'登录',false);
			}
	    },
	    autoTender:function(data){
	    	if(sui.isLogin()){
			 sui.open(data.url,data.id,{},{},true,data.name,false,true,data.text,function(){
			 	var autoTender=plus.webview.getWebviewById('automaticBid.html');
			 	autoTender&&autoTender.evalJS('vm.hidden();');
             	sui.open('views/my/automaticBidRules.html','automaticBidRules.html',{},{},true,'自动投标规则',false);
              });
			}else{
				 sui.open('views/root/login.html','login.html',{},{},true,'登录',false);
			}
	    },
	    shenglibao:function(isRealAuth){
	    	//生利宝
	    	if(sui.isLogin()){
	    		if(isRealAuth){
	    			sui.open('views/my/bearInterest.html','bearInterest.html');
	    		}else{
	    			var btn=['立即认证','取消'];
	    			mui.confirm('您还没有实名认证哦~','',btn,function(e){
	    				if(e.index==0){
	    					//去实名认证
	    					sui.open('views/huifu/realAuth.html','realAuth.html');
	    				}
	    			});
	    		}
	    	}else{
	    		sui.open('views/root/login.html','login.html',{},{},true,'登录',false);
	    	}
	    },
	    init:function(pic,name,amount,isRealAuth,msgNum,isSetPwd,isBandCard){
	    	vm.pic=pic;
	    	vm.userName=name;
	    	vm.amount=amount;//账户余额
	    	vm.isRealAuth=isRealAuth ;//是否实名认证
	    	vm.msgNum=msgNum ;//未读消息数量
	    	vm.isSetPwd=isSetPwd;
	    	vm.isBandCard=isBandCard;
	    	if(!isRealAuth && sui.isLogin()){
	    		vm.mask=false;
	    		//var main=plus.webview.getLaunchWebview();
				//main&&main.evalJS('openbackdrop();');
	    	}
	    },
	    my:function(){
	    	if(!sui.isLogin()){
				vm.init("images/my-logo.png","请登录","0.00",false,0,false,false);
				return;
			}
	    	sui.request('User/UserCenter',{},true,function(data){
	    		if(data){
	    			if(data.IsPass){
	    			    var param=data.ReturnObject;
	    			    vm.init(param.Photo||"images/my-logo.png",param.UserName,sui.rmoney(param.AvailAmount),param.IsRealAuth,param.MsgNum,param.IsSetBankPassword,param.IsBandCard);
	    			    localStorage.setItem('qhlead_userPic',param.Photo||"");
	    			}else{
	    				mui.toast(data.Desc);
	    			}
	    		}
	    	});
	    },
	    checkPayPwd:function(operType,page){
	    	var w=sui.wait();
	    	var postData={operType:operType};
	    	sui.request('User/CheckPayPassword', postData,true,function(data) {
				sui.closewait(w);
				if(data) {
					var IsPass = data.IsPass;
					if(IsPass) {
						sui.open('views/bank/checkPayPassword.html','checkPayPassword.html',{page:page,pageUrl:data.ReturnObject});
					} else {
						mui.toast(data.Desc);
					}
				} 
			});
	   },
	    changeImg:function(pic){
	    	vm.pic=pic;
	    },
	    closeMask:function(){
	    	vm.mask=true;
	    	//var main=plus.webview.getLaunchWebview();
			//main&&main.evalJS('closebackdrop();');
	    },
	    opening:function(type){
	    	if(type==1){
	    		sui.open('views/bank/personalOpening.html','personalOpening.html',{},{},true,'个人开户',false);
	    	}else{
	    		sui.open('views/bank/businessOpening.html','businessOpening.html',{},{},true,'企业开户',false);
	    	}
	    	vm.closeMask();
	    },
	    preventDefault:function(e){
	    		e.preventDefault();
	    }
	}
});
//监听事件
window.addEventListener('my', function(event) {
	vm.my();
});