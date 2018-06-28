var  statusBar=0;
(function(b) {
	var a = 0;
	var d = (/Html5Plus\/.+\s\(.*(Immersed\/(\d+\.?\d*).*)\)/gi).exec(navigator.userAgent);
	if(d && d.length >= 3) {
		a = parseFloat(d[2])
	}
	b.immersed = a;
	if(!a) {
		return
	}
	statusBar=a;
	var e = document.getElementsByTagName("header")[0];
	var g = document.getElementsByClassName("mui-content")[0];
	var f = document.getElementById("stylesheet");
	var h=document.getElementById("tapBar");
	e && (e.style.height = (a + 44) + "px", e.style.paddingTop = a + "px");
	h&& (h.style.top=(a + 44) + "px");
	g && (g.style.paddingTop = (a + 88) + "px");
	f && (f.innerText = ".mui-bar-nav ~ .mui-content .mui-pull-top-pocket{top: " + (88 + a) + "px;}");
})(window);