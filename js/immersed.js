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
	var e = document.getElementsByTagName("header")[0];
	var g = document.getElementsByClassName("mui-content")[0];
	e && (e.style.height = (a + 44) + "px", e.style.paddingTop = a + "px");
	g && (g.style.paddingTop = (a + 44) + "px");
})(window);