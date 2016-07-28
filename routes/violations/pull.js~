var express = require('express');
var oracledb = require('oracledb');
var router = express.Router();

// PULL VIOLATION 
router.get('/', function(req, res) {

  //set oracledb format to get output in object format
  oracledb.outFormat = oracledb.OBJECT;
  oracledb.autoCommit = true;

  //Process req parameters
  if(typeof req.param('p_Division')  === 'undefined' || typeof req.param('p_Division')  === 'null'){
    res.status(500).json({error : "Missing Parameter : p_Division"}); return;
  }
  var p_Division = "'" + req.param('p_Division') + "'";

  if(typeof req.param('p_Location')  === 'undefined' || typeof req.param('p_Location')  === 'null'){
    res.status(500).json({error : "Missing Parameter : p_Location"}); return;
  }
  var p_Location = "'" + req.param('p_Location') + "'";

  if(typeof req.param('p_Clli')  === 'undefined' || typeof req.param('p_Clli')  === 'null'){
    res.status(500).json({error : "Missing Parameter : p_Clli"}); return;
  }
  var p_Clli = "'" + req.param('p_Clli') + "'";

  if(typeof req.param('Attempts')  === 'undefined' || typeof req.param('Attempts')  === 'null'){
    res.status(500).json({error : "Missing Parameter : Attempts"}); return;
  }
  var Attempts = req.param('Attempts');

  if(typeof req.param('Completed')  === 'undefined' || typeof req.param('Completed')  === 'null'){
    res.status(500).json({error : "Missing Parameter : Completed"}); return;
  }
  var Completed = req.param('Completed');

  if(typeof req.param('Minutes')  === 'undefined' || typeof req.param('Minutes')  === 'null'){
    res.status(500).json({error : "Missing Parameter : Minutes"}); return;
  }
  var Minutes = req.param('Minutes');

  if(typeof req.param('CCR')  === 'undefined' || typeof req.param('CCR')  === 'null'){
    res.status(500).json({error : "Missing Parameter : CCR"}); return;
  }
  var CCR = req.param('CCR');

  if(typeof req.param('ALOC')  === 'undefined' || typeof req.param('ALOC')  === 'null'){
    res.status(500).json({error : "Missing Parameter : ALOC"}); return;
  }
  var ALOC = req.param('ALOC');

  if(typeof req.param('User')  === 'undefined' || typeof req.param('User')  === 'null'){
    res.status(500).json({error : "Missing Parameter : User"}); return;
  }
  var User = req.param('User');

  if(typeof req.param('p_TOD')  === 'undefined' || typeof req.param('p_TOD')  === 'null'){
    res.status(500).json({error : "Missing Parameter : p_TOD"}); return;
  }
  var p_TOD = "'" + req.param('p_TOD') + "'";

  if(typeof req.param('p_TOD2CH')  === 'undefined' || typeof req.param('p_TOD2CH')  === 'null'){
    res.status(500).json({error : "Missing Parameter : p_TOD2CH"}); return;
  }
  var p_TOD2CH = "'" + req.param('p_TOD2CH') + "'";

  //optional parameter
  var p_TOD_SCHEDULE = null;
  if(typeof req.param('p_TOD_SCHEDULE') !== 'undefined' && typeof req.param('p_TOD_SCHEDULE') !== 'null'){
    p_TOD_SCHEDULE = "'" + req.param('p_TOD_SCHEDULE') + "'";
  }
  
  //The SQL query
  var sNote = '[ TGQM=Review; Att={'+ Attempts +'}; Cmp={'+ Completed +'}; Min={'+ Minutes +'}; Ccr={'+ CCR +':0.0%}; Aloc={'+ ALOC +':0.00}; uid={'+ User +'}]'; 

  var params = p_Division + ',' + p_Location + ',' + p_Clli + ',\'' + sNote + '\',' + p_TOD + ',' + p_TOD2CH + ',' + p_TOD_SCHEDULE; 
  var rvalue = { rval: {type: oracledb.STRING, dir: oracledb.BIND_OUT} };
  var queryString = "BEGIN trunkmon.intern_package.pull_tg_tod_intern("+ params +",:rval); END;";

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
       connection.execute(queryString, rvalue,
         function(err,result) {
            if (err) {res.status(err.status || 500).json({error : "couldn't read from oracle databse", type : err.message}); return;}
            res.status(200).json({status: 'Pull successful', message : result.outBinds});   
       }); 
  });  
});

module.exports = router;
