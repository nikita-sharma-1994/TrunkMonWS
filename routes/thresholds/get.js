var express = require('express');
var oracledb = require('oracledb');
var router = express.Router();

//set oracledb format to get output in object format
oracledb.outFormat = oracledb.OBJECT;

// GET from THRESHOLDs 
router.get('/', function(req, res) {

  //Process req parameters
  var countryNegative = false, countryStartsFrom = undefined, countryName = undefined, divisionName = undefined;
  if(typeof req.param('countryNegative') !== 'undefined' && typeof req.param('countryNegative') !== 'null' && req.param('countryNegative') === 'true'){
    countryNegative = true;
  }
  if(typeof req.param('countryStartsFrom') !== 'undefined' && typeof req.param('countryStartsFrom') !== 'null'){
    countryStartsFrom = req.param('countryStartsFrom').split(',');
  }
  if(typeof req.param('countryName') !== 'undefined' && typeof req.param('countryName')  !== 'null'){
    countryName = req.param('countryName').split(',');
  } 
  if(typeof req.param('divisionName')  !== 'undefined' && typeof req.param('divisionName')  !== 'null'){
    divisionName = req.param('divisionName').split(',');
  } 

  //The SQL query
  var queryString = "SELECT threshold.routing_location_id, threshold.division_code, threshold.interval_code, division_lookup.division_name, active_location.description, (CASE trunkmon.threshold.auto_ccr WHEN null then trunkmon.threshold_default.auto_ccr else trunkmon.threshold.auto_ccr END) as AUTO_CCR, (CASE trunkmon.threshold.auto_aloc WHEN null then trunkmon.threshold_default.auto_aloc else trunkmon.threshold.auto_aloc END) as AUTO_ALOC, (CASE trunkmon.threshold.auto_memo WHEN null then trunkmon.threshold_default.auto_memo else trunkmon.threshold.auto_memo END) as AUTO_MEMO, (CASE trunkmon.threshold.auto_min_attempts WHEN null then trunkmon.threshold_default.auto_min_attempts else trunkmon.threshold.auto_min_attempts END) as AUTO_MIN_ATTEMPTS, (CASE trunkmon.threshold.rev_ccr WHEN null then trunkmon.threshold_default.rev_ccr else trunkmon.threshold.rev_ccr END) as REV_CCR,(CASE trunkmon.threshold.rev_aloc WHEN null then trunkmon.threshold_default.rev_aloc else trunkmon.threshold.rev_aloc END) as REV_ALOC, (CASE trunkmon.threshold.rev_memo WHEN null then trunkmon.threshold_default.rev_memo else trunkmon.threshold.rev_memo END) as REV_MEMO, (CASE trunkmon.threshold.rev_min_attempts WHEN null then trunkmon.threshold_default.rev_min_attempts else trunkmon.threshold.rev_min_attempts END) as REV_MIN_ATTEMPTS FROM ((trunkmon.threshold JOIN trunkmon.division_lookup ON threshold.division_code = division_lookup.division_code) JOIN trunkmon.active_location ON threshold.routing_location_id = active_location.routing_location_id) LEFT JOIN Trunkmon.threshold_default ON trunkmon.threshold.division_code = trunkmon.threshold_default.division_code";

  //WHERE conditions in queryString based on request parameters
  var divisionWhereFlag = true;

  if(typeof countryName  !== 'undefined'){
     var formatted_cName = "'" + countryName.join("','") + "'";
     divisionWhereFlag = false;
     queryString = queryString.concat(" WHERE active_location.description");
     if(countryNegative){ queryString = queryString.concat(" NOT");}
     queryString = queryString.concat(" IN ("+ formatted_cName +")"); 
  }
  else if(typeof countryStartsFrom  !== 'undefined'){
     var formatted_csf = "'" + countryStartsFrom.join("','") + "'";
     divisionWhereFlag = false;
     queryString = queryString.concat(" WHERE SUBSTR(active_location.description,0,1)");
     if(countryNegative){ queryString = queryString.concat(" NOT");}
     queryString = queryString.concat(" IN ("+ formatted_csf +")");    
  }
   
  if(typeof divisionName  !== 'undefined'){
     var formatted_dName = "'" + divisionName.join("','") + "'";
     if(divisionWhereFlag){
         queryString = queryString.concat(" WHERE");
     }
     else {
         queryString = queryString.concat(" AND");
     }
     queryString = queryString.concat(" division_lookup.division_name IN (" + formatted_dName + ")");
  }

  console.log(queryString); //added for debugging

  //establish connection to Oracle DB 
  oracledb.getConnection(
    {user : "trunkmon_app",
     password : "trunkmon_app",
     connectString : "10.227.1.96:1521/rdev"
    },
    function(err,connection) {
       if (err) {res.status(err.status || 500).json({error : "couldn't connect to oracle databse", type : err.message}); return;}    
       //execute query on the established connection
       connection.execute(queryString,
         function(err,result) {
            if (err) {res.status(err.status || 500).json({error : "couldn't read from oracle databse", type : err.message}); return;}
            res.status(200).json(result.rows);   
       }); 
  }); 
});

module.exports = router;
