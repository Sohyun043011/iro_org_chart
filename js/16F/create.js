
// 각 층에 대한 팀의 정보
var org={

    '관광마케팅실':['해외마케팅팀','국내관광팀','스마트관광팀','MICE뷰로'],
    '기획조정실':['고객홍보팀','전략기획팀','경영지원팀'],
}
// 어떤 팀의 열의 수를 바꿔야 한다면, dept_info의 value 를 바꿔주면 됨(ex. 2->3) 
// !! 열 수를 바꾸려면 해당 층의 [create.js,edit.js, edit.ejs, index.ejs] 4개 파일에서 모두 바꿔줘야 함.
 
var dept_info={'해외마케팅팀':2,'국내관광팀':2,'스마트관광팀':3,'MICE뷰로':2,'고객홍보팀':2,'전략기획팀':2,'경영지원팀':4};
var office = ['관광마케팅실','기획조정실'];

$(document).ready(function(){
            $('#container').css({"width": window.innerWidth, "height":'100%'});     //전체 컨테이너 크기 지정
            $('.cell').removeClass('border bg-light');                              //셀 안에 배경 색 제거 
            $('.mem-img').addClass('border');                                       //각 이미지에 선 추가
            $('.dept-table').last().css({'border-right':'none'});                   //마지막 팀 테두리 선 제거 
          
            //1. 각 실의 열수에 비례한 width 조정
            // 실장실에 순서대로 클래스명 부착
            for(var off = 0; off<office.length; off++){
                $('.header').eq(off).addClass(`header-${off}`);
            }
            // 전체 열 수 
            var sum=0;
            Object.values(dept_info).forEach(function(element){
                sum=sum+element;
            });
            //열수에 비례해서 width 조정
            for(var i=0;i<Object.keys(dept_info).length;i++){
                $('.department').eq(i).css({'width':`${(100*(Object.values(dept_info)[i]))/sum}%`});
            }
            // '관광마케팅실' 이면 addClass('office-0') '기획조정실이면 addClass('office-1')
            // 각 실의 부서들에 실 id (office-0, office-1..부착)
            for(var j = 0;j<Object.keys(dept_info).length;j++){
                var dept_name = $('.dept-name').eq(j).text();
                for(var k=0;k<Object.keys(org).length;k++){
                    var width_sum = 0;
                    var dept = Object.values(org)[k];
                    for(var t=0;t<dept.length;t++){
                        if(dept_name==dept[t]){
                            $('.department').eq(j).addClass(`office-${k}`);
                            width_sum=width_sum+$('.department').eq(j).width();
                        }
                    }
                } 
            }
            // 각 실에 해당하는 부서의 width를 더해서 실의 width로 바꾸기 (office-0, office-1. id를 이용하여)
            for(var h=0;h<$('.header').length;h++){
                var width_sum=0;
                for(var t=0;t<$(`.office-${h}`).length;t++){
                    width_sum=width_sum+$(`.office-${h}`).eq(t).width();
                }
                $('.header').eq(h).css({'width':`${width_sum}`});
            }

            // 2. 각 사원의 status(근무상태)를 설정
            $.ajax({
                method:'POST',
                url:'/status',
                data:{},
                success:function(result){                               //result : 서버에서 전달해준 json 값 
                    for(var mem=0;mem<$('.memInfo').length;mem++){
                        
                        // $(.memInfo) : 각 사원의 cell (네모박스)
                        // $('.memInfo').eq(mem).children()>0 : 이름,직급 나와있는 cell인 경우(빈 셀 아닌 경우)
                        if($('.memInfo').eq(mem).children().length>0)
                        {
                            //$('.memInfo').eq(mem).children('span:eq(0)') : 이름 span 태그의 id 즉, 해당 셀의 사번을 가져옴
                            var id = $('.memInfo').eq(mem).children('span:eq(0)').attr('id')
                            for(var res=0; res<result.length;res++)
                            {
                                // 서버에서 보내준 모든 사원 정보 중에, 해당 셀의 사번과 같은 사원 데이터를 가져옴
                                if(id==result[res]['emp_id'])
                                {
                                    var status = result[res]['status'];             //해당 사원의 근무상태
                                    if(status=="재택근무")
                                    {
                                        //재택근무면 default 버튼 지우고 파란색 버튼 부착(btn-blue) [default : btn-green] 
                                        $('.cell').eq(mem).children('span:eq(0)').removeClass('btn-green');
                                        $('.cell').eq(mem).children('span:eq(0)').addClass('btn-blue');
                                        
                                    }
                                    else if(status=="출장 및 교육")
                                    {
                                        //출장 및 교육은 default 버튼 지우고 노란색 버튼 부착(btn-yellow)
                                        $('.cell').eq(mem).children('span:eq(0)').removeClass('btn-green');
                                        $('.cell').eq(mem).children('span:eq(0)').addClass('btn-yellow');
                                    }
                                    else if(status=="휴무")
                                    {
                                        //휴무일 땐 default 버튼 지우고 빨간색 버튼 부착(btn-red);
                                        $('.cell').eq(mem).children('span:eq(0)').removeClass('btn-green');
                                        $('.cell').eq(mem).children('span:eq(0)').addClass('btn-red');
                                    
                                    }
                                }
                            }
                        }
                        else{
                            //(빈 셀인 경우) 상태표시 버튼 제거 (mem+4 하는 이유 : header 부분에 상태 나타내는 버튼 4개를 제외해야 하기 때문)
                            $(".rounded-circle").eq(mem+4).css({'display':'none'});
                        }
                    }
                }
            });

            // 3. 각 실장님 클릭시 detail 모달창 (다른 사원과 내부 요소들이 달라서 따로 구현함)
            $('.header').on('click',function(e){
                var data = e.currentTarget.children[1].getAttribute('id');      //실장님 id 가져옴
                
                if(data)
                {
                    // 가져올 id가 있는 경우, 모달창 표출.(show)
                    $('.black-background').css({marginTop:'0px'});
                    $('.black-background').show();
                    $('.right-container').scrollTop(0);
                    //서버로 실장님 사번을 보내서 상세 데이터 받아옴.
                    $.ajax({
                        method:'POST',
                        url:'/detail',
                        data:{
                            id:data
                        },  //서버로 보낼 데이터
                        success:function(result){
                            var name = result[0].emp_name;
                            var office = result[0].dept_name;
                            var mobile = result[0].mobile_no;
                            var office_no = result[0]. office_tel_no;
                            var position_tag = result[0].duty_name;
                            var detail_tag = result[0].roll_info;
                            var img = result[0].img_url;
                            
                            // background.ejs(모달창)에 받은 정보들 삽입
                            document.getElementById('img').innerHTML= `<img src="${img}" id="pic">`
                            document.getElementById('name_tag').innerHTML = `${name} ${position_tag}`;
                            document.getElementById('office_tag').innerHTML=office;
                            document.getElementById('phone_tag').innerHTML = mobile;
                            document.getElementById('office_p_tag').innerHTML = office_no;
                            document.getElementById('detail_tag').innerHTML = detail_tag;
                        },
                        error: function(result){
                            console.log(result);
                        }
                    })

                }
            });

            // 4.사원 이미지 클릭시 detail 모달창 띄움
            $('.mem-img').on('click',function(e){
                $('.black-background').css({marginTop:'0px'});
                $('.black-background').show();
                $('.right-container').scrollTop(0);                         //스크롤 위치 위로 초기화
                
                // data == 해당 사원의 사번
                var data =  e.target.parentElement.parentElement.children[1].children[0].getAttribute('id');
               
                $.ajax({
                    method:'POST',
                    url:'/detail',
                    data:{
                        id:data
                    },  //서버로 보낼 데이터
                    success:function(result){
                        var name = result[0].emp_name;
                        var office = result[0].dept_name;
                        var mobile = result[0].mobile_no;
                        var office_no = result[0]. office_tel_no;
                        var detail_tag = result[0].roll_info;
                        var img = result[0].img_url;
                        
                        // 팀장은 duty_name, 나머지 사원은 post_name이 직급
                        if(result[0].duty_name=="팀장"){
                            var position_tag = result[0].duty_name; 
                        }
                        else{
                            var position_tag = result[0].post_name; 
                        }

                        // background.ejs에 받은 정보들 삽입
                        document.getElementById('img').innerHTML= `<img src="${img}" id="pic">`

                        // 매니저님, 협력관님 직급 예외처리
                        if(result[0].emp_id=='20214012'){
                            position_tag = '매니저'
                            
                        }
                        else if(result[0].emp_id=='20214015'){
                            position_tag = '대외협력관'
                        }
                        document.getElementById('name_tag').innerHTML = `${name} ${position_tag}`;
                        document.getElementById('office_tag').innerHTML=office;
                        document.getElementById('phone_tag').innerHTML = mobile;
                        document.getElementById('office_p_tag').innerHTML = office_no;
                        document.getElementById('detail_tag').innerHTML = detail_tag;
                    },
                    error: function(result){
                        alert('실패');
                    }
                })

            });

            // 5. 모달창 뒤 검은 배경 누르면 창 닫힘
            $('.black-background').click(function(e){
                    if(e.target==e.currentTarget){
                      $('.black-background').hide();
                    }
            });

            // 6. 모달창 X 버튼 누르면 창 닫힘
            $('.btn-close').click(function(e){
                    if(e.target==e.currentTarget){
                        $('.black-background').hide();
                    }
            });
            
            // 7.8~18시인 경우, 페이지 새로고침 하는 함수
            setInterval(function(){ //3600초마다 function() 실행 
                today = new Date();
                if(today.getHours()>=8 && today.getHours()<18)
                {
                    // 8시~18시 사이면 refresh
                    location.reload();
                }
                else{
                    // 그 외 시간에는 setinterval 중지
                    return;
                }
            }, 3600000);
    }  
    
);

