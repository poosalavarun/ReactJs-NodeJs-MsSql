const express = require('express');
const sql = require('mssql');
const app = express();

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
app.set('port', process.env.PORT || 3001);

// Express only serves static assets in production
console.log('NODE_ENV: ', process.env.NODE_ENV);
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));

  // Return the main index.html, so react-router render the route in the client
  app.get('/', (req, res) => {
    res.sendFile(path.resolve('client/build', 'index.html'));
  });
}

const server = 'varunsqltestserver.database.windows.net';
const user = 'testserver';
const pswd = 'Welcome089';
const dbname = 'books';

// config db ====================================
const config  ={
  server: server,
  user: user,
  password: pswd,
  database: dbname
};

const COLUMNS = ['last_name', 'first_name'];

app.get('/api/books', (req, res) => {
  const firstName = req.query.firstName;

  if (!firstName) {
    res.json({
      error: 'Missing required parameters'
    });
    return;
  }

  let queryString = ``;
  if (firstName == '*') {
    queryString = `SELECT * from authors`;
  } else {
    queryString = `SELECT * from authors WHERE first_name ='${firstName}'`;
    console.log(queryString);
  }

  // pool.query(queryString, function(err, rows, fields) {
  //   if (err) throw err;

  //   if (rows.length > 0) {
  //     res.json(
  //       rows.map(entry => {
  //         const e = {};
  //         COLUMNS.forEach(c => {
  //           e[c] = entry[c];
  //         });
  //         return e;
  //       })
  //     );
  //   } else {
  //     res.json([]);
  //   }
  // });
//-----------mssql code------------------

 // connect to your database
 sql.connect(config, function (err) {
   console.log('Sql connected'); 
  if (err) console.log(err);

  // create Request object
  var request = new sql.Request();
     
  // query to the database and get the records
  request.query(queryString, function (err, rows) {
      
      if (err) console.log(err)
      console.log(rows.recordset);
      if (rows.recordset.length > 0) {
        res.json(
          rows.recordset.map(entry => {
            const e = {};
            COLUMNS.forEach(c => {
              e[c] = entry[c];
            });
            return e;
          })
        );
      } else {
        res.json([]);
      }
      // send records as a response
      //res.send(rows);
      
  });
});


});

app.listen(app.get('port'), () => {
  console.log(`Find the server at: http://localhost:${app.get('port')}/`); // eslint-disable-line no-console
});
