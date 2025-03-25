import fs from "node:fs/promises";
import crypto from "node:crypto";

export default async (req, res) => {
  const { SERVER_NAME, ENABLE_FIDO2 } = process.env;
  if (!ENABLE_FIDO2) return res.status(403).send("FIDO2 disabled");
  try {
    const authnResult = await req.app.locals.f2l.assertionResult(
      {
        id: req.body.id,
        rawId: new Uint8Array(Buffer.from(req.body.rawId, "base64")).buffer,
        response: {
          authenticatorData: new Uint8Array(
            Buffer.from(req.body.response.authenticatorData, "base64"),
          ).buffer,
          clientDataJSON: req.body.response.clientDataJSON,
          signature: req.body.response.signature,
        },
      },
      {
        userHandle: null,
        challenge: req.app.locals.assertionOptions.challenge,
        origin: `https://${SERVER_NAME}`,
        factor: "either",
        publicKey: await fs.readFile(`registered/${req.body.id}.pem`, "utf8"),
        prevCounter: 0,
      },
    );
    req.app.locals.assertionOptions = null;
    console.log(authnResult);
    const uuid = crypto.webcrypto.randomUUID();
    await fs.writeFile(
      `session/${uuid}.json`,
      JSON.stringify(
        {
          id: req.body.id,
          uuid,
          ip: req.ip,
          ASN: res.locals.ASN,
          country: res.locals.country,
          agent: req.headers["user-agent"],
          model: req.headers["sec-ch-ua-model"]?.replace(/^"(.*)"$/, "$1"),
          platform: req.headers["sec-ch-ua-platform"]?.replace(/^"(.*)"$/, "$1"),
          platformVersion: req.headers["sec-ch-ua-platform-version"]?.replace(/^"(.*)"$/, "$1"),
        },
        null,
        2,
      ),
    );
    // session cookie
    // res.setHeader("Set-Cookie", `session=${uuid}; Path=/; Secure; HttpOnly; SameSite=Strict`);
    // 10-year long cookie
    res.setHeader(
      "Set-Cookie",
      `session=${uuid}; Path=/; Expires=${new Date(
        Date.now() + 1000 * 60 * 60 * 24 * 365 * 10,
      ).toGMTString()}; Secure; HttpOnly; SameSite=Strict`,
    );
    return res.sendStatus(204);
  } catch (e) {
    return res.status(400).send(e.toString());
  }
};
