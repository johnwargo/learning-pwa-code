#!/bin/bash
# Copies the compiled config.js file to the other project folders
echo "Checking for compiled config.js"
FILE=./config.js
if test -f "$FILE"; then
  cp -v "$FILE" ../chapter-04
  cp -v "$FILE" ../chapter-05/pwa-news  
else 
  echo $FILE does not exist
  echo Please run the tsc command, and try again
fi
