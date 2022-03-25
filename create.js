//임시 dept_info(db에서 받아올 값)
// var path = require('path')
// var db_config=require(path.join(__dirname,'db_connect.js'));
// conn=db_config.init();//db connection handler 가져오기
// db_config.connect(conn);

// const { json } = require("express/lib/response");

// var org=[
//     {
//         room:'관광마케팅실',
//         team:{
//             '해외마케팅팀':2,
//             '국내관광팀':2,
//             '스마트관광팀':3,
//             'MICE뷰로':2
//         }
//     },
//     {   
//         room:'기획조정실',
//         team:{
//             '고객홍보팀':2,
//             '전략기획팀':2,
//             '경영지원팀':4
//         }
//     }
// ]

var org_2={

    '관광마케팅실':['해외마케팅팀','국내관광팀','스마트관광팀','MICE뷰로'],
    '기획조정실':['고객홍보팀','전략기획팀','경영지원팀'],
}
var dept_info={'해외마케팅팀':2,'국내관광팀':2,'스마트관광팀':3,'MICE뷰로':2,'고객홍보팀':2,'전략기획팀':2,'경영지원팀':4};
var office = ['관광마케팅실','기획조정실'];

$(document).ready(function(){


            $('#container').css({"width": window.innerWidth, "height":'100%'});     //전체 컨테이너 크기 지정
            $('.cell').removeClass('border bg-light');                              //셀 안에 배경 색 제거 
            $('.mem-img').addClass('border');                                       //각 이미지에 선 추가
            $('.dept-table').last().css({'border-right':'none'});                   //마지막 팀 테두리 선 제거 
            $('.header').css({'width':`${100/(office.length)}%`});
       
            // 실장실에 순서대로 클래스명 부착()
            for(var off = 0; off<office.length; off++){
                $('.header').eq(off).addClass(`header-${off}`);
            }

            // 전체 열 수 
            var sum=0;
            Object.values(dept_info).forEach(function(element){
                sum=sum+element;
            });

            for(var i=0;i<Object.keys(dept_info).length;i++){
                $('.department').eq(i).css({'width':`${(100*(Object.values(dept_info)[i]))/sum}%`});
            }
            // '관광마케팅실' 이면 addClass('office-0') '기획조정실이면 addClass('office-1')
            for(var j = 0;j<Object.keys(dept_info).length;j++){
                // 각 부서를 돌면서. 
                var dept_name = $('.dept-name').eq(j).text();
                for(var k=0;k<Object.keys(org_2).length;k++){
                    // org[k]의 team안에 해당 dept가 있는지 
                    var width_sum = 0;
                    var dept = Object.values(org_2)[k];
                    // 배열
                    for(var t=0;t<dept.length;t++){
                        if(dept_name==dept[t]){
                            $('.department').eq(j).addClass(`office-${k}`);
                            width_sum=width_sum+$('.department').eq(j).width();
                        }
                    }
                       
                } 

            }
            // 각 실에 해당하는 부서의 width를 더해서 실의 width로 바꾸기
            for(var h=0;h<$('.header').length;h++){
                // 2번 돌아감
                // console.log(h+'돌아감');
                var width_sum=0;
                for(var t=0;t<$(`.office-${h}`).length;t++){
                    // console.log(t);
                    width_sum=width_sum+$(`.office-${h}`).eq(t).width();
                }
                // console.log(width_sum);
                $('.header').eq(h).css({'width':`${width_sum}`});
            }

            $.ajax({
                method:'POST',
                url:'/status',
                data:{},
                success:function(result){
                    result=JSON.parse(result);
                    console.log(result[0]['status']);


                }
            });
            $(document).on('click','.mem-img',function(e){
                //클릭하면 모달창 뜸
                $('.black-background').show().animate({marginTop:'0px'});
                // 클릭한 cell의 memInfo의 memName,memPos를 가져옴.

                var data =  e.target.parentElement.parentElement.children[1].children[0].getAttribute('id');
                console.log("ajax started")
                //띄울 mem의 id
                $.ajax({
                    method:'POST',
                    url:'/detail',
                    data:{
                        id:data
                    },  //서버로 보낼 데이터
                    success:function(result){
                        // //alert('성공');
                        var name = result[0].emp_name;
                        var emp_id = result[0].emp_id;
                        var office = result[0].dept_name;
                        var mobile = result[0].mobile_no;
                        var office_no = result[0]. office_tel_no;
                        var position_tag = result[0].post_name;
                        var detail_tag = result[0].roll_info;
                        var img = result[0].img_url;
                        
                        
                        document.getElementById('img').innerHTML= `<img src="${img}" id="pic">`
                        document.getElementById('name_tag').innerHTML = name;
                        document.getElementById('id_tag').innerHTML = emp_id;
                        document.getElementById('office_tag').innerHTML=office;
                        document.getElementById('phone_tag').innerHTML = mobile;
                        document.getElementById('office_p_tag').innerHTML = office_no;
                        document.getElementById('position_tag').innerHTML = position_tag;
                        document.getElementById('detail_tag').innerHTML = detail_tag;
                        // result[0].emp_name;
                    },
                    error: function(result){
                        alert('실패');
                    }
                })
                if(data)
                {
                    console.log(data);
                }else{
                    console.log('빈 셀');
                }


                }); 
            $('.header').on('click',function(e){
                // header(실장실) 누를때
                $('.black-background').show().animate({marginTop:'0px'});
                var data = e.target.children[1].getAttribute('id');
                console.log("ajax started")
                //띄울 mem의 id
                $.ajax({
                    method:'POST',
                    url:'/detail',
                    data:{
                        id:data
                    },  //서버로 보낼 데이터
                    success:function(result){
                        // //alert('성공');
                        var name = result[0].emp_name;
                        var emp_id = result[0].emp_id;
                        var office = result[0].dept_name;
                        var mobile = result[0].mobile_no;
                        var office_no = result[0]. office_tel_no;
                        var position_tag = result[0].post_name;
                        var detail_tag = result[0].roll_info;
                        var img = result[0].img_url;
                        
                        
                        document.getElementById('img').innerHTML= `<img src="${img}" id="pic">`
                        document.getElementById('name_tag').innerHTML = name;
                        document.getElementById('id_tag').innerHTML = emp_id;
                        document.getElementById('office_tag').innerHTML=office;
                        document.getElementById('phone_tag').innerHTML = mobile;
                        document.getElementById('office_p_tag').innerHTML = office_no;
                        document.getElementById('position_tag').innerHTML = position_tag;
                        document.getElementById('detail_tag').innerHTML = detail_tag;
                        // result[0].emp_name;
                    },
                    error: function(result){
                        alert('실패');
                    }
                })
                if(data)
                {
                    console.log(data);
                }else{
                    console.log('빈 셀');
                }
            })
            $('.black-background').click(function(e){
        
                    // 만약 지금 실제로 클릭한 것이 black background일 때만 닫기 
                    // 이벤트 리스너 안에서 쓸 수 있는 이벤트 함수
                    // e.target;//지금 실제로 클릭한 요소
                    // e.currentTarget; //지금 이벤트리스너가 달린 곳
                    // $(this);//지금 이벤트리스너가 달린 곳
                    // e.preventDefault();//기본 동작 막기
                    // var className = $(e.target).attr('class');
                    
                    if(e.target==e.currentTarget){
                      $('.black-background').hide();
            
                    }
            
            });
            $('.btn-close').click(function(e){
                    //close button 눌렀을 때도 닫기 
                    if(e.target==e.currentTarget){
                        $('.black-background').hide();
              
                    }
            })

            // 16F, 17F, 수정 버튼 클릭시 event
            // 1. 16F 페이지일 때 16버튼 active 되어야 함

            var btn = document.getElementsByClassName("btn");
            
            //1.clicked 클래스 add,remove(버튼 색 변경)
            function handleClick(event) 
            {
                console.log(event.target);
                console.log(event.target.classList);
                if (event.target.classList[1] === "clicked") {
                    
                    event.target.classList.remove("clicked");
                } 
                else {
                    for (var i = 0; i < btn.length; i++) {
                        btn[i].classList.remove("clicked");
                    }
                    event.target.classList.add("clicked");
                }
            }
                

            /*2. 버튼 클릭시 페이지 이동*/

            function init() {
                for (var i = 0; i < btn.length; i++) 
                {
                    btn[i].addEventListener("click", handleClick);
                }
            }
                
            init();
    }  

            

);
           
            
// setTimeout(function(){ //30초에 한번씩 reload
//     location.reload();
// }, 30000);


function movePage(){
    location.href="/edit";
}