const dbConnection = require('../connection/db');
const uploadFile = require('../middlewares/uploadFile');
const router = require ('express').Router();

let isLogin = false;

let pathFile = 'http://localhost:3000/uploads/';

// render car detail
router.get('/carDetail/:id', function(request, response){
    const title = 'Car Detail';
    const id = request.params.id;

    const query = `SELECT * FROM tb_car WHERE id = ${id}`;

    dbConnection.getConnection(function(err,conn) {
      if(err) throw err;

      conn.query(query, function (err, results) {
        if (err) throw err;

        const car = {
          id: results[0].id,
          name: results[0].name,
          plat_number: results[0].plat_number,
          photo: pathFile + results[0].photo,
          price: results[0].price,
          status: results[0].status,
          brand_id: results[0].brand_id,
          type_id: results[0].type_id,
        };

        response.render('car/detail', {
          title,
          isLogin: request.session.isLogin,
          car,
      });

      // if(request.session.isAdmin) {
      //   response.render('car/detail', {
      //     title,
      //     isAdmin: request.session.isAdmin,
      //     car,
      // });
      });
    });
});

// render table Car
router.get('/car', function(request,response){
  const title = 'Dumbcars';

  const query = `SELECT * FROM tb_car`;

  dbConnection.getConnection(function(err,conn){
    if(err) throw err;
    conn.query(query, function(err, results){
      if(err) throw err;

      let car = [];
      for(let result of results){
        car.push({
          id: result.id,
          name: result.name,
          plat_number: result.plat_number,
          photo:  result.photo,
          price: result.price,
          status: result.status,
          brand_id: result.brand_id,
          type_id: result.type_id,
        });
      }

      if(car.length == 0) {
        car = false
      }

      response.render('car/car', {
        title,
        isLogin: request.session.isLogin,
        car,
      });
    });
    conn.release();
  });
});

// render add car
router.get('/addCar', function(request, response) {
  const title = 'Add Car';
  const queryBrand = 'SELECT id as brandId, name as brand from tb_brand';

  dbConnection.getConnection(function (err, connBrand) {
    if (err) throw err;
    connBrand.query(queryBrand, function (err, resultsB) {
      if (err) throw err;

      let brand = [];

      for (var result of resultsB) {
        brand.push({
          brandId: result.brandId,
          brand: result.brand,
        });
      }

      if (brand.length == 0) {
        brand = false;
      }

      const queryType = `SELECT id as typeId, name as type from tb_type`;
      dbConnection.getConnection((err, connType) => {
        if(err) throw err;
        connType.query(queryType, (err, resultsT) => {
          if(err) throw err;

          let type = [];

          for (const result of resultsT) {
            type.push({
              typeId: result.typeId,
              type: result.type,
            });
          }

          if (type.length == 0) {
            type = false;
          }

          // response.render('car/addCar', {
          //   title,
          //   isLogin: request.session.isLogin,
          //   brand,
          //   type,
          // });

        if(request.session.isAdmin) {
        response.render('car/addCar', {
          title,
          isAdmin: request.session.isAdmin,
          brand,
          type,
        }); 
      } else {
        response.redirect('/login')
      }

        });
      });
    })
    // conn.release();
  });
});

router.post('/addCar', uploadFile('image'), function(request,response) {
  const {name, plat_number, price, status, brand_id, type_id} = request.body;
  const image = request.file.filename;

  const query = `INSERT INTO tb_car (name, plat_number, price, photo, status, brand_id, type_id) 
  VALUES ("${name}", "${plat_number}", "${price}", "${image}", "${status}", "${brand_id}", "${type_id}");`;

  if(name == '' || plat_number == '' || price == '' || status == '' || brand_id == '' || type_id == '') {
    
    request.session.message = {
      type: 'danger',
      message: 'Please insert all field!'
    }
    return response.redirect('/car/addCar');
  }
  
  dbConnection.getConnection((err, conn) => {
    if(err) throw err;

    conn.query(query, (err, results) => {
      if(err) throw err;

      request.session.message = {
        type: 'success',
        message: 'Add car has success!'
      }
      response.redirect('/car/car');

    });
    conn.release();
  });
});
  
