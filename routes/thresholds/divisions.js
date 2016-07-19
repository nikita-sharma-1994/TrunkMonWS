var express = require('express');
var oracledb = require('oracledb');
var router = express.Router();

//set oracledb format to get output in object format
oracledb.outFormat = oracledb.OBJECT;

// GET divisions
router.get('/', function(req, res) {
  oracledb.getConnection(
    {user : "trunkmon_app",
     password : "trunkmon_app",
     connectString : "10.227.1.96:1521/rdev"
    },
    function(err,connection) {
       if (err) {res.status(err.status || 500).json({error : "couldn't connect to oracle databse", type : err.message}); return;}
       connection.execute(
         "SELECT DIVISION_CODE, DIVISION_NAME FROM TRUNKMON.DIVISION_LOOKUP",
         function(err,result) {
            if (err) {res.status(err.status || 500).json({error : "couldn't read from oracle databse", type : err.message}); return;}
            res.status(200).json(result.rows);     
       }); 
  }); 
});

module.exports = router;
