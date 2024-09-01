import {createRouter,createWebHashHistory} from "vue-router"

const routes=[
    {
        path:'/',
        name:'Login',
        component:()=>import('../views/LoginVIew.vue')
    },
    {
        path:'/menu',
        name:'menu',
        component:()=>import('../views/MenuView.vue'),
        children:[
            {
                path:'/chat',
                name:'chat',
                component:()=>import('../views/pages/ChatView.vue')
            },
            {
                path:'/addContacts',
                component:()=>import('../views/pages/AddContacts.vue')
            },
            {
                path:'/userInfo',
                component:()=>import('../views/pages/UserInfo.vue')
            },
            {
                path:'/friendInfo',
                name:'friendInfo',
                component:()=>import('../views/pages/FriendInfo.vue')
            },
            {
                path:'/resourceRequest',
                component:()=>import('../views/pages/ResourceRequestList.vue')
            }
        ]
    }
]

const router=createRouter({
    history:createWebHashHistory(),
    routes
})
router.beforeEach((to,from,next)=>{
    next()
})

export default router