var vm=new Vue({
	el:"#vue-app",
	data:{
	},
	mounted:function(){
	    this.$nextTick(function () {
		});
	},
	methods:{
		btnPayPwd:function(){
			//设置交易密码
			sui.open('setPayPwd.html','setPayPwd.html',{},{});
			setTimeout(function(){
				plus.webview.currentWebview().close('none',0);
			},1000);
		}
	}
});
