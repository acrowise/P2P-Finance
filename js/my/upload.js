var ui={
	container:document.getElementById('container'),
	operateImg:document.getElementById("operateImg"),
	btnRotate:document.getElementById('btnRotate'),
	btnUpload:document.getElementById('btnUpload'),
	tips:document.getElementById('tips'), 
	setOption:{},
	waitting:function(){
		return plus.nativeUI.showWaiting("处理中，请稍候...", {back:"close"});
	},
	closewait:function(w){
		w.close();w=null;
	},
	initCropper:function(path){
		 this.operateImg.src=path;
		 ui.setOption = {
			path: path,
			dst: 'myCropperPhoto',
			width: '600px',
			height: 'auto',
			rotate: 0,
			clip: {
				top: '0%',
				left: '0%',
				width: '100%',
				height: '100%'
			}
		};
		$('#operateImg').cropper({
			aspectRatio: 1,
			responsive: true,
			crop: function(data) {
				var naturalWidth = $('#operateImg').cropper("getImageData").naturalWidth;
				var naturalHeight = $('#operateImg').cropper("getImageData").naturalHeight;
				if (data.rotate == 0) {
					ui.setOption['width'] = '600px';
					ui.setOption['height'] = 'auto';
					ui.setOption['clip']['left'] = (Math.round(data.x / naturalWidth * 100)).toString() + '%';
					ui.setOption['clip']['top'] = (Math.round(data.y / naturalHeight * 100)).toString() + '%';
					ui.setOption['clip']['width'] = (Math.round(data.width / naturalWidth * 100)).toString() + '%';
					ui.setOption['clip']['height'] = (Math.round(data.height / naturalHeight * 100)).toString() + '%';
				} else if (data.rotate == 90) {
					ui.setOption['width'] = 'auto';
					ui.setOption['height'] = '600px';
					ui.setOption['clip'][mui.os.android?'left':'top'] = (Math.round(data.y / naturalWidth * 100)).toString() + '%';
					ui.setOption['clip'][mui.os.android?'top':'left'] = (Math.round((naturalHeight - data.x - data.width) / naturalHeight * 100)).toString() + '%';
					ui.setOption['clip']['width'] = (Math.round(data.height / naturalWidth * 100)).toString() + '%';
					ui.setOption['clip']['height'] = (Math.round(data.width / naturalHeight * 100)).toString() + '%';
				} else if (data.rotate == 180) {
					ui.setOption['width'] = '600px';
					ui.setOption['height'] = 'auto';
					ui.setOption['clip']['left'] = (Math.round((naturalWidth - data.x - data.width) / naturalWidth * 100)).toString() + '%';
					ui.setOption['clip']['top'] = (Math.round((naturalHeight - data.y - data.height) / naturalHeight * 100)).toString() + '%';
					ui.setOption['clip']['width'] = (Math.round(data.width / naturalWidth * 100)).toString() + '%';
					ui.setOption['clip']['height'] = (Math.round(data.height / naturalHeight * 100)).toString() + '%';
				} else { 
					ui.setOption['width'] = 'auto';
					ui.setOption['height'] = '600px';
					ui.setOption['clip'][mui.os.android?'left':'top'] = (Math.round((naturalWidth - data.y - data.height) / naturalWidth * 100)).toString() + '%';
					ui.setOption['clip'][mui.os.android?'top':'left'] = (Math.round(data.x / naturalHeight * 100)).toString() + '%';
					ui.setOption['clip']['width'] = (Math.round(data.height / naturalWidth * 100)).toString() + '%';
					ui.setOption['clip']['height'] = (Math.round(data.width / naturalHeight * 100)).toString() + '%';
				}
				ui.setOption['rotate'] = data.rotate; 
			}
		});
	},
	rotateImg:function(deg){
		$('#operateImg').cropper("rotate", deg);
	},
	operateImage:function(f_option_operate, f_operate_callback,w){
		var f_dst = '_documents/' + f_option_operate.dst+'.jpg';
		plus.io.resolveLocalFileSystemURL(f_option_operate.path, function(entry) {
			entry.file(function(file) {
				plus.zip.compressImage({
						src: f_option_operate.path,
						dst: f_dst,
						quality: 50,
						overwrite: true,
						format: 'jpg',
						width: f_option_operate.width,
						height: f_option_operate.height,
						rotate: f_option_operate.rotate,
						clip: {
							top: f_option_operate.clip.top,
							left: f_option_operate.clip.left,
							width: f_option_operate.clip.width,
							height: f_option_operate.clip.height
						}
					},
					function(i) {
						//plus.gallery.save(f_dst); 
						var f_ret = {
							code: 0,
							path:f_dst,
							w:w
						};
						f_operate_callback(f_ret);
					},
					function(e) {
						var f_ret = {
							code: 2,
							w:w
						};
						f_operate_callback(f_ret);
					});
			});
		}, function(e) {
			var f_ret = {
				code: 1,
				w:w
			};
			f_operate_callback(f_ret);
		});
	},
	operateCallback:function(data){
		if (data['code'] == 0) {
			var cimg = {
				path: data['path'],
				w: data['w']
			}
			ui.compressImage(cimg,ui.compressCallback);
		} else {
			mui.toast("图片处理失败，请稍候再试");
			ui.closewait(data['w']);
		}
	},
	compressImage:function(f_option_compress, f_compress_callback){
			var f_dst = '_documents/myCompressImage.jpg';
			plus.io.resolveLocalFileSystemURL(f_option_compress.path, function(entry) {
				entry.file(function(file) {
					if (file.size > 60000) {
						plus.zip.compressImage({
								src: f_option_compress.path,
								dst: f_dst,
								quality: Math.round(60000/ file.size * 100),
								overwrite: true,
								format: 'jpg',
								width: '100%',
								height: 'auto'
							},
							function(i) {
								//plus.gallery.save(f_dst);
								var f_ret = {
									code: 0,
									data: {
										target: f_dst
									},
									w:f_option_compress.w
								};
								f_compress_callback(f_ret);
							},
							function(e) {
								var f_ret = {
									code: 2,
									w:f_option_compress.w
								};
								f_compress_callback(f_ret);
							});
					} else {
						//plus.gallery.save(f_dst);
						var f_ret = {
							code: 0,
							data: {
								target: f_option_compress.path
							},
						    w:f_option_compress.w
						};
						f_compress_callback(f_ret);
					}
				});
			}, function(e) {
				var f_ret = {
					code: 1,
				    w:f_option_compress.w
				};
				f_compress_callback(f_ret);
			});
	},
	compressCallback:function(data){
			var task=plus.uploader.createUpload("http://testmapi.qhlead.com/Upload/Image",{method:"POST"},function(t,status){
				 if(status==200){
					var d=JSON.parse(t.responseText);
					var IsPass=d.IsPass;
					if(IsPass){
						var pic=d.ReturnObject;
						localStorage.setItem('qhlead_userPic',pic||"");
						var page=plus.webview.getWebviewById('userinfo.html');
						var my=plus.webview.getWebviewById('my.html');
						page&&page.evalJS('vm.changeImg("'+pic+'")');
						my&&my.evalJS('vm.changeImg("'+pic+'")');
					   ui.closewait(data.w);
					   mui.toast('头像设置成功');
					   setTimeout(function(){
					   	   plus.webview.currentWebview().close();
					   },120);
					}else{
						 ui.closewait(data.w);
						 mui.toast('头像设置失败，请稍后再试！');
					}
				}else{
					ui.closewait(data.w);
					mui.toast('网络不给力，请检查网络设置');
				}
			}
		);
		task.setRequestHeader("Token",localStorage.getItem('LEAD_TOKEN'));
		task.addFile("file://" + plus.io.convertLocalFileSystemURL(data['data']['target']),{key:"pic"});
		task.start();
	}
};
function plusReady(){
	var curr=plus.webview.currentWebview();
    ui.container.style.height =document.body.clientHeight+ 'px';
    ui.container.style.width = document.body.clientWidth+ 'px';
    ui.initCropper(curr.path); 
    ui.tips.classList.add('mui-hidden');
    //旋转90°
    ui.btnRotate.addEventListener('tap',function(){
    	ui.rotateImg(90);
    	//$('#operateImg').cropper("rotate", 90);
    });
    
    //上传
    ui.btnUpload.addEventListener('tap',function(){
    	var w=ui.waitting();
	     ui.operateImage(ui.setOption, ui.operateCallback,w);
    });
}
(function(){
	mui.ready(function(){
	   if(window.plus){
	   	   plusReady();
		}else{
		   document.addEventListener('plusready',plusReady,false);
		}
	});
})();