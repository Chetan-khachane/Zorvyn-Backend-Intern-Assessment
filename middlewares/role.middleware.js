
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.body.role)) {
      return res.status(403).json({
        message: "Forbidden: Access denied",
      });
    }
    next();
  };
};