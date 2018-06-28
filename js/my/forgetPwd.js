var vm=new Vue({
	el:"#vue-app",
	data:{
		w:null,
		mobile:"",
		code:"",
		newPwd:"",
		confirmPwd:"",
		value:"获取验证码",
		isSend:0,
		btnState:false
	},
	methods:{
			sendCode:function(txtYZM, txtMobile){
			//发送验证码
				var postData = {
					Mobile: txtMobile,
					RandomCode: md5RandomCode(txtYZM),
					BussinessType:3,
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
				if(sui.IsNullOrEmpty(vm.mobile.trim())) {
					mui.toast('请输入手机号');
					return;
				} else if(!vm.mobile.isMobile()) {
					mui.toast('请输入正确的手机号码');
					return;
				}
				vm.isSend = 0;
				vm.value = '请稍候...';
				vm.btnState=true;
				sui.request('Passport/GetTime', {}, true, function(data) {
					if(data) {
						var IsPass = data.IsPass;
						if(IsPass) {
							vm.sendCode(data.ReturnObject, vm.mobile);
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
		btnSure:function(){
			 if(!vm.isSend) {
				mui.toast('请获取手机验证码');
				return;
			} else if(sui.IsNullOrEmpty(vm.mobile.trim())) {
				mui.toast('请输入手机号');
				return;
			} else if(!vm.mobile.isMobile()) {
				mui.toast('请输入正确的手机号');
				return;
			} else if(sui.IsNullOrEmpty(vm.code.trim())) {
				mui.toast('请输入验证码');
				return;
			} else if(sui.IsNullOrEmpty(vm.newPwd.trim())) {
				mui.toast('请输入新密码，8~20位，由字母+数字和符号两种以上组合');
				return;
			}else if(sui.IsNullOrEmpty(vm.confirmPwd.trim())) {
				mui.toast('请再次输入新密码');
				return;
			}else if(vm.newPwd.trim()!=vm.confirmPwd.trim()) {
				mui.toast('两次密码输入不一致');
				return;
			} 
			vm.w=sui.wait(true,true,'请稍候...');
			var postData={
				Mobile:vm.mobile,
				SmsVerCode:vm.code,
				Password:vm.newPwd,
				ConfirmPassword:vm.confirmPwd,
			};
			sui.request('Passport/Forget', postData,false,function(data) {
				vm.w=sui.closewait(vm.w,true);
				if(data) {
					var IsPass = data.IsPass;
					if(IsPass) {
						 mui.toast("新密码设置成功");
						 var login=plus.webview.getWebviewById('login.html');
						 if(login){
						 	plus.webview.currentWebview().close();
						 }else{
						 	sui.removeToken();
							sui.open('../root/login.html','login.html',{},{},true,'登录',false);
							setTimeout(function(){
								var my=plus.webview.getWebviewById('my.html');
						    	my&&mui.fire(my,'my');
								var curr=plus.webview.currentWebview();
						     	curr.opener()&&curr.opener().close('none',0);
								curr.close('none',0);
							},600);
						 }
					} else {
						mui.toast(data.Desc);
					}
				} 
			});
		}
	}
});