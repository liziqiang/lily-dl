#!/bin/bash

echo "视频下载中..."
mkdir -p video
rm -rf video/*
./m3u8_downloader -f=list_video.txt -o=./video
echo "视频下载完成！"
