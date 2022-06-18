import { Reader } from "@maxmind/geoip2-node";

const { GEO_LITE_COUNTRY_PATH, GEO_LITE_ASN_PATH } = process.env;

const maxMindCountry =
  GEO_LITE_COUNTRY_PATH &&
  (await Reader.open(GEO_LITE_COUNTRY_PATH, {
    cache: { max: 6000 },
    watchForUpdates: true,
  }));

const maxMindASN =
  GEO_LITE_ASN_PATH &&
  (await Reader.open(GEO_LITE_ASN_PATH, {
    cache: { max: 6000 },
    watchForUpdates: true,
  }));

export default (ip) => {
  let ASN = { autonomousSystemNumber: 0, autonomousSystemOrganization: "unknown", network: "/" };
  try {
    ASN = maxMindASN.asn(ip);
  } catch (e) {}
  let country = { isoCode: "ZZ", names: { en: "Unknown" } };
  try {
    country = maxMindCountry.country(ip).country;
  } catch (e) {}
  return { ASN, country };
};
