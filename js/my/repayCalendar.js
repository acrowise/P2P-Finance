var vm = new Vue({
	el: '#vue-app',
    data: {
    	model:{
		  StateList:[]
    	},
    	isIos:false,
    	week:0,
    	picker:null
    },
    mounted: function () {
    	this.$nextTick(function () {
    		vm.picker=new mui.DtPicker({"type":"month"});
    		if(window.plus) {
				vm.plusReady();
			} else {
				document.addEventListener('plusready', vm.plusReady, false);
			}
    	});
    },
  	methods: {	
  		plusReady:function(){
  			setTimeout(function(){
  				vm.init(null,-99);
    			mui.os.ios && (vm.isIos=true);
    		},sui.constNum());
  		},
	    href:function(state,index){
	    	//日历详情
	    	if(state!=2){
	    		 var d=sui.formatDate('y-m',this.model.CurrentDate)+"-"+(index+1);
	    		 sui.open('repayCalendarDetail.html','repayCalendarDetail.html',{d:d},{},true,"还款日历",false);
	    	}
	    },
	    init:function(refundDate,upOrDown){
	    	var w=sui.wait();
	    	sui.request('Refund/RefundCalendar',{refundDate:refundDate,upOrDown:upOrDown},true,function(data){
	    		if(data){
	    			if(data.IsPass){
	    			  vm.model=data.ReturnObject;
	    			}else{
	    				mui.toast(data.Desc);
	    			}
	    		}
	    		sui.closewait(w);
	    	});
	    },
		getDay:function(d){
			 //d:2018-01，根据日期得到星期几， 返回0-6  周日-0
			this.week= new Date(d).getDay();
		},
		getNewDate:function(d){
			//根据日期获取新日期格式返回
			return d.toLocaleString().replace(/[年月]/g,'-').replace(/[日上下午]/g,'');
		},
		getDate:function(value){
			//格式化日期
			var d=this.getNewDate(new Date());
			this.getDay(sui.formatDate('y-m',value?value:d));
			return sui.formatDate('y年m月',value?value:d);
		},
		isEquals:function(index){
			//判断当前日期
			var active=false;
			if(sui.formatDate('y-m',this.model.CurrentDate)==sui.formatDate('y-m',this.model.Today) && index==sui.formatDate('d',this.model.Today)){
				active=true;
			}
			return active;
		},
		upOrDown:function(value){
			//上下月份切换
		    vm.init(this.model.CurrentDate,value?1:0);
		},
		btnPicker:function(){
			//日期选择器
		    this.picker.show(function(rs) {
		    	vm.init(rs.t,-99);
			});
		},
		refresh:function(){
			vm.init(vm.model.CurrentDate,-99);
		}
	},
	filters:{
		format:function(value){
			return value?sui.rmoney(value):'0.00';
		}
	}
});