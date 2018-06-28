var vm = new Vue({
	el: '#vue-app',
    data: {
		isIos:false,
		riskArr:['','','','','','','','','',''],
		riskType:1,
		show:false,
		invest:false,
		investId:null
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
		    var already=curr.already;
		    vm.invest=curr.invest;
		    vm.investId=curr.investId;
			if(!already){
				setTimeout(function(){
					mui.alert('按国家互联网金融监管有关规定，需您完成以下“风险测评”。测评完成，即可进行下一步操作。',function(){},'div');
				},mui.os.ios?300:0);
			}
		},
	    btnCommit:function(){
	    	var isStop=0,len=vm.riskArr.length;
	    	for (var i=0;i<len;i++) {
	    		  if(!vm.riskArr[i]){
	    	 		isStop=1;
	    	 		mui.toast('请选择风险测评第'+(i+1)+'题');
	    	 		break;
	    	   	}
	    	}
	    	if(isStop) return;
		      var w=sui.wait(true,true,'请稍候...');
				sui.request('User/RiskType', {options:vm.riskArr.join(',')},true,function(data) {
					w=sui.closewait(w,true);
					if(data) {
						if(data.IsPass){		
							var parent=plus.webview.getWebviewById('userinfo.html');
							var index=plus.webview.getSecondWebview();
							var investPage=plus.webview.getWebviewById('invest.html');
							vm.riskType=data.ReturnObject;
							var type=["保守型","稳健型","积极型"][vm.riskType-1];
							parent && parent.evalJS('vm.updateRiskType("'+type+'");');
							index&&mui.fire(index,'index');
							investPage&&mui.fire(investPage,'invest',{index:-2,refresh:true});
							vm.$nextTick(function(){
								vm.show=true;
							});
							if(vm.invest){
								var parent=plus.webview.currentWebview().opener();
								if(~parent.id.indexOf('Lead')){
						     		parent && parent.evalJS('vm.init();');
						     	}else{
						     		var page=plus.webview.getWebviewById(vm.investId);
						     		page && page.evalJS('vm.init();');
						     	}
							}
						} else {
							mui.toast(data.Desc); 
						}
					} 
			});
	   },
	    btnReset:function(){
	    	vm.show=false;
	    	vm.riskArr=['','','','','','','','','',''];
	    }
	},
	filters:{
		getType:function(value){
			//1-保守型 2-稳健型 3-积极型 
			return ["保守型","稳健型","积极型"][value-1];
		},
		getExplain:function(value){
			return [
			   '您的风险承担能力水平比较低，您关注资产的安全性远超于资产的收益性，所以低风险 、高流动性的出借品种比较适合您，这类出借的收益相对偏低。建议您可将不超过可支配收入的10%的资金出借于P2P理财等风险偏高项目，在控制风险的同时适当提高收益。注：以上建议仅供参考，不构成任何收益保证。',
			   '您有比较有限的风险承受能力，对出借收益比较敏感，期望通过短期、持续、渐进的出借获得高于定期存款的回报。较低等级风险的产品比较适合您。建议您可将不超过可支配收入的20%资金出借于p2p理财等风险偏高项目，适当回避风险的同时保证收益。注：以上建议仅供参考，不构成任何收益保证。',
			   '您有中高的风险承受能力，愿意承担可预见的出借风险去获取更多的收益。中高等级的风险出借品种比较适合您。建议您可将不超过可支配收入的40%的资金出借于P2P理财等风险偏高项目，以一定可预见的风险承担超额收益。注：以上建议仅供参考，不构成任何收益保证。'
			][value-1];
		}
	}
});