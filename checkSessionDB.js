// checkSessionDB.js
module.exports = function (req, res, next) {
  const conn = req.session?.conn;
  const userID = req.session?.userID;
  const isApiRequest =
    req.path.startsWith('/api/') ||
    req.get('sec-fetch-mode') === 'cors' ||
    req.get('x-requested-with') === 'XMLHttpRequest';

  if (!userID || !conn) {
    console.warn(`Session DB connection missing for sessionID=${req.sessionID}, URL=${req.originalUrl}`);

    const loginExpired = !userID;
    const status = loginExpired ? 401 : 440;
    const message = loginExpired
      ? "Login session expired. Please sign in again."
      : "Session expired. Please load the database again.";

    // Fetch follows redirects, which would hide the session status behind an
    // HTML login page and prevent the client-side recovery handler from running.
    if (isApiRequest || !req.accepts('html')) {
      return res.status(status).json({ message, success: false });
    }

    return res.redirect('/index.html');
  }

  // Connection is valid
  next();
};
