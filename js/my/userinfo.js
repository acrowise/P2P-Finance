var vm=new Vue({
	el: '#vue-app',
    data: {
    	rpath:null,
    	pic:'../../images/my-logo.png',
    	isRealAuth:false,
    	riskType:'',
    	userName:"头像",
    	w:null
    },
    mounted: function () {
    	this.$nextTick(function () {
    		 if(window.plus){
			 	    setTimeout(function(){
			 	      vm.w=sui.wait();
	    			   vm.init();
	    			},sui.constNum());
			   }else{
			     document.addEventListener('plusready',vm.init,false);
			 }	
    	});
    },
  	methods: {
  		init:function(){
		    	sui.request('User/UserCenter',{},true,function(data){
		    		vm.w&&sui.closewait(vm.w);
		    		if(data){
		    			if(data.IsPass){
		    			    var param=data.ReturnObject;
		    			    vm.pic=param.Photo||"../../images/my-logo.png"; 
		    			    vm.isRealAuth=param.IsRealAuth;
		    			    vm.riskType=param.RiskRating;
		    			    vm.userName=param.UserName;
		    			}else{
		    				mui.toast(data.Desc);
		    			}
		    		}
		    	});
	    },
	    changeImg:function(pic){
	    	vm.pic=pic;
	    },
	    updateRiskType:function(type){
	    	vm.riskType=type;
	    },
  		plusReady:function(){
  			 if(window.plus){
			     vm.upload();
			   }else{
			     document.addEventListener('plusready',vm.upload,false);
			 }	
  		},
	    href:function(data){
	    	if(data.id=='riskEvaluation.html'){
	    		sui.open(data.url,data.id,{already:vm.riskType},{},true,data.name,false);
	    	}else{
	    		data.title? sui.open(data.url,data.id,{},{},true,data.name,false):sui.open(data.url,data.id);
	    	}
	    },
	    realAuth:function(){
	    	if(!this.isRealAuth){
	    		sui.open('../bank/openingAccount.html','openingAccount.html',{},{},true,'开通银行存管',false);
	    	}else{
	    		//去修改信息
	    		mui.toast('您已开通银行存管账户');
	    	}
	    },
	    upload:function(){
	    	//上传头像
	    	var btnArray = [{title: "拍照"}, {title: "从相册选择"}];
	    	plus.nativeUI.actionSheet({title: "选择照片",cancel: "取消",buttons: btnArray}, function(e) {
					var index = e.index;
					if(index==1){
						var cmr = plus.camera.getCamera();
							cmr.captureImage(function(path) {
								var w=sui.wait(true,true,'请稍候...');
                                var local="file://" +decodeURIComponent(plus.io.convertLocalFileSystemURL(path));
                                var cpath='_documents/'+sui.unique()+'.jpg';
                                vm.compressImage(local,cpath,function(data){
                                	var temp='';
                                	if(data.success){
                                		 temp="file://" + plus.io.convertLocalFileSystemURL(data.path);
                                	}else{
                                		temp=data.path;
                                	}
                                	w=sui.closewait(w,true);
                                	sui.open('upload.html','upload.html',{path:temp});	
                                });
                                
							}, function(err) {});
					}else if(index==2){
						plus.gallery.pick(function(path) {
							var w=sui.wait(true,true,'请稍候...');
							 var cpath='_documents/'+sui.unique()+'.jpg';
                             vm.compressImage(decodeURIComponent(path),cpath,function(data){
                            	var temp='';
                            	if(data.success){
                            		 temp="file://" + plus.io.convertLocalFileSystemURL(data.path);
                            	}else{
                            		temp=data.path;
                            	}
                            	w=sui.closewait(w,true);
                            	sui.open('upload.html','upload.html',{path:temp});	
                            });
						}, function(err) {}, null);
					}
				});
	     },
	     compressImage:function(path,cpath,callback){
	     	  vm.rpath&&vm.removeFile(vm.rpath);
	     		plus.zip.compressImage({
						src: path,
						dst: cpath,
						quality: 40,
						overwrite: true,
						format: 'jpg',
						width: '100%',
						height: 'auto'
					},
					function(i) {
						vm.rpath=cpath;
						var data={path:cpath,success:true};
						callback(data);
					},
					function(e) {
						var data={path:path,success:false};
						callback(data);
				});
		},
		removeFile:function(relativePath){
			  plus.io.resolveLocalFileSystemURL(relativePath, function(entry) {
		         entry.remove(function(entry) {}, function(e) {});
			  });
	    }
	}
});