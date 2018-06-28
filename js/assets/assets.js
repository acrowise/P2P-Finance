var vm = new Vue({
	el: '#vue-app',
    data: {
    	model:{     
			TotalAmount : 0,//资产总额
	        AvailBal : 0,//账户余额
	        CapitalInterest : 0,//待收本息
	        FreezeAmount : 0,//冻结金额
	        RefundAmount : 0,//待还金额
	        HongBao: 0,//红包
	        RateCoupons: 0,//We券
	        TotalInvest: 0,//累计出借金额
	        DueInCapital : 0,//待收本金
	        DueInInterest: 0,//待收利息
	        EarnInterest : 0,//已赚利息
	        EarnRaiseInterest : 0,//已赚出借奖励
	        UnclaimedAward : 0//待领奖励
    	},
    	isIos:false
    },
    mounted: function () {
    	this.$nextTick(function () {
    		mui.os.ios && (vm.isIos=true);
    	});
    },
  	methods: {	
	    /*路由（跳转）tap事件绑定*/
	    href:function(data){
    			if(sui.isLogin()){
    			   sui.open('views/assets/assetsRecord.html','assetsRecord.html',{type:data.type},{},true,data.name,false);
    			}else{
    				sui.open('views/root/login.html','login.html',{},{},true,'登录',false);
    			}  
	    },
	    transfer:function(){
    			if(sui.isLogin())
    			   sui.open('views/my/myTransfer.html','myTransfer.html',{tap:2},{},true,'我的转让',false);
    			else
    				sui.open('views/root/login.html','login.html',{},{},true,'登录',false);
	    },
	    assets:function(){
	    	if(!sui.isLogin()){
				return;
			}
	    	sui.request('Account/FundSummary',{},true,function(data){
	    		if(data){
	    			if(data.IsPass){
	    			  vm.model=data.ReturnObject;
	    			}else{
	    				mui.toast(data.Desc);
	    			}
	    		}
	    	});
	    }
	},
	filters:{
		format:function(value){
			return sui.rmoney(value);
		}
	}
});
//监听事件
window.addEventListener('assets', function(event) {
	vm.assets();
});	