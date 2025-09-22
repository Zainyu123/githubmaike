<template>
  <div class="user-binding">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <span>用户绑定管理</span>
          <el-button type="primary" @click="showBindDialog = true">
            <el-icon><Link /></el-icon>
            绑定用户
          </el-button>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="用户ID">
            <el-input
              v-model="searchForm.userId"
              placeholder="请输入用户ID"
              clearable
              style="width: 150px;"
            />
          </el-form-item>
          <el-form-item label="会员库">
            <el-select 
              v-model="searchForm.memberPool" 
              placeholder="请选择会员库" 
              clearable
              style="width: 150px;"
            >
              <el-option label="基础会员库" value="basic" />
              <el-option label="VIP会员库" value="vip" />
              <el-option label="企业会员库" value="enterprise" />
            </el-select>
          </el-form-item>
          <el-form-item label="绑定状态">
            <el-select 
              v-model="searchForm.bindingStatus" 
              placeholder="请选择状态" 
              clearable
              style="width: 120px;"
            >
              <el-option label="已绑定" value="bound" />
              <el-option label="未绑定" value="unbound" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="handleReset">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-cards">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-number">{{ stats.totalUsers }}</div>
                <div class="stat-label">总用户数</div>
              </div>
              <el-icon class="stat-icon"><User /></el-icon>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-number">{{ stats.boundUsers }}</div>
                <div class="stat-label">已绑定用户</div>
              </div>
              <el-icon class="stat-icon"><Link /></el-icon>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-number">{{ stats.unboundUsers }}</div>
                <div class="stat-label">未绑定用户</div>
              </div>
              <el-icon class="stat-icon"><Unlock /></el-icon>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-number">{{ stats.bindingRate }}%</div>
                <div class="stat-label">绑定率</div>
              </div>
              <el-icon class="stat-icon"><TrendCharts /></el-icon>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 表格区域 -->
      <el-table
        :data="tableData"
        v-loading="loading"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="userId" label="用户ID" width="100" />
        <el-table-column prop="userName" label="用户名" width="120" />
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column prop="memberPool" label="会员库" width="120">
          <template #default="scope">
            <el-tag v-if="scope.row.memberPool" :type="getPoolType(scope.row.memberPool)">
              {{ getPoolName(scope.row.memberPool) }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="memberId" label="会员ID" width="120">
          <template #default="scope">
            <span v-if="scope.row.memberId">{{ scope.row.memberId }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="bindingStatus" label="绑定状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.bindingStatus === 'bound' ? 'success' : 'danger'">
              {{ scope.row.bindingStatus === 'bound' ? '已绑定' : '未绑定' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="bindingTime" label="绑定时间" width="180">
          <template #default="scope">
          <span v-if="scope.row.bindingTime">{{ scope.row.bindingTime }}</span>
          <span v-else>-</span>
        </template>
        </el-table-column>
        <el-table-column prop="lastActiveTime" label="最后活跃" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button
              v-if="scope.row.bindingStatus === 'unbound'"
              type="success"
              size="small"
              @click="handleBind(scope.row)"
            >
              绑定
            </el-button>
            <el-button
              v-if="scope.row.bindingStatus === 'bound'"
              type="warning"
              size="small"
              @click="handleUnbind(scope.row)"
            >
              解绑
            </el-button>
            <el-button
              type="primary"
              size="small"
              @click="handleViewDetail(scope.row)"
            >
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 绑定对话框 -->
    <el-dialog
      v-model="showBindDialog"
      title="绑定用户到会员库"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item label="用户ID" prop="userId">
          <el-input v-model="formData.userId" placeholder="请输入用户ID" />
        </el-form-item>
        <el-form-item label="会员库" prop="memberPool">
          <el-select v-model="formData.memberPool" placeholder="请选择会员库">
            <el-option label="基础会员库" value="basic" />
            <el-option label="VIP会员库" value="vip" />
            <el-option label="企业会员库" value="enterprise" />
          </el-select>
        </el-form-item>
        <el-form-item label="会员ID" prop="memberId">
          <el-input v-model="formData.memberId" placeholder="请输入会员ID" />
        </el-form-item>
        <el-form-item label="绑定备注">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入绑定备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showBindDialog = false">取消</el-button>
        <el-button type="primary" @click="handleBindSubmit">确定绑定</el-button>
      </template>
    </el-dialog>

    <!-- 解绑确认对话框 -->
    <el-dialog
      v-model="showUnbindDialog"
      title="确认解绑"
      width="400px"
    >
      <div class="unbind-info">
        <el-alert
          title="解绑后将无法恢复绑定关系"
          type="warning"
          :closable="false"
          show-icon
        />
        <div class="user-info">
          <p><strong>用户ID:</strong> {{ unbindData.userId }}</p>
          <p><strong>用户名:</strong> {{ unbindData.userName }}</p>
          <p><strong>会员库:</strong> {{ getPoolName(unbindData.memberPool) }}</p>
          <p><strong>会员ID:</strong> {{ unbindData.memberId }}</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="showUnbindDialog = false">取消</el-button>
        <el-button type="danger" @click="handleUnbindConfirm">确认解绑</el-button>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      title="用户绑定详情"
      width="600px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="用户ID">{{ detailData.userId }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ detailData.userName }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ detailData.email }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ detailData.phone }}</el-descriptions-item>
        <el-descriptions-item label="会员库">
          <el-tag v-if="detailData.memberPool" :type="getPoolType(detailData.memberPool)">
            {{ getPoolName(detailData.memberPool) }}
          </el-tag>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="会员ID">{{ detailData.memberId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="绑定状态">
          <el-tag :type="detailData.bindingStatus === 'bound' ? 'success' : 'danger'">
            {{ detailData.bindingStatus === 'bound' ? '已绑定' : '未绑定' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="绑定时间">{{ detailData.bindingTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="最后活跃">{{ detailData.lastActiveTime }}</el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ detailData.registerTime }}</el-descriptions-item>
        <el-descriptions-item label="绑定备注" :span="2">{{ detailData.remark || '无' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Link, Search, Refresh, User, Unlock, TrendCharts } from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const showBindDialog = ref(false)
const showUnbindDialog = ref(false)
const showDetailDialog = ref(false)
const formRef = ref()

// 搜索表单
const searchForm = reactive({
  userId: '',
  memberPool: '',
  bindingStatus: ''
})

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 表格数据
const tableData = ref([
  {
    userId: 'U001',
    userName: '张三',
    email: 'zhangsan@example.com',
    phone: '13800138001',
    memberPool: 'basic',
    memberId: 'M001',
    bindingStatus: 'bound',
    bindingTime: '2024-01-15 10:30:00',
    lastActiveTime: '2024-01-20 14:20:00',
    registerTime: '2024-01-10 09:15:00',
    remark: 'VIP用户绑定'
  },
  {
    userId: 'U002',
    userName: '李四',
    email: 'lisi@example.com',
    phone: '13800138002',
    memberPool: 'vip',
    memberId: 'M002',
    bindingStatus: 'bound',
    bindingTime: '2024-01-16 14:20:00',
    lastActiveTime: '2024-01-19 16:30:00',
    registerTime: '2024-01-12 11:20:00',
    remark: '企业用户'
  },
  {
    userId: 'U003',
    userName: '王五',
    email: 'wangwu@example.com',
    phone: '13800138003',
    memberPool: null,
    memberId: null,
    bindingStatus: 'unbound',
    bindingTime: null,
    lastActiveTime: '2024-01-18 10:15:00',
    registerTime: '2024-01-14 15:45:00',
    remark: null
  },
  {
    userId: 'U004',
    userName: '赵六',
    email: 'zhaoliu@example.com',
    phone: '13800138004',
    memberPool: 'enterprise',
    memberId: 'M003',
    bindingStatus: 'bound',
    bindingTime: '2024-01-17 09:15:00',
    lastActiveTime: '2024-01-20 08:30:00',
    registerTime: '2024-01-13 13:20:00',
    remark: '企业高级用户'
  }
])

// 表单数据
const formData = reactive({
  userId: '',
  memberPool: '',
  memberId: '',
  remark: ''
})

// 解绑数据
const unbindData = reactive({
  userId: '',
  userName: '',
  memberPool: '',
  memberId: ''
})

// 详情数据
const detailData = reactive({
  userId: '',
  userName: '',
  email: '',
  phone: '',
  memberPool: '',
  memberId: '',
  bindingStatus: '',
  bindingTime: '',
  lastActiveTime: '',
  registerTime: '',
  remark: ''
})

// 表单验证规则
const formRules = {
  userId: [
    { required: true, message: '请输入用户ID', trigger: 'blur' }
  ],
  memberPool: [
    { required: true, message: '请选择会员库', trigger: 'change' }
  ],
  memberId: [
    { required: true, message: '请输入会员ID', trigger: 'blur' }
  ]
}

// 统计数据
const stats = computed(() => {
  const total = tableData.value.length
  const bound = tableData.value.filter(item => item.bindingStatus === 'bound').length
  const unbound = total - bound
  const rate = total > 0 ? Math.round((bound / total) * 100) : 0
  
  return {
    totalUsers: total,
    boundUsers: bound,
    unboundUsers: unbound,
    bindingRate: rate
  }
})

// 方法
const getPoolType = (pool) => {
  const typeMap = {
    basic: 'info',
    vip: 'warning',
    enterprise: 'success'
  }
  return typeMap[pool] || 'info'
}

const getPoolName = (pool) => {
  const nameMap = {
    basic: '基础会员库',
    vip: 'VIP会员库',
    enterprise: '企业会员库'
  }
  return nameMap[pool] || pool
}

const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('搜索完成')
  }, 1000)
}

const handleReset = () => {
  searchForm.userId = ''
  searchForm.memberPool = ''
  searchForm.bindingStatus = ''
  handleSearch()
}

const handleBind = (row) => {
  formData.userId = row.userId
  formData.memberPool = ''
  formData.memberId = ''
  formData.remark = ''
  showBindDialog.value = true
}

const handleUnbind = (row) => {
  Object.assign(unbindData, {
    userId: row.userId,
    userName: row.userName,
    memberPool: row.memberPool,
    memberId: row.memberId
  })
  showUnbindDialog.value = true
}

const handleViewDetail = (row) => {
  Object.assign(detailData, row)
  showDetailDialog.value = true
}

const handleDialogClose = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    userId: '',
    memberPool: '',
    memberId: '',
    remark: ''
  })
}

const handleBindSubmit = async () => {
  try {
    await formRef.value.validate()
    
    // 检查用户是否已绑定
    const existingUser = tableData.value.find(item => item.userId === formData.userId)
    if (existingUser && existingUser.bindingStatus === 'bound') {
      ElMessage.warning('该用户已绑定到其他会员库')
      return
    }
    
    // 更新用户绑定信息
    if (existingUser) {
      existingUser.memberPool = formData.memberPool
      existingUser.memberId = formData.memberId
      existingUser.bindingStatus = 'bound'
      existingUser.bindingTime = new Date().toLocaleString()
      existingUser.remark = formData.remark
    } else {
      // 创建新用户记录
      const newUser = {
        userId: formData.userId,
        userName: `用户${formData.userId}`,
        email: `user${formData.userId}@example.com`,
        phone: `13800138${formData.userId.slice(-4)}`,
        memberPool: formData.memberPool,
        memberId: formData.memberId,
        bindingStatus: 'bound',
        bindingTime: new Date().toLocaleString(),
        lastActiveTime: new Date().toLocaleString(),
        registerTime: new Date().toLocaleString(),
        remark: formData.remark
      }
      tableData.value.unshift(newUser)
    }
    
    showBindDialog.value = false
    ElMessage.success('绑定成功')
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const handleUnbindConfirm = async () => {
  try {
    await ElMessageBox.confirm('确定要解绑这个用户吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 更新用户绑定状态
    const user = tableData.value.find(item => item.userId === unbindData.userId)
    if (user) {
      user.memberPool = null
      user.memberId = null
      user.bindingStatus = 'unbound'
      user.bindingTime = null
      user.remark = null
    }
    
    showUnbindDialog.value = false
    ElMessage.success('解绑成功')
  } catch {
    ElMessage.info('已取消解绑')
  }
}

const handleSizeChange = (val) => {
  pagination.pageSize = val
  handleSearch()
}

const handleCurrentChange = (val) => {
  pagination.currentPage = val
  handleSearch()
}

onMounted(() => {
  pagination.total = tableData.value.length
})
</script>

<style scoped>
.user-binding {
  height: 100%;
}

.page-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-area {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.search-form {
  margin: 0;
}

.stats-cards {
  margin-bottom: 20px;
}

.stat-card {
  position: relative;
  overflow: hidden;
}

.stat-card .el-card__body {
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.stat-icon {
  font-size: 32px;
  color: #409eff;
  opacity: 0.3;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.unbind-info {
  margin-bottom: 20px;
}

.user-info {
  margin-top: 15px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.user-info p {
  margin: 5px 0;
  color: #606266;
}
</style>
