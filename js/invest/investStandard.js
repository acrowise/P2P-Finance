var vm=new Vue({
	el:"#vue-app",
	data:{
		id:0,
		type:1,
		loanType:0,
		model:{},
		viewModel:{amount:"",agree:true,hbName:"",couponId:null,periods:1,pName:"",isChoice:false,sName:"出借期限",profit:'0.00'},
		isIos: false,
		grey: false,
		//hongbao:true,
		w:null,
		picker:null,
		quanPicker:null,
		doLoop:null,
		//isTransfer:false
	},
	mounted:function(){
	    this.$nextTick(function () {
			 if(window.plus){
			     vm.plusReady();
			    }else{
			     document.addEventListener('plusready',vm.plusReady,false);
			  }	
		});
	},
	methods:{
		plusReady:function(){
		    var curr=plus.webview.currentWebview();
	         this.id=curr.Id;
	 	     this.type=curr.type;
	 	     this.loanType=curr.loanType;
	 	     //红包限制去掉，债转可使用红包
	 	     /*
	 	     if(this.type!=4 || (this.type==4 && this.loanType!=1)){
	 	     	this.hongbao=true;
	 	     }
	 	    
	 	     if(this.type==4 && this.loanType!=1){
	 	     	//判断是否是年月账户的债转标
	 	     	this.isTransfer=true;
	 	     } 
	 	     */
	 	     //优惠券
	 	     vm.quanPicker=new mui.PopPicker();
			 vm.init();
		},
		init:function(){
			var $this=this;
			 setTimeout(function(){
			 	    mui.os.ios && (vm.isIos = true);
					vm.w=sui.wait();
					sui.request('Invest/InvestInfo', {id:vm.id,loanType:vm.type},true,function(data) {
						if(data) {
							var IsPass = data.IsPass;
							if(IsPass) {
							      vm.model=data.ReturnObject;
	                              vm.resultHandle(); //结果处理
							}else{
								mui.toast(data.Desc);
							}
						} 
					  sui.closewait(vm.w);
				});
			},sui.constNum());
		},
		resultHandle:function(){
			//初始化请求结果处理
			//出借期限处理
			var param={
				choice:false,
				name:"出借期限",
				pName:"", //出借期限+单位
				periods:1//出借期限
			};
			  if(this.id &&  this.type!=2 &&  this.type!=3 && this.loanType!=2 && this.loanType!=3){
	 	     	//房易融 和房易融债转 不能选择期数 （合规调整，年月账户债转与房易融调成一致）
			     param.name=this.type==4?"剩余期数":"出借期限";
			      //1-天 2-月 3-年 4-小时
			      param.pName=this.model.LoanTerm+["天","个月","年","小时"][this.model.LoanTermUnit-1];
			      param.periods=this.model.LoanTermUnit==3?this.model.LoanTerm*12:this.model.LoanTerm; 
			 }else{
			    //年月账户才可以选择期数
			 	var pickerArr=[];
			      //1-天 2-月 3-年 4-小时
			 	 //债转
			      if(this.type==4 ){
			         	//年债
			         	/*
				 		if(this.loanType==3){
						    var year=this.model.LoanTerm/12;
					 		if(year==1){
					 			 //param.choice=false;
					 			 param.name="剩余期数";
					 		}else{
					 			param.choice=true;
					 			 param.name="选择期数";
					 			 for(var i=0;i<year;i++){
					 			 	pickerArr.push({v:(i+1)*12,t:(i+1)*12+"个月"});
					 			 }
			 	                vm.picker=new mui.PopPicker();
			 	                vm.picker.setData(pickerArr);
					 	}
				 	}else{
				 		//月债
				 		if(this.model.LoanTerm==1){
				 			 param.name="剩余期数";
				 		}else{
				 			 param.choice=true;
				 			 param.name="选择期数";
				 			 for(var i=0;i<this.model.LoanTerm;i++){
				 			 	pickerArr.push({v:i+1,t:(i+1)+"个月"});
				 			 }
		 	                vm.picker=new mui.PopPicker();
		 	                vm.picker.setData(pickerArr);
				 		}
				 	}
				 	*/
				 	param.name="剩余期数";
				 	param.pName=this.model.LoanTerm+"个月"; //所有债转期数都是月份单位
				 	param.periods=this.model.LoanTerm; //默认最大的
			 	}else{
			 		if(this.model.LoanTerm==1){
				 		 param.name="出借期限";
			 		}else{
			 			 param.choice=true;
				 	     param.name="选择期数";
			 			for(var i=0;i<this.model.LoanTerm;i++){
			 				var v=this.model.LoanTermUnit==3?(i+1)*12:(i+1);
			 			 	pickerArr.push({v:v,t:(i+1)+["天","个月","年","小时"][this.model.LoanTermUnit-1]});
			 			 }
	 	                vm.picker=new mui.PopPicker();
	 	                vm.picker.setData(pickerArr);
			 		}
			 		param.pName=((this.model.LoanTermUnit==3 || this.model.LoanTermUnit==2)?1:this.model.LoanTerm)+["天","个月","年","小时"][this.model.LoanTermUnit-1];
				 	param.periods=this.model.LoanTermUnit==3?12:1; //默认最小的
			 	}
			 }
			 this.viewModel.periods=param.periods;
			 this.viewModel.pName=param.pName;
			 this.viewModel.isChoice=param.choice;
			 this.viewModel.sName=param.name;
			  if((vm.loanType==2 &&vm.type==4) || vm.type==2){
	          	  vm.model.Rate=vm.getRate(param.periods).toFixed(1)+'%';
	          }
			 //按钮处理
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
				}
				if(this.type!=4 && this.model.State!=6){
					//不是债转标且不是可加入
					this.grey=true;
				}
			}
			if(!this.model.IsRealAuth){
				this.realAuth();
			}else if(!this.model.IsAutoTender){
				this.isAutoTender();
			}
		},
		sendTender:function(){
			//发送出借
			if(!sui.isLogin()){
				sui.open('../root/login.html','login.html',{},{},true,'登录',false);
				return;
			}
			if(sui.IsNullOrEmpty(this.viewModel.amount) || this.viewModel.amount==0){
				mui.toast('请输入出借金额');
				return;
			}else if(typeof(this.viewModel.amount)!='number' && !this.viewModel.amount.isFloat()){
				mui.toast('请输入正确的出借金额');
				return;
			}else if(this.model.AvailBal<=0 || parseFloat(this.viewModel.amount)>this.model.AvailBal){
				mui.toast('您的账户余额不足，请先充值');
				return;
			}else if(this.model.MinInvestAmount>parseFloat(this.viewModel.amount)){
				mui.toast('出借金额不能低于'+sui.rmoney(this.model.MinInvestAmount));
				return;
			}else if(this.model.MaxInvestAmount!=0 && parseFloat(this.viewModel.amount)>this.model.MaxInvestAmount){
				mui.toast('出借金额不能高于'+sui.rmoney(this.model.MaxInvestAmount));
				return;
			}else if(!this.viewModel.agree){
				//这里有电子签章判断，后续需要加上，暂时未处理
				mui.toast('请先阅读并同意签署风险提示书以及借款合同');
				return;
			}
			vm.w=sui.wait(true,true,'请稍候...');
			var postData={
				Id:this.id==0?'':this.id,
				LoanType:this.type,
				Periods:this.model.RefundWays==1?1:this.viewModel.periods,
				TenderAmount:this.viewModel.amount,
				CouponId:this.viewModel.couponId?this.viewModel.couponId:'',
				Channel:mui.os.android?3:4,
				Agree:this.viewModel.agree
			}
			sui.request('Invest/SendTender', postData,false,function(data) {
				if(data) {
					var IsPass = data.IsPass;
					if(IsPass) {
						//出借成功处理
						var curr=plus.webview.currentWebview();
						var invest=plus.webview.getWebviewById('invest.html');
						var projectList=plus.webview.getWebviewById('investProjectList.html');
					    var parent=curr.opener();
					    parent.evalJS('vm.init();');
					    projectList&&projectList.evalJS('vm.downRefresh();');
					    invest&&mui.fire(invest,'invest',{index:-1,refresh:true});
					    mui.alert('提交成功，系统正在处理',function(){
					    	curr.close();
					    },'div');
					}else{
						//如果不需要下一步操作，则直接提示用户
						if(data.StatusCode=='S0014'){
							//还未实名认证
							vm.realAuth();
						}else if(data.StatusCode=='S0045'){
							//还未授权自动投标
							vm.isAutoTender();
						}else if(data.StatusCode=='S1030'){
							mui.confirm('注：电子签章和电子合同，与纸质合同具有同等的法律证据效力；用户交易后可在【我的账户】—【我的出借】和【我的转让】中查看已发生交易的电子合同。','首次出借需要您签署<span id="Authorize" style="color:#007aff">电子签章授权委托书</span>，请先同意签署',['拒绝','同意签署'],function(e){
			    				if(e.index==1){
			    				    	vm.w=sui.wait();
										sui.request('Invest/EsignAuthorize',{},true,function(data){
											sui.closewait(vm.w);
											if(data){
												if(data.IsPass){
													mui.toast('签署成功');
												}else{
												   mui.toast(data.Desc);
												}
											}
										});
			    				}
			    			},'div');
							
						}else if(data.StatusCode=='S1033'){
							//去风险测评
							 sui.open('../my/riskEvaluation.html','riskEvaluation.html',{},{},true,'风险测评',false);
						}else{
							mui.toast(data.Desc);
						}
					}
				}
				vm.w=sui.closewait(vm.w,true);
			});
		},
		placeholder:function(min,max){
			return  min? '请输入出借金额('+sui.rmoney(min)+'-'+sui.rmoney(max)+')':'请输入出借金额';
		},
		getRate:function(periods){
			//月账户利率计算
			var rate=8.7+0.1*periods;
            return rate>10.8?10.8:rate;
		},
		inputEvent:function(){
			//出借金额输入框
			clearTimeout(this.doLoop);
			this.doLoop=null;
			this.doLoop=setTimeout(function(){
				vm.expectProfit();
				vm.viewModel.hbName="";
				vm.viewModel.couponId=null;
			},1000);
		},
		expectProfit:function(){
			//计算预期收益
			if(!this.viewModel.amount ||(typeof(this.viewModel.amount)!='number' && !this.viewModel.amount.isFloat())  || this.viewModel.amount<=0 || this.viewModel.amount<this.model.MinInvestAmount){
				vm.viewModel.profit='0.00';
				return;
			}
			var postData={
				refundWay:this.model.RefundWays,
				loanType:this.loanType,
				amount:this.viewModel.amount,
				rate:((vm.loanType==2 && vm.type==4) || vm.type==2)? this.getRate(this.viewModel.periods):this.model.TenderRate,
				periods:this.viewModel.periods,
				quanId:this.viewModel.couponId
			};
			sui.request('Invest/ExpectProfit',postData,true,function(data){
				data&&(vm.viewModel.profit=sui.rmoney(data.Profit));
			},false);
		},
		choiceCoupon:function(){
			//选择优惠券
			vm.w=sui.wait();
			sui.request('Loan/CouponList',{investAmount:this.viewModel.amount||0,investPeriod:(this.model.RefundWays==1?1:this.viewModel.periods)},true,function(data){
				sui.closewait(vm.w);
				if(data){
					if(data.IsPass){
						if(data.ReturnList.length){
							var quanArr=[];
							for(var i=0,item;item=data.ReturnList[i++];){
								quanArr.push({v:item.Id,t:item.Name});
							}
							vm.quanPicker.setData(quanArr);
							setTimeout(function(){
				    			vm.quanPicker.show(function(items) {
								  if(items[0] && items[0].v){
								  	   vm.viewModel.hbName=items[0].t;
							           vm.viewModel.couponId=items[0].v;
							           vm.expectProfit();//计算预期收益
									 }
								});
				    		},50);	
						}else{
							//无可用优惠券
							vm.viewModel.hbName="暂无可用优惠券";
							vm.viewModel.couponId=null;
						}
					}else{
					   mui.toast(data.Desc);
					}
				}
			});
		},
		realAuth:function(){
			//去实名认证
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
		},
		isAutoTender:function(){
			//授权自动投标
			mui.confirm('欢迎您首次出借！出借前，需您授权第三方支付机构，授权确认方可进行下一步操作。',' ',['取消','立即授权'],function(e){
				if(e.index==1){
					sui.open('../bank/businessAuth.html','businessAuth.html',{},{},true,'业务授权',false);
					setTimeout(function(){
						plus.webview.currentWebview().close('none',0);
					},1000);
				}else{
					plus.webview.currentWebview().close();
				}
			},'div');
		},
		href:function(pageUrl,pageId,title){
			//页面跳转
			if(sui.isLogin()){
				if(this.model.IsRealAuth || pageId!='recharge.html'){
					//如果需要参数，或者不需要原生title，做一下调整
					sui.open(pageUrl,pageId,{},{},true,title,false);
				}else{
	    			this.realAuth();
				}
			}else{
				sui.open('../root/login.html','login.html',{},{},true,'登录',false);
			}
		},
		btnSwitch:function(event){
			//一键全投切换
			if(event.detail.isActive){
		        var value=vm.model.AvailBal>vm.model.SurplusAmount?vm.model.SurplusAmount:vm.model.AvailBal;
		        if(vm.model.MaxInvestAmount){
		        	value=value>vm.model.MaxInvestAmount?vm.model.MaxInvestAmount:value;
		        }
		        vm.viewModel.amount=value?value.toFixed(2):0;
		        vm.expectProfit();//计算预期收益
				vm.viewModel.hbName="";
				vm.viewModel.couponId=null;
			}
		},
		choicePeriods:function(){
			//选择期数
			if(vm.picker){
			  vm.picker.show(function(items) {
				  if(items[0] && items[0].v && vm.viewModel.couponId!=items[0].v){
			           	  vm.viewModel.pName=items[0].t;
			              vm.viewModel.periods=items[0].v;
			              vm.viewModel.hbName="";
				          vm.viewModel.couponId=null;
				          if((vm.loanType==2 && vm.type==4) || vm.type==2){
				          	  vm.model.Rate=vm.getRate(items[0].v).toFixed(1)+'%';
				          }
				          vm.expectProfit();//计算预期收益
					 }
				});
			}
		}
	},
	filters:{
		getAmount:function(value){
			return value? sui.rmoney(value):'0.00';
		}
	}
});

mui('body').on('tap','span[id=Authorize]',function(){
	sui.open('../help/Authorize.html','Authorize.html',{},{},true,'授权委托书',false);
});
//一键全投切换
/*
var btnSwitch=document.querySelector('.mui-switch');
   btnSwitch.addEventListener('toggle',function(event){
	if(event.detail.isActive){
        var value=vm.model.AvailBal>vm.model.SurplusAmount?vm.model.SurplusAmount:vm.model.AvailBal;
        if(vm.model.MaxInvestAmount){
        	value=value>vm.model.MaxInvestAmount?vm.model.MaxInvestAmount:value;
        }
        vm.viewModel.amount=value?value:0;
	}else{
		vm.viewModel.amount="";
	}
	vm.expectProfit();//计算预期收益
   });
   */
  