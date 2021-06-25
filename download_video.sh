#!/bin/bash

echo "视频下载中..."
rm -rf movie/*
while read c1 c2; do
    ./m3u8_downloader -u=$c1 -o=$c2
done < list_video.txt
echo "视频下载完成！"