router.get('/editCar/:id', function (request, response) {
    const title = 'Edit Car';
    const { id } = request.params;
  
    const query = `SELECT * FROM tb_car WHERE id = ${id}`;
  
    dbConnection.getConnection(function (err, conn) {
      if (err) throw err;
      conn.query(query, function (err, results) {
        if (err) throw err;
  
        const car = {
          ...results[0],
          photo: pathFile + results[0].photo,
        };
  
        const queryBrand = `SELECT name as brand, id as brandId from tb_brand`;
        dbConnection.getConnection(function(err, connBrand){
          if(err) throw err;
  
          connBrand.query(queryBrand, function(err, resultsB){
            if (err) throw err;
  
            let brand = [];
  
            for (var result of resultsB) {
              brand.push({
                brandId: result.brandId,
                brand: result.brand,
              });
            }
  
            if (brand.length == 0) {
              brand = false;
            }
  
            const queryType = `SELECT name as type, id as typeId from tb_type`;
            dbConnection.getConnection((err, connType) => {
              if(err) throw err;
  
              connType.query(queryType, (err, resultsT) => {
                if (err) throw err;
  
                let type = [];
  
                for (const result of resultsT) {
                  type.push({
                    typeId: result.typeId,
                    type: result.type,
                  });
                }
  
                if (type.length == 0) {
                  type = false;
                }
  
                // response.render('car/editCar', {
                //   title,
                //   isLogin: request.session.isLogin,
                //   car,
                //   brand,
                //   type,
                // });

                if(request.session.isAdmin) {
                  response.render('car/editCar', {
                    title,
                    isAdmin: request.session.isAdmin,
                    brand,
                    type,
                  }); 
                } else {
                  response.redirect('/login')
                }
  
              });
            });
          });
        });
      });
      conn.release();
    });
});

router.post('/editCar', uploadFile('image'), function (request, response) {
  const { id, name, plat_number, price, oldPhoto, status, brand_id, type_id } = request.body;

  let image = oldPhoto.replace(pathFile, '');

  if (request.file) {
    image = request.file.filename;
  }

  const query = `UPDATE tb_car SET name = "${name}", plat_number = "${plat_number}", price = "${price}", photo = "${image}", status = "${status}", brand_id = "${brand_id}", type_id = "${type_id}" WHERE id = ${id}`;

  dbConnection.getConnection(function (err, conn) {
    if (err) throw err;
    conn.query(query, function (err, results) {
      if (err) throw err;

      response.redirect('/car/car');
    });
    conn.release();
  });
});

router.get('/deleteCar/:id', function(request, response){
  const { id } = request.params;
  const query = `DELETE FROM tb_car WHERE id = ${id}`;

  dbConnection.getConnection(function(err,conn){
    if(err) throw err;
    conn.query(query, function(err, result){
      if(err) throw err;
      response.redirect('/car/car');
    });
    conn.release();
  });
});

// render table Brand
router.get('/brand', function(request,response){
  const title = 'Dumbcars';

  const query = 'SELECT * FROM tb_brand';

  dbConnection.getConnection(function(err,conn){
    if(err) throw err;
    conn.query(query, function(err, results){
      if(err) throw err;

      let brands = [];
      for(let result of results){
        brands.push({
          id: result.id,
          name: result.name,
        });
      }

      if(brands.length == 0) {
        brands = false
      }

      // response.render('car/brand', {
      //   title,
      //   isLogin: request.session.isLogin,
      //   brands,
      // });

      if(request.session.isAdmin) {
        response.render('car/brand', {
          title,
          isAdmin: request.session.isAdmin,
          brands,
        }); 
      } else {
        response.redirect('/login')
      }

    conn.release();
    });
  });
});

