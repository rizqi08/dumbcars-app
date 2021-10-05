const http = require('http');
const express = require('express');
const path = require('path');
const hbs = require('hbs');
const session = require('express-session');

const app = express();

const authRoute = require('./routes/auth');
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

// mount car route
app.use('/car', carRoute);

// mount auth route
app.use('/', authRoute);


const port = 3000;
const server = http.createServer(app)
server.listen(port);
console.debug(`Server listening on port ${port}`);