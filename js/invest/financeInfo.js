var vm = new Vue({
	el: '#vue-app',
    data: {
       model:{},
       isIos:false,
       type:1,
       id:0,
       loanId:0
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
  			vm.type=curr.type;
  			vm.id=curr.Id;
  			vm.loanId=curr.loanId;
			vm.getLoanInfo(vm.id,vm.type,vm.loanId);
  		},
	    getLoanInfo:function(id,type,loanId){
    		var param=type==4?loanId:id;
    		setTimeout(function(){
		    	   mui.os.ios&&(vm.isIos=true);
					var w=sui.wait();
					sui.request('Loan/LoanInfo',{loanId:param},true,function(data){
						sui.closewait(w);
						if(data){
							var IsPass=data.IsPass;
							if(IsPass){
							    vm.model=data.ReturnObject;
							    vm.$nextTick(function(){
							    	vm.$refs.container.classList.remove('mui-hidden');
							    });
							}else{
								mui.toast(data.Desc);
							}
						}
				  });
			},sui.constNum());
	    },
	    href:function(page,title){
	    	sui.open(page,page,{},{},true,title,false);
	    }
	},
	filters:{
		getAmount:function(value){
			return value?sui.rmoney(value):'';
		},
		refundWays:function(value){
			// 还款方式：1-到期还本付息 2-等额本息 3-先息后本
			return [
			    '到期还本付息。借款金额为X，年利率为Y，借款期限为Z月，则应还总利息计算公式为：X×Y/12×Z，应还本金为X。',
			    ' 等额本息。 借款金额为X，年利率为Y，借款期限为Z月，月还款本息和T，则第一个月应还利息计算公式为：X×Y/360*30,第二个月应还利息计算公式为：（X-(T-第一个月应还利息））×Y/360*30，各月以此类推，应还总利息计算公式为：第一个月应还利息+第二个月应还利息+…第Z个月的应还利息。应还本金为X。每月按30天算，不足一个自然月按实际天数算。',
			    '先息后本。借款金额为X，年利率为Y，借款期限为Z月，则每月应还利息计算公式为：X×Y/12，应还总利息计算公式为：X×Y/12×Z，应还本金为X。'
			][value-1];
		},
		reHtml:function(content){ 
			//去除全部的html标签
			return content?content.replace(/<\s?[^>]*>/gi,"").replaceAll('&nbsp;',""):"";
		}
	}
});