/**
 * @author dingyong
 * @version 1.0.0 build 20171204
 * 统计相关信息（启动次数，用户，设备信息，网络信息等）
 */
(function(statistic) {
	var _innerClass = {
		platform: function(para) {
			return ['AppStore','360应用市场','腾讯应用宝','魅族应用商店','华为应用商店','百度手机助手','阿里应用分发平台','小米应用商店','OPPO应用商店'][para];
		},
		network: function() {
			var types = {};
			types[plus.networkinfo.CONNECTION_UNKNOW] = "未知";
			types[plus.networkinfo.CONNECTION_NONE] = "未连接网络";
			types[plus.networkinfo.CONNECTION_ETHERNET] = "有线网络";
			types[plus.networkinfo.CONNECTION_WIFI] = "WiFi网络";
			types[plus.networkinfo.CONNECTION_CELL2G] = "2G蜂窝网络";
			types[plus.networkinfo.CONNECTION_CELL3G] = "3G蜂窝网络";
			types[plus.networkinfo.CONNECTION_CELL4G] = "4G蜂窝网络";
			return types[plus.networkinfo.getCurrentType()];
		},
		isFirstOpen: function() {
			var flag = localStorage.getItem("QHLEAD_STATISTIC");
			var bool = true;
			if(flag) {
				bool = false;
			} else {
				localStorage.setItem("QHLEAD_STATISTIC", 'true');
			}
			return bool;
		},
		request: function(data) {
			var _this=this;
			sui.request('Home/Monitor', data, false, function(d) {
				if(d && d.IsPass)
					_this.isFirstOpen();
			   _innerClass=null;
			    statistic=null;
			},true);
		}
	};
	statistic.request = function(resourceVer) {
		var data = {
			EquipmentType: plus.device.model,
			EquipmentNo: plus.device.uuid,
			DownloadPlatform: _innerClass.isFirstOpen() ? _innerClass.platform(0) : '',
			WholePackageVer: plus.runtime.version,
			ResourceVer: resourceVer,
			Network: _innerClass.network(),
			OperatingSystem: plus.os.name + plus.os.version,
			DeviceSize:plus.screen.resolutionWidth + "x" + plus.screen.resolutionHeight,
			SourceChannel: plus.os.name == 'Android' ? 3 : 4
		};
		_innerClass.request(data);
	};
})(window.statistic = {});