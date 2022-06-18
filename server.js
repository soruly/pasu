import "dotenv/config.js";
import fs from "fs-extra";
import path from "path";
import crypto from "crypto";
import { performance } from "perf_hooks";
import express from "express";
import rateLimit from "express-rate-limit";
import getIpInfo from "./src/get-ip-info.js";

const {
  SERVER_ADDR = "0.0.0.0",
  SERVER_PORT = 3000,
  BLACKLIST_UA,
  WHITELIST_COUNTRY,
} = process.env;

const app = express();

app.disable("x-powered-by");

app.set("trust proxy", 1);
app.set("view engine", "ejs");
app.set("views", path.resolve("."));

app.use((req, res, next) => {
  const { ASN, country } = getIpInfo(req.ip);
  res.locals.ASN = ASN;
  res.locals.country = country;
  next();
});

app.use((req, res, next) => {
  const startTime = performance.now();
  console.log(
    "=>",
    new Date().toISOString(),
    req.ip,
    res.locals.country.isoCode,
    res.locals.ASN.autonomousSystemNumber,
    req.path
  );
  res.on("finish", () => {
    console.log(
      "<=",
      new Date().toISOString(),
      req.ip,
      res.locals.country.isoCode,
      res.locals.ASN.autonomousSystemNumber,
      req.path,
      res.statusCode,
      `${(performance.now() - startTime).toFixed(0)}ms`
    );
  });
  next();
});

app.use((req, res, next) => {
  if (BLACKLIST_UA && req.headers["user-agent"]?.match(new RegExp(`(${BLACKLIST_UA})`, "i")))
    return;
  if (WHITELIST_COUNTRY && !WHITELIST_COUNTRY.split("|").includes(res.locals.country.isoCode))
    return;
  next();
});

app.use(express.json());

app.use((req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.set("Referrer-Policy", "no-referrer");
  res.set("X-Content-Type-Options", "nosniff");
  res.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "base-uri 'none'",
      "frame-ancestors 'none'",
      "block-all-mixed-content",
    ].join("; ")
  );
  next();
});

app.use(
  rateLimit({
    max: 120, // 120 requests per IP address (per node.js process)
    windowMs: 60 * 1000, // per 1 minute
  })
);

app.get(/[^\/]+\.[^\/]+$/, express.static("./static", { maxAge: 1000 * 60 * 60 * 24 }));

app.delete("/", (req, res) => {
  fs.copyFileSync("data/latest.json", `data/${Date.now()}.json`);
  fs.writeFileSync(
    "data/latest.json",
    JSON.stringify(
      JSON.parse(fs.readFileSync("data/latest.json")).filter((e) => e.name !== req.body.name),
      null,
      2
    )
  );
  return res.sendStatus(204);
});

app.post("/", (req, res) => {
  fs.copyFileSync("data/latest.json", `data/${Date.now()}.json`);
  fs.writeFileSync(
    "data/latest.json",
    JSON.stringify(JSON.parse(fs.readFileSync("data/latest.json")).concat(req.body), null, 2)
  );
  return res.sendStatus(204);
});

app.get("/", async (req, res) => {
  if (req.headers.accept?.toLowerCase() === "text/event-stream") {
    res.set({
      "Cache-Control": "no-cache",
      "Content-Type": "text/event-stream",
    });
    res.flushHeaders();

    res.write("retry: 1000\n\n");
    while (true) {
      res.write(
        `data: ${JSON.stringify(
          JSON.parse(fs.readFileSync("data/latest.json")).map(({ name, otp }) => ({
            name,
            otp: getOtp(otp),
          }))
        )}\n\n`
      );

      await new Promise((resolve) =>
        setTimeout(
          resolve,
          (Math.floor(Math.round(new Date().getTime() / 1000.0) / 30) + 1) * 30 * 1000 -
            new Date().getTime()
        )
      );
    }
  }
  return res.render("index", {
    list: JSON.parse(fs.readFileSync("data/latest.json")).map(({ name, otp }) => ({
      name,
      otp: getOtp(otp),
    })),
  });
});

if (!fs.existsSync("data/latest.json")) fs.outputFileSync("data/latest.json", JSON.stringify([]));

app.listen(SERVER_PORT, SERVER_ADDR, () =>
  console.log(`Media server listening on ${SERVER_ADDR}:${SERVER_PORT}`)
);

const getOtp = (secret) => {
  const timeBuffer = Buffer.alloc(8, 0);
  timeBuffer.writeUInt32BE(Math.floor(Math.round(new Date().getTime() / 1000.0) / 30), 4);
  const bits = secret
    .toUpperCase()
    .split("")
    .map((c) => "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567".indexOf(c).toString(2).padStart(5, "0"))
    .join("");
  const secretBuffer = Buffer.alloc(Math.ceil(secret.length / 16) * 10);
  for (let i = 0; i <= Math.floor(bits.length / 8); i++) {
    secretBuffer[i] = parseInt(bits.substring(i * 8, (i + 1) * 8), 2);
  }
  const hmac = crypto.createHmac("sha1", secretBuffer).update(timeBuffer).digest("hex");
  const offset = parseInt(hmac.substring(hmac.length - 1), 16) & 0x7fffffff;
  const otp = (parseInt(hmac.substring(offset * 2, offset * 2 + 8), 16) & 0x7fffffff).toString();
  return otp.length > 6 ? otp.substring(otp.length - 6) : otp.padStart(6, "0");
};
