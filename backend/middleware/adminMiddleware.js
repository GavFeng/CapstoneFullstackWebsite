const adminMiddleware = (req, res, next) => {
  if (!req.user ||req.user.accountType !== "admin") {
    return res.status(403).json({
      message: "Admin is required"
    });
  }
  next();
}
module.exports = adminMiddleware