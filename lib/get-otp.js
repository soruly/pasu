import crypto from "crypto";

export default (secret) => {
  const timeBuffer = Buffer.alloc(8, 0);
  timeBuffer.writeUInt32BE(Math.floor(Math.round(new Date().getTime() / 1000.0) / 30), 4);
  const bits = secret
    .toUpperCase()
    .split("")
    .map((c) => "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567".indexOf(c).toString(2).padStart(5, "0"))
    .join("");
  const secretBuffer = Buffer.alloc(Math.ceil(secret.length / 16) * 10);
  for (let i = 0; i <= Math.floor(bits.length / 8); i++) {
    secretBuffer[i] = parseInt(bits.substring(i * 8, (i + 1) * 8), 2);
  }
  const hmac = crypto.createHmac("sha1", secretBuffer).update(timeBuffer).digest("hex");
  const offset = parseInt(hmac.substring(hmac.length - 1), 16) & 0x7fffffff;
  const otp = (parseInt(hmac.substring(offset * 2, offset * 2 + 8), 16) & 0x7fffffff).toString();
  return otp.length > 6 ? otp.substring(otp.length - 6) : otp.padStart(6, "0");
};
