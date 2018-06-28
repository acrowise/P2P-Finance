var vm = new Vue({
	el: '#vue-app',
    data: {
		oldPwd:'',
		newPwd:'',
		confirmPwd:''
    },
    mounted: function () {
    	this.$nextTick(function () {
    	});
    },
  	methods: {	
	    /*提交操作*/
	    btnCommit:function(){
	    	  if (sui.IsNullOrEmpty(vm.oldPwd.trim())) {
			        mui.toast("请输入原登录密码");
			        return;
			   }else if (sui.IsNullOrEmpty(vm.newPwd.trim())) {
			        mui.toast("请输入新登录密码");
			        return;
			   }else if (sui.IsNullOrEmpty(vm.confirmPwd.trim())) {
			        mui.toast("请再次输入新登录密码");
			        return;
			   }else if (vm.newPwd.trim() != vm.confirmPwd.trim()) {
			        mui.toast("新密码和确认密码不一致");
			        return;
			    }
		      var w=sui.wait(true,true,'请稍候...');
				var postData={
					OldPassword:vm.oldPwd,
					NewPassword:vm.newPwd,
					ConfirmPassword:vm.confirmPwd,
				};
				sui.request('User/ModifyPwd', postData,false,function(data) {
					w=sui.closewait(w,true);
					if(data) {
						var IsPass = data.IsPass;
						if(IsPass){					
							sui.removeToken();
							mui.toast("密码修改成功");
							sui.open('../root/login.html','login.html',{},{},true,'登录',false);
							setTimeout(function(){
								var my=plus.webview.getWebviewById('my.html');
						    	my&&mui.fire(my,'my');
								var curr=plus.webview.currentWebview();
						     	curr.opener()&&curr.opener().close('none',0);
								curr.close('none',0);
							},600);
						} else {
							mui.toast(data.Desc);
						}
					} 
			});
	    }
	}
});