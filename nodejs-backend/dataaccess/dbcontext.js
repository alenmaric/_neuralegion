var mysql = require('mysql');

//local mysql db connection
var connection = mysql.createConnection({
    host     : 'db',
    port     : '3306',
    user     : 'mysql',
    password : 'mysecret',
    database : 'lambdaaws'
});

/*var connection = mysql.createConnection({
    host     : 'localhost',
    port     : '3306',
    user     : 'root',
    password : '',
    database : 'lambdaaws'
});
*/
connection.connect(function(err) {
    if (err) throw new Error('database failed to connect 2');

});

module.exports = connection;


