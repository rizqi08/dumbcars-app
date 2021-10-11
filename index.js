const http = require('http');
const express = require('express');
const path = require('path');
const hbs = require('hbs');
const session = require('express-session');
const isLogin = false

const app = express();

const carRoute = require('./routes/car');

// import db connection
const dbConnection = require('./connection/db');

let pathFile = 'http://localhost:3000/uploads/';

app.use(express.static('express'));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.urlencoded({ extended: false}));

// set views location to app
app.set("views", path.join(__dirname, "views"));

// set engine
app.set("view engine", "hbs");

// register view partials
hbs.registerPartials(path.join(__dirname, "views/partials"));

hbs.registerHelper('select', function(selected, options){
  return options.fn(this).replace(
    new RegExp(' value=\"' + selected + '\"'), '$& selected="selected"'
  );
});

app.use(
  session({
    cookie: {
      maxAge: 2 * 60 * 60 * 1000,
      secure: false,
      httpOnly: true
    },
    store: new session.MemoryStore(),
    saveUninitialized: true,
    resave: false,
    secret: "secretValue"
  })
);

// session alert
app.use(function(req,res,next){
  res.locals.message = req.session.message
  delete req.session.message
  next()
})

// render index page
app.get("/", function(request, response){
  const title = 'DumbCars'
  const query = `SELECT * FROM tb_car`;
  
  dbConnection.getConnection((err, conn) => {
    if(err) throw err;

    conn.query(query, (err, results) => {
      if (err) throw err;

      let car = [];

      for(let result of results) {
        car.push({
          id: result.id,
          name: result.name,
          plat_number: result.plat_number,
          photo: pathFile + result.photo,
          price: result.price,
          status: result.status,
          brand_id: result.brand_id,
          type_id: result.type_id,
        });
      }
      response.render('index', {
        title,
        isLogin: request.session.isLogin,
        car,
    });
    });
    
    conn.release();
  });
});

// render index page
app.get("/admin", function(request, response){
  const title = 'DumbCars'
  const query = `SELECT * FROM tb_car`;
  
  dbConnection.getConnection((err, conn) => {
    if(err) throw err;

    conn.query(query, (err, results) => {
      if (err) throw err;

      let car = [];

      for(let result of results) {
        car.push({
          id: result.id,
          name: result.name,
          plat_number: result.plat_number,
          photo: pathFile + result.photo,
          price: result.price,
          status: result.status,
          brand_id: result.brand_id,
          type_id: result.type_id,
        });
      }

      if(request.session.isAdmin) {
      response.render('dashboard', {
        title,
        isAdmin: request.session.isAdmin,
        car,
    });
   }

   else {
     response.redirect('/login')
   }
    });
    
    conn.release();
  });
});

// render form login
app.get('/login', function(request,response) {
  const title = 'Login';
  response.render('auth/login', {
    title,
    isLogin,
  });
});

//   login Handler
app.post('/login', function(request, response){
  const {email, password} = request.body;
  const query = `SELECT * FROM tb_user WHERE email = "${email}" AND password = "${password}"`;

  if (email == '' || password == '') {
      request.session.message = {
          type: 'danger',
          message: 'Please insert all field!'
      }
      return response.redirect('login');
  }

  dbConnection.getConnection((err, conn) => {
      if (err) throw err;

      conn.query(query, function (err, results){
          if(err) throw err;

          if(results.length === 0){
              request.session.message = {
                  type: 'danger',
                  message: 'Email and password dont match!'
              };
              return response.redirect('login');

          } else {

              request.session.isLogin = true;
              request.session.user = {
                  id: results[0].id,
                  email: results[0].email,
                  status: results[0].status,
              }

              const user = results[0]
              let status = user.status
              request.session.isAdmin = false
              if (status == "admin") {
                  request.session.isAdmin = true
                  response.redirect('/admin')
              }
              else if(status == "user") {
                  request.session.isAdmin = false
                  response.redirect('/')
              }
          }
      });

      conn.release();
  });
});

//   render form register
app.get('/register', function(request,response) {
  const title = 'Register';
  response.render('auth/register', {
    title,
    isLogin: request.session.isLogin,
  });
});

//handele register
app.post('/register', function(request, response) {
  const {email, password, name, no_ktp, address, phone, status} = request.body;

  const query = 'INSERT INTO tb_user(email, password, name, no_ktp, address, phone, status) VALUES (?,?,?,?,?,?,?)';
  if (email == '' || password == '' || name == '' || no_ktp == '' || address == '' || phone == '' || status == '') {
      request.session.message = {
          type: 'danger',
          message: 'Please insert all field!'
      }
      response.redirect('/register');
      return;
  }

  dbConnection.getConnection((err, conn) => {
      if(err) throw err;

      // execute query
      conn.query(query, [email, password, name, no_ktp, address, phone, status], (err, results) => {
          if(err) throw err;

          request.session.message = {
              type: 'success',
              message: 'Register has successfully!'
          }
          response.redirect('/register');
      });
      // release connection back to pool
      conn.release();
  });
});

app.get('/logout', function(request,response) {
  request.session.destroy();
  response.redirect('/');
});

// mount car route
app.use('/car', carRoute);



const port = 3000;
const server = http.createServer(app)
server.listen(port);
console.debug(`Server listening on port ${port}`);