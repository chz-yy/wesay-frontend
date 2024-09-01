<template>
  
    <el-descriptions
      class="margin-top"
      title="用户信息"
      size="default"
      :column="1"
      border
    >
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon :style="iconStyle">
              <user />
            </el-icon>
            用户ID
          </div>
        </template>
        {{ userId }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon :style="iconStyle">
              <user />
            </el-icon>
            用户名
          </div>
        </template>
        {{ userInfo.username }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon :style="iconStyle">
              <Avatar />
            </el-icon>
            头像
          </div>
        </template>
        <img :src="Constants.Avatar+userInfo.avatar" class="avatar" />
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon :style="iconStyle">
              <user />
            </el-icon>
            性别
          </div>
        </template>
        <span v-if="userInfo.gender==1">男</span>
        <span v-else>女</span>
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon :style="iconStyle">
                <Calendar />
            </el-icon>
            出生日期
          </div>
        </template>
        {{userInfo.birth}}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon :style="iconStyle">
              <Message />
            </el-icon>
            邮箱
          </div>
        </template>
        {{ userInfo.email }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon :style="iconStyle">
              <iphone />
            </el-icon>
            电话
          </div>
        </template>
        {{userInfo.phone}}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon :style="iconStyle">
              <tickets />
            </el-icon>
            个性签名
          </div>
        </template>
        {{userInfo.signature}}
      </el-descriptions-item>
    </el-descriptions>
   
  </template>

<script setup lang="ts">
import { computed, onMounted, } from 'vue'
import {
    Iphone,
    Tickets,
    User,
} from '@element-plus/icons-vue'
import store from '@/store';
import Constants from '@/utils/constants';
import { ref } from 'vue';
import { getUserByUserId, } from '@/utils/request';
import router from '@/router';

let userId=store.getters.getFriendId

const iconStyle = computed(() => {
    const marginMap = {
        default: '6px',
    }
    return {
        marginRight: marginMap.default,
    }
})

const userInfo=ref({
    username:'',
    avatar:'',
    phone:"",
    email:"",
    gender:1,
    birth:"",
    signature:""
})

onMounted(()=>{
    getUser(userInfo)
})

const avatarUrl=ref()

function getUser(user){
  getUserByUserId({userId:userId}).then(res=>{
        if(res.code==Constants.GET_OK){
            user.value=res.data
            avatarUrl.value=Constants.Avatar+user.value.avatar
        }
  })
}

router.afterEach((to) => {
  if (to.name === 'friendInfo') {
    userId = store.getters.getFriendId;
    getUser(userInfo)
  }
});

</script>

<style scoped>
.el-descriptions {
    margin-top: 20px;
}

.cell-item {
    display: flex;
    align-items: center;
}

.margin-top {
    margin-top: 20px;
}
.avatar{
    width: 40px;
    height: auto;
}

@media (max-width: 600px) {
}
</style>
