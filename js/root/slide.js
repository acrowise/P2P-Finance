mui.back = function() {};
function plusReady(){
	setTimeout(function(){
		plus.navigator.closeSplashscreen();
	},plus.os.name=='iOS'?100:200);
	document.getElementById("btnClose").addEventListener('tap', function(event) {
		plus.navigator.setStatusBarStyle("light");
		localStorage.setItem("qhlead_Flag_320", "true");
		plus.webview.currentWebview().close('none', 0);
	}, false);
}
(function($) {
	$.init();
	$.ready(function(){
		 if(window.plus){
	       plusReady();
	    }else{
	      document.addEventListener('plusready',plusReady,false);
	  }
	});
})(mui);