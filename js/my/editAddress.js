var vm=new Vue({
	el:"#vue-app",
	data:{
		w:null,
		addressFrom: {
			ShouHuoRen: null,
			Phone: null,
			Address: null,
			IsDefault: true,
			Area: null,
			AreaCode:null
		},
		cityPicker:null,
		type:0,
	    Id:null
	},
	mounted: function () {
    	this.$nextTick(function () {
    		vm.cityPicker = new mui.PopPicker({
				layer: 3
			});
		   vm.cityPicker.setData(cityData3);
    		if(window.plus){
			    vm.plusReady();
			}else{
			    document.addEventListener('plusready',vm.plusReady,false);
			}	
    	});    	    	    	
    },
	methods:{
		plusReady:function(){
			var curr = plus.webview.currentWebview();
			vm.Id=curr.eid;
			vm.type = curr.type;
			if(vm.type==1){
				setTimeout(function(){
		    		vm.init();
		    	},sui.constNum());
			}
		},
		init:function(){					
			//获取编辑列表
			vm.w=sui.wait();
			sui.request('User/GetAddress',{id:vm.Id},true,function(data){	
				sui.closewait(vm.w);
				if(data){
					if(data.IsPass){
					    vm.addressFrom=data.ReturnObject;
						var guideArr=data.ReturnObject2.trim().split('^');
						var guideLen=guideArr.length;
		                if(guideLen>=2){
				   		   vm.cityPicker.pickers[0].setSelectedValue(guideArr[1],0,function(){
				   		   	   if(guideLen>=3){
				   		   	   	   vm.cityPicker.pickers[1].setSelectedValue(guideArr[2],0,function(){
				   		   	   	   		if(guideLen>=4){
				   		   	   	   			vm.cityPicker.pickers[2].setSelectedValue(guideArr[3]);
				   		   	   	   		}
				   		   	   	   });
				   		   	    }
				   		   });
					    }
	    			}else{
	    				mui.toast(data.Desc);
	    			}
				}
			});				
		},
		picker:function(){
			document.activeElement.blur();
			setTimeout(function(){
				vm.cityPicker.show(function(items) {								
					vm.addressFrom.Area=(items[0].t||"")+(items[1].t||"")  + (items[2].t||"");
					vm.addressFrom.AreaCode=items[2].v || items[1].v || items[0].v;
				});
			},250);
		},
		btnSwitch:function(event){
			if(event.detail.isActive) {
				vm.addressFrom.IsDefault = true;
			} else {
				vm.addressFrom.IsDefault = false;
			}
		},
		btnCommit: function() {
			if( sui.IsNullOrEmpty(this.addressFrom.ShouHuoRen)){
				mui.toast('请填写收货人姓名');
				return;
			}else if(sui.IsNullOrEmpty(this.addressFrom.Phone)){
				mui.toast('请输入收货人手机号码');
				return;
			}else if(!this.addressFrom.Phone.isMobile()) {
				mui.toast("请输入正确的手机号码");
				return;
			}else if(sui.IsNullOrEmpty(this.addressFrom.Area)){
				mui.toast('请选择所在省份/城市/地区');
				return;
			}else if(sui.IsNullOrEmpty(this.addressFrom.Address)){
				mui.toast('详细地址不能为空');
				return;
			}else if(this.addressFrom.Address.length<5){
				mui.toast('详细地址不少于5个字');
				return;
			}			
			vm.w=sui.wait(true,true,'正在保存...');
			var postUrl=vm.type==0?'AddAddress':'ModifyAddress';
			sui.request('User/'+postUrl,vm.addressFrom,false,function(data){		
				vm.w=sui.closewait(vm.w,true);
				if(data){
					if(data.IsPass){
						var address=plus.webview.getWebviewById('address.html');
						address&&address.evalJS('vm.init();');					
						mui.toast("保存成功");
						plus.webview.currentWebview().close();					
	    		   }else{
	    				mui.toast(data.Desc);
	    			}		
				}
			});	
		}
	}
});