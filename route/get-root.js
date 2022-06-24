import fs from "fs-extra";
import getOtp from "../lib/get-otp.js";

const { ENABLE_FIDO2, ALLOW_REGISTER } = process.env;

export default async (req, res) => {
  if (
    ENABLE_FIDO2 &&
    !fs
      .readdirSync("session")
      .map((e) => e.replace(".json", ""))
      .includes(req.cookies.session)
  ) {
    return res.render("login", {
      mtimeCSS: Math.floor(fs.statSync("./static/style.css").mtimeMs).toString(36),
      mtimeJS: Math.floor(fs.statSync("./static/login.js").mtimeMs).toString(36),
    });
  }

  if (req.headers.accept?.toLowerCase() === "text/event-stream") {
    res.set({
      "Cache-Control": "no-cache",
      "Content-Type": "text/event-stream",
    });
    res.flushHeaders();

    res.write("retry: 1000\n\n");
    while (true) {
      res.write(
        `data: ${JSON.stringify({
          nextUpdate:
            (Math.floor(Math.round(new Date().getTime() / 1000.0) / 30) + 1) * 30 * 1000 -
            new Date().getTime(),
          list: JSON.parse(fs.readFileSync("data/latest.json")).map(({ name, otp }) => ({
            name,
            otp: getOtp(otp),
          })),
        })}\n\n`
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
    ENABLE_FIDO2,
    mtimeJS: Math.floor(fs.statSync("./static/index.js").mtimeMs).toString(36),
    mtimeCSS: Math.floor(fs.statSync("./static/style.css").mtimeMs).toString(36),
    list: JSON.parse(fs.readFileSync("data/latest.json")).map(({ name, otp }) => ({
      name,
      otp: "",
    })),
  });
};