// render add brand
router.get('/addBrand', function(request,response) {
    const title = 'Add Brand';
    // response.render('car/addBrand', {
    //   title,
    //   isLogin: request.session.isLogin,
    // });

    if(request.session.isAdmin) {
      response.render('car/addBrand', {
        title,
        isAdmin: request.session.isAdmin,
      }); 
    } else {
      response.redirect('/login')
    }
  });

router.post('/addBrand', function(request,response) {
  const {name} = request.body;

  if(name == ''){
    request.session.message = {
      type: 'danger',
      message: 'Please input all the field!',
    };
    return response.redirect('/addBrand');
  }

  const query = `INSERT INTO tb_brand (name) VALUES ("${name}");`;

  dbConnection.getConnection(function(err, conn){
    if(err) throw err;
    conn.query(query, function(err, result){
      if(err) throw err;

      request.session.message = {
        type: 'success',
        message: 'Input data success!',
      };
      response.redirect('/car/brand');
    });
    conn.release();
  })
});

router.get('/editBrand/:id', function (request, response) {
  const title = 'Edit brand';
  const { id } = request.params;

  const query = `SELECT * FROM tb_brand WHERE id = ${id}`;

  dbConnection.getConnection(function (err, conn) {
    if (err) throw err;
    conn.query(query, function (err, results) {
      if (err) throw err;

      const brand = {
        ...results[0],
      };

      // response.render('car/editBrand', {
      //   title,
      //   isLogin: request.session.isLogin,
      //   brand,
      // });

      if(request.session.isAdmin) {
        response.render('car/editBrand', {
          title,
          isAdmin: request.session.isAdmin,
          brand,
        }); 
      } else {
        response.redirect('/login')
      }

    });
    conn.release();
  });
});

router.post('/editBrand', function(request, response){
  const { id, name} = request.body;

  const query = `UPDATE tb_brand SET name = "${name}" WHERE id = ${id}`;

  dbConnection.getConnection(function(err,conn){
    if(err) throw err;
    conn.query(query, function(err, result){
      if(err) throw err;
      response.redirect('brand');
    });
    conn.release();
  });
});

router.get('/deleteBrand/:id', function(request, response){
  const { id } = request.params;
  const query = `DELETE FROM tb_brand WHERE id = ${id}`;

  dbConnection.getConnection(function(err,conn){
    if(err) throw err;
    conn.query(query, function(err, result){
      if(err) throw err;
      response.redirect('/car/brand');
    });
    conn.release();
  });
});

// render table Type
router.get('/type', function(request,response){
  const title = 'Dumbcars';

  const query = 'SELECT * FROM tb_type';

  dbConnection.getConnection(function(err,conn){
    if(err) throw err;
    conn.query(query, function(err, results){
      if(err) throw err;

      let types = [];
      for(let result of results){
        types.push({
          id: result.id,
          name: result.name,
        });
      }

      if(types.length == 0) {
        types = false
      }

      // response.render('car/type', {
      //   title,
      //   isLogin: request.session.isLogin,
      //   types,
      // });

      if(request.session.isAdmin) {
        response.render('car/type', {
          title,
          isAdmin: request.session.isAdmin,
          types,
        }); 
      } else {
        response.redirect('/login')
      }

    conn.release();
    });
  });
});

// render add Type
router.get('/addType', function(request,response) {
    const title = 'Dumbcars';
    // response.render('car/addType', {
    //   title,
    //   isLogin: request.session.isLogin,
    // });

    if(request.session.isAdmin) {
      response.render('car/editType', {
        title,
        isAdmin: request.session.isAdmin,
      }); 
    } else {
      response.redirect('/login')
    }
  });

router.post('/addType', function(request, response){
    const {name} = request.body;
  
    if(name == '') {
      request.session.message = {
        type: 'danger',
        message: 'Please input all the field!',
      };
      return response.redirect('/addType');
    } 
  
    const query = `INSERT INTO tb_type (name) VALUES ("${name}");`;
  
    dbConnection.getConnection(function(err, conn){
      if(err) throw err;
      conn.query(query, function(err, result){
        if(err) throw err;
  
        request.session.message = {
          type: 'success',
          message: 'Input data success!',
        };
        response.redirect('/car/type');
      });
      conn.release();
    });
  });

