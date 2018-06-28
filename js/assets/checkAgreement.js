var vm = new Vue({
	el: '#vue-app',
    data: {
    	agreement:[],
    	id:null,
    	detailId:null,
    	isIos:false
    },
    mounted: function () {
    	this.$nextTick(function () {
    		mui.os.ios&&(vm.isIos=true);
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
  			vm.id=curr.Id;
  			vm.detailId=curr.detailId;
  			setTimeout(function(){
  				vm.receiptPlan(vm.id,vm.detailId);
  			},sui.constNum());
  		},
	    download:function(url,name){
	    	//下载协议 暂时先只查看
	    	//plus.runtime.openFile(url); //只能打开本地路径，必须先下载
	    	 if(mui.os.android){
	    	 	plus.runtime.openURL(url,function(){
	    	 		mui.toast('抱歉，您的手机暂不支持查看pdf文件。');
	    	 	});
	    	 }else{
	    	 	 sui.open('../help/agreement.html','agreement.html',{agUrl:url,titles:name},{});
	    	 }
	    },
	    receiptPlan:function(id,detailId){
	    	   var w=sui.wait();
	    		sui.request('Invest/ContractList',{loanId:id,tenderDetailId:detailId},true,function(data){
	    			sui.closewait(w);
		    		if(data){
		    			if(data.IsPass){
						      var list=[];
						      if(data.ReturnList.length>0){
						      	  for (var i=0,item;item=data.ReturnList[i++];) {
						      	  	list.push({"name":item.MainName,"fileUrl":item.ContractUrl,"time":item.InsertTime});
						      	  	if(!sui.IsNullOrEmpty(item.AttachmentName1) && !sui.IsNullOrEmpty(item.AttachmentAddress1)){
						      	  		list.push({"name":item.AttachmentName1,"fileUrl":item.AttachmentAddress1,"time":item.InsertTime});
						      	  	}
						      	  	if(!sui.IsNullOrEmpty(item.AttachmentName2) && !sui.IsNullOrEmpty(item.AttachmentAddress2)){
						      	  		list.push({"name":item.AttachmentName2,"fileUrl":item.AttachmentAddress2,"time":item.InsertTime});
						      	  	}
						      	  }
						      	  vm.agreement=list;
						      }else{
						      	 sui.createtips('wujilu','暂无记录');
						      }
		    			}else{
		    				mui.toast(data.Desc);
		    			}
		    		}
		    	});
	    }
	},
	filters:{
		getDate:function(date){
			return sui.formatDate('y-m-d h:i:s',date);
		}
	}
});