var vm = new Vue({
	el: '#vue-app',
	data: {
		type: 1,
		id: 0,
		model: {Rate:0,RaiseRate:0,RiskLevel:"AA"},
		isIos: false,
		grey: false,
		show:true,
		surplusTime:"00天00时",
		inTime:null,
		btnText:"出借",
		progress:0
	},
	mounted: function() {
		var $this = this;
		$this.$nextTick(function() {
			if(window.plus) {
				vm.plusReady();
			} else {
				document.addEventListener('plusready', vm.plusReady, false);
			}
		});
	},
	methods: {
		plusReady: function() {
			var curr = plus.webview.currentWebview();
			vm.type = curr.type==4?4:1;
			vm.id = curr.Id;
			setTimeout(function() {
				mui.os.ios && (vm.isIos = true);
				var w = sui.wait();
				vm.init(w);
			}, sui.constNum());
		},
		init: function(w) {
			//房易融、债转、年月账户详情
			//标的类型：1-房易融 2-月账户 3-年账户 4-债转
			var $this=this;
			var postUrl = "Loan/YearsDetail";
			var param = {loanType: vm.type};
			if(vm.id) {
				postUrl = vm.type == 4 ? "Transfer/TransferDetail" : "Loan/LoanDetail";
				param = vm.type == 4 ? {transferId: vm.id} : {loanId: vm.id};
			}
			sui.request(postUrl, param, true, function(data) {
				w&&sui.closewait(w);
				if(data) {
					var IsPass = data.IsPass;
					if(IsPass) {
						vm.model = data.ReturnObject;
						vm.show=true;
						$this.$nextTick(function() {
							vm.getProgress();//项目进度
							vm.btnState();//按钮状态
							if(vm.id){
								if(vm.model.SurplusTime){
									vm.countDown(); //剩余时间 定时器
								    vm.intervalTime(); 
								}else{
									vm.model.SurplusAmount=0;
									vm.grey=true;
								}
							}
						});
					} else {
						mui.toast(data.Desc);
					}
				}
			});
		},
		getAmount: function(value) {
			//格式化金额
			return value ? sui.rmoney(value) : "0.00";
		},
		getRate: function() {
			//标的类型：1-房易融 2-月账户 3-年账户 4-债转
			var rate = null;
			if(this.id) {
				//具体标
				rate = (this.model.Rate+this.model.RaiseRate).toFixed(1)+"<em>%</em><div class='riskLevel'>"+this.model.RiskLevel+"</div>"; 
			} else {
				rate = this.type == 2 ? (this.model.MinRate + "~" + this.model.MaxRate+"<em>%</em>") : (this.model.MinRate + "<em>+"+ this.model.RaiseRate+"%</em>");
			}
			return ~rate.indexOf('undefined') ? "0.0<em>%</em>" : rate;
		},
		termNoun:function(){
			//借款期限名词
			//1-房易融 2-月账户 3-年账户 4-债转
			//锁定转让期
			if(this.id){
				return this.type==4?"剩余期数":(this.type==1?"借款期限":"锁定转让期");
			}else{
				return "锁定转让期";
			}
		},
		getTerm: function() {
			//出借期限/借款期限/剩余期数
			//1-天 2-月 3-年 4-小时
			var termUnit =["天","个月","年","小时"][this.model.LoanTermUnit-1];
			if(this.id){
				var result="";
				if(this.type==4){
					result=this.model.SurplusPeriod +termUnit;
				}else{
					result=this.model.LoanTerm  + termUnit;
				}
			}else{
				if(!this.model.MaxLoanTerm || this.model.MinLoanTerm==this.model.MaxLoanTerm)
					result=this.model.MinLoanTerm +termUnit;
                else
					result=this.model.MinLoanTerm+"-"+this.model.MaxLoanTerm+termUnit;
			}
			if(!result)
			   return 0;
			else
			  return ~result.indexOf('undefined')?0:result;
		},
		getProgress: function() { 
			//项目进度
			/// 状态： 6-可加入 7-撤标中 8-流标 9-已结束 10-放款中 11-还款中 12-还款完成
			/// 债转：状态：1-转让中 2-取消 3-成功 4-失败
			var progress = 100;
			if(this.id) {
				if(this.type == 4) {
					progress = this.model.State == 1 ? this.model.TenderProgress : 100;
				} else {
					progress = this.model.State == 6? this.model.TenderProgress : 100;
				}
			} else {
				var total = this.model.SurplusAmount + this.model.InvestedAmount;
				if(total) {
					progress = (this.model.InvestedAmount / total)*100;
				} else {
					progress = 100;
				}
			}
			 vm.progress= progress?progress:0;
		},
		investedAmt:function(){
			//已募集金额/转让金额
			var amount=0;
			if(this.id){
				amount=this.model.Amount;
			}else{
				amount=this.model.SurplusAmount + this.model.InvestedAmount;
			}
			return amount?sui.rmoney(amount):'0.00';
		},
		formatTime:function(value){
			//格式化时间
			return value<10?'0'+value:value;
		},
		countDown:function(){
			var seconds=vm.model.SurplusTime;
			if(seconds > 0) {
				var days=Math.floor(parseFloat(seconds) /3600/24);//天数
				var hours=Math.floor(parseFloat(seconds)/3600%24);//小时
				if(days || hours){
					var temp=vm.formatTime(days)+"天"+vm.formatTime(hours)+"时" ;
					if(vm.surplusTime!=temp){
						vm.surplusTime=temp;
					}
				}else{
					if(vm.surplusTime!="00天01时"){
						vm.surplusTime="00天01时";
					}
				}
				--seconds;
			} else{
				vm.surplusTime="00天00时";
				vm.grey=true;
				vm.model.SurplusAmount=0;
				clearInterval(vm.inTime);
			}
		},
		intervalTime:function(){
			clearInterval(vm.inTime);
			 if(this.model.SurplusTime){
				vm.inTime = setInterval(vm.countDown, 1000);
			}
		},
		btnState:function(){
			this.grey=false;
			//按钮状态以及按钮文本内容
			//状态： 6-可加入 7-撤标中 8-流标 9-已结束 10-放款中 11-还款中 12-还款完成
            // 债转：状态：1-转让中 2-取消 3-成功 4-失败
			if(this.model.SurplusAmount <=0){
				//所有标
				this.grey=true;
			}
			if(this.id){
				if(this.type==4 && this.model.State!=1){
					//债转且不是转让中
					this.grey=true;
					this.model.SurplusAmount=0;
					this.btnText=["已取消","转让成功","转让失败"][this.model.State-2]
				}
				if(this.type!=4 && this.model.State!=6){
					//不是债转标且不是可加入
					this.grey=true;
					this.model.SurplusAmount=0;
					this.btnText=["借款失败","借款失败","已结束","已结束","还款中","已结清"][this.model.State-7]
				}
				if(!this.model.IsTender){
					this.grey=true;
					this.model.SurplusAmount=0;
				}
			}
		},
		btnEvent:function(){
			//出借按钮事件
			if(sui.isLogin()){
				if(!this.model.IsRisk){
				   sui.open('../my/riskEvaluation.html','riskEvaluation.html',{invest:true},{},true,'风险测评',false);
				   return;
				}
				if(!this.model.IsRealAuth){
				  mui.confirm('您还没有开通银行存管账户，请先开通','',['取消','立即开通'],function(e){
	    				if(e.index==1){
	    					sui.open('../bank/openingAccount.html','openingAccount.html',{},{},true,'开通银行存管',false);
                            setTimeout(function(){
	    						plus.webview.currentWebview().close('none',0);
	    					},1000);
	    				}else{
    						plus.webview.currentWebview().close();
	    				}
	    			},'div');
					return;
				}
				var loanType=this.type==4?this.model.LoanType:0;
				sui.open('investStandard.html','investStandard.html',{Id:this.id,type:this.type,loanType:loanType},{},true,'出借',false);
			}else{
				sui.open('../root/login.html','login.html',{invest:true},{},true,'登录',false);
			}
		},
		href:function(pageUrl,name){	
			//页面跳转
			var loanId=this.model.LoanId?this.model.LoanId:0;
			sui.open(pageUrl,sui.unique(),{Id:this.id,type:this.type,loanId:loanId},{},true,name,false);
		},
		InterestTime:function(){
			//起息日期
			var time="已结束次日开始计算收益";
			if(this.id && this.type!=4 && this.model.InterestTime){
			    time=sui.formatDate('y-m-d',this.model.InterestTime);
			}
			return time;
		}
	},
	filters:{
		getDate:function(d){
			return d?sui.formatDate('y-m-d',d):"";
		}
	}
});