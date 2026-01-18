import crypto from "node:crypto";
import fs from "node:fs/promises";
import isSessionValid from "../lib/is-session-valid.ts";

export default async (req, res) => {
  const { ENABLE_FIDO2 } = process.env;
  if (ENABLE_FIDO2 && !(await isSessionValid(req.cookies.session))) return res.sendStatus(403);
  if (!req.body.name || !req.body.otp) return res.sendStatus(400);
  if (!req.body.otp.match(/[a-zA-Z0-9]{16,}/)) return res.sendStatus(400);
  await fs.copyFile("data/latest.json", `data/${Date.now()}.json`);
  await fs.writeFile(
    "data/latest.json",
    JSON.stringify(
      JSON.parse(await fs.readFile("data/latest.json", "utf8")).concat({
        id: crypto.webcrypto.randomUUID(),
        name: req.body.name,
        otp: req.body.otp,
      }),
      null,
      2,
    ),
  );
  return res.sendStatus(204);
};
