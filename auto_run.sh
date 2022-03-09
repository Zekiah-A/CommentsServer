#!/bin/bash
while true
do
	if [ $# -eq 0 ]
	  	then
			echo "[!] No arguments supplied, all server stdout will be redirected to file server.log"
			echo "Autostarted webserver with HTTPS."
			sudo node main.js > server.log 2>&1
		else
			echo "[!] Arguments supplied, defaulting to verbose console output"
			echo "Autostarted webserver with HTTPS."
			sudo node main.js
	fi
	sleep 1
done

