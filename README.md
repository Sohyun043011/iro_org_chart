# Github command guide #

1. git init : 해당 디렉토리에 .git 생성 (github와 연동 시작)

2. git config --global user.name "[Github ID]" : 로컬 pc에 깃허브 id 연동정보 넣기
   git config --global user.email "[Github email]" : 로컬 pc에 깃허브 email 연동정보 넣기
   cf) --global 옵션을 주지 않으면 레포지토리 단위(디렉토리 단위)로 설정값을 변경할 수 있음

3. git remote add origin [repository URL] : github에 업로드된 레포지토리 url을 원격 레포지토리로 설정 (origin이라는 이름으로 사용)

4. git remote -v : 연결된 원격 레포지토리 목록 확인

5. git pull origin master : 원격 레포지토리에서 가져오기
   cf) pull은 fetch와 merge를 동시에 수행해주기 때문에, ![rejected] 오류 메세지가 나오면 다음 방법으로 레포지토리 내용을 가져온다.

   1) git status로 스테이징 상태 체크 및 add, commit해주기
   2) git fetch --all
   3) git merge origin/master

6. git status : git 스테이징 내용 확인(Modified, Added, Deleted 정보 모두 반영)

7. git add . : 현재 디렉토리 내의 모든 변경사항을 스테이징

8. git commit [-a] [-m "message"] : 스테이징된 내용 커밋하기 
   [-a] : git add + git commit을 수행
   [-m "message"] : 커밋 comments 추가

9. git push [-u] origin master : 커밋 내용을 원격 레포지토리에 업로드
   [-u] : 최초 푸시할 때만 사용하기

10. .gitignore에 있는 내용들은 스테이징, 커밋 대상에서 제외
   ex) create.js : create.js 파일만 ingore
       node_modules/ : node_modules라는 디렉토리 내용은 전부 ignore
       *.exe : 확장자가 exe인 파일들은 전부 ignore
