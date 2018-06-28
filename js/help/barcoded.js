var ws=null;
var scan=null,domready=false,bCancel=false;
// H5 plus事件处理
function plusReady(){
	if(ws||!window.plus||!domready){
		return;
	}
	// 获取窗口对象
	ws=plus.webview.currentWebview();
	// 开始扫描
	ws.addEventListener('show',function(){
		scan=new plus.barcode.Barcode('bcid',[plus.barcode.QR,plus.barcode.EAN8,plus.barcode.EAN13],{frameColor:'#1E81D2',scanbarColor:'#1E81D2'});
	    scan.onmarked=onmarked;
	    scan.start({conserve:true,filename:"_doc/barcode/"});
	});
}
if(window.plus){
	plusReady();
}else{
	document.addEventListener("plusready",plusReady,false);
}
// 监听DOMContentLoaded事件
document.addEventListener("DOMContentLoaded",function(){
	domready=true;
	plusReady();
},false);
// 二维码扫描成功
function onmarked(type,result,file){
    switch(type){
    	case plus.barcode.QR:
    	type = "QR";
    	break;
    	case plus.barcode.EAN13:
    	type = "EAN13";
    	break;
    	case plus.barcode.EAN8:
    	type = "EAN8";
    	break;
    	default:
    	type = "其它"+type;
    	break;
    }
    result = result.replace(/\n/g, '');
    if(sui.isLogin()){
    	 if(~result.indexOf('operateType')) {
    			var param=result.split('?')[1];
    			var qrcodeType=param.split('&')[0].split('=')[1];
    			if(qrcodeType==1){
    				var connectionId=param.split('&')[1].split(',')[0];
    				var qrcodeId=param.split('&')[1].split(',')[1];
    				sui.open('qrcodeLogin.html','qrcodeLogin.html',{connectionId:connectionId,qrcodeId:qrcodeId},{},true,"扫码登录");
    				 setTimeout(function(){
					 	scan.cancel();
						var page=plus.webview.currentWebview();
						page.hide('none',0);
						page.close('none',0);
					},1000);
    			}else{
    				scan.cancel();
    			    plus.webview.currentWebview().close(); 
    			    mui.toast(result);
    			}
    	}else{
    		scan.cancel();
		    plus.webview.currentWebview().close(); 
		    mui.toast(result);
    	}
    }else{
    	if(~result.indexOf('operateType')){
    		 sui.open('../root/login.html','login.html',{},{},true,'登录',false);
    		 setTimeout(function(){
			 	scan.cancel();
				var page=plus.webview.currentWebview();
				page.hide('none',0);
				page.close('none',0);
			},1000);
    	}else if(~result.indexOf('regStart?m') || ~result.indexOf('?recommend')) {
    			var param=result.split('?')[1];
    			var mobile=param.split('=')[1];
    			if(!sui.IsNullOrEmpty(mobile)){
    				var reg=plus.webview.getWebviewById('reg.html');
    				if(reg){
    					reg.evalJS("vm.scanResult('"+mobile+"')");
    					 setTimeout(function(){
						 	scan.cancel();
							plus.webview.currentWebview().close(); 
						},220);
    				}else{
    					sui.open('../root/regStart.html','regStart.html',{mobile:mobile},{},true,'注册',false);
    					 setTimeout(function(){
						 	scan.cancel();
							var page=plus.webview.currentWebview();
							page.hide('none',0);
							page.close('none',0);
						},1000);
    				}	
    			}else{
					scan.cancel();
				    plus.webview.currentWebview().close(); 
				    mui.toast(result);
				    return;
			 }
    	}else{
    	    mui.toast(result);
    		scan.cancel();
	        plus.webview.currentWebview().close(); 
    	}
    }
}
function scanSwitch() {
    if(bCancel){
    	scan.start({conserve:true,filename:"_doc/barcode/"});
    	btCancel&&(btCancel.innerText='暂　停');
    }else{
    	scan.cancel();
    	btCancel&&(btCancel.innerText='开　始');
    }
    bCancel=!bCancel;
}

btCancel&&btCancel.addEventListener('tap',function(){
	scanSwitch();
});