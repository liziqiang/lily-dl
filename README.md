# lily-dl

下载Lily英语课程视频及音频

## 依赖
```
brew install ffmpeg
```

## 使用
首先登录帐号，然后获取需要下载的课程id，在页面运行`getLists.js`中的方法获取下载列表，然后保存到工程的list.txt中；然后可以直接运行`download.sh`下载全部，也可以分别运行下载音频、视频以及把ts转mp4
