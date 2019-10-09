#!/bin/bash

pkill -ef "chrome"
pkill -ef "yarn"
pkill -ef "http.server"

# Set correct display mode
#xrandr --output DP-1 --rotate normal
#xrandr -s 1280x800

# Start client
cd ~/installation
yarn build

# Start client server
cd ~/installation/dist
python3 -m http.server 9000 &

up=0
while [ $up -eq 0 ]
do
  echo "Waiting for server..."
  sleep 1
  wget http://localhost:9000 -O - 2>/dev/null | grep "Installation RUNNING" > /dev/null && up=1
done

# Start browser
rm -rf ~/.cache/google-chrome/Default

/opt/google/chrome/chrome --disable-features=InfiniteSessionRestore --password-store=basic --ignore-urlfetcher-cert-requests --no-default-browser-check --no-first-run --noerrdialogs --disable-infobars --disable-session-crashed-bubble --kiosk --app=http://localhost:9000/index.html & browser_pid=$!

# Hide mouse cursor when inactive
sleep 3
unclutter -idle 1 &

# Activate browser window
xdotool mousemove 50 50 click 1

# Wait for browser to quit
echo "OK!"

wait $browser_pid
