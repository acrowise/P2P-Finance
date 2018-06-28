var vm = new Vue({
	el: '#vue-app',
	data: {
		loadding: true,
		line: true,
		close: false,
		embed: null,
		title:'查看协议' ,
		agUrl:''
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
			this.title=curr.titles || '查看协议';
			this.agUrl=curr.agUrl;
			this.embed = plus.webview.create(this.agUrl, sui.unique(), {
				top: (immersed + 44) + 'px',
				bottom: "0px",
				position: 'dock',
				dock: 'bottom',
				bounce: 'vertical',
				bounceBackground: '#F7F7F9',
				decelerationRate: 1.0,
				scrollIndicator: 'none',
				scalable: true
			});
			curr.append(this.embed);
			this.embed.addEventListener("loaded", vm.offBrowserLoading, false);
			this.embed.addEventListener("loading", vm.onBrowserLoading, false);
			this.embed.overrideUrlLoading({
				mode: "reject",
				match: ".*#/home.*"
			}, function(e) {
				vm.callback();
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
		btnMore:function(){
			var bts=[{title:"浏览器打开"},{title:"复制链接"}];
		    plus.nativeUI.actionSheet({cancel:"取消",buttons:bts},function(e){
				if (e.index ==1) {
                   plus.runtime.openURL(vm.agUrl);
				}else if(e.index==2){
			       var UIPasteboard  = plus.ios.importClass("UIPasteboard");
				   var generalPasteboard = UIPasteboard.generalPasteboard();
				   generalPasteboard.setValueforPasteboardType(vm.agUrl, "public.utf8-plain-text");
				   mui.toast('已复制到剪贴板');
				}
			 });
		},
		onBrowserLoading: function() {
			this.line = true;
		},
		offBrowserLoading: function() {
			this.loadding = false;
			this.line = false;
		},
		callback:function(){
			plus.webview.currentWebview().close();
		}
	}
});