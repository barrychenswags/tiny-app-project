
var express = require("express");
var cookieParser = require('cookie-parser');
var app = express();
var PORT = 8080; // default port 8080

const bodyParser = require("body-parser");

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  }
}

function generateRandomString(num) {
  var chars = '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  var randomString = '';
  for (var i = 0; i < num; i++){
    randomString = randomString + chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return randomString;
}

function authenticateUser(em, pw) {
    console
    for (userId in usersDatabase) {
        //console.log(usersDatabase[userId]);
        let currentUser = usersDatabase[userId]
        if (currentUser.email === em && currentUser.password === pw) {
            return currentUser.id
        }
    }
    return false
}

//console.log(authenticateUser("mclovin69@gmail.com","iammclovin"));
//console.log(authenticateUser("postmalone@hotmail.com","ugly"));


app.get("/urls", (req, res) => {
  console.log(req.cookies);
  let templateVars = {urls: urlDatabase, uniqueId: req.cookies["uniqueId"]};

  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  res.render("urls_register");
});

app.post('/register', (req, res) => {

  //console.log(req.body.email,req.body.password);
  const userEmail = req.body.email;
  const userPassword = req.body.password;

  console.log(userEmail,userPassword);
  const uniqueId = generateRandomString(5);

  const newUser = {
    id: uniqueId,
    email: userEmail,
    password: userPassword
  }
  res.cookie('uniqueId', uniqueId);
  //res.cookie('email', userEmail);
  //res.cookie('password', userPassword);

  usersDatabase[newUser.id] = newUser;
  console.log(usersDatabase);

  res.redirect('/login');
});

app.get("/login", (req, res) => {
  res.render("urls_login");
});

app.post('/login', (req,res) => {
    console.log('Login values :', req.body.email, req.body.password)
    // if(req.body.username === "bob"){
    //     res.cookie('username', req.body.username)
    // }
    // else{
    //     res.cookie('username', 'STRANGER DANGER')
    // }
    const authenticate = authenticateUser(req.body.email, req.body.password)
    if(authenticate){
        res.cookie('uniqueId', authenticate )
        //req.session.userId = authenticate
        res.redirect('/urls')
    }
    else{
        res.cookie('uniqueId', 'fakenews')
        console.log(res.cookie.uniqueId);
        //req.session.userId = ''
        // delete req.session.userId
        res.redirect('/login')
    }

})

//"/urls/show", "/urls/new", req.cookie["uniqueId"]


app.get("/urls/new", (req, res) => {
  let templateVars = {uniqueId: req.cookies["uniqueId"]};
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const {longURL} = req.body;

  const short = generateRandomString(6);

  // create a new quote object
  urlDatabase[short] = longURL;

  // redirecting to the urls page
  res.redirect('/urls');

});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase, uniqueId: req.cookies["uniqueId"]};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  //Object.values(urlDatabase)[0];
  res.redirect(longURL);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  // extract the id info from the path
  const {shortURL} = req.params;
  // const id = req.params.id;

  delete urlDatabase[shortURL];

  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  // extract the id info from the path
  res.clearCookie('uniqueId');

  res.redirect('/login');
});

app.post('/urls/:shortURL', (req, res) => {

  const {shortURL} = req.params;
  const {newURL} = req.body;
  console.log(newURL);

  urlDatabase[shortURL] = newURL;

  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});