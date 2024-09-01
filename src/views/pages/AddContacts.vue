<template>
  <div style="display: flex ;">
    <el-input
    v-model="searchInput"
    style="width: 240px"
    placeholder="请输入用户ID"
    clearable
    />
    <el-button type="primary" class="el-bt" @click="searchUser">搜索</el-button>
  </div>
  

  <el-table :data="resultTable" style="width: 100%">
    <el-table-column prop="userId" label="用户ID"  class="tableColumn1" />
    <el-table-column prop="username" label="用户名"  class="tableColumn1"/>
    <el-table-column label="操作"  class="tableColumn1">
      <template #default="scope">
        <el-button
          link
          type="primary"
          size="small"
          @click.prevent="addFriend(scope.row.userId)"
        >
        添加  
      </el-button>
      </template>
    </el-table-column>
  </el-table>
  <p class="requestTitle">请求列表</p>
  <el-table :data="requestTable" style="width: 100%">
    <el-table-column prop="friendId" label="用户ID"  class="tableColumn1"/>
    <el-table-column prop="friendName" label="用户名"  class="tableColumn1"/>
    <el-table-column label="操作" class="tableColumn1">
      <template #default="scope">
        <el-button
          link
          type="primary"
          size="small"
          @click.prevent="agreeFriend(scope.row.friendId,scope.row.friendshipId)"
        >
        同意  
      </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
import store from '@/store';
import Constants from '@/utils/constants';
import {getUserByUserId, requestAddFriend,getRequestFriendList, agreeAddFriend} from '@/utils/request'
import { ElMessage } from 'element-plus';

import { onMounted, ref } from 'vue';

const userId=store.getters.getUserId
const searchInput=ref("")
const resultTable=ref([])
const searchUser=()=>{
  getUserByUserId({"userId":searchInput.value}).then(res=>{
    if(res.code==Constants.GET_OK){
      resultTable.value=[res.data]
    }else{
      ElMessage.error(res.msg)
    }
  })
}
const addFriend=(friendId)=>{
  requestAddFriend({"friendId":friendId,"userId":userId}).then(res=>{
    if(res.code==Constants.SAVE_OK){
      ElMessage.success("请求已发送")
    }else{
      ElMessage.error(res.msg)
    }
  })
}

let requestTable=ref()

onMounted(async()=>{
  const res=await getRequestFriendList({"userId":userId})
  if(res.code==Constants.GET_OK){
    requestTable.value=res.data
  }else{
    ElMessage.error(res.msg)
  }
})

const agreeFriend=(friendId,friendshipId)=>{
  agreeAddFriend({"friendshipId":friendshipId,"friendId":friendId,"userId":userId}).then(res=>{
    if(res.code==Constants.SAVE_OK){
      ElMessage.success("已同意好友请求")
    }else{
      ElMessage.error(res.msg)
    }
  })
}
</script>


<style  scoped>
.el-bt{
  margin: 0px 0px 0px 10px;
}
.requestTitle{
  text-align: center;
  margin-top: 50px;
}


</style>