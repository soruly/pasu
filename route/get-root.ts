import fs from "node:fs/promises";
import getOtp from "../lib/get-otp.ts";
import isSessionValid from "../lib/is-session-valid.ts";

export default async (req, res) => {
  const { ENABLE_FIDO2, ALLOW_REGISTER } = process.env;
  if (req.headers.accept?.toLowerCase() === "text/event-stream") {
    if (ENABLE_FIDO2 && !(await isSessionValid(req.cookies.session))) return res.sendStatus(403);
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
          list: JSON.parse(await fs.readFile("data/latest.json", "utf8")).map(
            ({ id, name, otp }) => ({
              id,
              name,
              otp: getOtp(otp),
            }),
          ),
        })}\n\n`,
      );

      await new Promise((resolve) =>
        setTimeout(
          resolve,
          (Math.floor(Math.round(new Date().getTime() / 1000.0) / 30) + 1) * 30 * 1000 -
            new Date().getTime(),
        ),
      );
    }
  }
  const headerList = ["Sec-CH-UA-Model", "Sec-CH-UA-Platform", "Sec-CH-UA-Platform-Version"];
  res.set("Accept-CH", headerList.join(", "));
  res.set("Vary", headerList.join(", "));
  return res.render("index", {
    ENABLE_FIDO2,
    ALLOW_REGISTER,
    IS_SESSION_VALID: await isSessionValid(req.cookies.session),
    integrity: req.app.locals.integrity,
    list: JSON.parse(await fs.readFile("data/latest.json", "utf8")).map(({ id, name, otp }) => ({
      id,
      name,
      otp: "",
    })),
  });
};
