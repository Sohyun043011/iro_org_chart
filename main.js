const req=require('request');
const http=require('http');
const fs = require('fs');
var url = require('url');
var path=require('path')
const express=require('express');
const res = require('express/lib/response');
var db_config=require(path.join(__dirname,'db_connect.js'));

const port=3000; //포트접속정보

conn=db_config.init();//db connection handler 가져오기
db_config.connect(conn);

const app=express(); 

app.set('views','./');
app.set('view engine','ejs');
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname+'/css')));
app.use(express.static(path.join(__dirname+'/node_modules')));
app.use(express.static(path.join(__dirname+'/img')));

app.get('/', (request, response)=>{ // http://[host]:[port]/로 접속 시 나올 페이지
    var sql="";
    /*good.emp_info 갱신 */
    sql=`truncate table good.emp_info`; //테이블 비우기
    conn.query(sql, function(err, rows, fileds){
        if(err) console.log('Truncate query is not executed.');
        else console.log('Truncate query executed successfully.');
    });
    sql=`insert into good.emp_info 
    SELECT NULL, A.emp_id, A.emp_nm as 'emp_name', IFNULL(A.mobile_no,'None') as mobile_no, 
    IFNULL(A.office_tel_no,'None') as office_tel_no , A.org_nm as dept_name, 
    IFNULL(A.mail_addr,'None') as mail_addr, IFNULL(A.roll_info,'None') as roll_info, 
    IFNULL(C.post_nm, 'None') as post_name, IFNULL(C.duty_nm, 'None') as duty_name,
    IFNULL(B.URL,'None') as img_url FROM connect.hr_info as A 
    LEFT JOIN connect.gw_pic_info as B ON A.emp_id=B.emp_code 
    RIGHT JOIN (SELECT distinct emp_id, post_nm, duty_nm from connect.inf_app 
    WHERE (emp_id, sta_ymd) IN (SELECT emp_id, MAX(sta_ymd) AS sta_ymd 
    FROM (SELECT * FROM connect.inf_app WHERE emp_id not IN 
    ( SELECT emp_id FROM connect.inf_app WHERE appnt_nm IN('퇴직','파견계약해지')))t 
    GROUP BY emp_nm) AND appnt_nm NOT IN ('직급대우해지') 
    AND emp_nm NOT IN ('테과장','테스트')) AS C ON A.emp_id=C.emp_id`;
    conn.query(sql, function(err, rows, fileds){
        if(err) console.log('Insert query is not executed.');
        else console.log('Insert query executed successfully.');
    })

    /*갱신 종료 */
    conn.query(sql, function(err, rows, fileds){
        if(err) console.log('query is not executed.');
<<<<<<< HEAD
        else{
            console.log(rows);
            response.render('index.ejs', {list:rows});

        } 
=======
        else {
            console.log(rows);
            response.render('index.ejs', {list:rows});
        }
    })

    sql=`select * from good.emp_info A left join good.seat_info B on A.emp_id=B.emp_id`;
    conn.query(sql, function(err, rows, fileds){
        if(err) console.log('query is not executed.');
        else {
            console.log(rows);
            response.render('index.ejs', {list:rows});
        }
>>>>>>> f0f2269b43e674ed802fd103b0a74c45dd5f6cc5
    })
    
});
app.get('/edit', (request, response)=>{ // http://[host]:[port]/edit으로 접속 시 나올 페이지
    //페이지에 수정 버튼으로 해당 url redirection하게 만들기
    response.sendFile(__dirname+'/edit.ejs')
});

app.get('/search', (request, response)=>{ //http://[host]:[port]/search으로 접속 시 나올 페이지 (사원 검색 페이지)
    var sql=`select * from connec.hr_info`;
    conn.query(sql, function(err, rows, fileds){
        if(err) console.log('query is not executed.');
        else {
            console.log(rows);
            response.render('search.ejs', {list:rows});
        }
    })
})


app.use((request, response)=>{ //잘못된 url로 접근 시
    response.send(`<h1>Sorry, page not found.</h1>`);
});

app.listen(port, function(){ // 3000번 포트로 listen
    console.log(`Server running at ${port}`);
});

