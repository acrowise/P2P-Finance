var vm = new Vue({
	el: '#vue-app',
    data: {
    	w:null,
		oldPhone:'',
		smsCode:'',
    	value:"获取验证码",
    	btnState:false,
    	isSend:0
    },
    mounted: function () {
    	this.$nextTick(function () {
    	});
    },
  	methods: {	
	    sendCode:function(txtYZM, txtMobile){
			//发送验证码
				var postData = {
					Mobile: vm.oldPhone,
					RandomCode: md5RandomCode(txtYZM),
					BussinessType:9,
					Channel: mui.os.android?3:4,
					CodeType:0,
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
			//获取服务器时间，发送验证码
			if(sui.IsNullOrEmpty(vm.oldPhone)) {
		        mui.toast("请输入原手机号码");
		        return;
		    }else if(!vm.oldPhone.isMobile()) {
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
						vm.sendCode(data.ReturnObject, vm.oldPhone);
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
	    /*下一步操作*/
	    nextCommit:function(){
	    	if(sui.IsNullOrEmpty(vm.oldPhone)) {
		        mui.toast("请输入原手机号码");
		        return;
		    }else if(!vm.oldPhone.isMobile()) {
				mui.toast('请输入正确的手机号码');
				return;
			}else if(!vm.isSend) {
				mui.toast('请获取手机验证码');
				return;
			}else if(sui.IsNullOrEmpty(vm.smsCode)){
    			mui.toast("请输入验证码");
	        	return;
    		}
			vm.w=sui.wait(true,true,'请稍候...');
    		sui.post('User/ValidateMobile',{code:vm.smsCode},function(data){
    			vm.w=sui.closewait(vm.w,true);
	    		if(data) {
					var IsPass = data.IsPass;
					if(IsPass) {
							sui.open('modifyMobile.html','modifyMobile.html',{param:data.ReturnObject},{},true,'更换新手机号',false);
							setTimeout(function(){
								plus.webview.currentWebview().close('none',0);
							},1000);
					} else {
						mui.toast(data.Desc);
					}
				} 
	    	});
	    }
	}
});