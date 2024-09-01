<template>
  <div class="chat-app">
    <el-container>
      <!-- 顶部功能栏 -->
      <el-header height="100px">
        <el-row :gutter="10"  justify="end">
          <el-col :xs="6" :sm="4">
            <el-button type="text" @click="showSearch = !showSearch" id="search">
              搜索联系人
            </el-button>
          </el-col>

          <el-col :xs="6" :sm="4">
            <el-button type="text" @click="addContacts" id="search">
              添加联系人
            </el-button>
          </el-col>

          <el-col :xs="6" :sm="4">
            <el-button type="text" @click="GroupDialog = true" id="search">
              创建群组
            </el-button>
          </el-col>

          <el-col :xs="6" :sm="4">
            <el-button type="text" @click="getResourceRequest" id="search">
              资源请求
            </el-button>
          </el-col>

          <el-col :xs="6" :sm="4">
            <el-button type="text" @click="userInfo" id="search">
              我的
            </el-button>
          </el-col>
          <el-col :xs="3" :sm="4" >
            <el-button type="text" @click="loginOut" id="search">
              退出
            </el-button>
          </el-col>
        </el-row>

        <el-input v-model="searchKeyword" v-show="showSearch" placeholder="请输入搜索内容"></el-input>

        <el-scrollbar>
          <div class="contact-list">
            <el-card v-for="contact in filteredContacts" :key="contact.id" class="contact-card"
              @click="selectContact(contact)" @mousedown="startLongPress($event, contact)" @mouseup="endLongPress"
              @touchstart="startLongPress($event, contact)" @touchend="endLongPress">
              <div class="contact-header">
                <el-badge :value="contact.unread" :hidden="contact.unread == 0">
                  <img :src="`${Constants.Avatar}${contact[contact.type === 1 ? 'friendAvatar' : 'groupAvatar']}`"
                    class="contact-avatar" />
                </el-badge>
                <div class="contact-name">{{ contact.type === 1 ? contact.friendName : contact.groupName }}</div>
              </div>
            </el-card>
          </div>
        </el-scrollbar>

        <div>
          <el-card :style="{ left: popoverPosition.x + 'px', top: popoverPosition.y + 'px' }" style="width: 100px;" v-if="contextMenuVisible" class="card">
            <el-menu>
              <el-menu-item @click="viewContact(contextContact)">查看信息</el-menu-item>
              <el-menu-item @click="deleteContact(contextContact)">删除</el-menu-item>
            </el-menu>
          </el-card>
        </div>
      </el-header>

      <el-main>
        <!-- 聊天框 -->
        <div class="chat-container">
          <router-view></router-view>
        </div>
        <!-- 创建群组 -->
        <el-dialog v-model="GroupDialog" title="创建群组" width="500" align-center>

          <el-table ref="groupTableRef" :data="memberTable" style="width: 100%" @selection-change="memberChange">
            <el-table-column type="selection" width="55" />
            <el-table-column property="friendName" label="用户名" width="120" />
          </el-table>
          <div style="margin-top: 20px">
            <div style="display: flex; margin-bottom: 10px;">
              <label style="margin-right: 10px;">群组名</label>
              <el-input v-model="groupName" style="width: 240px"></el-input>
            </div>
            <el-button @click="toggleSelection()">清空选项</el-button>
          </div>
          <template #footer>
            <div class="dialog-footer">
              <el-button @click="GroupDialog = false">取消</el-button>
              <el-button type="primary" @click="addGroup">
                提交
              </el-button>
            </div>
          </template>
        </el-dialog>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import router from '@/router';
import { ElContainer, ElHeader, ElMain, ElButton, ElInput, ElCard, ElScrollbar, ElMessage, ElTable } from 'element-plus';
import { computed, ref, onMounted } from 'vue';
import { createGroup, deleteFriend, exitGroup, getFriendList, getGroupList, getUnreadCount } from '../utils/request'
import store from '@/store';
import Constants from '@/utils/constants';
import websocket from '../utils/websocket'
const userId = store.getters.getUserId
const userAvatar = store.getters.getAvatar
let showSearch = ref(false)
let searchKeyword = ref('')

function getResourceRequest(){
  router.push("/resourceRequest")
}

const contextMenuVisible = ref(false);
const contextContact = ref(null);
const popoverPosition = ref({ x: 0, y: 0 });
let longPressTimer = null;
const LONG_PRESS_DURATION = 500; // Duration in milliseconds

const startLongPress = (event, contact) => {
  contextMenuVisible.value = false;
  // For mobile and desktop
  longPressTimer = setTimeout(() => {
    contextContact.value = contact;
    contextMenuVisible.value = true;

    // Calculate the position for the popover
    const { clientX, clientY } = event.touches ? event.touches[0] : event;
    popoverPosition.value = { x: clientX, y: clientY };
  }, LONG_PRESS_DURATION);
};

const endLongPress = () => {
  clearTimeout(longPressTimer);
};



const viewContact = (contact) => {
  store.commit('setFriendInfo', contact)
  if(contact.type==1)
  router.push("/friendInfo")
  contextMenuVisible.value = false;
};

