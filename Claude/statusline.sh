#!/bin/bash
input=$(cat)

current_dir=$(echo "$input" | jq -r '.workspace.current_dir')
model_name=$(echo "$input" | jq -r '.model.display_name')
output_style=$(echo "$input" | jq -r '.output_style.name')
dir_name=$(basename "$current_dir")

# Git info
git_info=""
if git -C "$current_dir" rev-parse --git-dir >/dev/null 2>&1; then
    branch=$(git -C "$current_dir" branch --show-current 2>/dev/null || echo 'detached')
    if [ -n "$(git -C "$current_dir" status --porcelain 2>/dev/null)" ]; then
        git_info=" git:($branch) ✗"
    else
        git_info=" git:($branch)"
    fi
fi

# Context window usage
context_size=$(echo "$input" | jq -r '.context_window.context_window_size')
usage=$(echo "$input" | jq '.context_window.current_usage')

if [ "$usage" != "null" ] && [ "$context_size" != "null" ] && [ "$context_size" -gt 0 ] 2>/dev/null; then
    total=$(echo "$usage" | jq '.input_tokens + .cache_creation_input_tokens + .cache_read_input_tokens')
    pct=$((total * 100 / context_size))
else
    pct=0
fi

# Color code based on usage
if [ "$pct" -lt 25 ]; then
    col="\033[32m"      # Green
elif [ "$pct" -lt 50 ]; then
    col="\033[33m"      # Yellow
elif [ "$pct" -lt 75 ]; then
    col="\033[38;5;208m" # Orange
else
    col="\033[31m"      # Red
fi

printf "\033[38;5;184m%s\033[0m%s \033[2m| %s | %s | Context: ${col}%d%%\033[0m" \
    "$dir_name" "$git_info" "$model_name" "$output_style" "$pct"
