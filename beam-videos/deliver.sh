#!/usr/bin/env bash
# Make a <28 MB 1080p delivery copy of a master render (two-pass x264 at a computed bitrate).
set -euo pipefail
FF=$(python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())")
in="$(realpath "$1")"; out="${in%.mp4}_share.mp4"
dur=$( ($FF -i "$in" 2>&1 || true) | sed -n 's/.*Duration: \([0-9:.]*\).*/\1/p' | awk -F: '{print $1*3600+$2*60+$3}')
vk=$(awk -v d="$dur" 'BEGIN{printf "%d", (27.0*8*1024*1024/d)/1000 - 160}')
$FF -y -loglevel error -i "$in" -c:v libx264 -preset slow -b:v ${vk}k -pass 1 -passlogfile /tmp/x264_$$ -an -f mp4 /dev/null
$FF -y -loglevel error -i "$in" -c:v libx264 -preset slow -b:v ${vk}k -pass 2 -passlogfile /tmp/x264_$$ -c:a aac -b:a 160k -movflags +faststart "$out"
rm -f /tmp/x264_$$*
ls -la "$out"
