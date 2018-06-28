var vm = new Vue({
	el: '#vue-app',
    data: {
       message:{},
       isIos:false
    },
    mounted: function () {
    	this.$nextTick(function () {
    		if(window.plus){
			     vm.plusReady();
			  }else{
			      document.addEventListener('plusready',vm.plusReady,false);
			}	
    	});
    },
  	methods: {	
  		plusReady:function(){
  			var msgId=plus.webview.currentWebview().msgId;
  			vm.getMessage(msgId);  			
  		},
	    getMessage:function(msgId){
	    	setTimeout(function(){
	    		mui.os.ios&&(vm.isIos=true);
				var w=sui.wait();
				sui.request('User/MessageDetail',{msgId:msgId},true,function(data){
					sui.closewait(w);
					if(data){
						if(data.IsPass){
						    vm.message=data.ReturnObject;			           
						}else{
							mui.toast(data.Desc);
						}
					}
			  });
			},sui.constNum());
	   }
	},
	filters:{
		formatDate:function(value){
			return value? sui.formatDate('y-m-d h:i:s',value):"";
		}
	}
});

/*跳转事件*/
mui('body').on('tap','a',function(){
	  //消息类型：1-标详情 2--自动投标 3-回款 4-还款提醒  5-优惠券提醒 6-提现 7-资讯
	  var param=JSON.parse(vm.message.Parameters);
	  switch (vm.message.MessageType){
	  	case 1:
	  	    sui.open('../invest/investDetail.html',sui.webviewId(),{Id:param.BusinessId,type:param.BusinessType},{},true,param.BusinessName,false);
	  		break;
	  	case 2:
		  	if(param.BusinessType==4){
		  		sui.open('myTransfer.html','myTransfer.html',{tap:2},{},true,'我的转让',false);
		  	}else{
		  		sui.open('../assets/assetsRecord.html','assetsRecord.html',{type:param.BusinessType},{},true,param.BusinessName,false);
		  	}
	  		break;
	  	case 3:
	  	    sui.open('payCalendar.html','payCalendar.html',{},{},true,'回款日历',false);
	  		break;
	  	case 4:
	    	sui.open('repayCalendar.html','repayCalendar.html',{},{},true,'还款日历',false);
	  		break;
	  	case 5:
	  	    sui.open('coupon.html','coupon.html',{type:param.BusinessType},{},true,'我的卡券',false);
	  		break;
	  	case 6:
	  	    sui.open('withdrawList.html','withdrawList.html',{});
	  		break;
	  	case 7:
	     	sui.open('../root/newsDetail.html','newsDetail.html',{newsId:param.BusinessId});
	  		break;
	  	default:
	  		break;
	  }
});
