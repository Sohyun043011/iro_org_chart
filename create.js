//임시 dept_info(db에서 받아올 값)



var dept_info = 
{'해외마케팅팀':2,'국내관광팀':2,'스마트관광팀':4,'MICE뷰로':2,
'고객홍보팀':2,'전략기획팀':2,'경영지원팀':4,'축제이벤트팀':2, '섬발전지원센터':2,'의료웰니스팀':2,'관광인프라':2};


$(document).ready(function(){
            
            // for(var i=0;i<$('.dept-name').length;i++){
            //     dept_name.push($('.dept-name').eq(i).text());
            // }
            // console.log(dept_name); //dept_name = ['해외마케팅팀','국내관광팀','스마트관광팀','마이스뷰로,'고객홍보팀','전략기획팀','경영지원팀']

            $(document).on('click','.cell',function(e){
                //클릭하면 모달창 뜸
                $('.black-background').show().animate({marginTop:'0px'});
                // 클릭한 cell의 memInfo의 memName,memPos를 가져옴.

               var data = {id : e.target.nextElementSibling.children[0].getAttribute('id') };
                //띄울 mem의 id
                $.ajax({
                    method:'POST',
                    url:'/detail',
                    data:data,  //서버로 보낼 데이터
                    success:function(result){
                        alert('성공');
                        // console.log(result);
                    },
                    error: function(result){
                        alert('실패');
                    }
                })
                }); 

         }  
    );
            



            // setTimeout(function(){ //30초에 한번씩 reload
            //     location.reload();
            // }, 30000);



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


//전체 컨테이너 width height 설정
$('#container').css({"width": screen.width,"height":screen.height});
        


        //각 팀에 4행 col=? 로 table 구성(dept_info : {'팀이름':'col 수'})
function makeCell(dpt_num,col_num)
{
            //dpt_num = department의 번호
            //col_num = 열의 수
           
                for(var i=0;i<4;i++)
                {
                    for(var j=0;j<col_num;j++)
                    {

                        //이름. 직급 db에서 가져옴.
                        
                        //var name = "임희복"
                        //var position = "차장"

                        var info = `<div class="memInfo">
                            <span class="memName fs-6" ></span>
                            <span class="memPos fs-6" ></span>
                        </div>`

                        var cell = `<div class="col-${12/col_num} text-center mem" id="${i*col_num+j+1}" style="float: none; margin:100 auto;">
                            <div class=" border bg-light cell mr-0"></div>
                          </div>`;
                
                         
                          $('.dept-table').children('#mem-row').eq(dpt_num).append(cell);  
                          $('.dept-table').children('#mem-row').eq(dpt_num).children('.mem').eq(i*col_num+j).append(info);
                          
                    }
                   
                }

                // var total =  $('.dept-table').children('#mem-row').eq(i).children('.mem').length;
 
}
        
