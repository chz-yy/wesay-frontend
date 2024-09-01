<template>
  
    <el-descriptions
      class="margin-top"
      title="用户信息"
      size="default"
      :column="1"
      border
    >
      <template #extra>
        <el-button type="primary" @click="getUserDialog">修改</el-button>
      </template>
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
    
    <el-dialog v-model="userInfoDialog" title="修改用户信息" width="500" align-center>
      <span>
        <el-form ref="userInfoFormRef" style="max-width: 600px" :model="userInfoForm" :rules="registerRules" label-width="auto"
          class="demo-ruleForm" size="default" status-icon>
          <el-form-item label="用户名" prop="username">
            <el-input v-model="userInfoForm.username" />
          </el-form-item>
          <el-form-item label="出生日期" prop="birth">
              <el-date-picker v-model="userInfoForm.birth" type="date" placeholder="选择出生日期" size="default" value-format="YYYY-MM-DD"/>
          </el-form-item>
          <el-form-item label="性别" prop="gender">
            <el-radio-group v-model="userInfoForm.gender">
              <el-radio :value="1" size="large">男</el-radio>
              <el-radio :value="0" size="large">女</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="头像" prop="avatar">
            <el-upload
              class="avatar-uploader"
              :action=Constants.uploadImage
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload"
            >
              <img v-if="avatarUrl" :src="avatarUrl" class="avatar" />
              <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            </el-upload>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="userInfoForm.email" />
          </el-form-item>
          <el-form-item label="电话" prop="phone">
            <el-input v-model="userInfoForm.phone" />
          </el-form-item>
          <el-form-item label="个性签名" prop="signature">
            <el-input v-model="userInfoForm.signature" />
          </el-form-item>
          <el-form-item>
            <el-button @click="resetForm(userInfoFormRef)">重置</el-button>
          </el-form-item>
        </el-form>
      </span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="userInfoDialog = false">返回</el-button>
          <el-button type="primary" @click="submitForm(userInfoFormRef)">
              提交
          </el-button>
        </div>
      </template>
    </el-dialog>
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
import { getUserByUserId, updateUserInfo } from '@/utils/request';
import { ElMessage, FormInstance, UploadProps } from 'element-plus';
const userId=store.getters.getUserId

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



const handleAvatarSuccess: UploadProps['onSuccess'] =(response, uploadFile) => {
  avatarUrl.value = URL.createObjectURL(uploadFile.raw!);
  userInfoForm.value.avatar=response.data
};

const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (rawFile.type !== 'image/jpeg') {
    ElMessage.error('请选择jpg格式的照片')
    return false
  } else if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('照片大小不能大于2MB!')
    return false
  }
  return true
}

const userInfoFormRef = ref<FormInstance>()

const userInfoDialog = ref(false)


const userInfoForm = ref({
  username: '',
  avatar: '',
  gender: '',
  birth: '',
  email: '',
  phone: '',
  signature:''
})

function getUserDialog(){
  getUser(userInfoForm)
  userInfoDialog.value=true
}


const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 1, max: 10, message: '长度为1到10字符', trigger: 'blur' },
  ],
  birth: [
    { required: true, message: '请选择出生日期', trigger: 'blur' },
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'blur' },
  ],
   
}

const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.validate((valid) => {
    if (valid) {
      updateUserInfo(userInfoForm.value).then(res=>{
        if(res.code==Constants.UPDATE_OK){
          store.commit("setAvatar",userInfoForm.value.avatar)
          ElMessage.success("修改成功")
          userInfoDialog.value = false
        }else{
          ElMessage.error(res.msg)
        }
      })
    } else {
      ElMessage.error("请检查数据格式")
    }
  })
}

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}
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
