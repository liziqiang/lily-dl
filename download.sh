#!/bin/bash
echo "音频下载中..."
mkdir -p audio
while read c1 c2 c3; do
    wget "$c2" -O ./audio/"$c3.mp3"
done < list.txt
echo "音频下载完成！"

echo "视频下载中..."
mkdir -p video
while read c1 c2 c3; do
    ./m3u8-macos-mojave-build -u=$c1 -o=./video -c=30
    mv video/merged.ts video/"$c3.ts"
done < list.txt
echo "视频下载完成！"

echo "转码中..."
while read c1 c2 c3; do
    ffmpeg -i video/"$c3.ts" -c:v libx264 -c:a aac video/"$c3.mp4"
done < list.txt
echo "转码完成！"
