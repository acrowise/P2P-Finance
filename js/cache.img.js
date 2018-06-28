/**
 * @author dingyong
 * @version 1.0.1 build 20171204
 * 图片缓存 ，图片使用 （未下载先下载，已下载，直接使用本地图片）
 */
var cache = {};
(function(cache) {
	var _innerClass = {
		setImgFromLocal: function(imgId, relativePath, callback) {
			var sd_path = plus.io.convertLocalFileSystemURL(relativePath);
			var elem = document.getElementById(imgId);
			if(elem) {
				elem.src = sd_path;
			}
			setTimeout(function() {
				callback && callback();
			}, 50);
		},
		setImgFromNet: function(imgId, loadUrl, relativePath, callback) {
			var _this = this;
			var dtask = plus.downloader.createDownload(loadUrl, {}, function(d, status) {
				if(status == 200) {
					_this.setImgFromLocal(imgId, d.filename, callback);
				} else {
					if(relativePath != null) {
						var elem = document.getElementById(imgId);
						if(elem) {
							elem.src = loadUrl;
						}
						_this.delFile(relativePath);
						setTimeout(function() {
							callback && callback();
						}, 50);
					}
				}
			});
			dtask.start();
		},
		delFile: function(relativePath) {
			plus.io.resolveLocalFileSystemURL(relativePath, function(entry) {
				entry.remove(function(entry) {}, function(e) {});
			});
		}
	};
	cache.setImg = function(imgId, loadUrl, callback) {
		if(imgId == null || loadUrl == null || loadUrl == '') {
			setTimeout(function() {
				callback && callback();
			}, 10);
			return;
		}
		var filename = loadUrl.substring(loadUrl.lastIndexOf("/") + 1, loadUrl.length);
		var relativePath = "_downloads/" + filename;
		plus.io.resolveLocalFileSystemURL(relativePath, function(entry) {
			_innerClass.setImgFromLocal(imgId, relativePath, callback);
		}, function(e) {
			_innerClass.setImgFromNet(imgId, loadUrl, relativePath, callback);
		});
	};
}(cache));