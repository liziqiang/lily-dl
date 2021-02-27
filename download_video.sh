#!/bin/bash

echo "视频下载中..."
mkdir -p video
rm -rf video/*
# ./m3u8_downloader -f=list_video.txt -o=./video
while read c1 c2; do
    ./m3u8_downloader -u=$c1 -o=./video
    mv video/main.ts video/"$c2.ts"
done < list_video.txt
echo "视频下载完成！"
