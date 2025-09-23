<template>
  <div class="upgrade-approvals">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <span>升级审批</span>
          <el-button @click="refresh">刷新</el-button>
        </div>
      </template>

      <div class="search-area">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="用户ID">
            <el-input v-model="searchForm.userId" placeholder="用户ID" clearable style="width: 150px;" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="状态" clearable style="width: 150px;">
              <el-option label="待同意" value="awaiting_approval" />
              <el-option label="待支付" value="pending" />
              <el-option label="已完成" value="completed" />
              <el-option label="已拒绝" value="rejected" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="applyFilter">
              筛选
            </el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table :data="filteredRequests" border stripe>
        <el-table-column prop="id" label="请求ID" width="160" />
        <el-table-column prop="userId" label="用户ID" width="100" />
        <el-table-column prop="currentPlan" label="当前套餐" width="120" />
        <el-table-column prop="targetPlan" label="目标套餐" width="120" />
        <el-table-column prop="priceDiff" label="差价" width="100" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="scope">
            <el-button
              v-if="scope.row.status === 'awaiting_approval'"
              type="success"
              size="small"
              @click="approve(scope.row)"
            >同意</el-button>
            <el-button
              v-if="scope.row.status === 'awaiting_approval'"
              type="danger"
              size="small"
              @click="reject(scope.row)"
            >拒绝</el-button>
            <el-button size="small" @click="view(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { useUpgradeStore } from '../stores/upgrade'
import { ElMessage } from 'element-plus'

const store = useUpgradeStore()

const searchForm = reactive({ userId: '', status: '' })
const filterKey = reactive({ userId: '', status: '' })

const filteredRequests = computed(() => {
  return store.allRequests.filter(r => {
    if (filterKey.userId && r.userId !== filterKey.userId) return false
    if (filterKey.status && r.status !== filterKey.status) return false
    return true
  })
})

const getStatusType = (status) => ({
  awaiting_approval: 'info',
  pending: 'warning',
  completed: 'success',
  rejected: 'danger'
}[status] || 'info')

const getStatusText = (status) => ({
  awaiting_approval: '待同意',
  pending: '待支付',
  completed: '已完成',
  rejected: '已拒绝'
}[status] || '未知')

const approve = (row) => {
  store.approveRequest(row.id)
  ElMessage.success('已同意，等待支付')
}

const reject = (row) => {
  store.rejectRequest(row.id, '商家拒绝')
  ElMessage.success('已拒绝')
}

const view = () => {
  ElMessage.info('查看详情，后续可扩展')
}

const applyFilter = () => {
  filterKey.userId = searchForm.userId
  filterKey.status = searchForm.status
}

const resetFilter = () => {
  searchForm.userId = ''
  searchForm.status = ''
  applyFilter()
}

const refresh = () => {
  store.refresh()
  ElMessage.success('已刷新')
}
</script>

<style scoped>
.upgrade-approvals {
  height: 100%;
}
.page-card { height: 100%; }
.card-header { display:flex; justify-content: space-between; align-items:center; }
.search-area { margin-bottom: 20px; padding: 20px; background: #f5f7fa; border-radius: 4px; }
.search-form { margin: 0; }
</style>


