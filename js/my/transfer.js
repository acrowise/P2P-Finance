var vm = new Vue({
	el: '#vue-app',
    data: {
       model:{SurplusCapital:0,CurrentInterest:0,Fee:0},
       isIos:false, 
       id:null,
       amount:"",
       agree:true,
       rate:'0.00',
       factAmt:'0.00',
       doLoop:null,
       kind:1
    },
    mounted: function () {
    	var $this=this;
    	$this.$nextTick(function () {
    		 if(window.plus){
			     $this.plusReady();
			    }else{
			     document.addEventListener('plusready',vm.plusReady,false);
			  }	
    	});
    },
  	methods: {	
  		plusReady:function(){
  			vm.id=plus.webview.currentWebview().Id
		    vm.transferDetail();
  		},
  		href:function(pageUrl,pageId,title){
  			sui.open(pageUrl,pageId,{},{},true,title,false);
  		},
	    transferDetail:function(){
	    	setTimeout(function(){
	    		mui.os.ios&&(vm.isIos=true);
				var w=sui.wait();
				sui.request('Transfer/CanTransferDetail',{tenderDetailId:vm.id},true,function(data){
					sui.closewait(w);
					if(data){
						var IsPass=data.IsPass;
						if(IsPass){
						    vm.model=data.ReturnObject;
						    vm.factAmt=sui.rmoney(data.ReturnObject.SurplusCapital-data.ReturnObject.Fee);
						}else{
							mui.toast(data.Desc);
						}
					}
			  });
			},sui.constNum());
	   },
	   rateDiscount:function(){
	    	//折益率=折益价/剩余本金
	    	//实际到账金额=转让金额±溢/折价金额-转让手续费
	    	clearTimeout(vm.doLoop);
	    	vm.doLoop=setTimeout(function(){
	    		var tempAmt=vm.amount;
	    		if(typeof(vm.amount)=='number'){
			   		vm.amount=vm.amount.toString();
			   	}
	    		if(!vm.amount.isFloat()){ 
	    			tempAmt=0;
		    		vm.amount="";
		    	}else if(vm.kind==1 && parseFloat(tempAmt)>((vm.model.SurplusCapital||0) * 0.01)){
		    		vm.amount=(vm.model.SurplusCapital * 0.01).toFixed(2).toString();
		    		tempAmt=(vm.model.SurplusCapital * 0.01).toFixed(2);
		    	}else if(vm.kind==2 && parseFloat(tempAmt)>vm.model.CurrentInterest){
		    		vm.amount=vm.model.CurrentInterest.toFixed(2).toString();
		    		tempAmt=vm.model.CurrentInterest.toFixed(2);
		    	}
		       tempAmt=vm.kind==1?(-parseFloat(tempAmt)):parseFloat(tempAmt);
		   	   vm.factAmt=sui.rmoney(vm.model.SurplusCapital+tempAmt-vm.model.Fee);
		   	   vm.rate= (tempAmt/vm.model.SurplusCapital*100).toFixed(2);
	    	},800);
	   },
	   btnSure:function(){
	   	var kindCn = this.kind == 1 ? "折价" : "溢价";
	   	if(typeof(this.amount)=='number'){
	   		this.amount=this.amount.toString();
	   	}
	   	 if(sui.IsNullOrEmpty(this.amount)){
	   	 	this.amount='0';
	   	 }
	   	 if(!this.agree){
	   	 	mui.toast('请阅读并同意《债权转让协议》');
	   	 	return;
	   	 }else if(!this.amount.isFloat()){
	   	 	mui.toast(kindCn+'金额必须为大于等于0的数字且允许保留两位小数');
	   	 	return;
	   	 }else if(this.kind==1 && parseFloat(this.amount)>(this.model.SurplusCapital * 0.01).toFixed(2)){
	   	 	mui.toast('折价金额不能大于'+ sui.rmoney(this.model.SurplusCapital * 0.01));
	   	 	return;
	   	 }else if(this.kind==2 && parseFloat(this.amount)>this.model.CurrentInterest){
	   	 	mui.toast('溢价金额不能大于'+ sui.rmoney(this.model.SurplusCapital * 0.01));
	   	 	return;
	   	 }
	   	 	var w=sui.wait();
	   	 	var postData={
	   	 		LoanId:vm.id,
	   	 		ReduceAmount:this.kind==1?(-parseFloat(vm.amount)):parseFloat(vm.amount),
	   	 		Agree:vm.agree
	   	 	};
			sui.request('Transfer/ApplyTransfer',postData,false,function(data){
				if(data){
					var IsPass=data.IsPass;
					if(IsPass){		
						var curr=plus.webview.currentWebview();
						var parent=curr.opener();
						parent&&parent.evalJS('vm.downRefresh(0)');
						setTimeout(function(){
							mui.toast('转让成功');
							curr.close();
						},200);
					}else{
						mui.toast(data.Desc);
					}
				}
				sui.closewait(w);
		  });
	   },
	   placeholder:function(){
	   	 //1-折价 2-溢价
	   	 var showTips="请输入折价金额，可折价（0.00~"+ sui.rmoney(this.model.SurplusCapital*0.010)+"）";
	   	   if(this.kind==2){
	   	    	var showTips="请输入溢价金额，可溢价（0.00~"+ sui.rmoney(this.model.CurrentInterest)+"）";
	   	   }
	   	    return showTips;
	   }
	},
	filters:{
		getAmount:function(value){
			return value?sui.rmoney(value):'0.00';
		},
		getDate:function(value){
			return value?sui.formatDate('y-m-d',value):"";
		}
	}
});
