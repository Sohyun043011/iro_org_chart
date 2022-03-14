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
    }
}