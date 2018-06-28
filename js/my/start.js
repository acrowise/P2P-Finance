var vm = new Vue({
	el: '#vue-app',
    data: {
    	model:{},
    	times:0
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
	    href:function(data){
			data.title? sui.open(data.url,data.id,{},{},true,data.name,false):sui.open(data.url,data.id);  		
	    },
	    plusReady:function(){
		   setTimeout(function(){
		      var w=sui.wait();
		   	  vm.getStart(w);
		   },sui.constNum());
  		},
	    getStart:function(w){
	    	sui.request('Account/StarSummary',{},true,function(data){
	    		w&&sui.closewait(w);
	    		if(data){
	    			if(data.IsPass){
	    			  vm.model=data.ReturnObject;
	    			}else{
	    				mui.toast(data.Desc);
	    			}
	    		}
	    	});
	    },
	    receiveAwards:function(){
	    	++this.times;
	    	if(this.times>1){
	    		return;
	    	}
	    	var w=sui.wait();
	    	sui.request('Account/ReceiveRewards',{},false,function(data){
	    		sui.closewait(w);
	    		if(data){
	    			if(data.IsPass){
	    				  mui.alert('提交成功，系统正在处理',function(){
					    	   var my=plus.webview.getWebviewById('my.html');
	    				       mui.fire(my,'my');
	    				       plus.webview.currentWebview().close();
					    },'div');
	    			}else{
	    				mui.toast(data.Desc);
	    				vm.times=0;
	    			}
	    		}
	    	});
	    },
	    levelImg:function(level){
	    	level=level?level:1;
	    	return '../../images/level/'+level+'.png';
	    }
	},
	filters:{
		getAmount:function(value){
			return value?sui.rmoney(value):'0.00';
		}
	}
});
