export default class Constants{
    static SAVE_OK=20011;
    static DELETE_OK=20021;
    static UPDATE_OK=20031;
    static GET_OK=20041;
    static SAVE_ERR=20010;
    static DELETE_ERR=20020;
    static UPDATE_ERR=20030;
    static GET_ERR=20040;
    static SYSTEM_ERR=50001;
    static SYSTEM_UNKNOW_ERR=59999;
    static BUSINESS_ERR=60001;
    static url="http://10.98.139.98:8080/"
    //上传照片地址
    static uploadImage= this.url+"api/upload/avatar";
    //查看头像地址
    static Avatar= this.url+"api/image/";
    //websocket后端请求地址
    static websocketUrl="ws://10.98.139.98:8080/api/websocket/";
    //axios请求地址
    static baseUrl=this.url+"api"

    
}