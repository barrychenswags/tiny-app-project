
var express = require("express");
var cookieParser = require('cookie-parser');
var app = express();
var flash = require('express-flash-messages');
var cookieSession = require('cookie-session');


var PORT = 8080; // default port 8080

const bodyParser = require("body-parser");

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(cookieSession({
    name: 'session',
    keys: ['sickomode']
}));
app.use(flash());

var urlDatabase = {
  "b2xVn2": {link: "http://www.lighthouselabs.ca", id: "Tml34"},
  "9sm5xK": {link: "http://www.google.com", id: "Tml34"},
  "h2x2B8": {link: "http://www.nhl.com", id: "DaB87"},
  "M9aC86": {link: "http://www.facebook.com", id: "Hbo20"},
  "G2n3b8": {link: "http://mlb.com", id: "Hbo20"}
};

const usersDatabase = {
  "Tml34": {
    id: "Tml34",
    email: "mclovin69@gmail.com",
    password: "iammclovin"
  },
  "DaB87": {
    id: "DaB87",
    email: "postmalone@hotmail.com",
    password: "alwaystired"
  },
  "Hbo20": {
    id: "Hbo20",
    email: "jonsnow@got.com",
    password: "bastard"
  }

};

function generateRandomString(num) {
  var chars = '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  var randomString = '';
  for (var i = 0; i < num; i++){
    randomString = randomString + chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return randomString;
}

function authenticateUser(em, pw) {

    for (userId in usersDatabase) {
        let currentUser = usersDatabase[userId];
        if (currentUser.email === em && currentUser.password === pw) {
            return currentUser.id;
        }
    }
    return false;
}

function emailCheck(em){
  for(var user in usersDatabase){
    console.log(usersDatabase[user].email);
    if (usersDatabase[user].email === em){
      return true;
    }
  }
  return false;
}

function urlsForUser(ID){
  var userUrls = {};
  for(var url in urlDatabase){
    if (urlDatabase[url].id === ID){
      userUrls[url] = urlDatabase[url];
    }
  }
  return userUrls;
}

app.get("/urls", (req, res) => {
  console.log(req.session.uniqueId);
  let templateVars = {
    urls: urlsForUser(req.session["uniqueId"]),
    uniqueId: req.session["uniqueId"],
    currentUser: usersDatabase[req.session["uniqueId"]]
  };
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  if(req.session.uniqueId===undefined){
    res.render("urls_register");
  }
  else{
      res.send('Already logged in, to register please logout first');
  }
});

app.post('/register', (req, res) => {

  const userEmail = req.body.email;
  const userPassword = req.body.password;

  if(userEmail.includes('@')===true){
    if(emailCheck(userEmail)===false){
      var uniqueId = generateRandomString(5);

      /*this method checks whether the generated random ID already exists in the database.
      If so, generate a new one */
      while(Object.keys(usersDatabase).includes(uniqueId)===true){
        uniqueId = generateRandomString(5);
      }

      const newUser = {
        id: uniqueId,
        email: userEmail,
        password: userPassword
      };

      usersDatabase[newUser.id] = newUser;
      //if user successfully registered direct to login page
      res.redirect('/login');
    }
    else{
      res.redirect('/register');

    }
  }
  else{
    res.send('Incorrect email format, must include @');
  }
});

app.get("/login", (req, res) => {

  if(req.session.uniqueId===undefined){
    res.render("urls_login");
  }
  else{
      res.send('Already logged in');
  }

});

app.post('/login', (req,res) => {

    const authenticate = authenticateUser(req.body.email, req.body.password);
    if(authenticate!== false){
      req.session.uniqueId = authenticate;
      console.log("login success",req.cookies.uniqueId);
      res.redirect('/urls');
    }
    else{

      console.log("login fail",req.cookies.uniqueId);
      res.redirect('/login');
    }
})

app.get("/urls/new", (req, res) => {
  let templateVars = {
    uniqueId: req.session["uniqueId"],
    currentUser: usersDatabase[req.session["uniqueId"]]
  };
  console.log("the id is ",req.session.uniqueId);
  if(req.session.uniqueId === undefined){
    res.redirect('/login');
  }
  res.render("urls_new", templateVars);
});

//ADD URL METHOD
app.post("/urls", (req, res) => {
  var {longURL} = req.body;
  if (longURL.includes('http://')===false){
    longURL = 'http://'+longURL;
  }

  var short = generateRandomString(6);

  //this method makes sure all 'short' are unique
  while(Object.keys(urlDatabase).includes(short)===true){
        short = generateRandomString(6);
  }

  const urlId = req.session.uniqueId;

  const newLink = {
    link: longURL,
    id: urlId
  }

  console.log(newLink);
  urlDatabase[short] = newLink;

  //after successfully adding new url redirect to the urls page
  res.redirect('/urls');

});

app.get("/urls/:shortURL", (req, res) => {

  //check if user have access to url
  if(Object.keys(urlsForUser(req.session["uniqueId"])).includes(req.params.shortURL) === true){
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlsForUser(req.session.uniqueId),
      uniqueId: req.session.uniqueId,
      currentUser: usersDatabase[req.session["uniqueId"]]
    };
    res.render("urls_show", templateVars);
  }
  else{
    res.send("Do not have access to this URL");

  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].link;
  res.redirect(longURL);
});


app.post('/urls/:shortURL/delete', (req, res) => {

  const {shortURL} = req.params;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {

  res.clearCookie('session');
  res.redirect('/urls');
});

//UPDATE URL METHOD
app.post('/urls/:shortURL', (req, res) => {

  const {shortURL} = req.params;
  const {newURL} = req.body;
  console.log(newURL);

  urlDatabase[shortURL].link = newURL;

  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});