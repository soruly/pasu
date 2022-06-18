const { ENABLE_FIDO2, ALLOW_REGISTER } = process.env;

export default async (req, res) => {
  if (!ENABLE_FIDO2 || !ALLOW_REGISTER) return res.status(403).send("Registration disabled");
  const registrationOptions = await req.app.locals.f2l.attestationOptions();
  req.app.locals.registrationOptions = registrationOptions;
  return res.send({
    ...registrationOptions,
    challenge: Buffer.from(registrationOptions.challenge).toString("base64"),
  });
};
