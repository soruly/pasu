import fs from "fs-extra";
import isSessionValid from "../lib/is-session-valid.js";

const { ENABLE_FIDO2 } = process.env;

export default (req, res) => {
  if (ENABLE_FIDO2 && !isSessionValid(req.cookies.session)) return res.sendStatus(403);
  fs.copyFileSync("data/latest.json", `data/${Date.now()}.json`);
  fs.writeFileSync(
    "data/latest.json",
    JSON.stringify(
      JSON.parse(fs.readFileSync("data/latest.json")).filter((e) => e.id !== req.body.id),
      null,
      2,
    ),
  );
  return res.sendStatus(204);
};
