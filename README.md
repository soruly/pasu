# pasu

Self-hosted [TOTP](https://en.wikipedia.org/wiki/Time-based_one-time_password) authenticator PWA with [FIDO2](https://en.wikipedia.org/wiki/FIDO2_Project) ([WebAuthn](https://en.wikipedia.org/wiki/WebAuthn))

[![License](https://img.shields.io/github/license/soruly/pasu.svg?style=flat-square)](https://github.com/soruly/pasu/blob/master/LICENSE)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/soruly/pasu/node.js.yml?style=flat-square)](https://github.com/soruly/pasu/actions)

![](https://user-images.githubusercontent.com/1979746/174454681-5d9cc324-bddc-4516-9452-f64a97311db4.png)
![](https://user-images.githubusercontent.com/1979746/174454683-0ee0128f-3be1-4e44-8787-88c04784ab9e.png)

## Features

- 2FA secrets stored in your own server instead of your own device
- Codes are generated on server side and push to all clients via server-sent events
- Installable PWA
- Allow others to access the OTP of your accounts
- or, Secured by FIDO2 (WebAuthn)
- Support password-less login via Fingerprint/TouchID/Windows Hello/YubiKey/pin code via [FIDO2](https://github.com/webauthn-open-source/fido2-lib)
- User-Agent block list
- IP block list

**Warning**

**This PWA is open to public by default.**\
Everyone is able to access your OTP. Do not use it for any serious businesses.\
The author does not bear any losses caused by this app.

## Demo

https://user-images.githubusercontent.com/1979746/174453876-f4d81b10-bf43-41b9-b135-442b68234660.mp4

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