router.get('/editType/:id', function (request, response) {
    const title = 'Edit type';
    const { id } = request.params;
  
    const query = `SELECT * FROM tb_type WHERE id = ${id}`;
  
    dbConnection.getConnection(function (err, conn) {
      if (err) throw err;
      conn.query(query, function (err, results) {
        if (err) throw err;
  
        const type = {
          ...results[0],
        };
  
        // response.render('car/editType', {
        //   title,
        //   isLogin: request.session.isLogin,
        //   type,
        // });

        if(request.session.isAdmin) {
          response.render('car/editType', {
            title,
            isAdmin: request.session.isAdmin,
            type,
          }); 
        } else {
          response.redirect('/login')
        }
      });
      conn.release();
    });
  });
  
 router.post('/editType', function(request, response){
    const { id, name} = request.body;
  
    const query = `UPDATE tb_type SET name = "${name}" WHERE id = ${id}`;
  
    dbConnection.getConnection(function(err,conn){
      if(err) throw err;
      conn.query(query, function(err, result){
        if(err) throw err;
        response.redirect('type');
      });
      conn.release();
    });
  });

router.get('/deleteType/:id', function(request, response){
    const { id } = request.params;
    const query = `DELETE FROM tb_type WHERE id = ${id}`;
  
    dbConnection.getConnection(function(err,conn){
      if(err) throw err;
      conn.query(query, function(err, result){
        if(err) throw err;
        response.redirect('/car/type');
      });
      conn.release();
    });
  });

// render table Type
router.get('/rent', function(request,response) {
  const title = 'Dumbcars';

  const query = `SELECT * FROM tb_rent`;

  dbConnection.getConnection(function(err,conn){
    if(err) throw err;
    conn.query(query, function(err, results){
      if(err) throw err;

      let rent = [];
      for(let result of results){
        rent.push({
          id: result.id,
          borrow_date: result.borrow_date,
          return_date: result.return_date,
          sub_total: result.sub_total,
          user_id: result.user_id,
          car_id: result.car_id,
        });
      }

      if(rent.length == 0) {
        rent = false
      }

      // response.render('car/rent', {
      //   title,
      //   isLogin: request.session.isLogin,
      //   rent,
      // });

      if(request.session.isAdmin) {
        response.render('car/rent', {
          title,
          isAdmin: request.session.isAdmin,
          rent,
        }); 
      } else {
        response.redirect('/login')
      }
    });
    conn.release();
  });
  });

// render table Type
// router.get('/addRent', function(request,response) {
//   const title = 'Add rent';
//   const query = 'SELECT id, name from tb_car';

//   dbConnection.getConnection(function (err, conn) {
//     if (err) throw err;
//     conn.query(query, function (err, results) {
//       if (err) throw err;

//       let car = [];

//       for (let result of results) {
//         car.push({
//           id: result.id,
//           name: result.name,
//         });
//       }

//       if (car.length == 0) {
//         car = false;
//       }
      
//       response.render('car/addRent', {
//         title,
//         car,
//         isLogin: request.session.isLogin,
//       });

//       // if(request.session.isAdmin) {
//       //   response.render('car/addRent', {
//       //     title,
//       //     isAdmin: request.session.isAdmin,
//       //     car,
//       //   }); 
//       // } else {
//       //   response.redirect('/login')
//       // }
//     });
//   });
//   });

// router.post('/addRent', function(request, response){
//     const {borrow_date, return_date, sub_total, car_id} = request.body;
  
//     if(borrow_date == '' || return_date == '' || sub_total == '' || car_id == '') {
//       request.session.message = {
//         type: 'danger',
//         message: 'Please input all the field!',
//       };
//       return response.redirect('/car/addRent');
//     } 
  
//     const query = `INSERT INTO tb_rent (borrow_date, return_date, sub_total, car_id) VALUES ("${borrow_date}", "${return_date}", "${sub_total}", "${car_id}");`;
  
