var vm=new Vue({
	el:"#vue-app",
	data:{
		feedback:''
	},
	mounted: function () {
    	this.$nextTick(function () {
    	});    	    	    	
    },
	methods:{
		btnSubmit: function() {
			if( sui.IsNullOrEmpty(this.feedback)){
				mui.toast('请输入您的意见反馈');
				return;
			}		
			var w=sui.wait(true,true,'正在提交...');
			sui.request('User/Feedback',{AdviceDesc:vm.feedback},false,function(data){		
				w=sui.closewait(w,true);
				if(data){
					if(data.IsPass){				
						mui.toast("提交成功");
						plus.webview.currentWebview().close();					
	    		   }else{
	    				mui.toast(data.Desc);
	    			}		
				}
			});	
		 }
	}
});