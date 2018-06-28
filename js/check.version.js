/*
* @author dingyong
* @updatetime 20171206
* @description: 1.<新版本/更新...> 等字眼最好不要出现，可由服务器提供回来 2.静默更新。
 */
(function($, wg) { 
    wg.checkServerVersion=function(versions,callback,source){
  	   sui.post('Passport/Upgrade',{coreVersion:plus.runtime.version,version:versions,os:plus.os.name},function(data){ 
		  if(data){
			var IsPass=data.IsPass;
			if(IsPass){
				var result={
					DownloadUrl:data.ReturnObject.DownloadUrl,
					HasVersion:data.ReturnObject.HasVersion,
					UpdateType:data.ReturnObject.UpdateType,
					PackageSize:data.ReturnObject.PackageSize,
					Version:data.ReturnObject.Version,
					NewFunction:data.ReturnObject.NewFunction
				};
				if(result.HasVersion){
					   var elem=document.createElement('div');
					   var keys=decodeURIComponent('%E6%9B%B4%E6%96%B0');
					   var classVal='masked';
					   if ($.os.android && parseFloat($.os.version) < 4.4) {
				       	   classVal='';
				       }
					   var sbHtml=[
					      '<div class="mui-backdrop" id="backdrops"></div><div class="mui-version-tips" id="version_box" >',
					      '<div class="title '+classVal+'">'+decodeURIComponent('%E6%A3%80%E6%B5%8B%E5%88%B0%E6%96%B0%E7%89%88%E6%9C%AC')+'</div>',
					      '<div class="version">'+decodeURIComponent('%E7%89%88%E6%9C%AC%E5%8F%B7')+'：<span>'+result.Version+'</span></div>',
					     '<div class="size">文件大小：<span id="fileSize">'+result.PackageSize+'</span></div><button type="button" class="mui-btn mui-btn-primary"  id="updateVersion" data-type="'+result.UpdateType+'" data-url="'+result.DownloadUrl+'">立即{{keys}}</button>',
					     '<div class="tips">温馨提示：请您先{{keys}}再进行操作，若不及时{{keys}}可能导致部分功能无法正常使用。</div><div class="newfunction ">'+result.NewFunction+'</div></div>',
					     '<div class="mui-version-box mui-hidden" id="Progress_box"><div class="tip">'+decodeURIComponent('%E5%8D%87%E7%BA%A7')+'中,请稍候...</div>',
					     '<div class="bar_l"><div class="bar_lw" id="updateProgress"></div><div class="bar_lr"></div></div><div class="bar_lr" id="numProcess">0%</div></div>',
					   ];
					   if(source=='index'){
				       	  //var main=plus.webview.getLaunchWebview();
				       	  //main && main.evalJS('openbackdrop();');
				       	    var 	nview = plus.nativeObj.View.getViewById('tabBar');
				       	    if(nview.isVisible()){
				       	    	nview.hide();
				       	    }
				       }
					  elem.innerHTML=sbHtml.join('').replaceAll('{{keys}}',keys);
				      document.body.appendChild(elem);
				      callback(true);
				}else{
					var 	nview = plus.nativeObj.View.getViewById('tabBar');
		       	    if(!nview.isVisible()){
		       	    	nview.show();
		       	    }
					callback(false);
				}
			}else{
				callback(false);
			}
		}else{
			callback(false);
		}
 	});
  };
 wg.updateApp = function(dUrl){
 	var ele={
 		updateProgress:document.querySelector('#updateProgress'),
 		numProcess:document.querySelector('#numProcess'),
 		Progress_box:document.querySelector('#Progress_box'),
 		backdrops:document.querySelector('#backdrops'),
 		keys:decodeURIComponent('%E6%9B%B4%E6%96%B0')
 	};
	ele.updateProgress.style.width='0%';
	ele.numProcess.innerText='0%';
	ele.Progress_box.classList.remove('mui-hidden');
	//var main=plus.webview.getLaunchWebview();
	var dtask = plus.downloader.createDownload(dUrl, {method:"GET"}, function(d,status){
		if ( status == 200 ) { 
			plus.runtime.install(d.filename,{force:true},function(){
				ele.updateProgress.style.width='100%';
	            ele.numProcess.innerText='100%';
	            ele.Progress_box.classList.add('mui-hidden');
	            ele.backdrops.classList.add('mui-hidden');
                //main && main.evalJS('closebackdrop();');
				plus.nativeUI.alert(decodeURIComponent('%E5%8D%87%E7%BA%A7')+"成功, 立即重启应用程序!",function(){
					plus.runtime.restart();
				});
			},function(e){
				ele.Progress_box.classList.add('mui-hidden');
	            ele.backdrops.classList.add('mui-hidden');
	            //main && main.evalJS('closebackdrop();');
				plus.nativeUI.alert(ele.keys+"失败，请退出应用程序稍后重新尝试！",function(){
					plus.runtime.restart();
				});
			});
		} else {
			ele.Progress_box.classList.add('mui-hidden');
	        ele.backdrops.classList.add('mui-hidden');
	        //main && main.evalJS('closebackdrop();');
			plus.nativeUI.alert(ele.keys+"失败，请退出应用程序稍后重新尝试！",function(){
					plus.runtime.restart();
				});
		} 
	} );
	dtask.addEventListener('statechanged',function(task,status){
		 if (status!=null && status==200 && task.state!=null) {
		   var persent =parseInt(100*task.downloadedSize /task.totalSize);
		   if(!persent){
		   	 ele.updateProgress.style.width='0%';
	         ele.numProcess.innerText='0%';
		   }else{
		   	  persent=persent>100?100:persent;
		   	  ele.updateProgress.style.width=persent+'%';
	          ele.numProcess.innerText=persent+'%';
		   }
		  }
	});
	dtask.start();
 };
wg.checkVersion=function(callback,source) {
    plus.runtime.getProperty( plus.runtime.appid, function (wgtinfo) {
    	var  versions= wgtinfo.version;
    	 if(source=='index'){
    	  statistic.request(versions);//统计信息
    	}
        wg.checkServerVersion(versions,callback,source);
    });
};

  $('body').on('tap','button[id=updateVersion]',function(){
	  	var dtype=this.getAttribute('data-type'); 
	  	 var dUrl=this.getAttribute('data-url');
	  	 if(dtype!=''&&dUrl!=''){
	  	 	if(dtype==1){
	  	 	  plus.runtime.openURL(dUrl);
	  	  }else{
	  	   	 document.querySelector('#version_box').classList.add('mui-hidden');
	  	 	 wg.updateApp(dUrl);
	  	  }
	  	 }else{
	  	 	var keys=decodeURIComponent('%E6%9B%B4%E6%96%B0');
	  	 	plus.nativeUI.alert(keys+"出错，请退出应用程序稍后重新尝试！",function(){
					plus.runtime.restart();
			  });
	  	 }
  });
  
})(mui, window.wg = {});

