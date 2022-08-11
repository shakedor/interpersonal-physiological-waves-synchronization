@echo off
:: go to server folder and run npm start in seperate terminal
cd [path_to_the_project]\interpersonal-physiological-waves-synchronization\server
start /B cmd.exe /k "npm start"
:: go to client folder and run npm start in seperate terminal
cd ..
cd .\client
start /B cmd.exe /k "npm start"