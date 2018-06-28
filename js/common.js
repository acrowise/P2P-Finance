/**
 * @author dingyong
 * @version 1.0.0 build 20171204
 */
var sui = {};
(function(sui, doc) {
	sui.IsNullOrEmpty = function(str) {
		return (str === null || str === '' || str === undefined || str === 'undefined') ? true : false;
	};
	String.prototype.trim = function() {
		return this.replace(/(^\s*)|(\s*$)/g, "");
	};
	String.prototype.isMobile = function() {
		return /^(?:13\d|14\d|15\d|16\d|17\d|18\d|19\d)\d{5}(\d{3}|\*{3})$/.test(this);
	};
	String.prototype.isFloat = function() {
		return /^([0-9]*[.]?[0-9])[0-9]{0,1}$/.test(this);
	};
    String.prototype.replaceAll = function(repstr,newstr){
　　 return this.replace(new RegExp(repstr,"gm"),newstr);
　};  
    sui.formatMobile=function(mobile){
    	if(!sui.IsNullOrEmpty(mobile)&&mobile.isMobile()){
    		return mobile.substr(0,3)+'****'+mobile.substr(7,4);
    	}else{
    		return mobile;
    	}
    };
     sui.checkIdCard = function(value) {
		var idCard = value;
		if (idCard.length == 15) {
			return sui.isValidityBrithBy15IdCard(idCard);
		} else if (idCard.length == 18) {
			var arrIdCard = idCard.split("");
			if (sui.isValidityBrithBy18IdCard(idCard) && sui.isTrueValidateCodeBy18IdCard(arrIdCard)) {
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	};

	sui.isTrueValidateCodeBy18IdCard = function(arrIdCard) {
		var sum = 0;
		var Wi = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2, 1];
		var ValideCode = [1, 0, 10, 9, 8, 7, 6, 5, 4, 3, 2];
		if (arrIdCard[17].toLowerCase() == 'x') {
			arrIdCard[17] = 10;
		}
		for (var i = 0; i < 17; i++) {
			sum += Wi[i] * arrIdCard[i];
		}
		var valCodePosition = sum % 11;
		if (arrIdCard[17] == ValideCode[valCodePosition]) {
			return true;
		} else {

			return false;
		}
	};

	sui.isValidityBrithBy18IdCard = function(idCard18) {
		var year = idCard18.substring(6, 10);
		var month = idCard18.substring(10, 12);
		var day = idCard18.substring(12, 14);
		var temp_date = new Date(year, parseFloat(month) - 1, parseFloat(day));
		if (temp_date.getFullYear() != parseFloat(year) || temp_date.getMonth() != parseFloat(month) - 1 || temp_date.getDate() != parseFloat(day)) {
			return false;
		} else {
			return true;
		}
	};

	sui.isValidityBrithBy15IdCard = function(idCard15) {
		var year = idCard15.substring(6, 8);
		var month = idCard15.substring(8, 10);
		var day = idCard15.substring(10, 12);
		var temp_date = new Date(year, parseFloat(month) - 1, parseFloat(day));

		if (temp_date.getYear() != parseFloat(year) || temp_date.getMonth() != parseFloat(month) - 1 || temp_date.getDate() != parseFloat(day)) {
			return false;
		} else {
			return true;
		}
	};
	sui.formatDate = function(formatStr, fdate) {
		if(!sui.IsNullOrEmpty(fdate)){
			if(~fdate.indexOf('.')){
				fdate=fdate.substring(0, fdate.indexOf('.'));
			}
			fdate = fdate.toString().replace('T', ' ').replace(/\-/g, '/');
			var fTime, fStr = 'ymdhis';
			if (!formatStr)
				formatStr = "y-m-d h:i:s";
			if (fdate)
				fTime = new Date(fdate);
			else
				fTime = new Date();
			var month = fTime.getMonth() + 1;
			var day = fTime.getDate();
			var hours = fTime.getHours();
			var minu = fTime.getMinutes();
			var second = fTime.getSeconds();
			month = month < 10 ? '0' + month : month;
			day = day < 10 ? '0' + day : day;
			hours = hours < 10 ? ('0' + hours) : hours;
			minu = minu < 10 ? '0' + minu : minu;
			second = second < 10 ? '0' + second : second;
			var formatArr = [
				fTime.getFullYear().toString(),
				month.toString(),
				day.toString(),
				hours.toString(),
				minu.toString(),
				second.toString()
			]
			for (var i = 0; i < formatArr.length; i++) {
				formatStr = formatStr.replace(fStr.charAt(i), formatArr[i]);
			}
			return formatStr;
		}else{
			return '';
		}
	};
	sui.rmoney = function(money) {
		return parseFloat(money).toFixed(2).toString().split('').reverse().join('').replace(/(\d{3})/g, '$1,').replace(/\,$/, '').split('').reverse().join('');
	};
	sui.wait = function(type,mode,tips) {
		// type:是否div模式, mode:是否为模态,tips:提示信息
		if(type){
			var div=document.createElement('div');	
			div.className=mode?"sui-backdrop":"sui-loadding";
	  		div.innerHTML=mode?'<div class="sui-loadding"><span class="mui-spinner mui-spinner-white" ></span><span class="sui-loadtips">'+tips+'</span></div>':'<span class="mui-spinner mui-spinner-white" ></span><span class="sui-loadtips">'+tips+'</span>';
	  		doc.body.appendChild(div);
	  		return div;
		}else{
				if (window.plus) {
				return plus.nativeUI.showWaiting("", {
					back:"close"
				});
			} else {
				doc.addEventListener("plusready", function(){
					return plus.nativeUI.showWaiting("", {
						back:"close"
					});
				}, false);
			}
		}
	};
	sui.closewait = function(w,type) {
		if(type&&w){
			doc.body.removeChild(w);
  	 		return null;
		}else{
			if (w) {
				w.close();
				w = null;
			}
		}
	};
	sui.weChat=function(){
		//return 'http://192.168.1.26:8090/';
		return 'http://testm.qhlead.com/';
	};
	//接口地址
	sui.interfaceUrl=function(){
		//return 'http://192.168.1.160:8090/';
		return 'http://testmapi.qhlead.com/';
	};
	sui.request=function(targetUrl,postData,way,callback,isNet,murl){
		var SERVER_URL=sui.interfaceUrl()+targetUrl;
		if(murl){
			SERVER_URL=murl+targetUrl;
		}
		mui.ajax(SERVER_URL, {
			dataType: 'json',
			type:way==true?"get":"post",
			data: postData,
			success: function(data) {
				callback(data);
			},
			error: function(xhr, type, errorThrown) {
				callback(false);
				if(!isNet){
					mui.toast('无法连接到服务器，请检查网络是否连接');
				}
			}
		});
	};
	sui.post=function(targetUrl,postData,callback,isNet){
		var SERVER_URL=sui.interfaceUrl()+targetUrl;
		mui.ajax(SERVER_URL, {
			contentType: 'application/json',
			type:"post",
			data: JSON.stringify(postData),
			success: function(data) {
				callback(data);
			},
			error: function(xhr, type, errorThrown) {
				callback(false);
				if(!isNet){
					mui.toast('无法连接到服务器，请检查网络是否连接');
				}
			}
		});
	};
	sui.open=function(pageUrl,pageId,para,styles,NHeader,title,hasProgress,hasButtons,text,callback){
		document.activeElement.blur(); 
		styles=styles || {};
		var show={
			duration: mui.os.ios?300:240,
			event:"loaded",
			extras:{acceleration:"capture"}//强制截屏加速
		};
		if(mui.os.ios){
			show.aniShow= "pop-in";
			styles.popGesture="close";
		}
		if(NHeader){
			var progress=null,buttons=null;
			if(hasProgress){
				 // 标题栏控件的进度条样式
				progress={                   
			        color:"#FFFFFF",    
			        height:"2px"     
			      };
			}
			styles.titleNView={
				  autoBackButton: true,
			      titleText:title,             
			      titleColor:"#FFFFFF",      
			      titleSize:"18px",              
			      backgroundColor:"#1E81D2",     
			      progress:progress
			}
			if(hasButtons){
				buttons=[{fontSrc:'_www/fonts/qhlead.ttf',text:text,fontSize:'18px',onclick:callback}];
				styles.titleNView.buttons=buttons;
			}
		}
		mui.openWindow({
			url: pageUrl,
			id: pageId,
			show: show,
			waiting: {
				autoShow: false
			},
			extras:para||{},
			styles:styles
     });
 };
	sui.setToken=function(value){
		localStorage.setItem('LEAD_TOKEN',value);
	};
	sui.getToken=function(){
		return localStorage.getItem('LEAD_TOKEN');
	};
    sui.removeToken=function(){
		localStorage.removeItem('LEAD_TOKEN');
	};
	sui.isLogin=function(){
		var bool=false;
		if(sui.getToken()){
			bool=true;
		}
		return bool;
	};
	sui.fragment=function(){
		return doc.createDocumentFragment();
	}; 
	sui.unique=function(n){
      n=n || 6;
	  var rnd='';
	  for(var i=0;i<n;i++)
	     rnd+=Math.floor(Math.random()*10);
	  return 'Lead'+new Date().getTime()+rnd;  
	};
	//1秒内不可重复创建相同页面
	sui.webviewId=function(){
	  return sui.formatDate('ymdhis',new Date().toLocaleString().replace(/[年月]/g,'-').replace(/[日上下午]/g,''));
	};
	sui.createtips=function(icon,word){
  		var elem=doc.createElement('div');
  		elem.className='nonetips';
  		elem.innerHTML='<span class="mui-icon iconfont icon-'+icon+'"></span><span class="tipsWord">'+word+'</span>';
  		doc.body.appendChild(elem);
  		return elem;
  };
    sui.rmovetips=function(elem){
  	 	if(elem){
  	 		doc.body.removeChild(elem);
  	 	}
  	 	return null;
  	};
  	sui.updatetips=function(elem,word){
  		elem.querySelector('.tipsWord').innerText=word;
  	};
    sui.InitBadge = function(badge) {
	 plus.runtime.setBadgeNumber(badge);
  };
	sui.constNum = function() {
		return mui.os.ios?0:260;
	};	
	 sui.queryString=function(url,name){
	   var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)","i");
	   var r = url.substr(1).match(reg);
	   if (r!=null) return (r[2]); return null;
	};
	function plusReadyCom(){
		  mui.init();
		  var UIApplication =null,sharedApplication =null;
		  if(mui.os.ios){
		  	 UIApplication=plus.ios.importClass("UIApplication");
		     sharedApplication=UIApplication.sharedApplication();
		  }
		  mui.ajaxSettings.beforeSend=function(xhr,setting){
		  	  xhr.setRequestHeader("Token",sui.getToken());
		  	  if(mui.os.ios&&sharedApplication){
			   		sharedApplication.setNetworkActivityIndicatorVisible(true);
			   }
		  };
		   mui.ajaxSettings.complete=function(xhr,setting){
			   	if(mui.os.ios&&sharedApplication){
			   		sharedApplication.setNetworkActivityIndicatorVisible(false);
			   		plus.ios.deleteObject(sharedApplication);
			   	}
		  };
		   //部分android（三星)机上出现兼容性问题(子页面遮住主页面),暂时主页取消使用
		  var curr=plus.webview.currentWebview();
		  if(curr){
		  	  var currId=curr.id;
			  if(currId!='default.html'&&currId!='invest.html'&&currId!='assets.html'&&currId!='my.html'){
			  	 curr.setStyle({scrollIndicator: 'none'});
			  }
		  }
	}
	 if(window.plus){
	       plusReadyCom();
	    }else{
	     document.addEventListener('plusready',plusReadyCom,false);
	  }
}(sui, document));