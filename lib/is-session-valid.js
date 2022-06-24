import fs from "fs-extra";

export default (session) =>
  fs
    .readdirSync("session")
    .map((e) => e.replace(".json", ""))
    .includes(session);
