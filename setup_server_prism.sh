#!/bin/bash

#triton create --wait --name=prism-{name} --network=zones webproject z1-standard --script={path to script}

webprojctl enable mongodb
sudo apt update 

#make sure node 16 is on th server
npm i -g n && n 16
hash -r

#create folders
mkdir /var/www/prism-server
mkdir /var/www/prism-client

#create prism service file
echo "[Unit]
Description=Prism Server
After=mongodb.service

[Service]
Type=simple
User=root
Environment=PORT=8000
# Replace with the actual directory
WorkingDirectory=/var/www/prism/server
ExecStart=/usr/local/bin/node ./dist/main.js 
# Theoretically keeps trying indefinitely
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target" > /etc/systemd/system/prism.service

#edit where nginx points to, 'root /var/www/htdocs'  -->  'root /var/www/prism/client/build'
sed -i 's,root         /var/www/htdocs,root         /var/www/prism-client/build,g' /etc/nginx/sites-enabled/https-site

#edit nginx permisssion
echo "
map \$uri \$acl {

   #default            'allow:user:*';
   default             'allow:*';
   /favicon.ico        'allow:*';
}" > /etc/nginx/conf.d/auth.conf


#create nginx proxy to server
echo "location /ping {
        access_log off;
        return 200 'pong';
}

location / {
        # kill cache
        add_header Last-Modified $date_gmt;
        add_header Cache-Control 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0';
        add_header Access-Control-Allow-Origin *;
        if_modified_since off;
        expires off;
        etag off;

        try_files $uri $uri/ @dflapp;
}

location @dflapp {
        proxy_pass http://127.0.0.1:8000;
        include proxy_params;
}" > /etc/nginx/frameworks-enabled/prism.conf




#enable services
sudo systemctl restart nginx
sudo systemctl enable prism.service
systemctl restart prism


#set up bitbucket ssh access
echo "Host bitbucket.org
    IdentityFile ~/.ssh/id_rsa
    IdentitiesOnly yes
    StrictHostKeyChecking no" > ~/.ssh/config