//8. 수정 버튼 누를 때, LOGIN 함수 실행
const login = async()=>{
    
    // Swal.fire 라는 라이브러리 이용
    const { value: password } = await Swal.fire({
        title: '비밀번호를 입력하세요',
        icon:'warning',
        input: 'password',
        heightAuto:false,
        inputPlaceholder: '비밀번호를 입력하세요',
        inputAttributes: {
          maxlength: 15,
          autocapitalize: 'off',
          autocorrect: 'off'
        },
        inputValidator: (value) => {
            if (!value) {
              return '비밀번호를 입력해주세요!'
            }
          }
    });

    if (password) {
        // password 입력 후, 서버에 password, link 정보 전송.
        var link=document.location.href;
        $.ajax({
            method:'POST',
            url:'/login',
            data : {
                password:password,
                url:link
            },
            success:function(result){
                if(result.error){
                    // error일 때(비번 틀리거나,다른 유저가 접속중일 때.)
                    if(result.error=="Password is not correct."){
                        Swal.fire({
                            title : "비밀번호가 틀렸습니다.",
                            icon:'warning',
                            heightAuto : false,
                        }).then(()=>{
                            location.href='/';
                        })
                    }
                    else if(result.error=="Already another user logged in."){
                        Swal.fire({
                            title : "다른 유저가 접속중입니다.",
                            icon:'warning',
                            heightAuto : false,
                        }).then(()=>{
                            location.href='/';
                        })
                    }
                }else{
                    //  정상 로그인인 경우, result로 받은 url(관리자 페이지 url) 로 페이지 변경
                    window.location.replace(result.url);
                }
                
            },
            error:function(result){
                console.log(result);
            }
        })
    }
}
