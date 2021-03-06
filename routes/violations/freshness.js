var express = require('express');
var oracledb = require('oracledb');
var router = express.Router();

// Check freshness
router.get('/', function(req, res) {
  //set oracledb format to get output in array format
  oracledb.outFormat = oracledb.ARRAY;

  if(typeof req.param('datetime')  === 'undefined' || typeof req.param('datetime')  === 'null'){
  res.status(500).json({error : "Missing Parameter : datetime"}); return;}
  oracledb.getConnection(
    {user : "trunkmon_app",
     password : "trunkmon_app",
     connectString : "10.227.1.96:1521/rdev"
    },
    function(err,connection) {
       if (err) {res.status(err.status || 500).json({error : "couldn't connect to oracle databse", type : err.message}); return;}
       var queryString = "SELECT CREATE_DATE FROM TRUNKMON.GEN_SESSION";
       connection.execute(queryString,
         function(err,result) {
            if (err) {res.status(err.status || 500).json({error : "couldn't read from oracle databse", type : err.message}); return;}
            /*res.status(200).json({datetime1 : new Date(result.rows[0]), datetime2 : new Date(result.rows[1]), datetime3 : new Date(req.param('datetime')), length : result.rows.length});*/
          
            for(var i = 0; i < result.rows.length; i++){
              if(new Date(result.rows[i]) > new Date(req.param('datetime'))) {
                 res.status(200).json({isFresh : "false", changeTime : result.rows[i]}); return;
              } 
            }
            res.status(200).json({isFresh : "true"}); 
       }); 
  }); 
});

module.exports = router;
