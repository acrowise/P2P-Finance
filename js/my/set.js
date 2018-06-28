var vm=new Vue({
	el: '#vue-app',
    data: {
    	isSetPwd:false
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
  			vm.isSetPwd=curr.isSetPwd;
  		},
	    href:function(data){
	    	if(data.name){
	    		if(data.id=='businessAuth.html'){
	    			 sui.open(data.url,data.id,{},{},true,data.name,false,true,"\ue705",function(){
		             	 sui.open('../bank/authExplain.html','authExplain.html',{},{},true,'授权说明',false);
		              });
	    		}else{
	    			sui.open(data.url,data.id,{},{},true,data.name,false);
	    		}
	    	}else{
	    		if(vm.isSetPwd){
	    			sui.open("../bank/tradePwd.html","tradePwd.html",{},{},true,"修改交易密码",false);
	    		}else{
	    			sui.open(data.url,data.id,{},{});
	    		}
	    	}
	    },
	    score:function(){
	    	//评分
	    	if(mui.os.ios) {
	    		plus.runtime.openURL('https://itunes.apple.com/cn/app/qian-hai-ling-tou/id1121867186?mt=8');
			}else{
				plus.runtime.openURL("market://details?id=io.dcloud.H528FA023", function(e) {
					mui.alert("没有安装腾讯应用宝，暂时无法评分，感谢支持",function(){},'div');
				}, "com.tencent.android.qqdownloader");	
			}
	    },
	    cancel:function(){
	    	var w=sui.wait();
	    	sui.request('User/CustomerCancel', {}, true, function(data) {
	    		sui.closewait(w);
					if(data) {
						if(data.IsPass) {
							mui.toast('注销成功');
							sui.removeToken();
						    plus.navigator.removeAllCookie();
					    	var my=plus.webview.getWebviewById('my.html');
							my&&mui.fire(my,'my');
							setTimeout(function(){
								plus.webview.currentWebview().close();
							},80);
						} else {
							mui.toast("注销失败："+  data.Desc);
							vm.loadding = false;
							vm.line = false;
						}
					} else {
						vm.loadding = false;
						vm.line = false;
					}
				});
	    },
	    exitLogin:function(){
	    	//退出登录
	    		var bts=[{title:"退出",style:"destructive"}];
			    plus.nativeUI.actionSheet({title:"退出后将清除您的登录信息,确认退出吗?",cancel:"取消",buttons:bts},function(e){
					if (e.index == 1) {
						sui.removeToken();
						plus.navigator.removeAllCookie();
						sui.open('../root/login.html','login.html',{},{},true,'登录',false);
						setTimeout(function(){
							var my=plus.webview.getWebviewById('my.html');
							my&&mui.fire(my,'my');
							plus.webview.currentWebview().close('none',0);
						},1000);
					}
				 });
	    }
	}
});