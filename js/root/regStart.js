var vm = new Vue({
	el: '#vue-app',
    data: {
    	mobile:"",
    	keys:"",
    	ok:false
    },
    mounted: function () {
    	var $this=this;
    	$this.$nextTick(function () {
    	    if(window.plus) {
				vm.plusReady();
			} else {
				document.addEventListener('plusready', vm.plusReady, false);
			}
    	});
    },
  	methods: {	
	    plusReady:function(){
	    	var curr=plus.webview.currentWebview();
	    	this.mobile=curr.mobile || '';
	    	this.keys=curr.keys || "";
	    	this.ok=true;
	    },
	    btnReg:function(kind){
	    	if(vm.ok){
	    		sui.open('reg.html','reg.html',{mobile:vm.mobile,userKind:kind,keys:vm.keys},{},true,'注册',false);
	    		setTimeout(function(){
	    			var curr=plus.webview.currentWebview();
	    			curr.close('none',0);
	    		},800);
	    	}
	    }
	}
});