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
	var f = document.getElementById("stylesheet");
	f && (f.innerText = ".mui-content .mui-pull-top-pocket{top: 44px}");
})(window);