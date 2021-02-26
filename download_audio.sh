#!/bin/bash

echo "音频下载中..."
mkdir -p audio
while read c1 c2 c3; do
    wget "$c2" -O ./audio/"$c3.mp3"
done < list.txt
echo "音频下载完成！"
