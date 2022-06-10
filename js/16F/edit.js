var org={

    '관광마케팅실':['해외마케팅팀','국내관광팀','스마트관광팀','MICE뷰로'],
    '기획조정실':['고객홍보팀','전략기획팀','경영지원팀'],
}
var dept_info={'해외마케팅팀':2,'국내관광팀':2,'스마트관광팀':3,'MICE뷰로':2,'고객홍보팀':2,'전략기획팀':2,'경영지원팀':4};
var office = ['관광마케팅실','기획조정실'];

// 수정(관리자 페이지) - create.js 와 거의 똑같음. 레이아웃이 같아서
$(document).ready(function(){
    $('#container').css({"width": window.innerWidth, "height":'100%'});     //전체 컨테이너 크기 지정
    $('.cell').removeClass('border bg-light');                              //셀 안에 배경 색 제거 
    $('.mem-img').addClass('border');                                       //각 이미지에 선 추가
    $('.dept-table').last().css({'border-right':'none'});                   //마지막 팀 테두리 선 제거 
  

    // 1. 각 실의 열수에 비례한 width 조정(create.js 와 동일 )
    // 실장실에 순서대로 클래스명 부착
    for(var off = 0; off<office.length; off++){
        $('.header').eq(off).addClass(`header-${off}`);
    }

    // 전체 열 수 
    var sum=0;
    Object.values(dept_info).forEach(function(element){
        sum=sum+element;
    });

    //열수를 이용해서 각 팀의 width 조정
    for(var i=0;i<Object.keys(dept_info).length;i++){
        $('.department').eq(i).css({'width':`${(100*(Object.values(dept_info)[i]))/sum}%`});
    }

    // '관광마케팅실' 이면 addClass('office-0') '기획조정실이면 addClass('office-1')
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
    // 각 실에 해당하는 부서의 width를 더해서 실의 width로 바꾸기
    for(var h=0;h<$('.header').length;h++){
        var width_sum=0;
        for(var t=0;t<$(`.office-${h}`).length;t++){
            width_sum=width_sum+$(`.office-${h}`).eq(t).width();
        }
        $('.header').eq(h).css({'width':`${width_sum}`});
    }


    // 2. 추가버튼 구현 -  만약 빈 셀이면, X 표시 없애고 border를 점선으로 표시
    for(var mem=0;mem<$('.memInfo').length;mem++){

        // 빈 셀인 경우
        if($('.memInfo').eq(mem).children().length==0)
        {
            // X 표시 제거
            $(".rounded-circle").eq(mem).css({'display':'none'});
            $('.memInfo').eq(mem).css({'height':'48px'});
            // + 버튼 추가(border 점선)
            $('.cell').eq(mem).append(`<div class="dashed-border"><button type="button" class="btn btn-secondary btn-add">+</button></div>`);
        }
    }

    // 3. 삭제버튼 - 해당 셀 삭제 버튼 누르는 경우, 셀의 사번을 ajax로 전송
    $('.btn-del').on('click',function(e){

        // Swal.fire 라이브러리 이용하여 confirm 창 구현
        Swal.fire({
            title : '해당 사원을 삭제하시겠습니까?',
            icon:'warning',
            heightAuto:false,
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: '승인',
            cancelButtonText: '취소'
        }).then((result)=>{
            if(result.isConfirmed){
                // '승인'을 누른 경우, 해당 사번을 ajax로 전송
                var data = e.target.parentElement.parentElement.children[1].children[0].getAttribute('id');
                $.ajax({
                    method:'POST',
                    url:`/delete/${data}`,
                    success:function(result){
                        // 정상적으로 삭제 되면, 삭제되었습니다 alert 창 띄운 후, 해당 페이지 realod.
                        Swal.fire({
                            heightAuto:false,
                            title:'삭제되었습니다.',
                            icon:'success',
                        }).then(()=>{location.reload()});
                    },
                    error: function(e){
                        // 세션이 만료돼서 로그아웃 된 경우 등, 삭제가 되지 않은 경우 alert 창 띄운 후, 메인페이지로 돌아감.
                        Swal.fire({
                            heightAuto:false,
                            title:'로그인 상태가 아닙니다.\n 이전 페이지로 돌아갑니다.',
                            icon:'warning',
                        }).then(()=>{location.href='/';});
                    }
                });
            }
        });
    });

    // 4. 추가버튼 누른 경우,모달창 띄우면서 해당 팀의 추가할 수 있는 사원 리스트 불러옴
    $('.btn-add').on('click',function(e){
        // 팀장인 경우와 일반 사원인 경우, 속성이 달라서 예외처리. 
        var seat_arrng = e.target.parentElement.parentElement.getAttribute('id');           //팀장 추가버튼인 경우(seat_arrng = 0인 경우)
        if(seat_arrng!=0){
            // 일반 사원인 경우 (seat_arrng!=0인 경우)
            seat_arrng = e.target.parentElement.parentElement.parentElement.getAttribute('id');
        }

        //모달창 show
        $('.black-background').show().animate({marginTop:'0px'});  
        // 추가할 사원 리스트는 jsGrid 라이브러리를 사용함
        $("#jsGrid").jsGrid({
            width: "100%",
            paging:false,
            autoload:true,
            fields: [
                { name : "number", type:"number",title:"번호",align:"center",width:"50px"},
                { name: "emp_name", type: "text",title:"이름",align:"center"},
                { name: "dept_name", type: "text",title:"팀이름",align:"center"},
            ],
            controller:{
                loadData : function(){
                    var d = $.Deferred();
                    // 지금 + 버튼을 누른 곳의 팀 이름을 가져오고, ajax로 서버에 전달.
                    var dept_name = $(e.target).parents('.department').children('.dept-name').text();
                    $.ajax({
                        method:'POST',
                        url:`/addlist/${dept_name}`,
                        dataType:"json",
                        success:function(data){
                            // 서버에서, 해당 팀의 seat_arrng=-1인 사람의 리스트를 가져와줌.
                            for(var i=0;i<data.length;i++)
                            {
                                // 가져온 사람에 대해 1,2,3,... index["number"] 번호를 매겨줌.
                                data[i]["number"]=i+1;
                            }
                            d.resolve(data);
                        },
                        error:function(e){
                            Swal.fire({
                                heightAuto:false,
                                title:'로그인 상태가 아닙니다.\n 이전 페이지로 돌아갑니다.',
                                icon:'warning',
                            }).then(()=>{location.href='/';});
                        }
                    });
                    return d.promise();
                }
            },
           
            rowClick : function(args){
                var getData = args.item;
                var emp_id = getData['emp_id'];
                
                Swal.fire({
                    title : '해당 사원을 추가하시겠습니까?',
                    icon:'warning',
                    heightAuto:false,
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: '승인',
                    cancelButtonText: '취소'
                }).then((result)=>{
                    if(result.isConfirmed){
                        $.ajax({
                            method:'POST',
                            url:`/add/${emp_id}/${seat_arrng}`,
                            dataType:"json",
                            success:function(data){
                                
                            },
                            error:function(e){
                                Swal.fire({
                                    heightAuto:false,
                                    title:'로그인 상태가 아닙니다.\n 이전 페이지로 돌아갑니다.',
                                    icon:'warning',
                                }).then(()=>{location.href='/';});
                            }
                           
                        });
                        Swal.fire({
                            heightAuto:false,
                            title:'승인되었습니다.',
                            icon:'success',
                        }).then(()=> {location.reload();}); 
                    }
                });

               
            }
            

            
        });
        
    });

    // 5. 모달창 뒤 검은 배경 누르면 창 닫힘
    $('.black-background').click(function(e){
        if(e.target==e.currentTarget){
          $('.black-background').hide();
        }
    });

    // 6. X 버튼 누르면 창 닫힘
    $('.btn-close').click(function(e){
            //close button 눌렀을 때도 닫기 
            if(e.target==e.currentTarget){
                $('.black-background').hide();
            }
    });
});

// 7. 300초(5분) 뒤에 logout 시킴
setTimeout(function(){ //300초(5분)뒤에 logout으로 
    location.replace('/logout');
}, 300000);
