const permit = (...permittedRoles) => {

  return (req, res, next) => {
    const { user } = req;

    if (user && permittedRoles.includes(user.role)) {
      next();
    } else {
      res.sendStatus(403);
    }
  }
};

module.exports = permit;
