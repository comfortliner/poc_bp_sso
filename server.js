const express = require('express');
const path = require('path');
const { sso } = require('node-expose-sspi');
// const serveIndex = require('serve-index');
const session = require('express-session');

const app = express();

// app.set('trust proxy', '127.0.0.1');
app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.resolve(__dirname, '.')));
// app.use(serveIndex(path.resolve(__dirname, '.'), { icons: true }));

app.use(session({
  secret: 'keyboard cat',
//  proxy: true,
  resave: true,
  saveUninitialized: true
}));

app.use(function(err, req, res, next) {
  console.log(err);
});

app.get('/', (req, res) => {
  res.locals.user = req.session.user;
  // return res.render('home', { user: req.session.user });
  return res.render('home');
});

app.get('/login', (req, res) => {
  const obj = { error: req.session.error };
  req.session.error = undefined;
  return res.render('login', obj);
});

app.get('/action/disconnect', (req, res) => {
  //res.locals.user = undefined;
  req.session.user = undefined;
  return res.redirect('/');
});

app.get('/no-sso', (req, res) => {
  return res.render('no-sso');
});

app.get('/sso', sso.auth({'useGroups': false}), (req, res)=> {
  if (!req.sso) {
    return res.redirect('/no-sso');
  }
  console.log(req.sso);
  req.session.user = req.sso.user.displayName;
  return res.redirect('/welcome');
});

app.use('/protected', (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
});

app.get('/welcome', (req, res) => {
  // console.log(req.session.user);
  res.locals.user = req.session.user;
  //return res.render('welcome', { user: req.session.user });
  return res.render('welcome');
});

// start with "node --max-http-header-size=16384 server.js"
app.listen(5000, () => console.log('Server started on port 5000'));

// app.use(sso.auth());

// app.use((req, res) => {
//   res.json({
//     sso: req.sso
//   });
// });
