var express = require('express');
var oracledb = require('oracledb');
var router = express.Router();

// PUSH into THRESHOLDS
router.get('/', function(req, res) {

  //set oracledb format to get output in object format
  oracledb.outFormat = oracledb.OBJECT;

  //Process req parameters
  var routing_location_id = undefined, division_code = undefined, interval_code = undefined;
  
  //required parameters
  if(req.param('routing_location_id')  === undefined || req.param('routing_location_id')  === null){
     res.status(500).json({error : "Missing Parameter : routing_location_id"}); return;
  } 
  routing_location_id = req.param('routing_location_id');
  if(req.param('division_code')  === undefined || req.param('division_code')  === null){
     res.status(500).json({error : "Missing Parameter : division_code"}); return;
  } 
  division_code = "'" + req.param('division_code') + "'"; 
  if(req.param('interval_code')  === undefined || req.param('interval_code')  === null){
     res.status(500).json({error : "Missing Parameter : interval_code"}); return;
  } 
  interval_code = "'" + req.param('interval_code') + "'";
 
  //establish connection to Oracle DB 
  oracledb.getConnection(
    {user : "trunkmon_app",
     password : "trunkmon_app",
     connectString : "10.227.1.96:1521/rdev"
    },
    function(err,connection) {
       if (err) {res.status(err.status || 500).json({error : "couldn't connect to oracle databse", type : err.message}); return;}  
       
       //Determine whether record exists
       var queryString = "SELECT * FROM trunkmon.threshold WHERE routing_location_id ="+ routing_location_id + " AND division_code =" + division_code +" AND interval_code =" + interval_code;
       var count = 0;
       console.log(queryString); //added for debugging    
       connection.execute(queryString,
         function(err,result) {
            if (err) {res.status(err.status || 500).json({error : "couldn't read from oracle databse", type : err.message}); return;}
            count = result.rows.length;   
            if(count == 0) {res.status(500).json({error : "No threshold exists for the parameters specified"}); return; }
            
            queryString = "DELETE FROM trunkmon.threshold WHERE routing_location_id =" + routing_location_id + " AND division_code =" + division_code + " AND interval_code =" + interval_code;
            console.log(queryString); //added for debugging

            //execute delete query on the established connection
            connection.execute(queryString, 
               function(err,result) {
                  if (err) {res.status(err.status || 500).json({error : "couldn't delete from oracle databse", type : err.message}); return;}
                  queryString = "COMMIT";
                  console.log(queryString); //added for debugging
                  connection.execute(queryString,
                     function(err,result) {
                        if (err) {res.status(err.status || 500).json({error : "couldn't commit to oracle databse", type : err.message}); return;}
                        res.status(200).json({status : "Delete Operation Successful!"});   
                  });    
            });
       });       
  }); 
}); 

module.exports = router;
