import {createStore} from "vuex";

export default createStore({
    state:{
        username:'',
        avatar:'',
        userId:'',
        friendId:'',
        friendName:'',
        friendAvatar:'',
        chatType:'',
        contacts:[],
        unread:''
    },
    getters:{
        getUsername(state){
            state.username=localStorage.getItem("userName")
            return state.username
        },
        getAvatar(state){
            state.avatar=localStorage.getItem("avatar")
            return state.avatar
        },
        getUserId(state){
            state.userId=localStorage.getItem("userId")
            return state.userId
        },
        getFriendId(state){
            state.friendId=localStorage.getItem("friendId")
            return state.friendId
        },
        getFriendName(state){
            state.friendName=localStorage.getItem("friendName")
            return state.friendName
        },
        getFriendAvatar(state){
            state.friendAvatar=localStorage.getItem("friendAvatar")
            return state.friendAvatar
        },
        getChatType(state){
            state.chatType=localStorage.getItem("chatType")
            return state.chatType
        },
        getAllContacts(state){
            state.contacts=localStorage.getItem("contacts")
            return state.contacts ? JSON.parse(state.contacts) : [];
        },
        getUnread(state){
            state.unread=localStorage.getItem("unread")
            return state.unread
        }
    },
    mutations:{
        setUsername(state,username){
            localStorage.setItem("userName",username)
            state.username=username
        },
        setAvatar(state,avatar){
            localStorage.setItem("avatar",avatar)
            state.avatar=avatar
        },
        setUserId(state,userId){
            localStorage.setItem("userId",userId)
            state.userId=userId
        },
        setFriendId(state,friendId){
            localStorage.setItem("friendId",friendId)
            state.friendId=friendId
        },
        setFriendName(state,friendName){
            localStorage.setItem("friendName",friendName)
            state.friendName=friendName
        },
        setFriendAvatar(state,friendAvatar){
            localStorage.setItem("friendAvatar",friendAvatar)
            state.friendAvatar=friendAvatar
        },
        setFriendInfo(state,contact){
            if(contact.type==1){
                state.friendId=contact.friendId
                state.friendName=contact.friendName
                state.friendAvatar=contact.friendAvatar
                localStorage.setItem("friendAvatar",contact.friendAvatar)
                localStorage.setItem("friendName",contact.friendName)
                localStorage.setItem("friendId",contact.friendId)
            }else{
                state.friendId=contact.groupId
                localStorage.setItem("friendId",contact.groupId)
            }
            localStorage.setItem("unread",contact.unread)
            localStorage.setItem("chatType",contact.type)
            state.unread=contact.unread
            state.chatType=contact.type
        },
        setChatType(state,type){
            localStorage.setItem("chatType",type)
            state.chatType=type
        },
        setAllContacts(state,contacts){
            localStorage.setItem("contacts",JSON.stringify(contacts))
            state.contacts=contacts
        }
    },
    actions:{

    },
    modules:{

    }
})