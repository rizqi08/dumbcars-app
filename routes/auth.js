const dbConnection = require('../connection/db');
const router = require('express').Router();
let isLogin = false;

// render form login
router.get('/login', function(request,response) {
    const title = 'Login';
    response.render('auth/login', {
      title,
      isLogin: request.session.isLogin,
    });
  });

//   login Handler
router.post('/login', function(request, response){
    const {email, password} = request.body;
    const query = 'SELECT id, email, password FROM tb_user WHERE email = ? AND password = ?';

    if (email == '' || password == '') {
        request.session.message = {
            type: 'danger',
            message: 'Please insert all field!'
        }
        return response.redirect('/login');
    }

    dbConnection.getConnection((err, conn) => {
        if (err) throw err;

        conn.query(query, [email, password], (err, results) => {
            if(err) throw err;

            if(results.length === 0){
                request.session.message = {
                    type: 'danger',
                    message: 'Email and password dont match!'
                }

            } else {
                request.session.message = {
                    type: 'success',
                    message: 'Login has successfully!'
                }

                request.session.isLogin = true;
                request.session.user = {
                    id: results[0].id,
                    email: results[0].email,
                }

                response.redirect('/')
            }
        });

        conn.release();
    });
});

//   render form register
router.get('/register', function(request,response) {
    const title = 'Register';
    response.render('auth/register', {
      title,
      isLogin: request.session.isLogin,
    });
  });

//handele register
router.post('/register', function(request, response) {
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

router.get('/logout', function(request,response) {
    request.session.destroy();
    response.redirect('/');
  });

  module.exports = router;