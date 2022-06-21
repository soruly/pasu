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
};
