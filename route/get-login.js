import fs from "node:fs/promises";

export default async (req, res) => {
  const { ENABLE_FIDO2 } = process.env;
  if (!ENABLE_FIDO2) return res.status(403).send("FIDO2 disabled");
  const assertionOptions = await req.app.locals.f2l.assertionOptions();
  req.app.locals.assertionOptions = assertionOptions;
  return res.send({
    ...assertionOptions,
    allowCredentials: (await fs.readdir("registered"))
      .filter((e) => e.match(/\.pem$/))
      .map((e) => ({
        type: "public-key",
        id: Buffer.from(e.replace(".pem", ""), "base64url").toString("base64"),
      })),
    challenge: Buffer.from(assertionOptions.challenge).toString("base64"),
  });
};
