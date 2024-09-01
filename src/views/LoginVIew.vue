<template>
  <div class="login-container">
    <el-form ref="loginFormRef" :model="loginForm" :rules="rules" label-width="80px" class="login-form">
      <h2 class="login-title">用户登录</h2>
      <el-form-item label="用户名" prop="username">
        <el-input type="input" v-model="loginForm.username" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="loginForm.password" type="password" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="login(loginFormRef)" class="login-button">
          登录
        </el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="registerDialog = true" class="login-button">
          注册
        </el-button>
      </el-form-item>
    </el-form>

    <el-dialog v-model="registerDialog" title="注册" width="500" align-center>
      <span>
        <el-form ref="registerFormRef" style="max-width: 600px" :model="registerForm" :rules="registerRules" label-width="auto"
          class="demo-ruleForm" size="default" status-icon>
          <el-form-item label="用户名" prop="username">
            <el-input v-model="registerForm.username" />
          </el-form-item>
          <el-form-item label="新密码" prop="password">
            <el-input v-model="registerForm.password" type="password" autocomplete="off" />
          </el-form-item>
          <el-form-item label="确认密码" prop="verifyPassword">
            <el-input v-model="registerForm.verifyPassword" type="password" autocomplete="off"/>
          </el-form-item>
          <el-form-item label="出生日期" prop="birth">
              <el-date-picker v-model="registerForm.birth" type="date" placeholder="选择出生日期" size="default" value-format="YYYY-MM-DD"/>
          </el-form-item>
          <el-form-item label="性别" prop="gender">
            <el-radio-group v-model="registerForm.gender">
              <el-radio value="1" size="large">男</el-radio>
              <el-radio value="0" size="large">女</el-radio>
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
              <img v-if="imageUrl" :src="imageUrl" class="avatar" />
              <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            </el-upload>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="registerForm.email" />
          </el-form-item>
          <el-form-item label="电话" prop="phone">
            <el-input v-model="registerForm.phone" />
          </el-form-item>
        
          <el-form-item>
            <el-button @click="resetForm(registerFormRef)">重置</el-button>
          </el-form-item>
        </el-form>
      </span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="registerDialog = false">返回</el-button>
          <el-button type="primary" @click="submitForm(registerFormRef)">
              提交
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="login" lang="ts">
import { reactive, ref } from 'vue';
import type {UploadProps, FormInstance} from 'element-plus';
import { ElForm, ElFormItem, ElInput, ElButton, ElMessage } from 'element-plus';
import { loginApi,registerApi } from '../utils/request'
import Constants from '../utils/constants.js'
import router from '@/router';
import { Plus } from '@element-plus/icons-vue'
import store from '@/store';


const imageUrl = ref('')

const handleAvatarSuccess: UploadProps['onSuccess'] =(response, uploadFile) => {
  imageUrl.value = URL.createObjectURL(uploadFile.raw!);
  registerForm.avatar=response.data
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

const registerFormRef = ref<FormInstance>()

const registerDialog = ref(false)
const registerForm = reactive({
  username: '',
  password: '',
  verifyPassword: '',
  avatar: '',
  gender: '',
  birth: '',
  email: '',
  phone: '',
})

const validatePass = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else {
    if (registerForm.verifyPassword !== '') {
      if (!registerFormRef.value) return
      registerFormRef.value.validateField('verifyPassword')
    }
    callback()
  }
}
const validatePass2 = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error("两次输入的密码不一致"))
  } else {
    callback()
  }
}
const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 1, max: 10, message: '长度为1到10字符', trigger: 'blur' },
  ],
  password: [
  { validator: validatePass, trigger: 'blur' },
  { min: 6, max: 16, message: '长度为6到16字符', trigger: 'blur' },
  ],
  checkPass: [{ validator: validatePass2, trigger: 'blur' },
  { min: 6, max: 16, message: '长度为6到16字符', trigger: 'blur' },
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
      registerApi(registerForm).then(res=>{
        if(res.code==Constants.SAVE_OK){
          ElMessage.success("注册成功")
          registerDialog.value = false
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

const loginFormRef = ref<FormInstance>()

let loginForm = reactive({
  username: '',
  password: ''
})
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
};

const login = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.validate((valid) => {
    if (valid) {
      loginApi(loginForm).then(res => {
        if (res.code == Constants.GET_OK) {
          store.commit("setUsername",res.data.username)
          store.commit("setAvatar",res.data.avatar)
          store.commit("setUserId",res.data.userId)
          router.push('/menu')
        } else {
          ElMessage.error(res.msg)
        }
    })
    } else {
      ElMessage.error("请检查数据格式")
    }
  })
  
};
</script>

<style scoped>

.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
}

.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}


.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 97vh;
  /* 使登录框垂直居中 */
  padding: 3px 1px;
  background-color: #f0f2f5;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  background: linear-gradient(to bottom right, #7faf4c, #21f398);
  /* 使用线性渐变 */
  background-size: cover;
  /* 背景图像铺满容器 */
  background-position: center;
  overflow: hidden;
  /* 确保内容不溢出 */
}

.login-form {
  width: 100%;
  max-width: 400px;
  /* 控制登录表单的最大宽度 */
}

.login-title {
  text-align: center;
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.login-button {
  width: 100%;
}

@media (max-width: 600px) {
  .login-container {
    height: 89vh;
    padding: 1px;
    /* 在小屏幕上减少内边距 */
  }

  .login-form {
    max-width: 80%;
    /* 在小屏幕上让表单宽度铺满 */
  }
}
</style>
