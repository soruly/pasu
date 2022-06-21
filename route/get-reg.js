import fs from "fs-extra";

const { ENABLE_FIDO2, ALLOW_REGISTER } = process.env;

export default async (req, res) => {
  if (ENABLE_FIDO2 && ALLOW_REGISTER)
    return res.render("register", {
      mtimeCSS: Math.floor(fs.statSync("./static/style.css").mtimeMs).toString(36),
      mtimeJS: Math.floor(fs.statSync("./static/register.js").mtimeMs).toString(36),
    });
  return res.status(403).send("Registration disabled");
};
