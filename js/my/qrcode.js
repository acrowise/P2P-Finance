var ui={
	container:document.getElementById('container'),
	shares:{},
	saveLocal:document.getElementById('saveLocal'),
	backdrop:document.getElementById('mui-backdrop')
};
function plusReady(){
	 setTimeout(function(){
	 	 refreshQrcode();
	 	 plus.share.getServices(function(s) {
			if (s && s.length > 0) {
				for (var i = 0; i < s.length; i++) {
					var t = s[i];
					ui.shares[t.id] = t;
				}
			}
		}, function() {
			mui.toast("获取分享服务列表失败");
		});
	 },sui.constNum());	 
}
(function(m){
	 m.init({
	 	gestureConfig: {
			longtap: true
		}
	 });
  m.ready(function(){
		 if(window.plus){
	       plusReady();
	    }else{
	     document.addEventListener('plusready',plusReady,false);
	  }
	});
})(mui);
var updateQrCode = function (sharedData) {
		var options = {
				render: 'image',
				ecLevel: 'M',
				minVersion:6,
				color: '#000',
				bgColor: '#fff',
				text: sharedData,
				size: 460,
				radius: 0.5,
				quiet:1,
				mode: 4,
				label: $("#label").val(),
				labelsize: 0.1,
				fontname: 'Ubuntu',
				fontcolor: '#ff9818',
				image: $("#img-buffer")[0],
				imagesize: 0.2
			};
		$("#container").empty().qrcode(options);
		ui.container.classList.add('sui-fadeIn');
};
var utf16to8= function (str){  
            var out, i, len, c;  
            out = "";  
            len = str.length;  
            for (i = 0; i < len; i++) {  
                c = str.charCodeAt(i);  
                if ((c >= 0x0001) && (c <= 0x007F)) {  
                    out += str.charAt(i);  
                } else if (c > 0x07FF) {  
                    out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));  
                    out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));  
                    out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));  
                } else {  
                    out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));  
                    out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));  
                }  
            }  
        return out;  
 };
 
 function refreshQrcode(){
 	var w=sui.wait();
 	sui.request('User/QrCodeInfo',{},true,function(data){ 
 		       sui.closewait(w);
				if(data){
					var IsPass=data.IsPass;
					if(IsPass){
						updateQrCode(utf16to8(data.ReturnObject));
				        createQrcode(); 
					}else{
					  mui.toast(data.Desc);
					}
				}
		   });
 }

var base64 =null;
ui.container.addEventListener('longtap',function(){
	 base64 = this.src; 
	 ui.saveLocal.style.display='block';
	ui.backdrop.classList.remove('mui-hidden');
});
ui.saveLocal.addEventListener('tap',function(){
		plus.gallery.save('_downloads/qrcode.png', function() {
				mui.toast("保存图片到相册成功");
			}, function() {
				mui.toast("保存图片到相册失败");
			});
	 ui.saveLocal.style.display='none';
	 ui.backdrop.classList.add('mui-hidden');
});
ui.backdrop.addEventListener('tap',function(){
	 ui.saveLocal.style.display='none';
	 ui.backdrop.classList.add('mui-hidden');
});
var  shareCardPicture=function(state){
	var url="_downloads/qrcode.png";
	if(state){
		url="_downloads/sharedLogo.png";
	}
	plus.io.resolveLocalFileSystemURL(url,function(entry){
		pic.src=entry.toLocalURL();
		pic.realUrl=url;
	},function(e){
		mui.toast("读取二维码文件错误："+e.message);
	});
};
var shareMessage= function (s,ex){
	var msg={content:'前海领投，值得信赖的P2P网贷平台',extra:{scene:ex}};
	if(pic&&pic.realUrl){
		msg.pictures=[pic.realUrl];
	}
	s.send(msg, function(){
		//mui.toast( "分享到\""+s.description+"\"成功！ " );
	}, function(e){
		//mui.toast( "分享到\""+s.description+"\"失败！");
	});
};
var  shareAction=function(id,ex) {
	var s=null;
	if(!id||!(s=ui.shares[id])){
		mui.toast( "无效的分享服务！" );
		return;
	}
	if ( s.authenticated ) {
		shareMessage(s,ex);
	} else {
		s.authorize( function(){
				shareMessage(s,ex);
			},function(e){
			mui.toast( "认证授权失败");
		});
	}
};
var createQrcode=function(){
	var base64=mui("img")[0].src;
	var  bitmap = new plus.nativeObj.Bitmap("qrcode");
	bitmap.loadBase64Data(base64, function() {
		bitmap.save('_downloads/qrcode.png', {overwrite: true,quality:100}, function() {
			plus.zip.compressImage({
					src: '_downloads/qrcode.png',
					dst: '_downloads/sharedLogo.png',
					quality: 100,
					overwrite: true
				},
				function(i) {
					shareCardPicture(true);
				},
				function(e) {
				  shareCardPicture(false);
			});
			
		}, function() {
		    bitmap.clear();
		});
	}, function() {
		 bitmap.clear();
	});
};

mui('body').on('tap','a[class=share_li]',function(){
	var ids=[{id:"weixin",ex:"WXSceneSession"},{id:"weixin",ex:"WXSceneTimeline"},{id:"qq"}];
	var index=parseInt(this.getAttribute('sid'));
	shareAction(ids[index].id,ids[index].ex);
	mui('#Share').popover('toggle');
});
