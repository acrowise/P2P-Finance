var vm = new Vue({
	el: '#vue-app',
    data: {
    	w:null,
		newPhone:'',
		smsCode:'',
    	value:"获取验证码",
    	btnState:false,
    	param:'',
    	isSend:0
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
			vm.param=plus.webview.currentWebview().param;
		},
	    sendCode:function(txtYZM, txtMobile){
			var postData = {
				Mobile: vm.newPhone,
				RandomCode: md5RandomCode(txtYZM),
				BussinessType:4,
				Channel: mui.os.android?3:4,
				CodeType:0,
				AppId:plus.runtime.appid,
				ImageCode:sui.unique()
			};
			sui.request('Passport/GetPhoneCode', postData, false, function(data) {
				if(data) {
					var IsPass = data.IsPass;
					if(IsPass) {
						vm.isSend = 1;
						vm.btnState=true;
						var maxtime = 120;
						function CountDown() {
							if(maxtime >= 0) {
								vm.value = maxtime + 's';
								--maxtime;
							} else {
								clearInterval(InTime);
							    vm.value = '获取验证码';
							    vm.btnState=false;
							}
						}
						InTime = setInterval(CountDown, 1000);
					} else {
						vm.value = '获取验证码';
					    vm.btnState=false;
						mui.toast(data.Desc);
					}
				} else {
					vm.value = '获取验证码';
				    vm.btnState=false;
				}
		
			});
		},
	    btnSend:function(){
			//获取服务器时间，发送验证码
			 if(sui.IsNullOrEmpty(vm.newPhone)) {
			        mui.toast("请输入新手机号");
			        return;
			   }else if (!vm.newPhone.isMobile()) {
			        mui.toast("请输入正确的手机号码");
			        return;
			   }
				vm.isSend = 0;
				vm.value = '请稍候...';
				vm.btnState=true;
				sui.request('Passport/GetTime', {}, true, function(data) {
					if(data) {
						var IsPass = data.IsPass;
						if(IsPass) {
							vm.sendCode(data.ReturnObject, vm.newPhone);
						} else {
							mui.toast('获取验证码失败,请稍候再试');
							vm.btnState=false;
							vm.value = '获取验证码';
						}
					} else {
						vm.btnState=false;
						vm.value = '获取验证码';
					}
				});
		},
	    btnCommit:function(){
	    	 if (sui.IsNullOrEmpty(vm.newPhone)) {
			        mui.toast("请输入新手机号");
			        return;
			   }else if (!vm.newPhone.isMobile()) {
			        mui.toast("请输入正确的手机号码");
			        return;
			   }else if(!vm.isSend) {
				  mui.toast('请获取手机验证码');
				  return;
			   }else if(sui.IsNullOrEmpty(vm.smsCode)){
	    			mui.toast("验证码不能为空");
		        	return;
	    		}else if(sui.IsNullOrEmpty(vm.param)){
	    			mui.toast("参数错误，请退出重试");
		        	return;
	    		}
			   vm.w=sui.wait(true,true,'请稍候...');
	    		var postData={
	    			Mobile :vm.newPhone,
	    			SmsVerCode:vm.smsCode, 
	    			EncryptString:vm.param
	    		};
	    		sui.request('User/ModifyMobile',postData,false,function(data){
	    			vm.w=sui.closewait(vm.w,true);
		    		if(data) {
						if(data.IsPass) {
							mui.toast("更换新手机号成功");
							localStorage.setItem('qhlead_userMobile',vm.newPhone);
							var my=plus.webview.getWebviewById('my.html');
							my&&mui.fire(my,'my');
                            setTimeout(function(){
                            	plus.webview.currentWebview().close();
                            },100);
						}else{
							mui.toast(data.Desc);
						}
					}
		    	});	
	    }
	}
});