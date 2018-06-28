var vm=new Vue({
	el:"#vue-app",
	data:{
		postData:{
			agree:true,
			username:"",
			certNo:"",
			ctype:"01",
			busiTradeType:"U04",
			companyName:"",
			uniSocCreCode:"",
			bizLicDomicile:"",
			dateOfEst:"",
			corpacc:"",
			corpAccBankNm:"",
			corpAccBankNo:""
		},
		w:null,
    	picker:null,
    	isIos:false
	},
	mounted:function(){
	    this.$nextTick(function () {
	    	vm.picker=new mui.DtPicker({"type":"date","beginYear":1980});
	    	mui.os.ios && (vm.isIos=true);
		});
	},
	methods:{
		btnOpening:function(){
			//企业开户
			if(!vm.postData.agree) {
				mui.toast('请阅读并同意《企业开户协议》');
				return;
			}else if(sui.IsNullOrEmpty(vm.postData.companyName)) {
				mui.toast('请输入公司名称');
				return;
			} else if(sui.IsNullOrEmpty(vm.postData.uniSocCreCode)) {
				mui.toast('请输入统一社会信用编码');
				return;
			} else if(sui.IsNullOrEmpty(vm.postData.bizLicDomicile)) {
				mui.toast('请输入营业执照住所');
				return;
			} else if(sui.IsNullOrEmpty(vm.postData.dateOfEst)) {
				mui.toast('请选择成立日期');
				return;
			}else if(sui.IsNullOrEmpty(vm.postData.username)) {
				mui.toast('请输入法人姓名');
				return;
			}else if(sui.IsNullOrEmpty(vm.postData.certNo)) {
				mui.toast('请输入身份证号码');
				return;
			} else if(!sui.checkIdCard(vm.postData.certNo)) {
				mui.toast('请输入正确的身份证号码');
				return;
			} else if(sui.IsNullOrEmpty(vm.postData.corpAccBankNm)) {
				mui.toast('请输入对公银行名称');
				return;
			} else if(sui.IsNullOrEmpty(vm.postData.corpAccBankNo)) {
				mui.toast('请输入对公银行行号');
				return;
			}  else if(sui.IsNullOrEmpty(vm.postData.corpacc)) {
				mui.toast('请输入对公账号');
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
		btnPicker:function(){
			//日期选择器
			document.activeElement.blur();
		    this.picker.show(function(rs) {
		    	vm.postData.dateOfEst=rs.t;
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
