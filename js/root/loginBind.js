var vm=new Vue({
	el:"#vue-app",
	data:{
		w:null,
		txtName:"",
		txtPwd:"",
		pic:"../../images/my-logo.png",
		keys:null,
		type:null
	},
	mounted:function(){
		var $this=this;
	    $this.$nextTick(function () {
	    	$this.pic=localStorage.getItem('qhlead_userPic')||"../../images/my-logo.png";
	    	$this.txtName=localStorage.getItem('qhlead_userMobile')||"";
			 if(window.plus){
			     $this.plusReady();
			    }else{
			     document.addEventListener('plusready',vm.plusReady,false);
			  }	
		});
	},
	methods:{
		plusReady:function(){
		    var curr=plus.webview.currentWebview();
	         vm.keys=curr.keys;
     	     vm.type=curr.type;
			  mui.init({
				beforeback: function() {
				     var my = plus.webview.getWebviewById("my.html");
				     my.evalJS("vm.my();");
				   }
			});
		},
		btnLogin:function(){
			//登录
			if(sui.IsNullOrEmpty(vm.txtName)){
				mui.toast('请输入用户名');
				return;
			}else if(sui.IsNullOrEmpty(vm.txtPwd)){
				mui.toast('请输入密码');
				return;
			}
			vm.w=sui.wait(true,true,'登录中...');
			sui.post('Passport/Login', {mobile:vm.txtName,password:vm.txtPwd,keys:vm.keys},function(data) {
				vm.w=sui.closewait(vm.w,true);
				if(data) {
					var IsPass = data.IsPass;
					if(IsPass) {
						 var my = plus.webview.getWebviewById("my.html");
						 var novice=plus.webview.getWebviewById('noviceLoan.html');
						 novice&& novice.evalJS('vm.init();');
					     my.evalJS("vm.my();");
						 sui.setToken(data.ReturnObject.Token);
						 localStorage.setItem('qhlead_userMobile',vm.txtName);
						  if(~data.Desc.indexOf('已绑定')){
			           	    	sui.open('modifyOauth.html','modifyOauth.html',{keys:vm.keys,type:vm.type},{},true,'更换绑定',false)
			           	    }else{
			           	    	sui.open('sureOauth.html','sureOauth.html',{keys:vm.keys,type:vm.type},{},true,'确认关联',false); 
			           	    }
			           	    setTimeout(function(){
		           	    		  plus.webview.currentWebview().close('none',0);
		           	    	 },800);
					} else {
						mui.toast(data.Desc);
					}
				} 
			});
		},
		btnForget:function(){
			//忘记密码
			sui.open('../my/forgetPwd.html','forgetPwd.html',{},{},true,'忘记密码',false);
		}
	}
});