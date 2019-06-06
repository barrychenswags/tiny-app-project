var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  var chars = '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  var randomString = '';
  for (var i = 0; i < 6; i++){
    randomString = randomString + chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return randomString;
}

/*app.get("/", (req, res) => {
  res.send("Hello!");
});*/


app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const {longURL} = req.body;

  const short = generateRandomString();

  // create a new quote object
  urlDatabase[short] = longURL;

  // redirecting to the urls page
  res.redirect('/urls');

});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase /* What goes here? */ };
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

app.post('/urls/:shortURL', (req, res) => {

  const {shortURL} = req.params;
  const {newURL} = req.body;

  urlDatabase[shortURL] = newURL;

  res.redirect('/urls');
});

/*
app.get("/new", (req, res) => {
  res.render("new_urls")
});

/*
app.get("/hello", (req, res) => {
  let templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
*/

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});