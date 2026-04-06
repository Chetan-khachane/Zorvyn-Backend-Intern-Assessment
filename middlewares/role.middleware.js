export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    let userRole = req.user?.role;
    
    if (!userRole) {
      return res.status(401).json({
        message: "Unauthorized: Role not found",
      });
    }
    if(userRole){
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          message: "Forbidden: Access denied",
        });
      }
    }else{
      if (!allowedRoles.includes(req.body?.role)) {
        return res.status(403).json({
          message: "Forbidden: Access denied",
        });
      }
    }

    next();
  };
};