const mysql=require('mysql');
var db_info={
    host:"192.168.20.19",
    user:"root",
    password:"Azsxdc123$",
    database:"good"
}

module.exports={
    db_info : {
        host:"192.168.20.19",
        user:"root",
        password:"Azsxdc123$",
        database:"good"
    },
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
    connectString : process.env.NODE_ORACLEDB_CONNECTIONSTRING || "192.168.20.13:1521/IDTCORA",
    sleep : function(ms){
        const wakeUpTime = Date.now() + ms;
        while (Date.now() < wakeUpTime) {}
    },
    emp_info_sync_query:`insert into good.emp_info 
    SELECT NULL, A.emp_id, A.emp_nm as 'emp_name', IFNULL(A.mobile_no,'None') as mobile_no, 
    IFNULL(A.office_tel_no,'None') as office_tel_no , A.org_nm as dept_name, 
    IFNULL(A.mail_addr,'None') as mail_addr, IFNULL(A.roll_info,'None') as roll_info, 
    IFNULL(C.post_nm, 'None') as post_name, IFNULL(C.duty_nm, 'None') as duty_name,
    IFNULL(B.URL,'None') as img_url FROM connect.hr_info as A 
    LEFT JOIN connect.gw_pic_info as B ON A.emp_id=B.emp_code 
    RIGHT JOIN (SELECT distinct emp_id, post_nm, duty_nm from connect.inf_app 
        WHERE (emp_id, sta_ymd, SEQ_NO) IN (
            SELECT emp_id, sta_ymd, MAX(SEQ_NO) AS SEQ_NO FROM connect.inf_app 
            WHERE (emp_id, sta_ymd) in(
                SELECT emp_id, MAX(sta_ymd) AS sta_ymd FROM (
                    SELECT emp_id, sta_ymd, SEQ_NO FROM connect.inf_app WHERE emp_id not in (
                        SELECT emp_id FROM connect.inf_app WHERE appnt_nm IN('퇴직','파견계약해지')
                    )
                )w GROUP BY emp_id)
            GROUP BY emp_id)
        AND appnt_nm NOT IN ('직급대우해지') 
        AND emp_nm NOT IN ('테과장','테스트')) AS C ON A.emp_id=C.emp_id`,
    seat_info_sync_query_1:`INSERT INTO good.seat_info(emp_id, emp_name, dept_name, post_name, seat_arrng) 
    SELECT emp_id, emp_name, dept_name, post_name, -1 FROM good.emp_info 
    WHERE (emp_id, emp_name, dept_name, post_name) NOT IN (
        SELECT emp_id, emp_name, dept_name, post_name FROM seat_info
    )`,
    seat_info_sync_query_2:`DELETE FROM good.seat_info 
    WHERE (emp_id, emp_name, dept_name, post_name) NOT IN (
        SELECT emp_id, emp_name, dept_name, post_name FROM good.emp_info
    )`,
    
}