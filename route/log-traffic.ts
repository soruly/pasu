import { performance } from "node:perf_hooks";

export default (req, res, next) => {
  const startTime = performance.now();
  console.log(
    "=>",
    new Date().toISOString(),
    req.ip,
    res.locals.country.isoCode,
    res.locals.ASN.autonomousSystemNumber,
    req.path,
  );
  res.on("finish", () => {
    console.log(
      "<=",
      new Date().toISOString(),
      req.ip,
      res.locals.country.isoCode,
      res.locals.ASN.autonomousSystemNumber,
      req.path,
      res.statusCode,
      `${(performance.now() - startTime).toFixed(0)}ms`,
    );
  });
  next();
};
