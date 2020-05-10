Getting Started

Server Running Steps:
- Ensure pm2 has been installed as a global package. If not run "npm i --g pm2"
- Run the following commands to start up 4 seperate instances of the server
	- pm2 start server.js -f -- 3002
	- pm2 start server.js -f -- 3003
	- pm2 start server.js -f -- 3004
	- pm2 start server.js -f -- 3005
- Setup nginx on your system with a configuration as per below as a load balancer:
	upstream app_servers {
		server 127.0.0.1:3002;
		server 127.0.0.1:3003;
		server 127.0.0.1:3004;
		server 127.0.0.1:3005;
	}

    server {
        listen       80;
        server_name  localhost;

        location / {
            proxy_set_header	X-Real-IP $remote_addr;
			proxy_set_header	Host	$http_host;
			proxy_pass			http://app_servers;
        }
- The server will then be accessible through http://localhost



Useful Links

- Tutorial to learn and get started in creating a RESTful API
https://www.codementor.io/@olatundegaruba/nodejs-restful-apis-in-10-minutes-q0sgsfhbd

- Tutorial to learn and get started in creating a react Appp
https://reactjs.org/tutorial/tutorial.html

