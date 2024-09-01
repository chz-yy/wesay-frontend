import axios from "axios";
import { ElLoading } from 'element-plus'
import { ElMessage } from 'element-plus'
import Constants from "./constants";
import JSONbig from 'json-bigint'
let loadingObj=null
const Service=axios.create({
    timeout:8000,
    baseURL:Constants.baseUrl,
    headers:{
        "Content-Type":"application/json;charset=utf-8"
    },
    transformResponse: [function (data) {
        try {
          const json = JSONbig({
            storeAsString: true
          })
        return json.parse(data)
        } catch (err) {
          return {
            data
        }}}]
})

Service.interceptors.request.use(config=>{
    loadingObj=ElLoading.service({
        lock: true,
        text: 'Loading',
        background: 'rgba(0, 0, 0, 0.7)',
      })
    return config
})

Service.interceptors.response.use(response=>{
    loadingObj.close()
    return response.data
},error=>{
    console.log(error)
    ElMessage.error('服务器错误')
});

export const post=config=>{
    return Service({
        ...config,
        method:'post',
        data:config.data
    })
}

export const get=config=>{
    return Service({
        ...config,
        method:'get',
        data:config.data
    })
}

export const put=config=>{
    return Service({
        ...config,
        method:'put',
        data:config.data
    })
}

export const del=config=>{
    return Service({
        ...config,
        method:'delete',
        data:config.data
    })
}