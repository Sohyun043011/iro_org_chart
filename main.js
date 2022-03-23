const req=require('request');
const http=require('http');
const fs = require('fs');
var url = require('url');
var path=require('path')
const express=require('express');
const res = require('express/lib/response');
const { DEC8_SWEDISH_CI } = require('mysql/lib/protocol/constants/charsets');
var db_config=require(path.join(__dirname,'db_connect.js'));

const port=3000; //포트접속정보

conn=db_config.init();//db connection handler 가져오기
db_config.connect(conn);

const app=express(); 

app.set('views','./views');
app.set('view engine','ejs');
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname+'/css')));
app.use(express.static(path.join(__dirname+'/node_modules')));
app.use(express.static(path.join(__dirname+'/img')));

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(bodyParser.json()); // for parsing application/json





app.get('/', (request, response)=>{ // http://[host]:[port]/로 접속 시 나올 페이지
    console.log('connection success');
    
    var sql="";
    var dept_info={'해외마케팅팀':2,'국내관광팀':2,'스마트관광팀':4,'MICE뷰로':2};
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

    sql=`INSERT INTO good.seat_info(emp_id, emp_name, dept_name, seat_arrng) 
    SELECT emp_id, emp_name, dept_name, -1 FROM good.emp_info 
    WHERE (emp_id, emp_name, dept_name) NOT IN (
        SELECT emp_id, emp_name, dept_name FROM seat_info
    )`;
    conn.query(sql, function(err, rows, fileds){
        if(err) console.log('Insert query is not executed.');
        else console.log('Insert query executed successfully.');
    });

    sql=`DELETE FROM good.seat_info 
    WHERE (emp_id, emp_name, dept_name) NOT IN (
        SELECT emp_id, emp_name, dept_name FROM good.emp_info
    )`;
    conn.query(sql, function(err, rows, fileds){
        if(err) console.log('Delete query is not executed.');
        else console.log('Delete query executed successfully.');
    });

    /*갱신 종료 */

    sql=`select * from good.emp_info A left join good.seat_info B on A.emp_id=B.emp_id`;
    conn.query(sql, function(err, rows, fileds){
        if(err) console.log('query is not executed.');
        else {
            console.log(rows);
            response.render('index.ejs', {list:rows});
            // response.render('pr.ejs', {list:rows});
            
        }
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

app.post('/detail',function(req,res){

    // const _id = req.body._id;
    var id = req.body.id;
    console.log("before query");
    console.log(id);
    var sql = `SELECT emp_name,emp_id,mobile_no,office_tel_no,dept_name,post_name,roll_info,img_url FROM good.emp_info WHERE emp_id='${id}'`;
    conn.query(sql, function(err, info, fields){
        if(err) console.log('query is not executed.');
        else {
            // stringify : JSOn parsing 가능한 text로 만들어줌
            // 그 text를 JSON 자료구조로 만들어주는 것이 JSON.parse
            // res.json : 
            res.json(JSON.parse(JSON.stringify(info)));
        }
            
    })
});

app.post('/move/:emp_id/:seat_arrng', function(req,res){
    var emp_id=req.params.emp_id;
    var seat_arrng=req.params.seat_arrng;

    var sql=`UPDATE good.seat_info 
    SET seat_arrng=${seat_arrng}
    WHERE emp_id='${emp_id}'`

    conn.query(sql, function(err, info, fields){
        if(err) console.log('query is not executed.');
    })
    console.log('좌석번호가 변경되었습니다.')
});

app.post('/add/:dept_name', function(req,res){
    var dept_name=res.params.dept_name;

    var sql=`select emp_id, emp_name, '${dept_name}' from seat_info
    where dept_name='${dept_name}' and seat_arrng=-1`

    conn.query(sql, function(err, info, fields){
        if(err) console.log('query is not executed.');
        else {
            res.json(JSON.parse(JSON.stringify(info)));
        }
            
    })
});


app.use((request, response)=>{ //잘못된 url로 접근 시
    response.send(`<h1>Sorry, page not found.</h1>`);
});

app.listen(port, function(){ // 3000번 포트로 listen
    console.log(`Server running at ${port}`);
});

