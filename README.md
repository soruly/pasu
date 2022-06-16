# 2FA

[![License](https://img.shields.io/github/license/soruly/2fa.svg?style=flat-square)](https://github.com/soruly/2fa/blob/master/LICENSE)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/soruly/2fa/Docker%20Image%20CI?style=flat-square)](https://github.com/soruly/2fa/actions)

Self hosted 2-factor authentication PWA

## Features

- Installable PWA
- (TBC) Display timeout indicator
- (TBC) Scan QR Code instead of manual input
- (TBC) Show QR Code for copying to other devices

## Getting Started

Prerequisites: nodejs >= 16

```
git clone https://github.com/soruly/2fa.git
cd 2fa
npm install
node server.js
```

Note: In order for PWA to work, you must host the server behind a reverse proxy (like nginx) with HTTPS

Example nginx config:

```
location / {
  proxy_set_header Host $host;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection upgrade;
  proxy_buffering off;
  proxy_cache off;
  proxy_pass http://127.0.0.1:3000;
}
```

### Environment Variables

- Copy `.env.example` to `.env`
- Edit `.env` as you need

```
SERVER_PORT # (optional) Default: 3000
SERVER_ADDR # (optional) Default: 127.0.0.1
```

### Run by pm2

You also can use [pm2](https://pm2.keymetrics.io/) to run this in background.

Use below commands to start / restart / stop server.

```
npm run start
npm run stop
npm run reload
npm run restart
npm run delete
```
