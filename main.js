var oracledb=require('oracledb');
const req=require('request');
const http=require('http');
const fs = require('fs');
var url = require('url');
var path=require('path')
const express=require('express');
const res = require('express/lib/response');
const session=require('express-session');
const mysql_store=require('express-mysql-session')(session);
const requestIp=require('request-ip');
const { DEC8_SWEDISH_CI } = require('mysql/lib/protocol/constants/charsets');
var db_config=require(path.join(__dirname,'db_connect.js'));
var mysql_config=require(path.join(__dirname,'login_info.js'))
var session_store= new mysql_store(mysql_config.options);

const port=3000; //포트접속정보

const user_pwd='ito1234!@#'

const app=express(); 

app.set('views','./views');
app.set('view engine','ejs');
app.use(session({
    secret:'kjwlakwf@$#!',
    resave:true,
    saveUninitialized: false,
    cookie:{
        maxAge:60000,
        httpOnly:false
    },
    store:session_store,
    
    rolling:true
}));
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname+'/css')));
app.use(express.static(path.join(__dirname+'/node_modules')));
app.use(express.static(path.join(__dirname+'/img')));
app.use(express.static(path.join(__dirname+'/views')));

var bodyParser = require('body-parser');
const { json } = require('express/lib/response');
const login_info = require('./login_info');
const db_connect = require('./db_connect');
const { sleep } = require('./db_connect');
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(bodyParser.json()); // for parsing application/json



