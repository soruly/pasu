# 2FA

[![License](https://img.shields.io/github/license/soruly/2fa.svg?style=flat-square)](https://github.com/soruly/2fa/blob/master/LICENSE)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/soruly/2fa/Node.js%20Lint?style=flat-square)](https://github.com/soruly/2fa/actions)

Self hosted 2-factor authenticator PWA

## Features

- 2FA authenticator hosted on web
- Allow others to access the OTP of your accounts
- Installable PWA
- (TBC) Display timeout indicator
- (TBC) Scan QR Code instead of manual input
- (TBC) Show QR Code for copying to other devices

**Warning**

**It is dangerous to host 2FA authenticators on cloud.**
This PWA is not secured by any password. Everyone is able to access your OTP.
The author does not bear any losses caused by this app.

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
