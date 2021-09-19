require('dotenv').config();
const jwt = require('jsonwebtoken');

const authToken = (req, res, next) => {
  const authHeader = req.headers['auth'];
  const authCookie = req.cookies['auth'];

  const tokenHeader = authHeader && authHeader.split(' ')[1];
  const tokenCookie = authCookie;

  if (tokenHeader === undefined && tokenCookie === undefined) {
    // Unauthenticated user role guest as default
    req.user = {
      'sub': 'xxxxx',
      'name': 'Gast',
      'role': 'guest'
    }
    next();
    return;
  }

  const token = tokenHeader || tokenCookie;

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      // Forbidden because some kind of error
      console.log('error', err);
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  })
}

module.exports = authToken;
