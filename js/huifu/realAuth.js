var vm = new Vue({
	el: '#vue-app',
	data: {
		loadding: true,
		line: true,
		close: false,
		embed: null
	},
	mounted: function() {
		this.$nextTick(function() {
			if(window.plus) {
				vm.init();
			} else {
				document.addEventListener('plusready',vm.init, false);
			}
		});
	},
	methods: {
		init: function() {
			setTimeout(function() {
				sui.request('User/RealAuth', {channel:2}, true, function(data) {
					if(data) {
						if(data.IsPass) {
							vm.plusReady(data.ReturnObject);
						} else {
							mui.toast(data.Desc);
							vm.loadding = false;
							vm.line = false;
						}
					} else {
						vm.loadding = false;
						vm.line = false;
					}
				});
			}, sui.constNum());
		},
		plusReady: function(data) {
			 mui.init({
				beforeback: function() {
				     vm.callback();
				  }
			});
			this.embed = plus.webview.create("", sui.unique(), {
				top: (immersed + 44) + 'px',
				bottom: "0px",
				position: 'dock',
				dock: 'bottom',
				bounce: 'vertical',
				bounceBackground: '#F7F7F9',
				decelerationRate: 1.0,
				scrollIndicator: 'none',
				scalable: false
			});
			this.embed.loadData(data);
			plus.webview.currentWebview().append(this.embed);
			this.embed.addEventListener("loaded", vm.offBrowserLoading, false);
			this.embed.addEventListener("loading", vm.onBrowserLoading, false);
			this.embed.overrideUrlLoading({
				mode: "reject",
				match: ".*#/user.*"
			}, function(e) {
				vm.callback();
			});
		},
		callback:function(){
			var info=plus.webview.getWebviewById('userinfo.html');
			var my = plus.webview.getWebviewById("my.html");
		    my&&my.evalJS("vm.my();");
		    info && info.evalJS("vm.init();");
		    setTimeout(function(){
		    	plus.webview.currentWebview().close();
		    },50);
		},
		btnClose: function() {
			//返回关闭
			if(vm.embed && !sui.IsNullOrEmpty(vm.embed.getURL())) {
				vm.embed.canBack(function(e) {
					if(e.canBack) {
						vm.embed.back();
						vm.close = true;
					} else {
						vm.callback();
					}
				});
			} else {
				vm.callback();
			}
		},
		onBrowserLoading: function() {
			this.line = true;
		},
		offBrowserLoading: function() {
			this.loadding = false;
			this.line = false;
		}
	}
});