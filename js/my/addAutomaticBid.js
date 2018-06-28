String.prototype.isNumber = function() {
	return /^[0-9]+$/.test(this);
};
var vm = new Vue({
	el: '#vue-app',
    data: {
    	ruleId:'',
    	picker:null,
    	model:{},
    	loanType:[],
    	btnActive:{'1':0,'2':0,'3':0}
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
	    href:function(data){
			data.title? sui.open(data.url,data.id,{},{},true,data.name,false):sui.open(data.url,data.id);				 
	    },	
	    plusReady:function(){
  			vm.ruleId=plus.webview.currentWebview().ruleId;
  			vm.init();  			
  		},
	    init:function(ruleId){
	    	setTimeout(function(){
	    		var w=sui.wait();
		    	sui.request('Invest/RuleDetail',{"ruleId":vm.ruleId},true,function(data){
		    		sui.closewait(w);
	    			if(data){
	    			    if(data.IsPass){
		    			    vm.model=data.ReturnObject;	
		    			    vm.loanType=(data.ReturnObject.LoanType||"").split(',');
		    			    for (var j=0,item;item=vm.loanType[j++];) {
		    			    	vm.btnActive[item]=1;
		    			    }
		    			    var couponArr=[];
		    			    for (var i=0,item;item=data.ReturnList[i++];) {
	    			        	couponArr.push({v:item.Index,t:item.Name});
	    			        }
		    			    vm.picker.setData(couponArr);
		    			}else{
		    				mui.toast(data.Desc);
		    			}
	    			}
		    	});
	    	},sui.constNum());
	    },
	    btnToggle:function(type){  
	    	var positions=vm.loanType.indexOf(type.toString());
	    	if(~positions){
	    		  vm.loanType.splice(positions,1);
	    		  vm.btnActive[type]=0;
	    	}else{
	    		 vm.loanType.push(type.toString());
	    		 vm.btnActive[type]=1;
	    	} 	
	  },
		pubTip:function(type){
			var content=["账户需保留的金额",'出借期限，单位为月，即1期=1个月','自动出借时，如选中优惠券的类型，将以出借金额为基础，且以收益最大化的原则使用对应类型的优惠券。'][type-1];
			mui.alert(content, "", function() {},mui.os.android?'div':'');
		},
		choiceQuan:function(){
			document.activeElement.blur();
			setTimeout(function(){
				vm.picker.show(function(items) {
					items[0].v&&(vm.model.Coupon = items[0].v);
				});
			},250);
		},
	    btnCommit:function(){
	    	if(sui.IsNullOrEmpty(this.model.AccountBal)){
	    		mui.toast("请输入账户预留金额");
	    		return;
	    	}else if(sui.IsNullOrEmpty(vm.loanType.join(','))){
	    		mui.toast("请选择出借类型");
	    		return;
	    	}else if(sui.IsNullOrEmpty(this.model.InvestTerm)){
	    		mui.toast("请输入出借期限");
	    		return;
	    	}else if(typeof(this.model.AccountBal)!='number' && !this.model.AccountBal.isFloat()){
	    		mui.toast("请输入正确的账户预留金额，必须为数字且允许保留两位小数");
	    		return;
	    	}else if((typeof(this.model.InvestTerm)!='number' && !this.model.InvestTerm.isNumber()) || this.model.InvestTerm>36 || this.model.InvestTerm<0){
	    		mui.toast("请输入正确的出借期限，必须为0~36以内的整数");
	    		return;
	    	}
	    	var postData={
	    	    Id:this.ruleId,
			    AccountBal: this.model.AccountBal,
			    LoanType: this.loanType.join(","),
			    InvestTerm: this.model.InvestTerm,
			    Coupon: this.model.Coupon
			}
	    	var w=sui.wait(true,true,'请稍候...');
	    	sui.request('Invest/ModifyRule',postData,false,function(data){
	    		w=sui.closewait(w,true);
    			if(data){
    				if(data.IsPass){
	    				var parent=plus.webview.getWebviewById('automaticBid.html');
						parent&&parent.evalJS('vm.init();');	
	    				mui.toast('保存成功');   
	    				setTimeout(function(){
	    					plus.webview.currentWebview().close();
	    				},50);  	    				
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
		getCoupon:function(value){
			return ['现金券','红包','We券'][value-1];
		}
	}
});