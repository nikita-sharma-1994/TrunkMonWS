var express = require('express');
var oracledb = require('oracledb');
var router = express.Router();

// GET from VIOLATIONs 
router.get('/', function(req, res) {

  //set oracledb format to get output in object format
  oracledb.outFormat = oracledb.OBJECT;

  //Process req parameters
  if(typeof req.param('date')  === 'undefined' || typeof req.param('date')  === 'null'){
    res.status(500).json({error : "Missing Parameter : date"}); return;
  }
  var date = "'" + req.param('date') + "'";
  //var date = req.param('date');

  if(typeof req.param('hour')  === 'undefined' || typeof req.param('hour')  === 'null'){
    res.status(500).json({error : "Missing Parameter : hour"}); return;
  }
  var hour = "'" + req.param('hour') + "'";

  //Optional parameters
  var countryStartsFrom = undefined, divisionName = undefined ;
  if(typeof req.param('countryStartsFrom') !== 'undefined' && typeof req.param('countryStartsFrom') !== 'null'){
    countryStartsFrom = req.param('countryStartsFrom').split(',');
  }
  if(typeof req.param('divisionName')  !== 'undefined' && typeof req.param('divisionName')  !== 'null'){
    divisionName = req.param('divisionName').split(',');
  } 

  var showAutoPulled = false, showRevPulled = false, showSaved = false, showExcluded = false, showMngdCtrsOnly = false;
  if(typeof req.param('showAutoPulled') !== 'undefined' && typeof req.param('showAutoPulled') !== 'null' && req.param('showAutoPulled') === 'true'){
    showAutoPulled = true;
  }
  if(typeof req.param('showRevPulled') !== 'undefined' && typeof req.param('showRevPulled') !== 'null' && req.param('showRevPulled') === 'true'){
    showRevPulled = true;
  }
  if(typeof req.param('showSaved') !== 'undefined' && typeof req.param('showSaved') !== 'null' && req.param('showSaved') === 'true'){
    showSaved = true;
  }
  if(typeof req.param('showExcluded') !== 'undefined' && typeof req.param('showExcluded') !== 'null' && req.param('showExcluded') === 'true'){
    showExcluded = true;
  }
  if(typeof req.param('showMngdCtrsOnly') !== 'undefined' && typeof req.param('showMngdCtrsOnly') !== 'null' && req.param('showMngdCtrsOnly') === 'true'){
    showMngdCtrsOnly = true;
  }
  
  //The SQL query
  var queryString = "SELECT violation.division_code, division_lookup.division_name, account.account_id, account.last_name, violation.clli, violation.location_id, active_location.description, violation.attempts, violation.completed, (violation.attempts - violation.completed) as failed, violation.minutes, (CASE violation.attempts WHEN 0 then 0 else violation.completed/violation.attempts END) as CCR,(CASE violation.completed WHEN 0 then 0 else violation.minutes/violation.completed END) as ALOC, violation.switch_id, (CASE trunkmon.threshold.auto_ccr WHEN null  then trunkmon.threshold_default.auto_ccr else trunkmon.threshold.auto_ccr END) as AUTO_CCR, (CASE trunkmon.threshold.auto_aloc WHEN null then trunkmon.threshold_default.auto_aloc else trunkmon.threshold.auto_aloc END) as AUTO_ALOC, (CASE trunkmon.threshold.rev_ccr WHEN null then trunkmon.threshold_default.rev_ccr else trunkmon.threshold.rev_ccr END) as REV_CCR, (CASE trunkmon.threshold.rev_aloc WHEN null then trunkmon.threshold_default.rev_aloc else trunkmon.threshold.rev_aloc END) as REV_ALOC,gen_session.HR FROM ((((((trunkmon.violation JOIN tel.trunk_group ON trunk_group.trunk_group = violation.trunk_group AND trunk_group.switch_id = violation.switch_id AND trunk_group.direction = 'O') JOIN tel.trunk_assignment ON trunk_assignment.trunk_group_id = trunk_group.trunk_group_id) JOIN telecom.account ON account.account_id = trunk_assignment.account_id) JOIN trunkmon.division_lookup ON violation.division_code = division_lookup.division_code) JOIN trunkmon.active_location ON violation.location_id = active_location.routing_location_id) JOIN (trunkmon.threshold LEFT JOIN trunkmon.threshold_default ON trunkmon.threshold.division_code = trunkmon.threshold_default.division_code) ON violation.division_code = threshold.division_code AND violation.location_id = threshold.routing_location_id) JOIN trunkmon.gen_session ON gen_session.session_id = violation.session_id WHERE gen_session.DT=TO_DATE("+ date +",'DD-Mon-YYYY') AND gen_session.HR=" + hour;

  if(typeof countryStartsFrom  !== 'undefined'){
     var formatted_csf = "'" + countryStartsFrom.join("','") + "'";
     queryString = queryString.concat(" AND SUBSTR(active_location.description,0,1) IN ("+ formatted_csf +")"); 
  }

  if(typeof divisionName  !== 'undefined'){
     var formatted_dName = "'" + divisionName.join("','") + "'";
     queryString = queryString.concat(" AND division_lookup.division_name IN (" + formatted_dName + ")");
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
