var vm = new Vue({
	el: '#vue-app',
    data: {
    	isIos:false,
    	model:{}
    },
    mounted: function () {
    	mui.os.ios && (this.isIos=true);
    	this.$nextTick(function () {
    		if(mui.os.ios){
    			vm.$refs.iosSet.classList.remove('mui-hidden');
    			vm.$refs.iosTips.classList.remove('mui-hidden');
    		}
    		 if(window.plus){
			     vm.init();
			   }else{
			     document.addEventListener('plusready',vm.init,false);
			  }	
    	});
    },
  	methods: {	
		 plusReady:function(){
		 	if(this.isIos){
		 		var UIApplication = plus.ios.importClass("UIApplication");
				var app = UIApplication.sharedApplication();
				var enabledTypes  = 0;
				if (app.currentUserNotificationSettings) {
				    var settings = app.currentUserNotificationSettings();
				    enabledTypes = settings.plusGetAttribute("types");
				} else { 
				        //针对低版本ios系统
				    enabledTypes = app.enabledRemoteNotificationTypes();
				}
				if ( 0 == enabledTypes ) {
					 vm.setMsg("AppNotice",false);
				     mui.confirm('检测到您还未开启通知消息提醒功能，是否立即设置？','',['取消','确定'],function(e){
				     		if(e.index==0){
				     			return false;
				     		}else{
				     			plus.runtime.openURL("app-settings:");
				     		}
				     });
				}else{
					vm.setMsg("AppNotice",true);
				}
			   plus.ios.deleteObject(app);
		 	}else{
		 		mui('.mui-switch')['switch']();
		 	}
		 },
		 init:function(){
		 	if(sui.isLogin()){
		 		setTimeout(function(){
		 			var w=sui.wait();
		 			sui.request('User/GetMessageSet',{},true,function(data){
		 				sui.closewait(w);
			    		if(data){
			    			if(data.IsPass){
			    			    vm.model=data.ReturnObject || {};
			    			    vm.plusReady();
			    			}else{
			    				mui.toast(data.Desc);
			    			}
			    		}
			    	});
		 		},sui.constNum());
		 	}
		 },
		 btnSwitch:function(event,dom){
		 	var pushManager = plus.android.importClass("com.igexin.sdk.PushManager");
			var context = plus.android.runtimeMainActivity();
			if(event.detail.isActive){
				pushManager.getInstance().turnOnPush(context);
				vm.setMsg(dom,true);
			}else{
				 pushManager.getInstance().turnOffPush(context);
				 vm.setMsg(dom,false);
			}
		 },
	  	 iosSet:function(){
	  	 	plus.runtime.openURL("app-settings:");
	  	 },
	  	 toogleSwitch:function(event,dom){
				vm.setMsg(dom,event.detail.isActive);
	  	 },
	  	 setMsg:function(fileds, filedsValue){
	  	 	sui.request('User/SetUserMessage',{fileds:fileds,filedsValue:filedsValue},true,function(data){});
	  	}
  	}
});
