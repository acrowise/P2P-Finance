var vm=new Vue({
	el:"#vue-app",
	data:{
		w:null,
		txtName:"请稍候...",
		pic:"../../images/my-logo.png",
		loginWay:"尚未关联前海领投账号",
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
			      var parent=plus.webview.getWebviewById('login.html');
			      parent&&parent.evalJS('vm.logout();');
				}
			});
		    var curr=plus.webview.currentWebview();
	         vm.keys=curr.keys;
     	     vm.type=curr.type;
			 var way=['QQ','微信','支付宝'][vm.type-1]||"";
		     vm.loginWay='您的'+way+'尚未关联前海领投账号';
			setTimeout(function(){
				vm.w=sui.wait();
				vm.refresh(vm.keys);
			},sui.constNum());	
		},
		btnNew:function(){
			//关联新账号
			sui.open('regStart.html','regStart.html',{keys:vm.keys},{},true,'注册',false);
		},
		btnHas:function(){
			//关联已有账号
			sui.open('loginBind.html','loginBind.html',{keys:vm.keys,type:vm.type},{},true,'登录绑定',false);
		}
	}
});