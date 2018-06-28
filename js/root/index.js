var subpages = ['default.html', 'invest.html', 'assets.html','my.html'];
var subpage_style = {
	top: '0',
	bottom: '51px',
	scrollIndicator:'none'
};
var subpage_style2 = {
	top: '0',
	bottom: '51px',
	scrollIndicator:'none',
	decelerationRate:1.0,
	bounce: 'vertical',
	bounceBackground:"#f7f7f9"
};
var aniShow = {};
function plusReady(){
	var self = plus.webview.getLaunchWebview();
	var _second = plus.webview.getSecondWebview();
	for(var i = 0; i < 4; i++) {
		var temp = {};
		var sub =i==0?(_second||plus.webview.create(subpages[i], subpages[i], subpage_style2)):plus.webview.create(subpages[i], subpages[i], i==3? subpage_style2 : subpage_style);
		//var sub = plus.webview.create(subpages[i], subpages[i], (i == 0 ||i==3)? subpage_style2 : subpage_style);
		if(i > 0) {
			sub.hide();//如果android下拉刷新字样显示不全，hack：hide延时10ms即可，for循环外处理
		} else {
			temp[subpages[i]] = "true";
			mui.extend(aniShow, temp);
		}
		self.append(sub);
	}
}
(function(){
  mui.init();
  if(window.plus){
    plusReady();
  }else{
    document.addEventListener('plusready',plusReady,false);
  }
})();
var activeTab = subpages[0];
mui('.mui-bar-tab').on('tap', 'a', function(e) {
	var targetTab = this.getAttribute('href');
	if(targetTab == activeTab) {
		return;
	}
	if(targetTab=='assets.html' && !localStorage.getItem('LEAD_TOKEN')){
		 var show={
				duration: mui.os.ios?300:240
			};
			if(mui.os.ios){
				show.aniShow= 'pop-in';
			}else{
				show.event="loaded";
				show.extras={acceleration:"capture"};//强制截屏加速
			}
			mui.openWindow({
				url: 'views/root/login.html',
				id: 'login.html',
				show: show,
				waiting: {
					autoShow: false
				},
				extras:{source:'assets'},
				styles:{
					titleNView:{
					 autoBackButton: true,
				      titleText:'登录',             
				      titleColor:"#FFFFFF",      
				      titleSize:"18px",              
				      backgroundColor:"#1E81D2",     
				      progress:null
				}
			}
	    });
		return;
	}
    //触发页面自定义事件
	var currpage=targetTab=="default.html"?plus.webview.getSecondWebview():plus.webview.getWebviewById(targetTab);
	var fireEvent={'default.html':'index','invest.html':'invest','assets.html':'assets','my.html':'my'}[targetTab];
	var param=targetTab=='invest.html'?{index:-1}:{};
	mui.fire(currpage,fireEvent,param);
	
	if(mui.os.ios || aniShow[targetTab]) {
		plus.webview.show(targetTab);
	} else {
		var temp = {};
		temp[targetTab] = "true";
		mui.extend(aniShow, temp);
		plus.webview.show(targetTab, "fade-in", 300);
	}
	plus.webview.hide(activeTab);
	activeTab = targetTab;
});
//跳转到相应页面
window.addEventListener('tabEvent', function(event) {
	//domId=[index=>defaultTab,invest=>investTab,assets=>assetsTap,my=>myTab]
	var domId=event.detail.domId;
	var tab = document.getElementById(domId);
	if(domId&&tap){	
		mui.trigger(tab, 'tap');
		var current = document.querySelector(".mui-bar-tab>.mui-tab-item.mui-active");
		if(tab !== current) {
			current.classList.remove('mui-active');
			tab.classList.add('mui-active');
		}
	}
});
function openbackdrop(){
	var elem=document.getElementById("backdrops");
	elem&&elem.classList.remove('mui-hidden');
}
function closebackdrop(){
	var elem=document.getElementById("backdrops");
	elem&&elem.classList.add('mui-hidden');
}