var express = require('express');
var oracledb = require('oracledb');
var router = express.Router();

/* GET countries. */
router.get('/', function(req, res) {
  oracledb.getConnection(
    {user : "trunkmon_app",
     password : "trunkmon_app",
     connectString : "10.227.1.96:1521/rdev"
    },
    function(err,connection) {
       if (err) {res.status(500).json({error : "couldn't connect to oracle databse"}); return;}
       connection.execute(
         "SELECT COUNTRY_ID, DESCRIPTION FROM TRUNKMON.ACTIVE_LOCATION",
         function(err,result) {
            if (err) {res.status(500).json({error : "couldn't read from oracle databse"}); return;}
            res.status(200).json(result.rows);     
       }); 
  }); 
});

module.exports = router;
