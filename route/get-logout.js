import fs from "node:fs/promises";

const { ENABLE_FIDO2 } = process.env;

export default async (req, res) => {
  if (!ENABLE_FIDO2) return res.status(403).send("FIDO2 disabled");
  await fs.unlink(`session/${req.cookies.session}.json`);
  res.setHeader(
    "Set-Cookie",
    `session=; Path=/; Expires=${new Date(0).toGMTString()}; Secure; HttpOnly; SameSite=Strict`,
  );
  return res.redirect(302, "/");
};
