var express = require('express');
var oracledb = require('oracledb');
var router = express.Router();

// PUSH into THRESHOLDS
router.get('/', function(req, res) {

  //set oracledb format to get output in object format
  oracledb.outFormat = oracledb.OBJECT;

  //Process req parameters
  var routing_location_id = undefined, division_code = undefined, interval_code = undefined;
  var auto_min_attempts = null, auto_ccr = null, auto_aloc =null, auto_memo = null;
  var rev_min_attempts = null, rev_ccr = null, rev_aloc =null, rev_memo = null;
  
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

  //optional parameters
  if(typeof req.param('auto_min_attempts') !== 'undefined' && typeof req.param('auto_min_attempts') !== 'null'){
    auto_min_attempts = req.param('auto_min_attempts');
  }
  if(typeof req.param('auto_aloc') !== 'undefined' && typeof req.param('auto_aloc') !== 'null'){
    auto_aloc = req.param('auto_aloc');
  }
  if(typeof req.param('auto_ccr') !== 'undefined' && typeof req.param('auto_ccr') !== 'null'){
    auto_ccr = req.param('auto_ccr');
  }
  if(typeof req.param('auto_memo') !== 'undefined' && typeof req.param('auto_memo') !== 'null'){
    auto_memo = "'" + req.param('auto_memo') + "'";
  }

  if(typeof req.param('rev_min_attempts') !== 'undefined' && typeof req.param('rev_min_attempts') !== 'null'){
    rev_min_attempts = req.param('rev_min_attempts');
  }
  if(typeof req.param('rev_aloc') !== 'undefined' && typeof req.param('rev_aloc') !== 'null'){
    rev_aloc = req.param('rev_aloc');
  }
  if(typeof req.param('rev_ccr') !== 'undefined' && typeof req.param('rev_ccr') !== 'null'){
    rev_ccr = req.param('rev_ccr');
  }
  if(typeof req.param('rev_memo') !== 'undefined' && typeof req.param('rev_memo') !== 'null'){
    rev_memo =  "'" + req.param('rev_memo') + "'";
  }
  
  //establish connection to Oracle DB 
  oracledb.getConnection(
    {user : "trunkmon_app",
     password : "trunkmon_app",
     connectString : "10.227.1.96:1521/rdev"
    },
    function(err,connection) {
       if (err) {res.status(err.status || 500).json({error : "couldn't connect to oracle databse", type : err.message}); return;}  
       //Determine whether to insert or update
       var queryString = "SELECT * FROM trunkmon.threshold WHERE routing_location_id ="+ routing_location_id + " AND division_code =" + division_code +" AND interval_code =" + interval_code;
       var count = 0, operation_type = '';

       console.log(queryString); //added for debugging    
       connection.execute(queryString,
         function(err,result) {
            if (err) {res.status(err.status || 500).json({error : "couldn't read from oracle databse", type : err.message}); return;}
            count = result.rows.length;   
            
            if(count == 0) { //INSERT
                var valuesString = routing_location_id + "," + division_code + "," + interval_code + "," + auto_min_attempts + "," + auto_ccr + "," + auto_aloc + "," + auto_memo + "," + rev_min_attempts + "," + rev_ccr + ","  + rev_aloc + "," + rev_memo; 
                queryString = "INSERT INTO trunkmon.threshold (routing_location_id, division_code, interval_code, auto_min_attempts , auto_ccr, auto_aloc, auto_memo, rev_min_attempts, rev_ccr, rev_aloc, rev_memo) VALUES (" + valuesString + ")";
                operation_type = 'Insert';    
            }
            else { //UPDATE
                queryString = "UPDATE trunkmon.threshold SET auto_min_attempts=" + auto_min_attempts +  ",auto_ccr=" + auto_ccr + ",auto_aloc=" + auto_aloc+ ",auto_memo=" + auto_memo + ",rev_min_attempts=" + rev_min_attempts +  ",rev_ccr=" + rev_ccr + ",rev_aloc=" + rev_aloc+ ",rev_memo=" + rev_memo + " WHERE routing_location_id =" + routing_location_id + " AND division_code =" + division_code + " AND interval_code =" + interval_code;
                operation_type = 'Update'; 
            } 
            console.log(queryString); //added for debugging
            //execute Insert/Update query on the established connection
            connection.execute(queryString, 
               function(err,result) {
                  if (err) {res.status(err.status || 500).json({error : "couldn't push to oracle databse", type : err.message}); return;}
                  queryString = "COMMIT";
                  console.log(queryString); //added for debugging
                  connection.execute(queryString,
                     function(err,result) {
                        if (err) {res.status(err.status || 500).json({error : "couldn't commit to oracle databse", type : err.message}); return;}
                        res.status(200).json({status : "Push Operation Successful!", operation : operation_type});   
                  });    
            });
       });       
  }); 
}); 

module.exports = router;
