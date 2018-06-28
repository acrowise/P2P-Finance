var vm = new Vue({
	el: '#vue-app',
    data: {
    	model:{
		  ReceiptPlan:[]
    	},
    	isIos:false,
    	currDate:null
    },
    mounted: function () {
    	this.$nextTick(function () {
    		if(window.plus) {
				vm.plusReady();
			} else {
				document.addEventListener('plusready', vm.plusReady, false);
			}
    	});
    },
  	methods: {	
  		plusReady:function(){
  			this.currDate=plus.webview.currentWebview().d;
  			setTimeout(function(){
  				vm.init(vm.currDate);
    			mui.os.ios && (vm.isIos=true);
    		},sui.constNum());
  		},
	    href:function(Id,type,detailId,loanId){
	    	//标的回款计划
	       sui.open('../assets/receivablesPlan.html','receivablesPlan.html',{id:Id,type:type,detailId:detailId,loanId:loanId});
	    },
	    init:function(currDate){
	    	var w=sui.wait();
	    	sui.request('Account/CurrentReceiptPlan',{currDate:currDate},true,function(data){
	    		if(data){
	    			if(data.IsPass){
	    			  vm.model=data.ReturnObject;
	    			}else{
	    				mui.toast(data.Desc);
	    			}
	    		}
	    		sui.closewait(w);
	    	});
	    }
	},
	filters:{
		format:function(value){
			return value?sui.rmoney(value):'0.00';
		},
		getDate:function(value){
			//格式化日期
			return value?sui.formatDate('y-m-d',value):"-";
		},
		getState:function(value){
			 //状态：1-待收 2-还款中 3-已收 4-还款失败 5-已转让
			 return ["待收","还款中","已收","还款失败","已转让"][value-1];
		}
	}
});