var org={

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
    $('.btn').removeClass('clicked');


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
        // 각 부서를 돌면서. 
        var dept_name = $('.dept-name').eq(j).text();
        for(var k=0;k<Object.keys(org).length;k++){
            // org[k]의 team안에 해당 dept가 있는지 
            var width_sum = 0;
            var dept = Object.values(org)[k];
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
        var width_sum=0;
        for(var t=0;t<$(`.office-${h}`).length;t++){
            width_sum=width_sum+$(`.office-${h}`).eq(t).width();
        }
        $('.header').eq(h).css({'width':`${width_sum}`});
    }


    // 추가버튼 -  만약 빈 셀이면, X 표시 없애고 border를 점선으로 표시
    for(var mem=0;mem<$('.memInfo').length;mem++){
        console.log($('.memInfo').eq(mem).children().length);
        if($('.memInfo').eq(mem).children().length==0)
        {
            // 빈 셀인 경우 버튼 제거
            $(".rounded-circle").eq(mem).css({'display':'none'});
            // $('.cell').eq(mem).append(`<img src="img/none.PNG"  class="mem-img dahsed-border" style="">`)
            $('.memInfo').eq(mem).css({'height':'48px'});
            // $('.cell').eq(mem).addClass('dashed-border');
            //버튼 추가
            $('.cell').eq(mem).append(`<div class="dashed-border"><button type="button" class="btn btn-secondary btn-add">+</button></div>`);
        }
    }


    $('.btn-del').on('click',function(e){
        // 해당 셀 삭제 버튼 누르는 경우, 셀의 사번을 ajax로 전송
        // 삭제 하시겠습니까?(confirm창)


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
                var data = e.target.parentElement.parentElement.children[1].children[0].getAttribute('id');
                console.log("ajax started");
                $.ajax({
                    method:'POST',
                    url:`/delete/${data}`,
                    success:function(result){
                        Swal.fire({
                            heightAuto:false,
                            title:'삭제되었습니다.',
                            icon:'success',
                        }).then(()=>{location.reload()});
                        
                    },
                    error: function(e){
                        // alert("error: "+e.responseText);
                        Swal.fire({
                            heightAuto:false,
                            title:'로그인 상태가 아닙니다.\n 이전 페이지로 돌아갑니다.',
                            icon:'warning',
                        }).then(()=>{location.href='/';});
                        
                        // return;
                    }
                });

                
               
               
            }
        });

        
    });

    // 추가 버튼 누르는 경우
    $('.btn-add').on('click',function(e){
        

        var seat_arrng = e.target.parentElement.parentElement.getAttribute('id');       //팀장버튼인 경우
        if(seat_arrng!=0){
            seat_arrng = e.target.parentElement.parentElement.parentElement.getAttribute('id');
        }
        // console.log(seat_arrng);
        $('.black-background').show().animate({marginTop:'0px'});  
        // 플러스 버튼 누르면 유저리스트 가져오기

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
                    var dept_name = $(e.target).parents('.department').children('.dept-name').text();
                    console.log(dept_name);
    
                    
                    $.ajax({
                        method:'POST',
                        url:`/addlist/${dept_name}`,
                        dataType:"json",
                        success:function(data){
                           
                            // console.log(data);
                            
                            
                            for(var i=0;i<data.length;i++)
                            {
                                data[i]["number"]=i+1;
                            }
                            console.log(data);
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
                console.log(args);
                console.log(args.event);
                var getData = args.item;
                var emp_id = getData['emp_id'];
                var emp_name = getData['emp_name'];
                
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

    // 모달창 뒤 검은 배경 누르면 창 닫힘
    $('.black-background').click(function(e){
        if(e.target==e.currentTarget){
          $('.black-background').hide();
        }
    });

    // X 버튼 누르면 창 닫힘
    $('.btn-close').click(function(e){
            //close button 눌렀을 때도 닫기 
            if(e.target==e.currentTarget){
                $('.black-background').hide();
            }
    });
});



setTimeout(function(){ //300초(5분)뒤에 logout으로 
    location.replace('/logout');
}, 300000);
