require('dotenv').config();

const cookieParser = require('cookie-parser');
const express = require('express');
const jwt = require('jsonwebtoken');
const path = require('path');
const { sso } = require('node-expose-sspi');
// const serveIndex = require('serve-index');

const authToken = require('./middleware/authToken');
const permit = require('./middleware/permit');
const permitsJSON = require('./permits.json');

const app = express();

app.set('view engine', 'ejs');
app.set('view cache', false);
app.set('views', path.resolve(__dirname, 'views'));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.resolve(__dirname, '.')));
// app.use(serveIndex(path.resolve(__dirname, '.'), { icons: true }));

app.get('/', authToken, (req, res) => {
  res.render('home', { user: req.user });
});

app.get('/login', authToken, (req, res) => {
  res.render('login', { user: req.user });
});

app.get('/action/disconnect', (req, res) => {
  res.clearCookie('auth');

  res.redirect('/');
});

app.get('/no-sso', (req, res) => {
  res.render('no-sso');
});

app.get('/sso', sso.auth({'useGroups': false}), (req, res)=> {
  if (!req.sso) {
    res.redirect('/no-sso');
  }

  const { cn, displayName, l, telephoneNumber, department, company } = req.sso.user.adUser;

  // user not in permits.json role guest as default
  let role = 'guest';

  const filterUser = permitsJSON.filter(element => element.sub == cn[0]);
  if (filterUser.length !== 0) {
    role = filterUser[0].role;
  }
  
  const user = { 
    'sub': cn[0],
    'name': displayName[0],
    'location': l[0],
    'telephoneNumber': telephoneNumber[0],
    'department': department[0],
    'company': company[0],
    role
   };

  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);

  res.cookie('auth', accessToken, { httpOnly: true, maxAge: 1000 * 60 * 15 });

  res.redirect('/');
});

app.use('/protected', (req, res) => {
  // if (!req.session.user) {
  //   res.redirect('/login');
  // }
});

// app.get('/navigation', (req, res) => {
//   res.render('navigation', { user: req.user });
// });

app.get('/admin', authToken, permit('admin'), (req, res) => {
  res.render('admin', { user: req.user });
});

app.get('/user', authToken, permit('admin', 'user'), (req, res) => {
  res.render('user', { user: req.user });
});

app.get('/guest', authToken, (req, res) => {
  res.render('guest', { user: req.user });
});

// start with "node --max-http-header-size=16384 server.js"
app.listen(5000, () => console.log('Server started on port 5000'));
