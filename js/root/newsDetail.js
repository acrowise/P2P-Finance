var vm = new Vue({
	el: '#vue-app',
    data: {
       shares:{},
       news:{Title:'',Content:''},
       isIos:false,
       hidden:true,
       newsId:null,
       iosBrowse:'Safari 打开',
       iosImg:'../../images/share/fx7.png'
    },
    mounted: function () {
    	this.$nextTick(function () {
    		if(!mui.os.ios){
    			vm.iosBrowse="浏览器打开";
    			vm.iosImg="../../images/share/fx3.png";
    		}
    		 if(window.plus){
			     vm.plusReady();
			    }else{
			     document.addEventListener('plusready',vm.plusReady,false);
			  }	
    	});
    },
  	methods: {	
  		plusReady:function(){
  			vm.newsId=plus.webview.currentWebview().newsId;
		  	plus.share.getServices(function(s) {
				if (s && s.length > 0) {
					for (var i = 0; i < s.length; i++) {
						var t = s[i];
						vm.shares[t.id] = t;
					}
				}
			}, function() {
				mui.toast("获取分享服务列表失败");
		 });
		 vm.getNews(vm.newsId);
  		},
	    getNews:function(newsId){
	    	setTimeout(function(){
				var w=sui.wait();
				sui.request('Home/NewsDetail',{newsId:newsId},true,function(data){
					 sui.closewait(w);
					if(data){
						var IsPass=data.IsPass;
						if(IsPass){
						    vm.news=data.ReturnObject;
						    vm.hidden=false;
						    mui.os.ios&&(vm.isIos=true);
						}else{
							mui.toast(data.Desc);
						}
					}
			  });
			},sui.constNum());
	    },
	    substr:function(content){
			//去除全部的html标签
			var result=content.replace(/<\s?[^>]*>/gi,"");
			if(result && result.length>30){
				result=result.substr(0,30);
			}
			return result;
		},
	    shareMsg:function(s,ex,index){
	    	var msg={extra:{scene:ex}};
			var sharedHref=sui.weChat()+"#/home/info/infoDetail?id="+vm.newsId;
			msg.href=sharedHref;
			var sharedTitle='领出借讯';
			var title=vm.news.Title.length>25?vm.news.Title.substring(0,25)+'...':vm.news.Title;
			var content=vm.substr(vm.news.Content);
			if(!sui.IsNullOrEmpty(title)){
				sharedTitle=title;
			}
			msg.title=sharedTitle;
			msg.content=content==""?'来自前海领投的分享：'+sharedHref:content;
			msg.thumbs=["_www/images/publogo.png"];
			msg.pictures=["_www/images/publogo.png"];
			s.send(msg, function(){}, function(e){});
	    },
	    shareAction:function(id,ex,index){
	    	var s=null;
			if(!id||!(s=vm.shares[id])){
				mui.toast( "无效的分享服务！" );
				return;
			}
			if (s.authenticated) {
				vm.shareMsg(s,ex,index);
			}else{
				s.authorize( function(){
					vm.shareMsg(s,ex,index);
				 },function(e){
					  //mui.toast( "认证授权失败");
				});
			}
	   },
	   copyVal:function(val){
	   		if(mui.os.android){
				var Context = plus.android.importClass("android.content.Context");
		        var main = plus.android.runtimeMainActivity();
		        var clip = main.getSystemService(Context.CLIPBOARD_SERVICE);
		        plus.android.invoke(clip,"setText",val);
			}else{
				 var UIPasteboard  = plus.ios.importClass("UIPasteboard");
				 var generalPasteboard = UIPasteboard.generalPasteboard();
				 generalPasteboard.setValueforPasteboardType(val, "public.utf8-plain-text");
				 //以下是兼容ios10的临时写法
				 //generalPasteboard.plusCallMethod({setValue:href, forPasteboardType:"public.utf8-plain-text"});
		         //generalPasteboard.plusCallMethod({valueForPasteboardType:"public.utf8-plain-text"});
			}
			mui.toast('已复制到剪贴板');
	   },
	   btnShare:function(index){
	   	    var openUrl=sui.weChat()+"#/home/info/infoDetail?id="+vm.newsId;
	   	    var sharedTitle='领出借讯';
			var title=vm.news.Title.length>25?vm.news.Title.substring(0,25)+'...':vm.news.Title;
			if(!sui.IsNullOrEmpty(title)){
				sharedTitle=title;
			}
			var body=sharedTitle+'(分享自@前海领投)。 ' + openUrl;
			if(index==4){
			    var msg = plus.messaging.createMessage(plus.messaging.TYPE_SMS);
			    msg.body =body;
			    plus.messaging.sendMessage(msg);
			}else if(index==5){
				 var msg = plus.messaging.createMessage(plus.messaging.TYPE_EMAIL);
			     msg.body =body;
			     plus.messaging.sendMessage(msg);
			}else if(index==6){
				plus.runtime.openURL(openUrl);
			}else if(index==7){
				vm.copyVal(openUrl);
			}else{
			   var ids=[{id:"weixin",ex:"WXSceneSession"},{id:"weixin",ex:"WXSceneTimeline"},{id:"qq"},{id:"sinaweibo"}];
			   vm.shareAction(ids[index].id,ids[index].ex,index);
			}
			mui('#Share').popover('toggle');
	   }
	},
	filters:{
		formatDate:function(value){
			return sui.formatDate('y-m-d h:i:s',value);
		}
	}
});
//打开外部链接
mui('body').on('tap','a',function(){
	var href=this.getAttribute('href');
	href&&plus.runtime.openURL(href);
});