const VerifyAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).send({ error: "Unauthorized User" });
    }
    if (req.user.role !== 'admin') {
      return res.status(403).send({ error: "Forbidden: Admins only" });
    }
    next();
  } catch (err) {
    return res.status(401).send({ error: "Unauthorized User" });
  }
};

module.exports = VerifyAdmin;


