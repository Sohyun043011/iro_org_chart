-- emp_info와 seat_info 정보 동기화를 위한 과정 (부서정보 변경 시에도 적용됨)
-- 1. emp_info에만 존재하고 seat_info에는 없는 직원 정보를 초기값 -1로 삽입
INSERT INTO good.seat_info(emp_id, emp_name, dept_name, seat_arrng) 
SELECT emp_id, emp_name, dept_name, -1 FROM good.emp_info 
WHERE (emp_id, emp_name, dept_name) NOT IN (
    SELECT emp_id, emp_name, dept_name FROM seat_info
);

--2. emp_info에 없고 seat_info에만 존재하는 직원 정보(퇴사자)를 삭제

DELETE FROM good.seat_info 
WHERE (emp_id, emp_name, dept_name) NOT IN (
    SELECT emp_id, emp_name, dept_name FROM good.emp_info
);

-- seat_arrng 변경

UPDATE good.seat_info
SET seat_arrng={}
WHERE emp_id={};