#!/bin/bash

echo "转码中..."
while read c1 c2 c3; do
    ffmpeg -i video/"$c3.ts" -c:v libx264 -c:a aac video/"$c3.mp4"
done < list.txt
echo "转码完成！"
