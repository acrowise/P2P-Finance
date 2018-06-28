var vm = new Vue({
	el: '#vue-app',
    data: {
    	rate:0,
    	term:0, 
    	termUnit:4,
    	profit:0,
    	isIos:false,
    	grey:false
    },
    mounted: function () {
    	var $this=this;
    	$this.$nextTick(function () {
    	    if(window.plus) {
				vm.plusReady();
			} else {
				document.addEventListener('plusready', vm.plusReady, false);
			}
    	});
    },
  	methods: {	
	    plusReady:function(){
	    	var curr=plus.webview.currentWebview();
	    	this.rate=curr.rate;
	    	this.term=curr.term;
	    	this.termUnit=curr.termUnit;
	    	this.profit=curr.profit;
	    	setTimeout(function(){
	    		mui.os.ios&&(vm.isIos=true); 
	    		vm.init();
	    	},sui.constNum());
	    },
	    init:function(){
	    	//判断用户是否出借过新手标
	    	if(sui.isLogin()){
	    		sui.request('Invest/IsTender',{},true,function(data){
		    		if(data){
		    			if(data.IsPass && data.ReturnObject){
		    			   vm.grey=true;
		    			}
		    		}
		    	},true);
	    	}
	    },
	    sendTender:function(){
	    	if(!sui.isLogin()){
				sui.open('login.html','login.html',{},{},true,'登录',false);
				return;
			}
	    	var w=sui.wait(true,true,'请稍候...');
	    	sui.request('Invest/SendNoviceTender',{channel:mui.os.android?3:4},true,function(data){
	    		w=sui.closewait(w,true);
	    		if(data){
	    			if(data.IsPass){
	    			   vm.grey=true;
	    			     mui.alert('提交成功，系统正在处理',function(){
	    				      plus.webview.currentWebview().close();
					    },'div');
	    			}else{
	    				mui.toast(data.Desc);
	    			}
	    		}
	    	});
	    }
	},
	computed:{
		getRate:function(){
			return this.rate.toFixed(1);
		},
		getTerm:function(){
			//1-天 2-月 3-年 4-小时
			var termUnit="天";
			switch (this.termUnit){
				case 2:
				   termUnit="个月";
					break;
				case 3:
				   termUnit="年";
					break;
				case 4:
				    termUnit="小时";
					break;
				default:
					break;
			}
			return this.term+termUnit; 
		},
		getProfit:function(){
			return sui.rmoney(this.profit);
		}
	}
});