var vm=new Vue({
	el:"#vue-app",
	data:{
		w:null,
		txtMobile:"",
		txtCode:"",
		txtPwd:"",
		txtUser:"",
		agree:true,
		isSend:0,
		value:"获取验证码",
		btnState:false,
		keys:"",
		userKind:1
	},
	mounted:function(){
		var $this=this;
	    $this.$nextTick(function () {
			 if(window.plus){
			     $this.plusReady();
			    }else{
			     document.addEventListener('plusready',vm.plusReady,false);
			  }	
		});
	},
	methods:{
		closePage:function(){
			 sui.open('../my/riskEvaluation.html','riskEvaluation.html',{},{},true,'风险测评',false);
			 var login=plus.webview.getWebviewById('login.html');
			 var oauthLogin=plus.webview.getWebviewById('oauthLogin.html');
			 login&&login.evalJS('vm.logout();');
			setTimeout(function(){
			    login&&login.close('none',0);
			    oauthLogin&&oauthLogin.close('none',0);
			 	plus.webview.currentWebview().close('none',0);
			 },800);
		},
		plusReady:function(){
			var page = plus.webview.currentWebview();
			vm.keys=page.keys||'';
			vm.txtUser=page.mobile||'';
			vm.userKind=page.userKind||1;
		},
		sendCode:function(txtYZM, txtMobile){
			//发送验证码
				var postData = {
					Mobile: txtMobile,
					RandomCode: md5RandomCode(txtYZM),
					BussinessType:1,
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
				if(!vm.agree) {
					mui.toast('请阅读并同意前海领投《注册协议》');
					return;
				} else if(sui.IsNullOrEmpty(vm.txtMobile)) {
					mui.toast('请输入手机号');
					return;
				} else if(!vm.txtMobile.isMobile()) {
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
							vm.sendCode(data.ReturnObject, vm.txtMobile);
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
		btnReg:function(){
			//注册
			if(!vm.agree) {
				mui.toast('请阅读并同意前海领投《注册协议》');
				return;
			}else if(sui.IsNullOrEmpty(vm.txtMobile)) {
				mui.toast('请输入手机号');
				return;
			} else if(!vm.txtMobile.isMobile()) {
				mui.toast('请输入正确的手机号');
				return;
			}else if(!vm.isSend) {
				mui.toast('请获取手机验证码');
				return;
			}  else if(sui.IsNullOrEmpty(vm.txtCode)) {
				mui.toast('请输入验证码');
				return;
			} else if(sui.IsNullOrEmpty(vm.txtPwd)) {
				mui.toast('请输入登录密码，8~20位，由字母+数字和符号两种以上组合');
				return;
			}else if(!sui.IsNullOrEmpty(vm.txtUser)&&!vm.txtUser.isMobile()) {
				mui.toast('请输入正确的推荐人手机号');
				return;
			} 
			vm.w=sui.wait(true,true,'正在注册...');
			var postData = {
				Mobile: vm.txtMobile,
				Password: vm.txtPwd,
				SmsVerCode: vm.txtCode,
				Channel: mui.os.android?3:4,
				TuiJianUser: vm.txtUser,
				Agree:vm.agree,
				Key:vm.keys,
				UserKind:vm.userKind
			};
			sui.post('Passport/Reg', postData,function(data) {
				vm.w=sui.closewait(vm.w,true);
				if(data) {
					var IsPass = data.IsPass;
					if(IsPass) {
						if(data.ReturnObject && !sui.IsNullOrEmpty(data.ReturnObject)){
							sui.setToken(data.ReturnObject); 
							localStorage.setItem('qhlead_userMobile',vm.txtMobile);
							 var my = plus.webview.getWebviewById("my.html");
							 var novice=plus.webview.getWebviewById('noviceLoan.html');
							 novice&& novice.evalJS('vm.init();');
						     my.evalJS("vm.my();");
							 vm.closePage();
						}else{
							plus.webview.currentWebview().close();
						}
						mui.toast(data.Desc);
					} else {
						mui.toast(data.Desc);
					}
				} 
			});
		},
		btnAgree:function(){
			//用户注册协议
			sui.open('../help/regProtocol.html','regProtocol.html',{},{},true,'用户注册协议',false);
		},
		btnRisk:function(){
			//风险提示书
			sui.open('../help/riskNote.html','riskNote.html',{},{},true,'风险提示书',false);
		},
		btnScan:function(){
			document.activeElement.blur();
			//扫码填写推荐人
			sui.open('../help/scanQrcode.html','scanQrcode.html',{},{});
		},
		scanResult:function(result){
			//扫码结果
			vm.txtUser=result;
		}
	}
});
