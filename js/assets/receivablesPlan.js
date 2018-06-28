var vm = new Vue({
	el: '#vue-app',
    data: {
    	model:{"ReceiptPlan":[]},
    	id:null,
    	loanId:null,
    	detailId:null,
    	type:1,
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
  			var curr=plus.webview.currentWebview();
  			vm.id=curr.id;
  			vm.loanId=curr.loanId;
  			vm.type=curr.type;
  			vm.detailId=curr.detailId;
  			setTimeout(function(){
  				mui.os.ios&&(vm.isIos=true);
  				vm.receiptPlan(vm.loanId,vm.detailId);
  			},sui.constNum());
  		},
	    /*路由（跳转）tap事件绑定*/
	    href:function(name){
	    	sui.open('../invest/investDetail.html',sui.webviewId(),{Id:vm.loanId,type:vm.type},{},true,name,false);
	    },
	    agreement:function(){
	    	//查看协议
	    	sui.open('checkAgreement.html','checkAgreement.html',{Id:vm.loanId,detailId:vm.detailId},{},true,'查看协议',false);
	    },
	    receiptPlan:function(id,detailId){
	    	   var w=sui.wait();
	    		sui.request('Account/LoanReceiptPlan',{loanId:id,tenderDetailId:detailId},true,function(data){
	    			sui.closewait(w);
		    		if(data){
		    			if(data.IsPass){
						   vm.model=data.ReturnObject;
		    			}else{
		    				mui.toast(data.Desc);
		    			}
		    		}
		    	});
	    }
	},
	filters:{
		getAmount:function(value){
			return sui.rmoney(value);
		},
		getDate:function(date){
			return sui.formatDate('y-m-d',date);
		},
		getState:function(value){
			//1-待回款 2-还款中 3-已回款 4-还款失败 5-已转让 6-待到期转让
			return ["未还款","还款中","已还款","还款失败","已转让","待到期转让"][value-1];
		}
	},
	computed:{
		totalInterest:function(){
			var $this=this;
			//总出借奖励
			var total=0;
			for(var i=0,item;item=$this.model.ReceiptPlan[i++];){
			    //1-待收 2-还款中 3-已收 4-还款失败 5-已转让
				if(item.State !=5 && item.State !=6 ){
					total+=(item.State==3?item.FactRaiseInterest:item.RaiseInterest);
				}
			}
			return sui.rmoney(total);
		}
	}
});