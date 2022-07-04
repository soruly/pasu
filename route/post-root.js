import crypto from "crypto";
import fs from "fs-extra";
import isSessionValid from "../lib/is-session-valid.js";

const { ENABLE_FIDO2 } = process.env;

export default (req, res) => {
  if (ENABLE_FIDO2 && !isSessionValid(req.cookies.session)) return res.sendStatus(403);
  if (!req.body.name || !req.body.otp) return res.sendStatus(400);
  if (!req.body.otp.match(/[a-zA-Z0-9]{16,}/)) return res.sendStatus(400);
  fs.copyFileSync("data/latest.json", `data/${Date.now()}.json`);
  fs.writeFileSync(
    "data/latest.json",
    JSON.stringify(
      JSON.parse(fs.readFileSync("data/latest.json")).concat({
        id: crypto.webcrypto.randomUUID(),
        name: req.body.name,
        otp: req.body.otp,
      }),
      null,
      2
    )
  );
  return res.sendStatus(204);
};
