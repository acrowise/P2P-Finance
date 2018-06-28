var vm = new Vue({
	el: '#vue-app',
    data: {
       houseList:{},
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
			vm.getHouse(curr.Id,curr.type,curr.loanId);
  		},
	    getHouse:function(id,type,loanId){
    		var param=type==4?loanId:id;
    		setTimeout(function(){
		    	   mui.os.ios&&(vm.isIos=true);
					var w=sui.wait();
					sui.request('Loan/LoanUserHouse',{loanId:param},true,function(data){
						sui.closewait(w);
						if(data){
							if(data.IsPass){
								if(data.ReturnList && data.ReturnList.length){
									vm.houseList=data.ReturnList;
								    vm.$nextTick(function(){
								    	vm.$refs.container.classList.remove('mui-hidden');
								    });
								}else{
									sui.createtips('wujilu','暂无记录');
								}
							}else{
								mui.toast(data.Desc);
							}
						}
				  });
			},sui.constNum());
	    }
	},
	filters:{
		getAmount:function(value){
			return value?sui.rmoney(value):'';
		},
		getDate:function(d){
			return d?sui.formatDate('y-m-d',d):'';
		},
		getChinese:function(num){
			var chinese=["一","二","三","四","五","六","七","八","九","十","十一","十二"][num];
			return chinese?chinese:(num+1);
		}
	}
});