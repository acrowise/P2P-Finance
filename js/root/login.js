var vm=new Vue({
	el:"#vue-app",
	data:{
		w:null,
		txtName:"",
		txtPwd:"",
		pic:"../../images/my-logo.png",
		auths:{},
		source:null,
		doLoop:null,
		invest:false
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
			vm.source=curr.source||null;
			vm.invest=curr.invest;
			  mui.init({
				beforeback: function() {
				     var my = plus.webview.getWebviewById("my.html");
				     my.evalJS("vm.my();");
				     vm.logout();
				   }
			});
			plus.oauth.getServices(function(services){
				 for(var i in services){
						var service=services[i];
						var id=service.id;
						vm.auths[id]=service;
					}	
				},function(e){
					mui.toast("获取登录认证失败："+e.message);
				});
		},
		inputName:function(){
			clearTimeout(vm.doLoop);
			vm.doLoop=setTimeout(function(){
				if(vm.txtName !=(localStorage.getItem('qhlead_userMobile')||"")){
					vm.pic="../../images/my-logo.png";
				}else{
					vm.pic=localStorage.getItem('qhlead_userPic')||"../../images/my-logo.png";
				}
			},400);
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
			sui.post('Passport/Login', {mobile:vm.txtName,password:vm.txtPwd,keys:""},function(data) {
				vm.w=sui.closewait(vm.w,true);
				if(data) {
					var IsPass = data.IsPass;
					if(IsPass) {
						sui.setToken(data.ReturnObject.Token); 
						localStorage.setItem('qhlead_userMobile',vm.txtName);
						 vm.logout();
						 var my = plus.webview.getWebviewById("my.html");
						 var novice=plus.webview.getWebviewById('noviceLoan.html');
						 var parent=plus.webview.currentWebview().opener();
						 novice&& novice.evalJS('vm.init();');
					     my.evalJS("vm.my();");
					     mui.toast("登录成功");
				     	 if(vm.invest){
							parent.evalJS('vm.init();');
						 }
					      if(!data.ReturnObject.IsRisk){
					     	var investId=false;
					     	if(parent && ~parent.id.indexOf('Lead')){
					     		investId=parent.id;
					     	}
					     	sui.open('../my/riskEvaluation.html','riskEvaluation.html',{invest:vm.invest,investId:investId},{},true,'风险测评',false);
					     }else{
					     	setTimeout(function(){
								plus.webview.currentWebview().close();
							},220);
							return;
					     }
					     setTimeout(function(){
							plus.webview.currentWebview().close('none',0);
						},1000);
					} else {
						mui.toast(data.Desc);
					}
				} 
			});
		},
		btnReg:function(){
			//注册
			sui.open('regStart.html','regStart.html',{},{},true,'注册',false);
		},
		resultOperater:function(type,data){
			  vm.w=sui.closewait(vm.w,true); 
			   if(data){
				var IsPass=data.IsPass;
				if(IsPass){
					var IsBind=data.IsBind;
					if(IsBind){
						localStorage.setItem('qhlead_userMobile',data.Mobile);
						sui.setToken(data.Token);
						vm.logout();
			            var main = plus.webview.getWebviewById("my.html");
			            var novice=plus.webview.getWebviewById('noviceLoan.html');
						 novice&& novice.evalJS('vm.init();');
			            main.evalJS("vm.my();");
			             if(vm.invest){
			             	var parent=plus.webview.currentWebview().opener();
							parent.evalJS('vm.init();');
						 }
			           setTimeout(function(){
				            plus.webview.currentWebview().close();
			           },220);
					}else{
						var keys=data.Key;
						//关联登录
						sui.open('oauthLogin.html','oauthLogin.html',{keys:keys,type:type},{},true,'关联登录',false);
					}
				}else{
					mui.toast(data.Desc);
					vm.logout();
				}
			}else{
				vm.logout();
			}
		},
		qqLogin:function(token,nickName,photo){
			//QQ登录
			sui.request('Passport/OpenIdAndUnionId',{accessToken:token,nickName:nickName,photo:photo},true,function(data){
				vm.resultOperater(1,data);
			});
		},
		wechatLogin:function(token,openId,unionId,nickName,photo){
			//微信登录
			sui.request('Passport/WechatOpenId',{accessToken:token,openId:openId,unionId:unionId,nickName:nickName,photo:photo},true,function(data){
				vm.resultOperater(2,data);
			});
		},
		userInfo:function(auth,id){
			//用户信息
			var openidi=null;
			var unionidi=null;
			var token=auth.authResult.access_token;
			if(id=='weixin'){
				openidi=auth.authResult.openid;
				unionidi=auth.authResult.unionid;
			}
			auth.getUserInfo(function(){
                vm.w=sui.closewait(vm.w,true);
				var nickname=auth.userInfo.nickname||auth.userInfo.name;
				 if(id=='qq'){
				 	var photo=auth.userInfo.figureurl_2||auth.userInfo.figureurl_1||auth.userInfo.figureurl_qq_1||auth.userInfo.figureurl;
				    vm.qqLogin(token,nickname,photo); 
				 }else if(id=='weixin'){
				 	var photo=auth.userInfo.headimgurl;
				 	var openId=openidi||auth.userInfo.openid;
				 	var unionId=unionidi||auth.userInfo.unionid;
				    vm.wechatLogin(token,openId,unionId,nickname,photo);
				 }
			},function(e){
				mui.toast("获取用户信息失败");
			});
		},
		oauthLogin:function(id){
			//登录认证
			var auth=vm.auths[id];
			if(auth){
				if(mui.os.android){
					vm.w=sui.wait(true,true,'请稍候...');
				}
				document.addEventListener("pause",function(){
					setTimeout(function(){
						vm.w=sui.closewait(vm.w,true);
					},2000);
				}, false );
				auth.login(function(){
					vm.w=sui.closewait(vm.w,true);
					vm.userInfo(auth,id);
				},function(e){
					vm.w=sui.closewait(vm.w,true);
					plus.nativeUI.alert("登录失败["+e.code+"]："+e.message,null,"登录认证失败");
				});
			}else{
				mui.toast("无效的登录认证通道！");
			}
		},
		btnForget:function(){
			//忘记密码
			sui.open('../my/forgetPwd.html','forgetPwd.html',{},{},true,'忘记密码',false);
		},
		logout:function(){
			//注销第三方登录
			for(var i in vm.auths){
		   	  vm.auths[i].logout(function(){},function(e){});
			}
		}
	}
});