ECHO Off
REM copies the compiled config.js file to the other project folders
ECHO Checking for compiled config.js
IF EXIST "config.js" (
  ECHO Copying configuration file
  xcopy .\config.js ..\chapter-04\ /y
  xcopy .\config.js ..\chapter-05\ /y
  xcopy .\config.js ..\chapter-06\ /y
  xcopy .\config.js ..\chapter-07\ /y
  xcopy .\config.js ..\chapter-08\ /y
) ELSE (
  ECHO File does not EXIST
  ECHO Please run the `tsc` command, and try again
)