app.post('/login',(req,res)=>{
    conn=db_config.init();//db connection handler 가져오기
    db_config.connect(conn);
    console.log('req.body.url : '+req.body.url);
    const url_link=new URL(req.body.url);
    console.log('url link : '+url_link.pathname);
    var param_id='Anonymous'; //default id 설정
    
    var param_pw = req.body.password || req.query.password;
    sql='select * from good.sessions';

    conn.query(sql, async function(err, rows){
        list=JSON.parse(JSON.stringify(rows));
        console.log(list)
        if (list.length!=0){
            console.log("session이 하나 이상 존재합니다.");
            console.log(req.session.is_logined);
            if(req.session.is_logined){
                console.log("session이 하나 이상 존재합니다.")
                res.json({result:'redirect', url:'/edit'});
            }else{
                console.log('이미 다른 유저가 로그인하였습니다.');
                res.json({error:"Already another user logged in."});
            }
        }
        else if(param_pw==user_pwd){
            const connection_info=requestIp.getClientIp(req).split(':'); // req 헤더정보 분리
            console.log(connection_info)
            if(connection_info.length==4){ // ipv4 추출
                param_id=connection_info[3];
            }
    
            req.session.user=param_id;
            req.session.is_logined=true;
            if(url_link.pathname=='/'){
                req.session.floor='16';
            }else if(url_link.pathname=='/17F/'){
                req.session.floor='17';
            }else if(url_link.pathname=='/conv'){
                req.session.floor='conv';
            }
            req.session.save(err=>{
                if(err) throw err;
                console.log('session created');
                res.json({result:'redirect', url:'/edit'});

            })
        }else{
            console.log('password is not correct.');
            console.log(param_pw);
            console.log(user_pwd);
            res.json({error:"Password is not correct."});
        }
    });
    
});
app.get('/logout', (req, res)=>{
    
    if(req.session.is_logined){
        console.log('로그아웃');

        var floor=req.session.floor;
        req.session.destroy(function(err){
            if(err) throw err;
            console.log('세션 삭제하고 로그아웃됨');
            if(floor=='16'){
                res.redirect('/');
            }else if(floor=='17'){
                res.redirect('/'+floor+'F');
            }else if(floor=='conv'){
                res.redirect('/'+floor);
            }
            
        });
    }
    else{
        console.log('로그인 상태 아님');
        res.redirect('/');
    }
});
app.get('/', (request, response)=>{ // http://[host]:[port]/로 접속 시 나올 페이지
    conn=db_config.init();//db connection handler 가져오기
    db_config.connect(conn);
    console.log('connection success');
    var sql=""
    /*good.emp_info 갱신 */

    conn.query(`truncate table good.emp_info`, function(err, rows, fileds){
        if(err) console.log('Truncate query is not executed.');
        else console.log('Truncate query executed successfully.');
    });
    try{
        conn.query(db_connect.emp_info_sync_query, function(err, rows, fileds){
            if(err) {
                console.log(err);
                throw 'Insert query is not executed.';
            }
            else console.log('Insert query executed successfully.');
        })
    }catch{
        sleep(3000);
        conn.query(db_connect.emp_info_sync_query, function(err, rows, fileds){
            if(err) console.log(err);
            else console.log('Insert query executed successfully.');
        })
    }

    conn.query(db_connect.seat_info_sync_query_1, function(err, rows, fileds){
        if(err) console.log(err);
        else console.log(rows.affectedRows);
    });

    conn.query(db_connect.seat_info_sync_query_2, function(err, rows, fileds){
        if(err) console.log(err);
        else console.log(rows.affectedRows + " rows affected");
    });

    /*갱신 종료 */
    sql=`select * from good.emp_info A left join good.seat_info B on A.emp_id=B.emp_id`;
    conn.query(sql, function(err, rows, fileds){
        if(err) console.log(err);
        else {
            response.render('16F/index', {list:rows});
            
        }
    })

    conn.end();
});
app.get('/17F',(request,response)=>{
    conn=db_config.init();//db connection handler 가져오기
    db_config.connect(conn);
    console.log('connection success');
    
    var sql="";
    /*good.emp_info 갱신 */
    conn.query(`truncate table good.emp_info`, function(err, rows, fileds){
        if(err) console.log('Truncate query is not executed.');
        else console.log('Truncate query executed successfully.');
    });

    try{
        conn.query(db_connect.emp_info_sync_query, function(err, rows, fileds){
            if(err) {
                console.log(err);
                throw 'Insert query is not executed.';
            }
            else console.log('Insert query executed successfully.');
        })
    }catch{
        sleep(3000);
        conn.query(db_connect.emp_info_sync_query, function(err, rows, fileds){
            if(err) console.log(err);
            else console.log('Insert query executed successfully.');
        })
    }

    conn.query(db_connect.seat_info_sync_query_1, function(err, rows, fileds){
        if(err) console.log(err);
        else console.log(rows.affectedRows);
    });

    conn.query(db_connect.seat_info_sync_query_2, function(err, rows, fileds){
        if(err) console.log(err);
        else console.log(rows.affectedRows + " rows affected");
    });

    /*갱신 종료 */
    sql=`select * from good.emp_info A left join good.seat_info B on A.emp_id=B.emp_id`;
    conn.query(sql, function(err, rows, fileds){
        if(err) console.log('query is not executed.');
        else {
            response.render('17F/index_17.ejs', {list:rows});
        }
    })

    conn.end();
});
app.get('/conv', (request,response)=>{
    conn=db_config.init();//db connection handler 가져오기
    db_config.connect(conn);
    console.log('connection success');
    
    var sql="";
    /*good.emp_info 갱신 */
    conn.query(`truncate table good.emp_info`, function(err, rows, fileds){
        if(err) console.log('Truncate query is not executed.');
        else console.log('Truncate query executed successfully.');
    });

    try{
        conn.query(db_connect.emp_info_sync_query, function(err, rows, fileds){
            if(err) {
                console.log(err);
                throw 'Insert query is not executed.';
            }
            else console.log('Insert query executed successfully.');
        })
    }catch{
        sleep(3000);
        conn.query(db_connect.emp_info_sync_query, function(err, rows, fileds){
            if(err) console.log(err);
            else console.log('Insert query executed successfully.');
        })
    }

    conn.query(db_connect.seat_info_sync_query_1, function(err, rows, fileds){
        if(err) console.log(err);
        else console.log(rows.affectedRows);
    });

    conn.query(db_connect.seat_info_sync_query_2, function(err, rows, fileds){
        if(err) console.log(err);
        else console.log(rows.affectedRows + " rows affected");
    });

    /*갱신 종료 */
    sql=`select * from good.emp_info A left join good.seat_info B on A.emp_id=B.emp_id`;
    conn.query(sql, function(err, rows, fileds){
        if(err) console.log('query is not executed.');
        else {
            response.render('convensia/index_conv.ejs', {list:rows});
            // response.render('pr.ejs', {list:rows});
            
        }
    })

    conn.end();
});

