var vm = new Vue({
	el: '#vue-app',
    data: {
    	newsList:[],
    	imgIdArr:[],
    	index:1
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
	    href:function(id){
	    	sui.open('newsDetail.html','newsDetail.html',{newsId:id});
	    },
	    downloadQueue:function(){
			//图片下载
			if(vm.imgIdArr.length>0){
				 var data=vm.imgIdArr.shift();
			     cache.setImg(data.id,data.imgurl,vm.downloadQueue());
			}
		},
	    pullupRefresh:function(){
	    	setTimeout(function() {
	    		sui.request('Home/NewsList',{pageIndex:vm.index},true,function(data){
	    			var refresh=false;
		    		if(data){
		    			if(data.IsPass){
		    				 var len=data.ReturnList.length;
		    				 	if(len>0){
								    vm.newsList=vm.newsList.concat(data.ReturnList);
								     for(var i=0,item;item=data.ReturnList[i++];){ 
								     	if(!sui.IsNullOrEmpty(item.Cover))
								     		vm.imgIdArr.push({id:item.Id,imgurl:item.Cover});
							          }
									 vm.index++;
								      vm.$nextTick(function(){
							                // 渲染已经完成
							                vm.downloadQueue();
							            });
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
	    }
	},
	filters:{
		substr:function(content){
			//去除全部的html标签
			var result=content.replace(/<\s?[^>]*>/gi,"");
			if(result && result.length>50){
				result=result.substr(0,50);
			}
			return result;
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