var vm = new Vue({
	el: '#vue-app',
    data: {
    	w:null,
    	addrList:[],
    	isIos:false,
    	elem:null
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
  			setTimeout(function(){
  			   mui.os.ios&&(vm.isIos=true);
  				vm.w=sui.wait();
	    		vm.init();
	    	},sui.constNum());
  		},
		init:function(){					
		   vm.elem=sui.rmovetips(vm.elem);	
			sui.request('User/GetAddressList',{},true,function(data){	
				sui.closewait(vm.w);
				if(data){
					if(data.IsPass){
    				 	if(data.ReturnList && data.ReturnList.length){
						    vm.addrList=data.ReturnList;
						}else{
							vm.elem=sui.createtips('wujilu','暂无记录');
						}
	    			}else{
	    				mui.toast(data.Desc);
	    			}	
				}
			});		
		},
		goAddress:function(type,id){
		    sui.open('editAddress.html','editAddress.html',{type:type,eid:id},{},true,type==0?'新增地址':'编辑地址',false);
		},
		setDefault:function(item,e){
			   e.stopPropagation();
				vm.w=sui.wait();
				sui.request('User/SetDefaultAddress',{id:item.Id},true,function(data){		
					sui.closewait(vm.w);
					if(data){
						if(data.IsPass){
							mui.toast("设置成功");
							vm.init();						
						}else{
							setTimeout(function(){
								item.IsDefault = false;	
							},50);
		    				mui.toast(data.Desc);						
						}
					}else{
						setTimeout(function(){
							item.IsDefault = false;	
						},50);
					}
				});		
		},
		deleteData:function(index,id){				
			var bts=[{title:"确认",style:"destructive"}];
		    plus.nativeUI.actionSheet({title:"确认删除该地址吗？",cancel:"取消",buttons:bts},function(e){
				if (e.index == 1) {
					vm.w=sui.wait();
					sui.request('User/DelAddress',{id:id},true,function(data){
						sui.closewait(vm.w);
						if(data){
						  if(data.IsPass){
								vm.addrList.splice(index,1);	
								mui.toast("删除成功");
								if(!vm.addrList.length){
									vm.elem=sui.createtips('wujilu','暂无记录');
								}
				    		}else{
			    				mui.toast(data.Desc);
			    			}
						}
					});	
				}
			 });
		}
	}
});