const mysql=require('mysql');
const connection=mysql.createPool({
  connectionLimit : 10,
  host:'localhost',
  user:'panallyadmin',
  password:'admin@panally',
  database:'panally'
});
module.exports=connection;
