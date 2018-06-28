var vm=new Vue({
	el:"#vue-app",
	data:{
		postData:{
			agree:true,
			username:"",
			certNo:"",
			ctype:"00",
			busiTradeType:"U01"
		},
		w:null
	},
	mounted:function(){
	    this.$nextTick(function () {
		});
	},
	methods:{
		btnOpening:function(){
			//个人开户
			if(!vm.postData.agree) {
				mui.toast('请阅读并同意《个人开户协议》');
				return;
			}else if(sui.IsNullOrEmpty(vm.postData.username)) {
				mui.toast('请输入真实姓名');
				return;
			} else if(sui.IsNullOrEmpty(vm.postData.certNo)) {
				mui.toast('请输入身份证号码');
				return;
			} else if(!sui.checkIdCard(vm.postData.certNo)) {
				mui.toast('请输入正确的身份证号码');
				return;
			} 
			vm.w=sui.wait();
			sui.request('User/CustomerRegister', vm.postData,false,function(data) {
				sui.closewait(vm.w);
				if(data) {
					var IsPass = data.IsPass;
					if(IsPass) {
						 var my = plus.webview.getWebviewById("my.html");
					     my.evalJS("vm.my();");
					     sui.open('openingSuccess.html','openingSuccess.html',{},{},true,'开户成功',false);
					     setTimeout(function(){
					     	var openAcc= plus.webview.getWebviewById('openingAccount.html');
					     	openAcc && openAcc.close('none',0);
					     	plus.webview.currentWebview().close('none',0);
					     },1000);
					} else {
						mui.toast(data.Desc);
					}
				} 
			});
		},
		btnAgree:function(){
			//个人开户协议
			sui.open('openingProtocol.html','openingProtocol.html',{},{},true,'资金存管三方协议',false);
		},
		btnRisk:function(){
			//风险提示书
			sui.open('../help/riskNote.html','riskNote.html',{},{},true,'风险提示书',false);
		}
	}
});
