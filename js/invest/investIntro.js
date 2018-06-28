var vm = new Vue({
	el: '#vue-app',
    data: {
       content:"",
       isIos:false
    },
    mounted: function () {
    	var $this=this;
    	$this.$nextTick(function () {
    		 if(window.plus){
			     $this.plusReady();
			    }else{
			     document.addEventListener('plusready',$this.plusReady,false);
			  }	
    	});
    },
  	methods: {	
  		plusReady:function(){
  			var curr=plus.webview.currentWebview();
			vm.getIntro(curr.Id,curr.type);
  		},
	    getIntro:function(id,type){
	    	//1-房易融 2-月账户 3-年账户 4-债转
	    		var intro="";
	    		if(type==2){
	    			intro='“月账户”是受用户委托，授权系统自动投标、到期转让的智能出借工具。';
	    			intro+='“月账户”在用户认可的标的范围内，对符合要求的标的匹配优先自动投标，';
	    			intro+='并在出借到期后自动转让退出。匹配完成即进入锁定期。锁定期内，';
	    			intro+='用户已投项目按单个项目逐期结算应回本金和利息；锁定期结束后，';
	    			intro+='平台自动发起债权转让，转让成功后结算剩余本金和利息。';
	    		}else{
	    			intro='“年账户”是前海领投为方便用户出借推出的标准化出借工具，用户加入年账户后，';
	    			intro+='平台立即启动优先匹配投标，按用户认可的标的范围内，对符合要求的标的进行优先自动投标，';
	    			intro+='提高了用户出借的速度和灵活度，及时盘活用户资金，更好的满足用户多样化的出借需求。此外，';
	    			intro+='使用该工具所出借项目还适用于《前海领投质保计划书》';
	    		}
	    	id?sui.createtips('wujilu','暂无记录'):(vm.content=intro);
	    }
	}
});