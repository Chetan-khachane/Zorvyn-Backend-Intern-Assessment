export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    let userRole = req.user?.role;

    if (!userRole) {
      return res.status(401).json({
        message: "Unauthorized: Role not found",
      });
    }
    userRole = req.body.role
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: "Forbidden: Access denied",
      });
    }

    next();
  };
};