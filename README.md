# pasu

Self-hosted [TOTP](https://en.wikipedia.org/wiki/Time-based_one-time_password) authenticator PWA with [FIDO2](https://en.wikipedia.org/wiki/FIDO2_Project) ([WebAuthn](https://en.wikipedia.org/wiki/WebAuthn))

[![License](https://img.shields.io/github/license/soruly/pasu.svg?style=flat-square)](https://github.com/soruly/pasu/blob/master/LICENSE)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/soruly/pasu/Node.js%20Lint?style=flat-square)](https://github.com/soruly/pasu/actions)

![](https://images.plurk.com/3TaPd8iaPPEI6OhZ9sAJfF.png)

## Features

- 2FA secrets stored in your own server instead of your own device
- Codes are generated on server side and push to all clients via server-sent events
- Installable PWA
- Allow others to access the OTP of your accounts
- or, Secured by FIDO2 (WebAuthn)
- User-Agent block list
- IP block list

Notes: FIDO2 (WebAuthn) is not enabled in demo server

**Warning**

**This PWA is open to public by default.**\
Everyone is able to access your OTP. Do not use it for any serious businesses.\
The author does not bear any losses caused by this app.

## Getting Started

Prerequisites: nodejs >= 16

```
git clone https://github.com/soruly/pasu.git
cd pasu
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
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_pass http://127.0.0.1:3000;
}
```

### Environment Variables

- Copy `.env.example` to `.env`
- Edit `.env` as you need

```
SERVER_PORT=3000        # (optional) Default: 3000
SERVER_ADDR=127.0.0.1   # (optional) Default: 127.0.0.1
SERVER_NAME=localhost   # the app doesn't work without HTTPS, you need a valid hostname
#BLACKLIST_UA=Bot|MSIE|Bytespider|Baidu|Sogou|FB_AN|FB_IOS|FB_IAB|Instagram
#WHITELIST_COUNTRY=ZZ|HK|TW
#GEO_LITE_COUNTRY_PATH=/etc/GeoIP/GeoLite2-Country.mmdb
#GEO_LITE_ASN_PATH=/etc/GeoIP/GeoLite2-ASN.mmdb
#ENABLE_FIDO2=1          # when ENABLE_FIDO2 is not set (default), the server is public
#ALLOW_REGISTER=1        # when ALLOW_REGISTER is not set (default), no new devices can be registered
```

To register a new device with WebAuthn, turn on both `ENABLE_FIDO2` and `ALLOW_REGISTER`, then visit `https://your.server/reg` to continue. It is suggested you turn off ALLOW_REGISTER when not needed.

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
