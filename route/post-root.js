import fs from "fs-extra";

const { ENABLE_FIDO2 } = process.env;

export default (req, res) => {
  if (
    ENABLE_FIDO2 &&
    !fs
      .readdirSync("session")
      .map((e) => e.replace(".json", ""))
      .includes(req.cookies.session)
  ) {
    return res.status(403);
  }
  if (!req.body.name || !req.body.otp) return res.sendStatus(400);
  if (!req.body.name.match(/[a-zA-Z][a-zA-Z0-9]+/)) return res.sendStatus(400);
  if (!req.body.otp.match(/[a-zA-Z0-9]{16,}/)) return res.sendStatus(400);
  fs.copyFileSync("data/latest.json", `data/${Date.now()}.json`);
  fs.writeFileSync(
    "data/latest.json",
    JSON.stringify(JSON.parse(fs.readFileSync("data/latest.json")).concat(req.body), null, 2)
  );
  return res.sendStatus(204);
};