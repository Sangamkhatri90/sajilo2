// checkSessionDB.js
module.exports = function (req, res, next) {
  const conn = req.session?.conn;

  if (!conn) {
    console.warn(`Session DB connection missing for sessionID=${req.sessionID}, URL=${req.originalUrl}`);

    if (req.accepts('html')) {
      return res.redirect('/index.html');
    }

    // A database can be reselected only while the authenticated user is still
    // present in the session. A fully expired session must log in again.
    if (!req.session?.userID) {
      return res.status(401).json({
        message: "Login session expired. Please sign in again.",
        success: false,
      });
    }

    return res.status(440).json({
      message: "Session expired. Please load the database again.",
      success: false,
    });
  }

  // Connection is valid
  next();
};
