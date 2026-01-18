import fs from "node:fs/promises";

export default async (session) =>
  (await fs.readdir("session")).map((e) => e.replace(".json", "")).includes(session);
