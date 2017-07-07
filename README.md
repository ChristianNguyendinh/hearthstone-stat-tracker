# Hearthstone Stat Tracker  
  
Hearthstone Stat Tracker is a side project that was aimed at helping me learn D3, and the basics of a login system.   
The application runs on NodeJS, uses ExpressJS for the backend web framework, PostgreSQL for the database, Bootstrap as the frontend framework, Embedded JS for templating, D3 for visualizing the data, and Heroku for deployment.  
It allows users to login, enter game results for a play session, track those sessions results, then view data visualizations for their overall stats.  
The login system is very basic, and currently only hashes the password for security. I'll implement the things under the 'FUTURE' section eventually to remedy this.  
  
<img src="https://raw.githubusercontent.com/ChristianNguyendinh/hearthstone-stat-tracker/master/doc/screenshot.png" width="700" />  
  
  
--------------------------    
  
### Set Up:  
Needs a PostgreSQL server running in the background  
Create the table schemas provided in the 'schema' file  
Put the proper url to the PostgreSQL server in the config file  
Set a desired secret in the config file for password hashing  
Set a desired secret in 'main.js' for encryption of session cookies  
npm install  
node main.js  
Go to 127.0.0.1:3000/
  
### FUTURE:  
Protect API  
Improve Login System (more info, salting, password recovery, etc.)  
Customizable User Profiles  