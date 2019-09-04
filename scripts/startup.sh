#!/bin/bash

pkill -ef "chrome"
pkill -ef "gulp"
pkill -ef "http.server"

# Roll logs
mkdir ~/log

cp ~/log/client.log.2 ~/log/client.log.3
cp ~/log/client.log.1 ~/log/client.log.2
cp ~/log/client.log ~/log/client.log.1

# Build project
cd ~/installation
/usr/local/bin/gulp build

# Start web server
cd ~/installation/build
python3 -m http.server 9000 > ~/log/client.log 2>&1 &

up=0
while [ $up -eq 0 ]
do
  echo "Waiting for server..."
  sleep 1
  wget http://localhost:9000 -O - 2>/dev/null | grep "Installation RUNNING" > /dev/null && up=1
done

# Start browser
rm -rf ~/.cache/google-chrome/Default
/opt/google/chrome/chrome --disable-features=InfiniteSessionRestore --password-store=basic --ignore-urlfetcher-cert-requests --noerrdialogs --disable-infobars --disable-session-crashed-bubble --kiosk http://localhost:9000/index.html & browser_pid=$!

# Hide mouse cursor when inactive
sleep 10
unclutter -idle 1 &

# Activate browser window
xdotool mousemove 50 50 click 1

# Wait for browser to quit
echo "OK!"

wait $browser_pid
