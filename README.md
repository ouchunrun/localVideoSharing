## Description

该demo用于测试本地音视频共享功能

## 支持

- 支持的浏览器：chrome、firefox

- safari 和其他浏览器不支持 captureStream 接口


## usage

- 上传本地文件。如果浏览器支持captureStream接口，则能成功建立对等连接，能够发流。


## 通过captureStream获取流有两种方式：

- canvas.captureStream()
- video.captureStream()


## issues

- firefox存在的问题：本地和对端的任何一方静音，视频就会被静音。官方demo测试也是相同的 issues。

- 测试地址:https://webrtc.github.io/samples/src/content/capture/video-pc/

