#!/usr/bin/env bash
# Joins clips/s01..s11.mp4 with 0.5 s dissolves into vinyl-shutter-install.mp4,
# with a fade up from black at the head and a fade out at the tail.
set -euo pipefail
cd "$(dirname "$0")"
XF=0.5
clips=(clips/s{01,02,03,04,05,06,07,08,09,10,11}.mp4)
inputs=(); for c in "${clips[@]}"; do inputs+=(-i "$c"); done

filter=""; prev="[0:v]"; offset=0
for i in $(seq 1 $((${#clips[@]} - 1))); do
  d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "${clips[$((i - 1))]}")
  offset=$(python3 -c "print(round($offset + $d - $XF, 3))")
  filter+="${prev}[$i:v]xfade=transition=fade:duration=$XF:offset=$offset[v$i];"
  prev="[v$i]"
done
total=$(python3 -c "print(round($offset + $(ffprobe -v error -show_entries format=duration -of csv=p=0 "${clips[-1]}"), 3))")
filter+="${prev}fade=t=in:st=0:d=0.6,fade=t=out:st=$(python3 -c "print($total - 0.8)"):d=0.8[out]"

ffmpeg -y -loglevel error "${inputs[@]}" -filter_complex "$filter" -map "[out]" \
  -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -movflags +faststart vinyl-shutter-install.mp4
echo "wrote vinyl-shutter-install.mp4 (${total}s)"
