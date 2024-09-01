<template>
  <div class="chat-container">
    <el-scrollbar wrap-class="chat-messages" ref="scrollbar">
      <div ref="innerRef">
        <div v-for="(message, index) in messages" :key="index" class="message" :class="{ 'message-self': message.isSelf }">
          <img :src="message.avatar" class="message-avatar" />
          <div class="message-content">{{ message.content }}</div>
        </div>
      </div>
    </el-scrollbar>
    <div style="display: flex;align-items: center;">
      <el-input v-model="newMessage" placeholder="请输入消息内容" class="input-new-message" @keyup.enter="sendMessage"></el-input>
      <el-button type="primary" :icon="Edit" circle style="margin-top: 18px;" @click="resourceDialog=true"/>
    </div>
    
    <el-dialog v-model="resourceDialog" title="请求资源表单" width="500" align-center>
      <span>
        <el-form ref="resourceFormRef" style="max-width: 600px" :model="resourceForm" :rules="resourceRules" label-width="auto"
          class="demo-ruleForm" size="default" status-icon>
          <el-form-item label="姓名" prop="name">
            <el-input v-model="resourceForm.name" />
          </el-form-item>
          <el-form-item label="学号" prop="studentId">
            <el-input v-model="resourceForm.studentId" />
          </el-form-item>
          <el-form-item label="预估运行时间" prop="runtime">
            <el-input v-model="resourceForm.runtime" />
          </el-form-item>
          <el-form-item label="预估资源" prop="resource">
            <el-input v-model="resourceForm.resource" />
          </el-form-item>
          <el-form-item>
            <el-button @click="resetForm(resourceFormRef)">重置</el-button>
          </el-form-item>
        </el-form>
      </span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="resourceDialog = false">返回</el-button>
          <el-button type="primary" @click="submitForm(resourceFormRef)">
              提交
          </el-button>
        </div>
      </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick,watch } from 'vue';
import store from '@/store';
import websocket from '@/utils/websocket';
import Constants from '@/utils/constants';
import { useRouter } from 'vue-router';
import { clearUnread, getGroupMemberInfo, getHistoryGroupMessage, getHistoryMessage, requestResource, updateIsRead } from '@/utils/request';
import { ElMessage, FormInstance } from 'element-plus';
import { Edit} from '@element-plus/icons-vue'

const router = useRouter();
const allContacts=store.getters.getAllContacts;
const userId = store.getters.getUserId;
const userAvatar = store.getters.getAvatar;

const newMessage = ref('');
const currentChat = ref({ friendId: store.getters.getFriendId, friendAvatar: store.getters.getFriendAvatar,type:store.getters.getChatType });

interface Message {
  content: string;
  isSelf: boolean;
  avatar: string;
  type:number
}
const messages = ref<Message[]>([]);

function sendMessage() {
  if (newMessage.value.trim()) {
    messages.value.push({
      content: newMessage.value,
      isSelf: true,
      avatar: Constants.Avatar + userAvatar,
      type:currentChat.value.type
    });
    const messagePojo = { senderId: userId, receiverId: currentChat.value.friendId, content: newMessage.value ,chatType:currentChat.value.type};
    websocket.Send(messagePojo);
    newMessage.value = '';
    setScrollToBottom();
  }
}

const resourceForm=ref({
  senderId:'',
  receiverId:'',
  name:'',
  studentId:'',
  runtime:'',
  resource:''
})

const resourceDialog=ref(false)

const resourceRules = {
  name: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
  ],
  studentId: [
    { required: true, message: '请输入学号', trigger: 'blur' },
  ],
  runtime: [
    { required: true, message: '请输入预估运行时间', trigger: 'blur' },
  ],
  resource: [
    { required: true, message: '请输入预估资源', trigger: 'blur' },
  ],
}

const resourceFormRef = ref<FormInstance>()

const submitForm = (formEl: FormInstance | undefined) => {
  if(currentChat.value.type==0){
    ElMessage.error("群组不能提交")
    return
  }
  if (!formEl) return
  formEl.validate(async (valid) => {
    if (valid) {
     resourceForm.value.senderId=userId
     resourceForm.value.receiverId=currentChat.value.friendId
     const res=await requestResource(resourceForm.value)
     if(res.code==Constants.SAVE_OK){
      ElMessage.success("提交成功")
      newMessage.value="提交了一个资源请求,"+"请求编号为："+res.data
      sendMessage()
      resourceDialog.value=false
     }else{
      ElMessage.error(res.msg)
     }
    } else {
      ElMessage.error("请检查数据格式")
    }
  })
}

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}
onMounted(() => {
  if(currentChat.value.type==1){
    friendChat()
  }
  else{
    groupChat()
  }
});

function friendChat(){
  setWebsocketCallback()
  getHistory(userId,currentChat.value.friendId)
  IsRead(userId,currentChat.value.friendId)
}


const groupMember=ref([])
async function groupChat(){
  const res=await getGroupMemberInfo({groupId:currentChat.value.friendId})
  groupMember.value=res.data
  setWebsocketCallbackGroup()
  getHistoryGroup(currentChat.value.friendId)
  IsReadGroup(userId,currentChat.value.friendId)
}

async function IsRead(receiverId,senderId){
  if(store.getters.getUnread==0)
  return
  const res=await updateIsRead({receiverId,senderId})
  if(res.code==Constants.UPDATE_OK){
     return
  }else{
    console.log(res.msg)
  }
}