(function(util){
	util.options={
		ACTIVE_COLOR: "#2AA2F5",
		NORMAL_COLOR: "#777",
		subpages: ['invest.html', 'assets.html','my.html']
	};
	/**
	 *  简单封装了绘制原生view控件的方法
	 *  绘制内容支持font（文本，字体图标）,图片img , 矩形区域rect
	 */
	util.drawNative=function(id, styles, tags) {
		var view = new plus.nativeObj.View(id, styles, tags);
		return view;
	};
	/**
	 * 初始化首个tab窗口 和 创建子webview窗口 
	 */
	util.initSubpage=function(aniShow,callback) {
		  var subpage_style = {
				top: '0',
				bottom: '51px',
				scrollIndicator:'none'
		     },
			subpages = util.options.subpages,
			self = plus.webview.currentWebview(),
			temp = {};
			
		//兼容安卓上添加titleNView 和 设置沉浸式模式会遮盖子webview内容
		/*
		if(mui.os.android) {
			if(plus.navigator.isImmersedStatusbar()) {
				subpage_style.top += plus.navigator.getStatusbarHeight();
			}
			if(self.getTitleNView()) {
				subpage_style.top += 40;
			}
			
		}
         */
		// 初始化第一个tab项为首次显示
		temp[self.id] = "true";
		mui.extend(aniShow, temp);
		// 初始化绘制首个tab按钮
		//util.toggleNview(0);
		var _second=plus.webview.getSecondWebview();
		for(var i = 0, len = subpages.length; i < len; i++) {
			if(!plus.webview.getWebviewById(subpages[i]) || i==2) {
				var sub =i==2?_second:plus.webview.create(subpages[i], subpages[i],subpage_style);
				//初始化隐藏
				sub.hide();
				// append到当前父webview
				self.append(sub);
			}
		}
		callback();
	};
	/**	
	 * 点击切换tab窗口 
	 */
	util.changeSubpage=function(targetPage, activePage, aniShow) {
		//若为iOS平台或非首次显示，则直接显示
		if(mui.os.ios || aniShow[targetPage]) {
			plus.webview.show(targetPage);
		} else {
			//否则，使用fade-in动画，且保存变量
			var temp = {};
			temp[targetPage] = "true";
			mui.extend(aniShow, temp);
			plus.webview.show(targetPage, "fade-in", 300);
		}
		//隐藏当前 除了第一个父窗口
		if(activePage !== plus.webview.getLaunchWebview()) {
			plus.webview.hide(activePage);
		}
	};
	/**
	 * 点击重绘底部tab （view控件）
	 */
	util.toggleNview=function(currIndex) {
		currIndex = currIndex * 2;
		// 重绘当前tag 包括icon和text，所以执行两个重绘操作
		var indexArr={0:"\ue628",1:"",2:"\ue62c",3:"",4:"\ue60a",5:"",6:"\ue6f1",7:""};
		var indexActiveArr={0:"\ue625",2:"\ue62a",4:"\ue624",6:"\ue62b"};
		util.updateSubNView(currIndex, util.options.ACTIVE_COLOR, indexActiveArr[currIndex]);
		util.updateSubNView(currIndex + 1, util.options.ACTIVE_COLOR, "");
		// 重绘兄弟tag 反之排除当前点击的icon和text
		for(var i = 0; i < 8; i++) {
			if(i !== currIndex && i !== currIndex + 1) {
				util.updateSubNView(i, util.options.NORMAL_COLOR, indexArr[i]);
			}
		}
	};
	/*
	 * 改变颜色
	 */
	util.changeColor=function(obj, color) {
		obj.color = color;
		return obj;
	};
	/*
	 * 利用 plus.nativeObj.View 提供的 drawText 方法更新 view 控件
	 */
	util.updateSubNView=function(currIndex, color, text) {
		    var self = plus.webview.currentWebview(),
		    nviewEvent = plus.nativeObj.View.getViewById("tabBar"), // 获取nview控件对象
			nviewObj = self.getStyle().subNViews[0], // 获取nview对象的属性
			currTag = nviewObj.tags[currIndex]; // 获取当前需重绘的tag
		    nviewEvent.drawText(sui.IsNullOrEmpty(text)?currTag.text:text, currTag.position, util.changeColor(currTag.textStyles, color), currTag.id);
   }
})(window.utilNview={});
