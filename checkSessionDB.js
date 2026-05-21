// checkSessionDB.js
module.exports = function (req, res, next) {
  const conn = req.session?.conn;

  if (!conn) {
    console.warn(`Session DB connection missing for sessionID=${req.sessionID}, URL=${req.originalUrl}`);

    if (req.accepts('html')) {
      return res.redirect('/index.html');
    }

    return res.status(440).json({
      message: "Session expired. Please load the database again.",
      success: false,
    });
  }

  // Connection is valid
  next();
};
  