async function IsReadGroup(userId,groupId){
  if(store.getters.getUnread==0)
  return
  const res=await clearUnread({userId,groupId})
  if(res.code==Constants.DELETE_OK){
     return
  }else{
    console.log(res.msg)
  }
}


function setWebsocketCallback(){
  websocket.setMessageCallback((data) => {
    const msg = JSON.parse(data);
    if(msg.senderId!=currentChat.value.friendId||msg.receiverId!=userId){
      notCurrentFriend(msg)
      return
    }
    messages.value.push({
      content: msg.content,
      isSelf: false,
      avatar: Constants.Avatar + currentChat.value.friendAvatar,
      type:currentChat.value.type
    });
    setScrollToBottom();
  });
}

function notCurrentFriend(msg){
  const contact = allContacts.find(contact => {
        if (msg.chatType==1 && contact.type==1) {
            return contact.friendId == msg.senderId;
        } else if (msg.chatType==0 && contact.type==0) {
            return contact.groupId == msg.receiverId;
        }
        return false
    });
  if (contact) {
        ElMessage.success((contact.type == 1 ? contact.friendName : contact.groupName) + "发来了一条消息");
        contact.unread = (contact.unread || 0) + 1;  // 确保 unread 有一个初始值
  } else {
        console.warn('Contact not found for senderId:', msg.senderId);
      }
}

function setWebsocketCallbackGroup(){
  websocket.setMessageCallback((data) => {
    const msg = JSON.parse(data);
    if(msg.receiverId!=currentChat.value.friendId){
      notCurrentFriend(msg)
      return
    }
    let member= groupMember.value.filter(member=>member.userId==msg.senderId)
    messages.value.push({
      content: msg.content,
      isSelf: false,
      avatar: Constants.Avatar + member[0].avatar,
      type:currentChat.value.type
    });
    setScrollToBottom();
  });
}

watch(currentChat,async (newChat) => {
  messages.value=[]
  if(newChat.type==1){
    friendChat()
  }
  else{
    groupChat()
  }
}, { deep: true });

watch(messages,()=>{
  setScrollToBottom();
})

function getHistory(userId,friendId){
  getHistoryMessage({userId:userId,friendId:friendId}).then(res=>{
  if(res.code==Constants.GET_OK){
    if(res.data.length==0)
    return
    messages.value=res.data.map(message=>{
      return {
      content: message.content,
      isSelf: message.senderId === userId, // 需要定义 currentUserId 变量，表示当前用户的 ID
      avatar: message.senderId === userId ? Constants.Avatar+userAvatar : Constants.Avatar+currentChat.value.friendAvatar,
      type:1
    }
    })
  }
})
}

function getHistoryGroup(groupId) {
  getHistoryGroupMessage({ groupId }).then(res => {
    if (res.code === Constants.GET_OK) {
      if (res.data.length === 0) return;
      messages.value = res.data.map(message => {
        const isSelf = message.senderId === userId;
        const avatar = isSelf
          ?  userAvatar
          : (groupMember.value.find(member => member.userId === message.senderId) || {}).avatar;

        return {
          content: message.content,
          isSelf: isSelf,
          avatar: Constants.Avatar + avatar,
          type: 0
        };
      });
    }
  }).catch(error => {
    console.error('Error fetching message history:', error);
  });
}

// Update currentChat when navigating
router.afterEach((to) => {
  if (to.name === 'chat') {
    const newFriendId = store.getters.getFriendId;
    const newFriendAvatar = store.getters.getFriendAvatar;
    const newType=store.getters.getChatType
    currentChat.value = {
      friendId: newFriendId,
      friendAvatar: newFriendAvatar,
      type:newType
    };
  }
});

const innerRef = ref();
const scrollbar = ref(null);

async function setScrollToBottom() {
  await nextTick();
  const max = innerRef.value!.clientHeight;
  scrollbar.value!.setScrollTop(max);
}
</script>


<style scoped>
.chat-container {
  
  height: calc(97vh - 200px);
  /* 调整聊天框高度 */
  width: 100%;
  /* 撑满宽度 */
  display: flex;
  margin: auto;
  margin-top: 20px;
  flex-direction: column;
  justify-content: flex-end;
  /* 聊天内容底部对齐 */
}

.chat-messages {
  width: 100%;
  /* 撑满宽度 */
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  /* 聊天消息左对齐 */
  padding: 10px;
}

.message {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  max-width: 100%;
}

.message-self {
  flex-direction: row-reverse;
  /* 自己发送的消息反向显示 */
}

.message-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
}

.message-content {
  word-break: break-all; /* Break words that are too long to fit */
  overflow-wrap: break-word; 
  background-color: #f0f0f0;
  padding: 10px;
  border-radius: 10px;
  max-width: 60%;
}

.message-self .message-content {
  background-color: #dcf8c6;
  /* 自己发送的消息背景色 */
}

.input-new-message {
  width: 100%;
  margin-top: 20px;
  padding: 10px;
}
@media (max-width: 600px) {
    .message-avatar {
    margin-left: 10px;
    /* 调整头像在小屏幕上的位置 */
    margin-right: 0;
  }

  .message-content {
    margin-left: 10px;
    /* 调整消息内容在小屏幕上的位置 */
    margin-right: 0;
  }
  
  .input-new-message {
    margin-top: 10px;
  }
}
</style>