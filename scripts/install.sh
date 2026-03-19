#!/bin/bash
export PATH=/opt/alt/alt-nodejs24/root/usr/bin:$PATH
echo "Node Version: $(node -v)"
echo "NPM Version: $(npm -v)"
cd ~/domains/mediumslateblue-chimpanzee-606025.hostingersite.com/public_html
npm install --omit=dev
echo "Install complete"
