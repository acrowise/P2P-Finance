var vm=new Vue({
	el:"#vue-app",
	data:{
		postData:{
			agree:true,
			busiTradeType:"B04",
			authAmount:"1000000",
			authTime:"2038-12-30",
			businessSeqNo:""
		},
		w:null
	},
	mounted:function(){
	    this.$nextTick(function () {
	    	if(window.plus) {
				vm.plusReady();
			} else {
				document.addEventListener('plusready',vm.plusReady, false);
			}
		});
	},
	methods:{
		plusReady:function(){
			mui.init({
				beforeback: function() {
					var my = plus.webview.getWebviewById("my.html");
					my.evalJS("vm.my();");
				 }
			});
		},
		checkPayPassword:function(){
			//校验交易密码
			if(!vm.postData.agree) {
				mui.toast('请阅读并同意《风险提示书》');
				return;
			}else if(sui.IsNullOrEmpty(vm.postData.authAmount)){
					mui.toast('请输入授权金额');
					return;
				}else if(!vm.postData.authAmount.isFloat()){
					mui.toast('请输入正确的授权金额,允许保留两位小数');
					return;
				}else if(parseFloat(vm.postData.authAmount)<200000){
					mui.toast('授权金额不能低于200,000.00');
					return;
				}
			vm.w=sui.wait();
			sui.request('User/CheckPayPassword', {operType:"B04",authority:'T99',authtime:vm.postData.authTime}, true,function(data) {
				sui.closewait(vm.w);
				if(data) {
					var IsPass = data.IsPass;
					if(IsPass) {
						 sui.open('checkPayPassword.html','checkPayPassword.html',{page:"auth",pageUrl:data.ReturnObject});
					} else {
						mui.toast(data.Desc);
					}
				} 
			});
		},
		btnAuth:function(){
			//业务授权
			vm.w=sui.wait(true,true,'正在处理...');
			sui.request('User/SignOrRevokeAgreement', vm.postData,false,function(data) {
				vm.w=sui.closewait(vm.w,true);
				if(data) {
					var IsPass = data.IsPass;
					if(IsPass) {
						 var my = plus.webview.getWebviewById("my.html");
					     my.evalJS("vm.my();");
					     mui.alert('授权成功',function(){
					     	plus.webview.currentWebview().close();
					    },'div');
					     //授权完成后应该跳转到客户绑卡-判断客户类型
					     //sui.open('openingSuccess.html','openingSuccess.html',{},{},true,'开户成功',false);
					} else {
						mui.toast(data.Desc);
					}
				} 
			});
		},
		btnRisk:function(){
			//风险提示书
			sui.open('../help/riskNote.html','riskNote.html',{},{},true,'风险提示书',false);
		},
		callback:function(seqNo){
			this.postData.businessSeqNo=seqNo;
			this.btnAuth();
		}
	}
});