const deleteContact =async (contact) => {
  if(contact.type==1){
    const res=await deleteFriend({userId,friendId:contact.friendId})
    if(res.code==Constants.DELETE_OK){
      ElMessage.success("删除好友成功")
    }else{
      console.log(res.msg)
    }
  }else{
    const res=await exitGroup({userId,groupId:contact.groupId})
    if(res.code==Constants.DELETE_OK){
      ElMessage.success("退出成功")
    }else{
      console.log(res.msg)
    }
  }
  contextMenuVisible.value = false;
};

let GroupDialog = ref(false)
const groupName = ref('')
const groupTableRef = ref<InstanceType<typeof ElTable>>()
const memberSelection = ref([])
const memberTable = ref([])
const toggleSelection = (rows) => {
  if (rows) {
    rows.forEach((row) => {
      groupTableRef.value!.toggleRowSelection(row, undefined)
    })
  } else {
    groupTableRef.value!.clearSelection()
  }
}
const memberChange = (val) => {
  memberSelection.value = val
}

function addGroup() {
  if (memberSelection.value.length === 0 || groupName.value == '') {
    ElMessage.error("请检查数据")
    return
  }
  const friendIds = memberSelection.value.map(s => s.friendId)
  let form = {
    "userId": userId,
    "friendId": friendIds,
    "groupName": groupName.value,
    "groupAvatar": userAvatar
  }
  createGroup(form).then(res => {
    if (res.code == Constants.SAVE_OK) {
      ElMessage.success("创建群组成功")
      GroupDialog.value = false
    } else {
      ElMessage.error(res.msg)
    }
  })
}
onMounted(async () => {
  try {
    fetchContacts()
    websocket.Init(userId)
    setWebsocketCallback()

  } catch (error) {
    console.error('Error fetching friend list:', error);
  }
});



function setWebsocketCallback() {
  websocket.setMessageCallback((data) => {
    const msg = JSON.parse(data);
    const contact = allContacts.value.find(contact => {
      if (msg.chatType == 1 && contact.type == 1) {
        return contact.friendId == msg.senderId;
      } else if (msg.chatType == 0 && contact.type == 0) {
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
  });
}

const allContacts = ref([]);

// 获取朋友和群聊的数据
const fetchContacts = async () => {
  const friends = await getFriendList({ "userId": userId });
  const groups = await getGroupList({ "userId": userId });   // 假设你有一个获取群聊列表的函数
  const unread = await getUnreadCount({ userId })
  if (friends.code == Constants.GET_OK && groups.code == Constants.GET_OK && unread.code == Constants.GET_OK) {
    allContacts.value = [
      ...friends.data.map(contact => {
        let count = unread.data[contact.friendId] || 0
        return { ...contact, type: 1, unread: count }
      }),
      ...groups.data.map(group => {
        let count = unread.data[group.groupId] || 0
        return { ...group, type: 0, unread: count }
      })
    ];
    store.commit("setAllContacts", allContacts.value)
    memberTable.value = friends.data;
  }
};

const filteredContacts = computed(() => {
  return allContacts.value.filter(contact => {
    if (searchKeyword.value) {
      return contact.type === 1
        ? contact.friendName.includes(searchKeyword.value)
        : contact.groupName.includes(searchKeyword.value);
    }
    return true;
  });
});

function selectContact(contact) {
  contact.unread=0
  store.commit('setFriendInfo', contact)
  router.push('/chat')
}
function addContacts() {
  router.push('/addContacts')
}
function loginOut() {
  store.commit("setUsername", "")
  store.commit("setAvatar", "")
  store.commit("setUserId", "")
  router.push('/')
}
function userInfo() {
  router.push('/userInfo')
}
</script>

<style scoped>
.el-card {
  --el-card-padding: 0px;
  overflow: visible;
}

.card{
  position: absolute;
}
.chat-app {
  height: 97vh;
}

.contact-list {
  display: flex;
  float: left;
  padding-top: 6px;
}

.contact-card {
  pointer-events: auto;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  /* Align items to the start of the flex container */
  width: 100px;
  height: 50px;
  margin: 5px;
  text-align: center;
  border-radius: 10px;
  background: var(--el-color-danger-light-9);
  color: var(--el-color-danger);
}

.contact-header {
  display: flex;
  align-items: center;
}

.contact-avatar {
  width: 50px;
  height: 50px;
  border-radius: 5px;
  margin-right: 10px;
  /* Add space between avatar and name */
  flex-shrink: 0;
}


.contact-name {
  font-weight: bold;
  font-size: 10px;
  flex: 1;
  /* Make name take up remaining space */
  text-align: center;
  /* 让名称占据剩余空间 */
}

.chat-container {
  height: calc(97vh - 200px);
  /* 调整聊天框高度 */
  width: 50%;
  /* 撑满宽度 */
  display: flex;
  margin: auto;
  margin-top: 20px;
  flex-direction: column;

  /* 聊天内容底部对齐 */
}




@media (max-width: 600px) {
  .chat-app {
    padding: 0px;
  }

  .chat-container {
    height: calc(97vh - 180px);
    /* 调整聊天框高度 */
    width: 100%;
    /* 撑满宽度 */
    margin-top: 20px;
  }

  .contact-card {
    width: 60px;
    height: 40px;
    margin: 5px;
  }

  .contact-avatar {
    width: 30px;
    height: 40px;
    margin-right: 5px;
  }

  .contact-name {
    font-weight: bold;
    font-size: 10px;
    flex: 1;
    /* Make name take up remaining space */
    text-align: center;
  }
  .el-col{
    span:6
  }
}
</style>