app.get('/edit', (request, response)=>{ // http://[host]:[port]/edit으로 접속 시 나올 페이지
    //16F, 17F에 따라 다른 페이지를 호출해야 함 => 17층 레이아웃 구성 완료되면 추가 구성

    // 페이지에 수정 버튼으로 해당 url redirection하게 만들기
    
    if(!request.session.is_logined){
        console.log('로그인 상태 아님');
        response.redirect('/');
    }
    console.log(request.session.floor);


    conn=db_config.init();//db connection handler 가져오기
    db_config.connect(conn);
    console.log('connection success');
    
    var sql="";
    /*good.emp_info 갱신 */
    conn.query(`truncate table good.emp_info`, function(err, rows, fileds){
        if(err) console.log('Truncate query is not executed.');
        else console.log('Truncate query executed successfully.');
    });

    conn.query(db_connect.emp_info_sync_query, function(err, rows, fileds){
        if(err) console.log(err);
        else console.log('Insert query executed successfully.');
    })

    sql=`select * from good.emp_info A left join good.seat_info B on A.emp_id=B.emp_id`;
    conn.query(sql, function(err, rows, fields){
        if(err) console.log(err);
        else {
            if(request.session.floor=='16'){
                response.render('16F/edit.ejs', {list:rows});
            }else if(request.session.floor=='17'){
                response.render('17F/edit_17.ejs', {list:rows});
            }else if(request.session.floor=='conv'){
                response.render('convensia/edit_conv.ejs', {list:rows});
            }
        }
    })
    conn.end();
});

app.post('/detail',function(req,res){
    conn=db_config.init();//db connection handler 가져오기
    db_config.connect(conn);
    // const _id = req.body._id;
    var id = req.body.id;

    var ip=login_info.get_ip(req);

    var sql=''

    console.log(ip)
    if(ip=='192.168.10.232'){ // 조직도 표출 tv로 접속 시 휴대폰 정보 None으로 수정
        sql = `SELECT emp_name,emp_id,'None' as mobile_no,office_tel_no,dept_name,post_name,duty_name,roll_info,img_url 
        FROM good.emp_info WHERE emp_id='${id}'`;
    }else{
        sql = `SELECT emp_name,emp_id,mobile_no,office_tel_no,dept_name,post_name,duty_name,roll_info,img_url 
        FROM good.emp_info WHERE emp_id='${id}'`;
    }
    conn.query(sql, function(err, info, fields){
        if(err) console.log('query is not executed.');
        else {
            // stringify : JSOn parsing 가능한 text로 만들어줌
            // 그 text를 JSON 자료구조로 만들어주는 것이 JSON.parse
            // res.json : 
            console.log(info);
            res.json(JSON.parse(JSON.stringify(info)));
        }
            
    })
    conn.end();
});

app.post('/addlist/:dept_name', function(req,res){ // 플러스 버튼 누를 때 가져올 유저리스트

    if(!req.session.is_logined){
        console.log('로그인 상태 아님');
        res.status(401).json({error:"You are not logged in."});
    }else{

        conn=db_config.init();//db connection handler 가져오기
        db_config.connect(conn);

        var dept_name=req.params.dept_name;

        var sql=`select emp_id, emp_name,dept_name from seat_info
        where dept_name='${dept_name}' and seat_arrng=-1` // 해당 부서에 seat_arrng=-1인 사용자들 호출

        conn.query(sql, function(err, info, fields){
            if(err) console.log('query is not executed.');
            else {
                res.json(JSON.parse(JSON.stringify(info)));
            }
                
        })
        conn.end();
    }
});

