<template>
    <p class="requestTitle">请求列表</p>
    <el-table :data="requestTable" style="width: 100%">
        <el-table-column prop="id" label="请求编号" class="tableColumn1" />
        <el-table-column prop="name" label="姓名" class="tableColumn1" />
        <el-table-column prop="studentId" label="学号" class="tableColumn1" />
        <el-table-column prop="runtime" label="预估运行时间" class="tableColumn1" />
        <el-table-column prop="resource" label="预估资源" class="tableColumn1" />
        <el-table-column label="操作" class="tableColumn1">
            <template #default="scope">
                <el-button link type="primary" size="small" v-if="scope.row.isAgree==0"
                    @click.prevent="agreeRequest(scope.row)">
                    同意
                </el-button>
                <span v-else>已同意</span>
            </template>
        </el-table-column>
    </el-table>

    <p class="requestTitle">我的请求</p>
    <el-table :data="myRequestTable" style="width: 100%">
        <el-table-column prop="id" label="请求编号" class="tableColumn1" />
        <el-table-column prop="name" label="姓名" class="tableColumn1" />
        <el-table-column prop="studentId" label="学号" class="tableColumn1" />
        <el-table-column prop="runtime" label="预估运行时间" class="tableColumn1" />
        <el-table-column prop="resource" label="预估资源" class="tableColumn1" />
        <el-table-column label="操作" class="tableColumn1">
            <template #default="scope">
                <span v-if="scope.row.isAgree==0">待审核</span>
                <span v-else>已同意</span>
            </template>
        </el-table-column>
    </el-table>
</template>

<script setup lang="ts">
import store from '@/store';
import Constants from '@/utils/constants';
import { agreeResourceRequest, getMyResourceRequestList, getResourceRequestList } from '@/utils/request'
import { ElMessage } from 'element-plus';
import websocket from '@/utils/websocket';
import { onMounted, ref } from 'vue';

const userId = store.getters.getUserId

let myRequestTable=ref()

async function getMyRequest(){
    const res = await getMyResourceRequestList({ "userId": userId })
    if (res.code == Constants.GET_OK) {
        myRequestTable.value = res.data
    } else {
        ElMessage.error(res.msg)
    }
}


let requestTable = ref()

onMounted(() => {
    getRequest()
    getMyRequest()
})

async function getRequest(){
    const res = await getResourceRequestList({ "userId": userId })
    if (res.code == Constants.GET_OK) {
        requestTable.value = res.data
    } else {
        ElMessage.error(res.msg)
    }
}

const agreeRequest = (row) => {
    agreeResourceRequest({id:row.id}).then(res => {
        if (res.code == Constants.UPDATE_OK) {
            ElMessage.success("已同意该请求")
            sendMessage(row.id,row.senderId)
            row.isAgree=1
        } else {
            ElMessage.error(res.msg)
        }
    })
}


function sendMessage(id,receiverId) {
    const newMessage = '已同意编号：'+id+"的请求";
    const messagePojo = { senderId: userId, receiverId: receiverId, content: newMessage,chatType:1};
    websocket.Send(messagePojo);
}


</script>


<style scoped>
.el-bt {
    margin: 0px 0px 0px 10px;
}

.requestTitle {
    text-align: center;
    margin-top: 50px;
}
</style>