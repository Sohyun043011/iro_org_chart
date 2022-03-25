const mysql=require('mysql');
var db_info={
    host:"192.168.20.19",
    user:"root",
    password:"Azsxdc123$",
    database:"good"
}

module.exports={
    init:function(){
        return mysql.createConnection(db_info);
    },
    connect: function(conn){
        conn.connect(function(err){
            if(err) console.error("mysql connection error : " + err);
            else console.log('mysql is connected successfully.');
        })
    },
    user : process.env.NODE_ORACLEDB_USER || "silver", 
    password : process.env.NODE_ORACLEDB_PASSWOR || "silver", 
    connectString : process.env.NODE_ORACLEDB_CONNECTIONSTRING || "192.168.20.13:1521/IDTCORA" 
}