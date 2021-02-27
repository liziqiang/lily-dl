#!/bin/bash

echo "音频下载中..."
mkdir -p audio
rm -rf audio/*
while read c1 c2; do
    wget "$c1" -O ./audio/"$c2.mp3"
done < list_audio.txt
echo "音频下载完成！"
