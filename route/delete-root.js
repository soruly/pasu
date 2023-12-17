import fs from "node:fs/promises";
import isSessionValid from "../lib/is-session-valid.js";

const { ENABLE_FIDO2 } = process.env;

export default async (req, res) => {
  if (ENABLE_FIDO2 && !(await isSessionValid(req.cookies.session))) return res.sendStatus(403);
  await fs.copyFile("data/latest.json", `data/${Date.now()}.json`);
  await fs.writeFile(
    "data/latest.json",
    JSON.stringify(
      JSON.parse(await fs.readFile("data/latest.json")).filter((e) => e.id !== req.body.id),
      null,
      2,
    ),
  );
  return res.sendStatus(204);
};
