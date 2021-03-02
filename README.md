# lily-dl

下载Lily英语课程视频及音频

## 使用
1. 先安装插件，可以在谷歌应用商店搜索[Lily Downloader](https://chrome.google.com/webstore/detail/lily-downloader/bicfofcalgnhfemingaindalckjpbpcj)下载安装，或者通过`chrome-extension`安装插件，具体方法可以百度
2. 登录帐号后点击右上角插件icon会自动获取课程列表，点击对应课程会把改课程中的视频和音频下载链接导出
3. 把下载的文件保存到工程根目录中；然后可以直接运行`download.sh`下载全部，也可以分别运行下载音频、视频

PS: 有时候下载的时候可能不会把所有的文件都下载，原因是部分m3u8文件格式错误导致的，从列表中去除该文件后重试即可

## References
[m3u8下载工具](https://github.com/sudot/m3u8/tree/v1.3)
