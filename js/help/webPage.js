var vm = new Vue({
	el: '#vue-app',
	data: {
		loadding: true,
		line: true,
		close: false,
		embed: null,
		title:"前海领投"
	},
	mounted: function() {
		this.$nextTick(function() {
			if(window.plus) {
				vm.plusReady();
			} else {
				document.addEventListener('plusready',vm.plusReady, false);
			}
		});
	},
	methods: {
		plusReady: function(data) {
			var curr=plus.webview.currentWebview();
			var webUrl=curr.webUrl;
			this.embed = plus.webview.create(webUrl, sui.unique(), {
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
			curr.append(this.embed);
			this.embed.addEventListener("loaded", vm.offBrowserLoading, false);
			this.embed.addEventListener("loading", vm.onBrowserLoading, false);
			this.embed.overrideUrlLoading({
				mode: "reject",
				match: ".*app=qhlead.*"
			}, function(e) {
				if(sui.isLogin){
					var page=parseInt(sui.queryString(e.url,"webview"));
					switch (page){
						case 1:
						    sui.open('../bank/openingAccount.html','openingAccount.html',{},{},true,'开通银行存管',false);
							break;
						default:
							break;
					}
				}else{
					 sui.open('../root/login.html','login.html',{},{},true,'登录',false);
				}
                setTimeout(function(){
					plus.webview.currentWebview().close('none',0);
				},1000);
			});
		},
		btnClose: function() {
			//返回关闭
			if(vm.embed && !sui.IsNullOrEmpty(vm.embed.getURL())) {
				vm.embed.canBack(function(e) {
					if(e.canBack) {
						vm.embed.back();
						vm.close = true;
					} else {
						plus.webview.currentWebview().close();
					}
				});
			} else {
				plus.webview.currentWebview().close();
			}
		},
		onBrowserLoading: function() {
			this.line = true;
		},
		offBrowserLoading: function() {
			this.loadding = false;
			this.line = false;
			vm.title=vm.embed.getTitle() || '前海领投';
		}
	}
});