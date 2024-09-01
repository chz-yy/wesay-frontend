
import {post,get,put,del} from './service.js'

export const loginApi=data=>{
    return post({
        url:'/user/login',
        data
    })
}

export const registerApi=data=>{
    return post({
        url:'/user/register',
        data
    })
}

export const getUserByUserId=params=>{
    return get({
        url:'/user/getUserByUserId',
        params
    })
}
export const getFriendList=params=>{
    return get({
        url:'/friendship/list',
        params
    })
}

export const requestAddFriend=data=>{
    return post({
        url:'/friendship/requestAddFriend',
        data
    })
}

export const getRequestFriendList=params=>{
    return get({
        url:'/friendship/getRequestFriendList',
        params
    })
}

export const agreeAddFriend=data=>{
    return post({
        url:'/friendship/agreeAddFriend',
        data
    })
}

export const getHistoryMessage=params=>{
    return get({
        url:'/msg/getHistory',
        params
    })
}

export const getHistoryGroupMessage=params=>{
    return get({
        url:'/msg/getHistoryGroup',
        params
    })
}

export const updateUserInfo=data=>{
    return put({
        url:'/user/updateUserInfo',
        data
    })
}

export const createGroup=data=>{
    return post({
        url:'/group/createGroup',
        data
    })
}

export const getGroupList=params=>{
    return get({
        url:'/group/list',
        params
    })
}

export const getGroupMemberInfo=params=>{
    return get({
        url:'/groupMember/memberInfo',
        params
    })
}

export const getUnreadCount=params=>{
    return get({
        url:'/msg/unread',
        params
    })
}

export const updateIsRead=data=>{
    return put({
        url:'/msg/read',
        data
    })
}


export const clearUnread=params=>{
    return del({
        url:'/unread/clearUnread',
        params
    })
}

export const deleteFriend=params=>{
    return del({
        url:'/friendship/deleteFriend',
        params
    })
}

export const exitGroup=params=>{
    return del({
        url:'/groupMember/exitGroup',
        params
    })
}

export const requestResource=data=>{
    console.log(data)
    return post({
        url:'/resource/request',
        data
    })
}

export const getResourceRequestList=params=>{
    return get({
        url:'/resource/list',
        params
    })
}

export const getMyResourceRequestList=params=>{
    return get({
        url:'/resource/myList',
        params
    })
}

export const agreeResourceRequest=data=>{
    return put({
        url:'/resource/agree',
        data
    })
}