app.post('/add/:emp_id/:seat_arrng', function(req, res){ // 추가할 사용자 리스트에서 하나 선택해서 그 자리에 배치
    if(!req.session.is_logined){
        console.log('로그인 상태 아님');
        res.status(401).json({error:"You are not logged in."});
    }else{
        conn=db_config.init();//db connection handler 가져오기
        db_config.connect(conn);
        
        var emp_id=req.params.emp_id;
        var seat_arrng=parseInt(req.params.seat_arrng);

        var sql=`update seat_info set seat_arrng=${seat_arrng} where emp_id=${emp_id}`;

        conn.query(sql, function(err, info, fields){
            if(err) console.log(err);
            else {
                console.log(info.affectedRows);
            }
        });
        conn.end();
    }
});

app.post('/delete/:emp_id', function(req, res){ // 배치된 사용자의 seat_arrng를 -1로 만들어 빼기
    if(!req.session.is_logined){
        console.log('로그인 상태 아님');
        res.status(401).json({error:"You are not logged in."});
    }else{
        conn=db_config.init();//db connection handler 가져오기
        db_config.connect(conn);
        var emp_id=req.params.emp_id;

        var sql=`update seat_info set seat_arrng=-1 where emp_id=${emp_id}`;

        conn.query(sql, function(err, info, fields){
            if(err) console.log(err);
            else {
                console.log(info.insertId);
            }
        });

        conn.end();
        res.json({result:'성공'});
    }
});

app.post('/status', function(req, res){
    conn=db_config.init();//db connection handler 가져오기
    db_config.connect(conn);

    function fillZero(width, str){
        return str.length >= width ? str:new Array(width-str.length+1).join('0')+str;//남는 길이만큼 0으로 채움
    }

    var sql=`select emp_id, shift_cd, work_type, ymd, plan2, fix1, dayoff1_time, busi_trip1_time from good.ehr_cal_today`;

    let today=new Date();

    conn.query(sql, function(err, info, fields){
        if(err) console.log(err);
        else {
            let serialized=JSON.parse(JSON.stringify(info)); // 가져온 sql정보를 json parsing 후 변수에 저장
            for(line of serialized){
                var work_type=line["work_type"]; //work_type 정보
                // var plan2=line["plan2"]; //plan2정보
                var fix1=line["fix1"];//fix1정보
                var dayoff=line["dayoff1_time"];//dayoff1_time 정보
                var busi_trip=line["busi_trip1_time"];//busi_trip1_time 정보

                line["status"]="근무 중"; // default status값

                if(work_type=="0270" ||work_type=="0280" || work_type=="0290" ||work_type=="0300"){//work_type 재택근무 코드
                    line["status"]="재택근무";
                }

                if(plan2=="전일연차" || fix1=="기타휴가" || work_type=="0060"){ //하루종일 연차인 경우
                    line["status"]="휴무";
                    continue;
                }

                if(busi_trip!='None'){ //출장기록이 있으면
                    var sta_busi_trip=busi_trip.substr(0,4);
                    var end_busi_trip=busi_trip.substr(5,4);
                    var now=fillZero(2,today.getHours().toString())+fillZero(2,today.getMinutes().toString());

                    if(now>=sta_busi_trip && now<=end_busi_trip){
                        line["status"]="출장 및 교육";
                    }
                }

                if(dayoff!='None'){ //연차기록이 있으면 
                    var sta_dayoff=dayoff.substr(0,4);
                    var end_dayoff=dayoff.substr(5,4);
                    var now=fillZero(2,today.getHours().toString())+fillZero(2,today.getMinutes().toString());

                    if(now>=sta_dayoff && now<=end_dayoff){
                        line["status"]="휴무";
                    }
                }

            }
            const newArray = serialized.map(({shift_cd, work_type,ymd,plan2,fix1,dayoff1_time, ...rest}) => rest);
            res.json(JSON.parse(JSON.stringify(newArray)));
        }
    });
    conn.end();
})

app.use((request, response)=>{ //잘못된 url로 접근 시
    response.send(`<h1>Sorry, page not found.</h1>`);
});

app.listen(port, function(){ // 3000번 포트로 listen
    console.log(`Server running at ${port}`);
});


