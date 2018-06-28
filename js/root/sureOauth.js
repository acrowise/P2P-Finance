var vm=new Vue({
	el:"#vue-app",
	data:{
		w:null,
		txtName:"请稍候...",
		pic:"../../images/my-logo.png",
		loginWay:"快速登录前海领投账号",
		keys:null,
		type:null
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
			var login=plus.webview.getWebviewById('login.html');
			 var oauthLogin=plus.webview.getWebviewById('oauthLogin.html');
			 login&&login.evalJS('vm.logout();');
			 setTimeout(function(){
			 	login&&login.close('none',0);
			 },100);
			 oauthLogin&&oauthLogin.close('none',0);
			 setTimeout(function(){
			 	plus.webview.currentWebview().close();
			 },320);
		},
		refresh:function(thirdModel){
			sui.request('Passport/GetThird',{key:thirdModel},true,function(data){
				sui.closewait(vm.w);
				if(data){
					var IsPass=data.IsPass;
			        if(IsPass){
			        	vm.pic=data.Photo;
			        	vm.txtName=data.NickName;
			        }else{
			        	 mui.toast(data.Desc);
			        }
				}
			});
		},
		plusReady:function(){
			mui.init({
		         beforeback: function() {
			      vm.closePage();
				}
		   });
		    var curr=plus.webview.currentWebview();
	         vm.keys=curr.keys;
     	     vm.type=curr.type;
			 var way=['QQ','微信','支付宝'][vm.type-1]||"";
		     vm.loginWay='您可以使用'+way+'快速登录前海领投账号';
			setTimeout(function(){
				vm.w=sui.wait();
				vm.refresh(vm.keys);
			},sui.constNum());	
		},
		btnSure:function(){
			//确认关联
			vm.w=sui.wait(true,true,'请稍候...');
			sui.request('Passport/UpdateBind',{key:vm.keys},true,function(data){
				vm.w=sui.closewait(vm.w,true);
				if(data){
					var IsPass=data.IsPass;
					if(IsPass){
					    vm.closePage();
					    mui.toast('关联成功');
					}else{
						mui.toast(data.Desc);
					}				
				}
			});
		},
		btnCancle:function(){
			//取消
			plus.webview.currentWebview().close();
		}
	}
});