<template>
  <div id="app">
    <el-container>
      <el-aside width="250px" class="sidebar">
        <div class="sidebar-header">
          <h2>会员管理系统</h2>
        </div>
        <el-menu
          :default-active="$route.path"
          router
          class="sidebar-menu"
        >
          <el-menu-item index="/member-pool">
            <el-icon><User /></el-icon>
            <span>会员库配置</span>
          </el-menu-item>
          <el-menu-item index="/upgrade-migration">
            <el-icon><TrendCharts /></el-icon>
            <span>套餐升级</span>
          </el-menu-item>
          <el-menu-item index="/user-binding">
            <el-icon><Link /></el-icon>
            <span>用户绑定</span>
          </el-menu-item>
          <el-menu-item index="/quota-dashboard">
            <el-icon><DataBoard /></el-icon>
            <span>名额看板</span>
          </el-menu-item>
          <el-menu-item index="/plan-detail">
            <el-icon><Document /></el-icon>
            <span>套餐详细</span>
          </el-menu-item>
          <el-menu-item index="/course-management">
            <el-icon><Reading /></el-icon>
            <span>课程管理</span>
          </el-menu-item>
          <el-menu-item index="/upgrade-approvals">
            <el-icon><TrendCharts /></el-icon>
            <span>
              升级审批
              <el-badge v-if="pendingCount > 0" :value="pendingCount" class="menu-badge" />
            </span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header class="main-header">
          <div class="header-content">
            <h3>{{ getPageTitle() }}</h3>
            <div class="user-info">
              <el-icon><User /></el-icon>
              <span>管理员</span>
            </div>
          </div>
        </el-header>
        <el-main class="main-content">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { User, TrendCharts, Link, DataBoard, Document, Reading } from '@element-plus/icons-vue'
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useUpgradeStore } from './stores/upgrade'

const route = useRoute()
const upgradeStore = useUpgradeStore()
const pendingCount = computed(() => upgradeStore.pendingCount)

let badgeTimer = null
onMounted(() => {
  badgeTimer = setInterval(() => {
    upgradeStore.refresh()
  }, 10000)
})

onBeforeUnmount(() => {
  if (badgeTimer) clearInterval(badgeTimer)
})

const getPageTitle = () => {
  const titleMap = {
    '/member-pool': '会员库配置',
    '/upgrade-migration': '套餐升级',
    '/user-binding': '用户绑定',
    '/quota-dashboard': '名额看板',
    '/plan-detail': '套餐详细',
    '/course-management': '课程管理',
    '/upgrade-approvals': '升级审批'
  }
  return titleMap[route.path] || '会员管理系统'
}
</script>

<style scoped>
#app {
  height: 100vh;
}

.el-container {
  height: 100%;
}

.sidebar {
  background-color: #304156;
  color: #bfcbd9;
}

.sidebar-header {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #434a50;
}

.sidebar-header h2 {
  margin: 0;
  color: #fff;
  font-size: 18px;
}

.sidebar-menu {
  border: none;
  background-color: #304156;
}

.sidebar-menu .el-menu-item {
  color: #bfcbd9;
  border-bottom: 1px solid #434a50;
}

.sidebar-menu .el-menu-item:hover {
  background-color: #263445;
  color: #fff;
}

.sidebar-menu .el-menu-item.is-active {
  background-color: #409eff;
  color: #fff;
}

.main-header {
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.header-content h3 {
  margin: 0;
  color: #303133;
  font-size: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
}

.main-content {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: calc(100vh - 60px);
}
</style>
