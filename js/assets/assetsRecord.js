var vm = new Vue({
	el: '#vue-app',
    data: {
    	tenderList:[],
    	index:1,
    	type:1,
    	loopPullDown:null,
    	picker:null
    },
    mounted: function () {
    	this.$nextTick(function () {
    		vm.picker=new mui.PopPicker();
			 if(window.plus){
			     vm.plusReady();
			    }else{
			     document.addEventListener('plusready',vm.plusReady,false);
			  }	
    	});
    },
  	methods: {	
  		plusReady:function(){
			var curr=plus.webview.currentWebview();
			vm.type=-99;  //  curr.type; //1-房易融 2-月账户 3-年账户
			setTimeout(function() {
				 mui('#pullrefresh').pullRefresh().pullupLoading();
			}, mui.os.ios?200:0);
		},
	    /*路由（跳转）tap事件绑定*/
	    href:function(data){
	    	//  状态： 6-可加入 7-撤标中 8-流标 9-已结束 10-放款中 11-还款中 12-还款完成
    		//标的id：  type=4为债转标
    		var id=data.type==4?data.transferId:data.id;
	    	if(data.state==11 || data.state==12){
	    		sui.open('receivablesPlan.html','receivablesPlan.html',{id:id,type:data.type,detailId:data.detailId,loanId:data.id});
	    	}else{
	    		sui.open('../invest/investDetail.html',sui.webviewId(),{Id:id,type:data.type},{},true,data.name,false);
	    	}
	    },
	    pulldownRefresh:function(){
	    		clearTimeout(vm.loopPullDown);
				setTimeout(function() {
					sui.request('Invest/UserTenderList',{pageIndex:1,loanType:vm.type},true,function(data){
						if(data){
							var IsPass=data.IsPass;
							if(IsPass){
								var len=data.ReturnList.length;
								if(len>0){
									vm.tenderList=data.ReturnList;
									vm.index=2;
									vm.loopPullDown= setTimeout(function(){
										mui('#pullrefresh').pullRefresh().enablePullupToRefresh();
								        mui('#pullrefresh').pullRefresh().refresh(true);
									},mui.os.ios?600:200);
								}else{
									mui('#pullrefresh').pullRefresh().disablePullupToRefresh();
								}
							}else{
								mui.toast(data.Desc);
							}
						}
					});
				}, 150);
	    },
	    pullupRefresh:function(){
	    	setTimeout(function() {
	    		sui.request('Invest/UserTenderList',{pageIndex:vm.index,loanType:vm.type},true,function(data){
	    			var refresh=false;
		    		if(data){
		    			if(data.IsPass){
		    				 var len=data.ReturnList.length;
		    				 	if(len>0){
								    vm.tenderList=vm.tenderList.concat(data.ReturnList);
									vm.index++;
								}else{
									if(vm.index==1){
										 refresh=true;
										 mui('#pullrefresh').pullRefresh().disablePullupToRefresh();
									     sui.createtips('wujilu','暂无记录');
									}else{
										 refresh=true;
									}
								}
		    			}else{
		    				mui.toast(data.Desc);
		    			}
		    		}
		    		mui('#pullrefresh').pullRefresh().endPullupToRefresh(refresh);
		    	});
	    	},150);
	    },
	    btnRenewal:function(id,periods){
	    	//续期按钮
	    	var dataArr=[];
	    	//1-房易融 2-月账户 3-年账户
	    	var unit=["","个月","年"][vm.type-1];
	    	for (var i=0;i<periods;i++) {
	    		dataArr.push({v:i+1,t:(i+1)+unit});
	    	}
	    	vm.picker.setData(dataArr);
    		setTimeout(function(){
    			vm.picker.show(function(items) {
				  if(items[0] && items[0].v){
					 	vm.saveRenewal(id,items[0].v);
					 }
				});
    		},50);
	    },
	    saveRenewal:function(id,periods){
	       //保存续期
	       var w=sui.wait(true,true,'请稍候...');
    		sui.request('Invest/SaveRenewal',{tenderDetailId:id,periods:periods},true,function(data){
    			w=sui.closewait(w,true);
	    		if(data){
	    			if(data.IsPass){
	    				 mui.toast('续期成功');
	    				 vm.pulldownRefresh();
	    			}else{
	    				mui.toast(data.Desc);
	    			}
	    		}
	    	});
	    }
	},
	filters:{
		transfer:function(type){
			//2-月债 3-年债
			return type==2?"月债":"年债";
		},
		getTerm:function(periods,unit){
			//1-天 2-月 3-年 4-小时   年账户的出借时已转成月份，单位改成月
			return periods+["天","个月","个月","小时"][unit-1]; 
		},
		format:function(value){
			return sui.rmoney(value);
		},
		getDate:function(date,type){
			return sui.formatDate(type==1? 'y-m-d h:i:s':'y-m-d',date);
		}
	}
});
(function($) {
	$.init({
		pullRefresh: {
			container: '#pullrefresh',
			up: {
				callback: vm.pullupRefresh
			}
		}
	});
})(mui);