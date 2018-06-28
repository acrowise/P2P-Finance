new Vue({
	el:"#vue-app",
	data:{
		w:null,
		connectionId:'',
		qrcodeId:'',
		myurl: 'http://testwww.qhlead.com/',
	    curr:null,
	    errMsg:'',
	    errShow:false
	},
	mounted:function(){
		var $this=this;
		mui.init({
			beforeback:function(){
				$this.cancle();
			}
		});
	    $this.$nextTick(function () {
			 if(window.plus){
			     $this.plusReady();
			    }else{
			     document.addEventListener('plusready',$this.plusReady,false);
			  }	
		});
	},
	methods:{
		cancle:function(){
			sui.request('Passport/CancleLogin', { connectionId: this.connectionId }, false, function(data) {
				if(data) {
					var IsPass = data.IsPass;
					if(!IsPass) {
						mui.toast(data.Desc);
					}
				}
			}, false,this.myurl);
			this.curr&&this.curr.close();
		},
		plusReady:function(){
			var $this=this;
			$this.curr=plus.webview.currentWebview();
			$this.connectionId = $this.curr.connectionId;
			$this.qrcodeId = $this.curr.qrcodeId;
			setTimeout(function() {
					sui.request('Passport/AlreadyScan', { connectionId: $this.connectionId }, false, function(data) {
						if(data) {
							var IsPass = data.IsPass;
							if(!IsPass) {
								mui.toast(data.Desc);
							}
						} 
					},false, $this.myurl);
			}, sui.constNum());
		},
		btnLogin:function(){
			var $this=this;
			$this.w = sui.wait();
			sui.request('Passport/SubmitScanLogin', { token: sui.getToken(), connectionId: $this.connectionId, qrcodeId: $this.qrcodeId }, false, function(data) {
				sui.closewait($this.w);
				if(data) {
					var IsPass = data.IsPass;
					if(IsPass) {
						$this.curr.close();
						mui.toast(data.Desc);
					} else {
						$this.errMsg= data.Desc;
						$this.errShow =true;
					}
				}
			}, false,$this.myurl);
		}
	}
});