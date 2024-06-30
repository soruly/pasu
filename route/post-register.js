import fs from "node:fs/promises";

export default async (req, res) => {
  const { SERVER_NAME, ENABLE_FIDO2, ALLOW_REGISTER } = process.env;
  if (!ENABLE_FIDO2 || !ALLOW_REGISTER) return res.status(403).send("Registration disabled");
  try {
    const regResult = await req.app.locals.f2l.attestationResult(
      {
        id: req.body.id,
        rawId: new Uint8Array(Buffer.from(req.body.rawId, "base64")).buffer,
        response: {
          attestationObject: new Uint8Array(
            Buffer.from(req.body.response.attestationObject, "base64"),
          ).buffer,
          clientDataJSON: req.body.response.clientDataJSON,
        },
      },
      {
        challenge: req.app.locals.registrationOptions.challenge,
        origin: `https://${SERVER_NAME}`,
        factor: "either",
      },
    );
    req.app.locals.registrationOptions = null;
    console.log(regResult);
    await fs.writeFile(
      `registered/${req.body.id}.pem`,
      regResult.authnrData.get("credentialPublicKeyPem"),
    );
    await fs.writeFile(
      `registered/${req.body.id}.json`,
      JSON.stringify(
        {
          ip: req.ip,
          ASN: res.locals.ASN,
          country: res.locals.country,
          agent: req.headers["user-agent"],
        },
        null,
        2,
      ),
    );
    return res.sendStatus(204);
  } catch (e) {
    return res.status(400).send(e.toString());
  }
};
