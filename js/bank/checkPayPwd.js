var vm = new Vue({
	el: '#vue-app',
	data: {
		loadding: true,
		line: true,
		close: false,
		embed: null,
		page:"",
		pageUrl:"",
		title:'确认交易密码' 
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
			var curr=plus.webview.currentWebview();
			vm.page=curr.page;
			vm.pageUrl=curr.pageUrl;
			vm.plusReady(vm.pageUrl);
		},
		plusReady: function(data) {
			mui.init({
				beforeback: function() {
					vm.callback();
				 }
			});
			if(mui.os.ios && ~data.indexOf("signature")){
				data=data.replace(sui.queryString(data,"signature"),sui.queryString(data,"signature").replaceAll("%",encodeURIComponent("%")));
			}
			this.embed = plus.webview.create(data, sui.unique(), {
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
			if(vm.page=='recharge'){
				var rechargeList=plus.webview.getWebviewById('rechargeList.html');
				rechargeList && rechargeList.evalJS("vm.pulldownRefresh();");
			}else{
			  var withdrawList=plus.webview.getWebviewById('withdrawList.html');
			   withdrawList && withdrawList.evalJS("vm.pulldownRefresh();");
			}
			var my = plus.webview.getWebviewById("my.html");
			my&&my.evalJS("vm.my();");
			setTimeout(function(){
				plus.webview.currentWebview().close();
			},80);
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
			vm.title=vm.embed.getTitle() || '确认交易密码';
		}
	}
});