//     dbConnection.getConnection(function(err, conn){
//       if(err) throw err;
//       conn.query(query, function(err, result){
//         if(err) throw err;
  
//         request.session.message = {
//           type: 'success',
//           message: 'Add data success!',
//         };
//         response.redirect('/car/rent');
//       });
//       conn.release();
//     });
//   });
  

router.get('/addRent/:id', function (request, response) {
  const title = 'User Rent';
  const { id } = request.params;

  const query = `SELECT * FROM tb_car WHERE id = ${id}`;

  dbConnection.getConnection(function (err, conn) {
    if (err) throw err;
    conn.query(query, function (err, results) {
      if (err) throw err;

      const car = {
        ...results[0],
        photo: pathFile + results[0].photo,
      };

      response.render('car/addRent', {
        title,
        isLogin: request.session.isLogin,
        car,
      });
    });
    conn.release();
  });
});

router.post('/addRent', uploadFile('image'), function (request, response) {
  const { borrow_date, return_date, sub_total, car_id } = request.body;
  const query = `UPDATE tb_car SET status = "user" WHERE id = ${car_id}`;
  const user = request.session.user
  const user_id = user.id
  // console.log(query);
  dbConnection.getConnection(function (err, conn) {
    if (err) throw err;
    conn.query(query, function (err, results) {
      if (err) throw err;

      const queryRent = `INSERT INTO tb_rent (borrow_date, return_date, sub_total, user_id, car_id) VALUES ("${borrow_date}", "${return_date}", "${sub_total}", "${user_id}", "${car_id}");`;
      dbConnection.getConnection(function(err, conn){
        if(err) throw err;
        conn.query(queryRent, function(err, result){
          if(err) throw err;

          request.session.message = {
            type: 'success',
            message: 'Add data success!',
          };
          response.redirect('/');
        });
        conn.release();
      });
    });
    conn.release();
  });
});

router.get('/editRent/:id', function (request, response) {
    const title = 'Edit rent';
    const { id } = request.params;
  
    const query = `SELECT * FROM tb_rent WHERE id = ${id}`;
  
    dbConnection.getConnection(function (err, conn) {
      if (err) throw err;
      conn.query(query, function (err, results) {
        if (err) throw err;
  
        const rent = {
          ...results[0],
        };
        
        const query = `SELECT id, name from tb_car`;
        dbConnection.getConnection((err, conn) => {
          if(err) throw err;
  
          conn.query(query, (err, results)=> {
            if(err) throw err;
  
            let car = [];
            
            for (const result of results) {
              car.push({
                id: result.id,
                name: result.name,
              });
            }
  
            if (car.length == 0) {
              car = false;  
            }
            
            // response.render('car/editRent', {
            //   title,
            //   isLogin: request.session.isLogin,
            //   rent,
            //   car,
            // });

            if(request.session.isAdmin) {
              response.render('car/editRent', {
                title,
                isAdmin: request.session.isAdmin,
                rent,
                car,
              }); 
            } else {
              response.redirect('/login')
            }
  
          });
        });
      });
      conn.release();
    });
  });
  
router.post('/editRent', function (request, response) {
    var { id, borrow_date, return_date, sub_total, car_id } = request.body;
  
    const query = `UPDATE tb_rent SET borrow_date = "${borrow_date}", return_date = "${return_date}", sub_total = "${sub_total}", car_id = "${car_id}" WHERE id = ${id}`;
  
    dbConnection.getConnection(function (err, conn) {
      if (err) throw err;
      conn.query(query, function (err, results) {
        if (err) throw err;
  
        response.redirect('/car/rent');
      });
      conn.release();
    });
  });

router.get('/deleteRent/:id', function(request, response){
  const { id } = request.params;
  const query = `DELETE FROM tb_rent WHERE id = ${id}`;

  dbConnection.getConnection(function(err,conn){
    if(err) throw err;
    conn.query(query, function(err, result){
      if(err) throw err;
      response.redirect('/car/rent');
    });
    conn.release();
  });
});

  module.exports = router;