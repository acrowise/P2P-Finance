var vm = new Vue({
	el: '#vue-app',
    data: {
    	msgList:[],
    	index:1,
    	w:null,
    	show:true
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
			setTimeout(function() {
				 mui('#pullrefresh').pullRefresh().pullupLoading();
			}, mui.os.ios?200:0);
		},
	    /*路由（跳转）tap事件绑定*/
	    href:function(index,id){
	    	sui.open('messageDetail.html','messageDetail.html',{msgId:id},{},true,'消息详情',false);
	    	setTimeout(function(){
	    		vm.msgList[index].State=2;
	    	},300);
	    },
	    pullupRefresh:function(){
	    	setTimeout(function() {
	    		sui.request('User/MessageList',{pageIndex:vm.index},true,function(data){
	    			var refresh=false;
		    		if(data){
		    			if(data.IsPass){
	    				 	if(data.ReturnList&&data.ReturnList.length){
							    vm.msgList=vm.msgList.concat(data.ReturnList);	
								vm.index++;
							}else{
								if(vm.index==1){
									 vm.show=false;
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
	    deleteMsg:function(index,msgId,event){				
			var bts=[{title:"确认",style:"destructive"}];
		    plus.nativeUI.actionSheet({title:"确认删除该消息吗？",cancel:"取消",buttons:bts},function(e){
		    	var mli = event.target.parentNode.parentNode;
				if (e.index == 1) {
					vm.w=sui.wait(true,true,'请稍后...');
					sui.request('User/DeleteMessage',{msgIds:msgId},true,function(data){			
						vm.w=sui.closewait(vm.w,true);
						if(data.IsPass){	
							mui.swipeoutClose(mli);
						    vm.msgList.splice(index,1);
							mui.toast("删除成功");
							!vm.msgList.length&&sui.createtips('wujilu','暂无记录');
		    		   }else{
		    				mui.swipeoutClose(mli);
		    				mui.toast(data.Desc);
		    			}				
					});	
				}else{
					setTimeout(function() {
						mui.swipeoutClose(mli);
					}, 0);
				}
			 });
	    }
	},
	filters:{
		formatDate:function(value){
			return sui.formatDate('y-m-d h:i:s',value);
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
