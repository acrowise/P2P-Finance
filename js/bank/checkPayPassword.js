var vm = new Vue({
	el: '#vue-app',
	data: {
		loadding: true,
		line: true,
		close: false,
		embed: null,
		page:"",
		pageUrl:""
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
			//console.log(data);
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
				match: ".*#/bank.*"
			}, function(e) {
				var arr=e.url.split('?')[1].split('&');
				var len=arr.length;
				var waterNo="";
				for (var i=0;i<len;i++) {
					var param=arr[i].split('=')[0];
					if(param=='businessSeqNo' || param=='businessseqno'){
						waterNo=arr[i].split('=')[1];
						break;
					}
				}
				if(vm.page=='bindCard' || ~e.url.indexOf('bank/bindBankCard')){
					sui.open('bindBankCard.html','bindBankCard.html',{waterNo:waterNo});
					setTimeout(function(){
						plus.webview.currentWebview().close('none',0);
					},1000);
				}else{
					var opener=plus.webview.currentWebview().opener();
					opener.evalJS('vm.callback("'+waterNo+'")');
					setTimeout(function(){
						vm.callback();
					},100);
				}
			});
		},
		callback:function(){
			plus.webview.currentWebview().close();
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