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
    resave:false,
    saveUninitialized: false,
    store:session_store
}));
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname+'/css')));
app.use(express.static(path.join(__dirname+'/node_modules')));
app.use(express.static(path.join(__dirname+'/img')));

var bodyParser = require('body-parser');
const { json } = require('express/lib/response');
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
    sql='select count(*) as num_of_sessions from good.sessions';

    conn.query(sql, async function(err, rows){
        list=JSON.parse(JSON.stringify(rows));
        if (list[0]['num_of_sessions']!=0){
            console.log('이미 다른 유저가 로그인하였습니다.');
            res.json({error:"Already another user logged in."});
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
            }
            else if(url_link.pathname=='/17F'){
                req.session.floor='17';
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
    
})
app.get('/logout', (req, res)=>{
    
    if(req.session.is_logined){
        console.log('로그아웃');

        var floor=req.session.floor;
        req.session.destroy(function(err){
            if(err) throw err;
            console.log('세션 삭제하고 로그아웃됨');
            if(floor=='16'){
                res.redirect('/');
            }else{
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
        AND emp_nm NOT IN ('테과장','테스트')) AS C ON A.emp_id=C.emp_id`;
    conn.query(sql, function(err, rows, fileds){
        if(err) console.log(err);
        else console.log('Insert query executed successfully.');
    })

    sql=`INSERT INTO good.seat_info(emp_id, emp_name, dept_name, post_name, seat_arrng) 
    SELECT emp_id, emp_name, dept_name, post_name, -1 FROM good.emp_info 
    WHERE (emp_id, emp_name, dept_name, post_name) NOT IN (
        SELECT emp_id, emp_name, dept_name, post_name FROM seat_info
    )`;
    conn.query(sql, function(err, rows, fileds){
        if(err) console.log(err);
        else console.log(rows.affectedRows);
    });

    sql=`DELETE FROM good.seat_info 
    WHERE (emp_id, emp_name, dept_name, post_name) NOT IN (
        SELECT emp_id, emp_name, dept_name, post_name FROM good.emp_info
    )`;
    conn.query(sql, function(err, rows, fileds){
        if(err) console.log(err);
        else console.log(rows.affectedRows + " rows affected");
    });

    /*갱신 종료 */

    sql=`select * from good.emp_info A left join good.seat_info B on A.emp_id=B.emp_id`;
    conn.query(sql, function(err, rows, fileds){
        if(err) console.log('query is not executed.');
        else {
            response.render('index.ejs', {list:rows});
            
        }
    })

    conn.end();
});
app.get('/17',(request,response)=>{
    conn=db_config.init();//db connection handler 가져오기
    db_config.connect(conn);
    console.log('connection success');
    
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
        AND emp_nm NOT IN ('테과장','테스트')) AS C ON A.emp_id=C.emp_id`;
    conn.query(sql, function(err, rows, fileds){
        if(err) console.log(err);
        else console.log('Insert query executed successfully.');
    })

    sql=`INSERT INTO good.seat_info(emp_id, emp_name, dept_name, post_name, seat_arrng) 
    SELECT emp_id, emp_name, dept_name, post_name, -1 FROM good.emp_info 
    WHERE (emp_id, emp_name, dept_name, post_name) NOT IN (
        SELECT emp_id, emp_name, dept_name, post_name FROM seat_info
    )`;
    conn.query(sql, function(err, rows, fileds){
        if(err) console.log(err);
        else console.log(rows.affectedRows);
    });

    sql=`DELETE FROM good.seat_info 
    WHERE (emp_id, emp_name, dept_name, post_name) NOT IN (
        SELECT emp_id, emp_name, dept_name, post_name FROM good.emp_info
    )`;
    conn.query(sql, function(err, rows, fileds){
        if(err) console.log(err);
        else console.log(rows.affectedRows + " rows affected");
    });

    /*갱신 종료 */

    sql=`select * from good.emp_info A left join good.seat_info B on A.emp_id=B.emp_id`;
    conn.query(sql, function(err, rows, fileds){
        if(err) console.log('query is not executed.');
        else {
            response.render('index_17.ejs', {list:rows});
            // response.render('pr.ejs', {list:rows});
            
        }
    })

    conn.end();
});
app.get('/edit', (request, response)=>{ // http://[host]:[port]/edit으로 접속 시 나올 페이지
    //16F, 17F에 따라 다른 페이지를 호출해야 함 => 17층 레이아웃 구성 완료되면 추가 구성

    // 페이지에 수정 버튼으로 해당 url redirection하게 만들기
    
    if(!request.session.is_logined){
        response.redirect('/');
    }
    console.log(request.session.floor);


    conn=db_config.init();//db connection handler 가져오기
    db_config.connect(conn);
    console.log('connection success');
    
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
        AND emp_nm NOT IN ('테과장','테스트')) AS C ON A.emp_id=C.emp_id`;
    conn.query(sql, function(err, rows, fileds){
        if(err) console.log(err);
        else console.log('Insert query executed successfully.');
    })
    sql=`select * from good.emp_info A left join good.seat_info B on A.emp_id=B.emp_id`;
    conn.query(sql, function(err, rows, fields){
        if(err) console.log(err);
        else {
            if(request.session.floor=='16'){
                response.render('edit.ejs', {list:rows});
            }else if(request.session.floor=='17'){
                response.render('edit.ejs', {list:rows});
                //여기다가 edit_17.js 넣어주세여!!
            }
            
            // response.render('pr.ejs', {list:rows});
            
        }
    })
    conn.end();
});

app.get('/search', (request, response)=>{ //http://[host]:[port]/search으로 접속 시 나올 페이지 (사원 검색 페이지~)
    conn=db_config.init();//db connection handler 가져오기
    db_config.connect(conn);
    var sql=`select * from connec.hr_info`;
    conn.query(sql, function(err, rows, fileds){
        if(err) console.log('query is not executed.');
        else {
            console.log(rows);
            response.render('search.ejs', {list:rows});
        }
    })
    conn.end();
})

app.post('/detail',function(req,res){
    conn=db_config.init();//db connection handler 가져오기
    db_config.connect(conn);
    // const _id = req.body._id;
    var id = req.body.id;

    var sql = `SELECT emp_name,emp_id,mobile_no,office_tel_no,dept_name,post_name,duty_name,roll_info,img_url FROM good.emp_info WHERE emp_id='${id}'`;
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

app.post('/move/:emp_id/:seat_arrng', function(req,res){
    conn=db_config.init();//db connection handler 가져오기
    db_config.connect(conn);

    var emp_id=req.params.emp_id;
    var seat_arrng=req.params.seat_arrng;

    var sql=`UPDATE good.seat_info 
    SET seat_arrng=${seat_arrng}
    WHERE emp_id='${emp_id}'`

    conn.query(sql, function(err, info, fields){
        if(err) console.log('query is not executed.');
    })
    console.log('좌석번호가 변경되었습니다.')
    conn.end();
});

app.post('/addlist/:dept_name', function(req,res){ // 플러스 버튼 누를 때 가져올 유저리스트
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
});

app.post('/add/:emp_id/:seat_arrng', function(req, res){ // 추가할 사용자 리스트에서 하나 선택해서 그 자리에 배치
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
});

app.post('/delete/:emp_id', function(req, res){ // 배치된 사용자의 seat_arrng를 -1로 만들어 빼기
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
                var plan2=line["plan2"]; //plan2정보
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
            // emp_id, status 제외하고 모두 삭제해주기
            
            // delete serialized["shift_cd"];
            // delete serialized["work_type"];
            // delete serialized["ymd"];
            // delete serialized["plan2"];
            // delete serialized["fix1"];
            // delete serialized["dayoff1_time"];
            res.json(JSON.parse(JSON.stringify(newArray)));
        }
    });
    conn.end();
})


// app.post('/status', function(request, response){ // 사용자 사진 클릭 시 세부내용
//     oracledb.getConnection({ //ehr database에서 정보 가져오기
//         user : db_config.user, 
//         password : db_config.password, 
//         connectString : db_config.connectString 
//     }, 
//     function(err, connection) { 
//         if (err) { 
//             console.error(err.message); 
//             return; 
//         } 
//         let query = `SELECT EMP_ID,SHIFT_CD,WORK_TYPE, YMD FROM EHR2011060.TAM5400_V 
//         WHERE YMD =(SELECT TO_CHAR(SYSDATE, 'YYYYMMDD')AS YYYYMMDD FROM DUAL)`; 
        
//         connection.execute(query, [], function (err, result) { 
//             if (err) { 
//                 console.error(err.message); 
//                 doRelease(connection); 
//                 return; 
//             } 
//             // console.log(result.rows); // 데이터 
//             doRelease(connection, result.rows); // Connection 해제 
//         }); 
//     }); // DB 연결 해제 
//     function doRelease(connection, rowList) { 
//         connection.release(function (err) { 
//             if (err) { 
//                 console.error(err.message); 
//             } // DB종료까지 모두 완료되었을 시 응답 데이터 반환 
//             console.log('list size: ' + rowList.length); 

//             var rowList_json='['; //조회한 데이터 기반으로 상태값만 넘겨주도록 json 데이터 변경
//             for (row=0;row<rowList.length;row++){ // serialize
//                 rowList_json+='{';
//                 rowList_json+='"emp_id":"'+rowList[row][0]+'",';
//                 if(rowList[row][2]=="0270" ||rowList[row][2]=="0280" ||
//                     rowList[row][2]=="0290" ||rowList[row][2]=="0300"){//work_type 재택근무 코드

//                     rowList_json+='"status":"재택근무"';
//                 }
//                 else{
//                     rowList_json+='"status":"근무 중"';
//                 }
//                 rowList_json+="},";

//                 console.log(rowList[row][0], rowList[row][1], rowList[row][2], rowList[row][3]);
//             }
            
//             if(rowList.length>1){
//                 rowList_json=rowList_json.substring(0, rowList_json.length - 1);
//             }
//             rowList_json+="]";

//             response.json(JSON.parse(JSON.stringify(rowList_json)));
//         }); 
//     } 
// });

app.use((request, response)=>{ //잘못된 url로 접근 시
    response.send(`<h1>Sorry, page not found.</h1>`);
});

app.listen(port, function(){ // 3000번 포트로 listen
    console.log(`Server running at ${port}`);
});


