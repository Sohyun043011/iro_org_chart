const requestIp=require('request-ip')

module.exports={
    options: {
        host:"192.168.20.19",
        user:"root",
        password:"Azsxdc123$",
        database:"good",
        clearExpired: true,
        checkExpirationInterval:10000,
        expiration:60000,
        connectionLimit: 1,
        endConnectionOnClose:true,
    },
    get_ip : function(req){
        const connection_info=requestIp.getClientIp(req).split(':'); // req 헤더정보 분리
        let ip='localhost';
        if(connection_info.length==4){ // ipv4 추출
            ip=connection_info[3];
        }
        return ip;
    }
};