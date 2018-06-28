(function(b) {
	var a = 0;
	var c = (/Html5Plus\/.+\s\(.*(Immersed\/(\d+\.?\d*).*)\)/gi).exec(navigator.userAgent);
	if(c && c.length >= 3) {
		a = parseFloat(c[2])
	}
	b.immersed = a;
	if(!a) {
		return
	}
	var d = document.getElementsByTagName("header")[0];
	var e = document.getElementById("stylesheet");
	d && (d.style.height = (a + 44) + "px", d.style.paddingTop = a + "px");
	e && (e.innerText = ".mui-bar-nav ~ .mui-content .mui-pull-top-pocket{top: " + (44 + a) + "px;}")
})(window);