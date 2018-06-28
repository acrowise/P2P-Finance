var vm = new Vue({
	el: '#vue-app',
	data: {
		w:null,
		updateTime:localStorage.getItem('qhlead_timestamp')||'',
		imgIdArr:[],
		banner:[],
		noviceLoan:{"Rate":0,"Amount":0,"LoanTerm":0,"LoanTermUnit":4,"Profit":0,"IsOnline":1},
		loan:{"Rate":0,"RaiseRate":0,"LoanTerm":1,"LoanTermUnit":2,"SurplusAmount":0,"RefundWays":2,"RiskLevel":"AA","State":6,"Name":''},
		news:{},
		lastBannerId:null,
		firstBannerId:null,
		riskLevel:0,
		pad51:false
	},
	mounted: function() {
		this.$nextTick(function() {
			if(window.plus) {
				vm.plusReady();
			} else {
				document.addEventListener('plusready', vm.plusReady, false);
			}
		});
	},
	methods: {
		checkVersion:function(){
			//检测update
			wg.checkVersion(function(data){
				sui.closewait(vm.w);
				if(!data){
					vm.pad51=true;
					mui.fire(plus.webview.currentWebview(),'index');
					if(sui.isLogin()){
						vm.getPushInfo();
					}
					wg=null;
				}
			},'index');
		},
		createMsg:function(msg){
			//创建本地消息
			var payload=msg.payload;
        	if(typeof(payload)=='string'){
        		payload=JSON.parse(payload.trim());
        	}
			if(!payload.isLocal){
        		var options = {cover:false};
        		payload.isLocal=1;
        		var localMsg=msg.content;
        		if(!localMsg||localMsg==''){
        			localMsg=(msg.aps&&msg.aps.alert&&msg.aps.alert.body)?msg.aps.alert.body :'';
        		}
        		if(localMsg){
        			 plus.push.createMessage(localMsg,JSON.stringify(payload),options);
        			 plus.device.vibrate(1000);
        		}
        	}
		},
		initSubPages:function(callback){
			    var aniShow = {};
	            utilNview.initSubpage(aniShow,callback);
	            var 	nview = plus.nativeObj.View.getViewById('tabBar'),
					activePage = plus.webview.currentWebview(),
					targetPage,
					subpages = utilNview.options.subpages,
					pageW = window.innerWidth,
					currIndex = 0;
				/**
				 * 根据判断view控件点击位置判断切换的tab
				 */
				nview.addEventListener('click', function(e) {
					var clientX = e.clientX;
					if(clientX > 0 && clientX <= parseInt(pageW * 0.25)) {
						currIndex = 0;
					} else if(clientX > parseInt(pageW * 0.25) && clientX <= parseInt(pageW * 0.5)) {
						currIndex = 1;
					} else if(clientX > parseInt(pageW * 0.5) && clientX <= parseInt(pageW * 0.75)) {
						currIndex = 2;
					} else {
						currIndex = 3;
					}
					// 匹配对应tab窗口	
					if(currIndex > 0) {
						targetPage = plus.webview.getWebviewById(subpages[currIndex - 1]);
					} else {
						targetPage = plus.webview.currentWebview();
					}

					if(targetPage == activePage) {
						return;
					}

					if(currIndex === 2 && !sui.isLogin()) { 
						 sui.open('views/root/login.html','login.html',{},{},true,'登录',false);
					} else {
						var fireEvent=["index","invest","assets","my"][currIndex];
						var param=currIndex==1?{index:-1}:{};
						mui.fire(targetPage,fireEvent,param);
						//底部选项卡切换
						utilNview.toggleNview(currIndex);
						// 子页面切换
						utilNview.changeSubpage(targetPage, activePage, aniShow);
						//更新当前活跃的页面
						activePage = targetPage;
					}
					
				});
		},
		plusReady: function() {
			this.initSubPages(function(){
				var lauchFlag=localStorage.getItem("qhlead_Flag_320");
				 if(!lauchFlag){
				 	var slide=plus.webview.create('views/root/slide.html','slide.html',{},{});
				 	slide.show('none',0);
				    vm.checkVersion();
				 }else{
				 	setTimeout(function(){
					   plus.navigator.setStatusBarStyle("light");
					   plus.navigator.closeSplashscreen();
				 	   vm.w=sui.wait();
				 	   vm.checkVersion();
				 	},mui.os.ios?300:500);
				 }
			});
			//消息推送
			 plus.push.addEventListener("click", function(msg) {
				  	var payload=msg.payload;
				  	if(!payload){
				  		return;
				  	}
					if(typeof(payload)=='string'){
						payload=JSON.parse(payload.trim());
					}
				  	 var type=payload.type;
				  	 var param=payload.data;
				  	 if(typeof(param)=='string'){
						param=JSON.parse(param);
					}
				  	switch (type){
						  	case 1:
						  	    sui.open('views/invest/investDetail.html',sui.webviewId(),{Id:param.BusinessId,type:param.BusinessType},{},true,param.BusinessName,false);
						  		break;
						  	case 2:
							  	if(param.BusinessType==4){
							  		sui.open('views/my/myTransfer.html','myTransfer.html',{tap:2},{},true,'我的转让',false);
							  	}else{
							  		sui.open('views/assets/assetsRecord.html','assetsRecord.html',{type:param.BusinessType},{},true,param.BusinessName,false);
							  	}
						  		break;
						  	case 3:
						  	    sui.open('views/my/payCalendar.html','payCalendar.html',{},{},true,'回款日历',false);
						  		break;
						  	case 4:
						    	sui.open('views/my/repayCalendar.html','repayCalendar.html',{},{},true,'还款日历',false);
						  		break;
						  	case 5:
						  	    sui.open('views/my/coupon.html','views/my/coupon.html',{type:param.BusinessType},{},true,'我的卡券',false);
						  		break;
						  	case 6:
						  	    sui.open('views/my/withdrawList.html','withdrawList.html',{});
						  		break;
						  	case 7:
						     	sui.open('views/root/newsDetail.html','newsDetail.html',{newsId:param.BusinessId});
						  		break;
						  	default:
						  		break;
						  }
				}, false);
			 plus.push.addEventListener("receive", function(msg) {	
			     //解决重复监听
			    if (mui.os.ios) {
		           msg.payload && vm.createMsg(msg);
		        }else{
		           vm.createMsg(msg);
		        }
			}, false);
			//切换到前台
			document.addEventListener("resume", function(){
				//执行下载
				 vm.downloadQueue();
			}, false);
		},
		href: function(data) {
			/*路由（跳转）tap事件绑定*/
			if(data.newsId){
				sui.open(data.url,data.id,{newsId:data.newsId});
			}else{
				if(data.id!='payCalendar.html' || sui.isLogin()){
					data.title? sui.open(data.url,data.id,{},{},true,data.name,false):sui.open(data.url,data.id);
				}else{
					sui.open('views/root/login.html','login.html',{},{},true,'登录',false);
				}
			}
		},
		postPushInfo: function(osType, geTuiId) {
			//提交个推信息
			sui.post('User/ModifyGeTui', {osType: osType,geTuiId: geTuiId}, function(data) {},true);
		},
		getPushInfo:function(){
			//获取个推信息
			var info = plus.push.getClientInfo();
			if(plus.os.name=='Android'){
				vm.postPushInfo(1,info.clientid);
			}else{
				vm.postPushInfo(2,info.token);
			}
		},
		downloadQueue:function(){
			//图片下载
			if(vm.imgIdArr.length>0){
				 var data=vm.imgIdArr.shift();
			     cache.setImg(data.id,data.imgurl,vm.downloadQueue());
			}
		},
		getFirstPage:function(){
			var $this=this;
			//获取首页信息
			sui.request('Home/FirstPage',{updateTime:vm.updateTime,channel:1},true,function(data){
				if(data){
					var IsPass=data.IsPass;
					if(IsPass){
					  var isChange=data.ReturnObject.IsBannerChange;
					  if(isChange && data.ReturnObject.Banner){
					  	 vm.updateTime=data.ReturnObject.Timestamp;
					     localStorage.setItem('qhlead_timestamp',vm.updateTime);
					     vm.banner=data.ReturnObject.Banner;
					     vm.lastBannerId=sui.unique(6);
					     vm.imgIdArr.push({id:vm.lastBannerId,imgurl:vm.banner[vm.banner.length-1].ImageUrl});
					       for(var i=0,item;item=vm.banner[i++];){ 
				     	     vm.imgIdArr.push({id:item.Id,imgurl:item.ImageUrl});
				          }
					     vm.firstBannerId=sui.unique(6);
					     vm.imgIdArr.push({id:vm.firstBannerId,imgurl:vm.banner[0].ImageUrl});
					  }
				     vm.noviceLoan=data.ReturnObject.NoviceLoan;
				     vm.loan=data.ReturnObject.Loan;
				     vm.riskLevel=data.ReturnObject.RiskLevel;
				     vm.news=data.ReturnObject.News||{};
				       $this.$nextTick(function(){
			                if(isChange){
			                	// 渲染已经完成
			                    vm.downloadQueue();
			                	mui("#slider").slider({
									interval: 0
								});
								setTimeout(function() {
									mui("#slider").slider({
										interval: 4000
									});
								}, 1000);  
			               }
			            });
	                    sui.closewait(vm.w);
	                    sui.InitBadge(0);
					}else{
					   mui.toast(data.Desc);
					   sui.closewait(vm.w);
					}
				}else{
					sui.closewait(vm.w);
				}
			});
		},
		bannerTap:function(data){
			//轮播跳转
			//图片类型：1-不跳转 2-借款详情 3-资讯 4-活动 5-指定URL
			var type=data.ImageType;
	        var para=typeof(data.ParamJson)=='string'?JSON.parse(data.ParamJson):data.ParamJson ;
	        if(!sui.IsNullOrEmpty(type)&&!sui.IsNullOrEmpty(para) && para){
					if(type!=1){
						if(type==2){
							//借款类型 Type：1-房易融 2-月账户 3-年账户
							var title =para.Name;
							if(sui.IsNullOrEmpty(title) && !para.BusinessId){
								switch (para.Type){
									case 2:
								 	    title="月账户";
										break;
									case 3:
									    title="年账户";
										break;
									default:
									    title="标的详情";
										break;
								}
							}
							sui.open('views/invest/investDetail.html',sui.webviewId(),{Id:para.BusinessId,type:para.Type},{},true,title,false);
						}else if(type==3){
							//资讯类型：1-新闻 2-公告
							sui.open('views/root/newsDetail.html','newsDetail.html',{newsId:para.BusinessId});
						}else if(type==4){
							//活动：微信和app的页面地址单独设置
							sui.open(data.ImagePageUrl,data.ImagePageUrl,{});
						}else if(type==5){
							//指定地址
							if(~data.ImagePageUrl.indexOf('http')){
								sui.open('views/help/webPage.html','webPage.html',{webUrl:data.ImagePageUrl},{});
								//plus.runtime.openURL(data.ImagePageUrl);
							}else{
								sui.open(data.ImagePageUrl,data.ImagePageUrl,{},{});
							}
						}
					}
			 }
		},
		yearsLoan:function(){
			//1-房易融 2-月账户 3-年账户 4-债转
			//id为具体标的编号 0-false表示年月账户资金池明细
    	   sui.open('views/invest/investDetail.html',sui.webviewId(),{Id:0,type:2},{},true,'月账户',false);
		},
		btnLoan:function(){
			if(this.riskLevel==0 && sui.isLogin()){
    			sui.open('views/my/riskEvaluation.html','riskEvaluation.html',{},{},true,'风险测评',false);
    		}else{
    			sui.open('views/invest/investDetail.html',sui.webviewId(),{Id:this.loan.Id,type:this.loan.LoanType},{},true,this.loan.Name,false);
    		}
		},
		novice:function(){
			var postData={
				rate:this.noviceLoan.Rate,
				term:this.noviceLoan.LoanTerm,
				termUnit:this.noviceLoan.LoanTermUnit,
				profit:this.noviceLoan.Profit
			};
			sui.open('views/root/noviceLoan.html','noviceLoan.html',postData,{},true,'新手专享',false);
		},
		getLoanRate:function(rate,raise){
			return '<span class="bigspan">'+(parseFloat(rate)+parseFloat(raise)).toFixed(1)+'</span>%';
	  }
	},
	computed:{
		getRate:function(){
			//新手标利率
			return this.noviceLoan.Rate.toFixed(1);
		},
		minTerm:function(){
			//月账户最短期限
			//1-天 2-月 3-年 4-小时
			return this.loan.MinLoanTerm+["天","个月","年","小时"][this.loan.LoanTermUnit-1]; 
		}
	},
	filters:{
		getAmount:function(value){
			return sui.rmoney(value);
		},
		getTerm:function(min,unit,max){
			var result="";
			//1-天 2-月 3-年 4-小时
			var termUnit=["天","个月","年","小时"][unit-1];
			if(!max || min==max){
				result=min+termUnit;
			}else{ 
				 result=min+"-"+max+termUnit;
			}
			return result;
    	},
    	refundWays:function(value){
    		//还款方式：1-到期还本付息 2-等额本息 3-先息后本
    		return ["到期还本付息","等额本息","先息后本"][value-1];
    	},
    	statusDesc:function(status){
    		//状态： 6-可加入 7-撤标中 8-流标 9-已结束 10-放款中 11-还款中 12-还款完成
    		return ["可加入","撤标中","借款失败","已结束","已结束","还款中","已结清"][status-6];
    	}
	}
});
//自定义事件
window.addEventListener('index', function(event) {
	vm.getFirstPage();
});
