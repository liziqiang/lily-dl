#!/bin/bash

echo "转码中..."
input=""
output=""
while read c1 c2 c3; do
    input=$input"-i $c3.ts "
    output=$output"$c3.mp4 "
done < list.txt
cd video
ffmpeg $input -c:v libx264 -c:a aac $output
echo "转码完成！"
