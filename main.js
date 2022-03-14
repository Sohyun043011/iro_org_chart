
const req=require('request');
const http=require('http');
const fs = require('fs');
var url = require('url');
var path=require('path')
const express=require('express');
const res = require('express/lib/response');
var db_config=require(path.join(__dirname,'db_connect.js'));
const port=3000;

conn=db_config.init();
db_config.connect(conn);

const app=express();

app.set('views','./');
app.set('view engine','ejs');
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname+'/css')));
app.use(express.static(path.join(__dirname+'/node_modules')));
app.use(express.static(path.join(__dirname+'/img')));



app.get('/', (request, response)=>{ // http://[host]:[port]/로 접속 시 나올 페이지
    var sql=`select * from good.emp_info A left join good.seat_info B on A.emp_id=B.emp_id`;
    conn.query(sql, function(err, rows, fileds){
        if(err) console.log('query is not executed.');
        else response.render('index.ejs', {list:rows});
    })
    
});
app.get('/edit', (request, response)=>{ // http://[host]:[port]/main으로 접속 시 나올 페이지
    response.sendFile(__dirname+'/edit.html')
});

app.use((request, response)=>{ //잘못된 url로 접근 시
    response.send(`<h1>Sorry, page not found.</h1>`);
});

app.listen(port, function(){ // 3000번 포트로 listen
    console.log(`Server running at ${port}`);
});




// var app=http.createServer(function(request, response){
//     var _url = request.url;
//     var queryData = url.parse(_url, true).query;
//     var pathname = url.parse(_url, true).pathname;

//     if(pathname === "/") {
//         if(queryData.id === undefined){
//             // loginHTML = '/html/login.html';
//             // loginHTML = '/html/create.html';
//             indexHtml = '/index.html';
//             response.writeHead(200);
//             response.end(fs.readFileSync(__dirname + indexHtml));
//         }
//     }
// })

// app.listen(3000, ()=>{
//     console.log("Server running at http://localhost:3000/");
// });



