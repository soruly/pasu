import fs from "node:fs/promises";
import path from "node:path";

export default async (session) => {
  if (typeof session !== "string" || !session || path.basename(session) !== session) {
    return false;
  }
  try {
    await fs.stat(path.join("session", session + ".json"));
    return true;
  } catch {
    return false;
  }
};
