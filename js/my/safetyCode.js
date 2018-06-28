var vm=new Vue({
	el:"#vue-app",
	data:{
		w:null,
		txtMobile:"",
		txtPwd:"",
		smsCode:"",
		payPwd:"",
		isSend:0,
		value:"获取验证码",
		btnState:false,
		isRisk:true
	},
	mounted:function(){
	    this.$nextTick(function () {
	    	if(window.plus){
			     vm.plusReady();
			  }else{
			     document.addEventListener('plusready',vm.plusReady,false);
			  }	
		});
	},
	methods:{
		plusReady:function(){
			var curr=plus.webview.currentWebview();
			var isTips=curr.isTips;
			if(!sui.IsNullOrEmpty(curr.isRisk)){
				vm.isRisk=curr.isRisk;
			}
			if(isTips){
				mui.alert('为了保证资金安全，请设置您的安全码',function(){},'div');
			}
		},
		sendCode:function(txtYZM, txtMobile){
			//发送验证码
				var postData = {
					Mobile: txtMobile,
					RandomCode: md5RandomCode(txtYZM),
					BussinessType:10,
					Channel: mui.os.android?3:4,
					CodeType:0,
					LoginPwd:vm.txtPwd,
					ImageCode:sui.unique()
				};
				sui.request('Passport/GetLoginPhoneCode', postData, false, function(data) {
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
				if(sui.IsNullOrEmpty(vm.txtMobile.trim())) {
					mui.toast('请输入手机号');
					return;
				}else if(!vm.txtMobile.isMobile()) {
					mui.toast('请输入正确的手机号码');
					return;
				}else if(sui.IsNullOrEmpty(vm.txtPwd.trim())){
					mui.toast('请输入登录密码');
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
		btnSure:function(){
			//提交
			if(!vm.isSend) {
				mui.toast('请获取手机验证码');
				return;
			} else if(sui.IsNullOrEmpty(vm.txtMobile.trim())) {
				mui.toast('请输入手机号');
				return;
			} else if(!vm.txtMobile.isMobile()) {
				mui.toast('请输入正确的手机号');
				return;
			} else if(sui.IsNullOrEmpty(vm.txtPwd.trim())){
				mui.toast('请输入登录密码');
				return;
			} else if(sui.IsNullOrEmpty(vm.smsCode.trim())) {
				mui.toast('请输入验证码');
				return;
			}else if(sui.IsNullOrEmpty(vm.payPwd.trim())) {
				mui.toast('请输入新的安全码');
				return;
			} 
			vm.w=sui.wait(true,true,'正在保存...');
			var postData = {
				Mobile: vm.txtMobile,
				Password: vm.txtPwd,
				SmsVerCode: vm.smsCode,
				PayPassword:vm.payPwd
			};
			sui.request('User/SetPayPwd', postData,false,function(data) {
				vm.w=sui.closewait(vm.w,true);
				if(data) {
					var IsPass = data.IsPass;
					if(IsPass) {
						mui.toast("设置成功");
						if(!vm.isRisk){
							sui.open('../my/riskEvaluation.html','riskEvaluation.html',{},{},true,'风险测评',false);
							setTimeout(function(){
								plus.webview.currentWebview().close('none',0);
							},800);
						}else{
							plus.webview.currentWebview().close();
						}
					}else{
						mui.toast(data.Desc);
					}
				}
			});
		}
	}
});