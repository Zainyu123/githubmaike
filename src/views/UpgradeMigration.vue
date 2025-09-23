<template>
  <div class="upgrade-migration">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <span>套餐升级迁移</span>
          <div style="display:flex; gap:10px;">
            <el-button @click="showRecordsDialog = true">
              升级记录
            </el-button>
            <el-button type="primary" @click="showUpgradeDialog = true">
              <el-icon><TrendCharts /></el-icon>
              发起升级
            </el-button>
          </div>
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
          <el-form-item label="升级状态">
            <el-select 
              v-model="searchForm.status" 
              placeholder="请选择状态" 
              clearable
              style="width: 120px;"
            >
              <el-option label="待支付" value="pending" />
              <el-option label="已完成" value="completed" />
              <el-option label="已取消" value="cancelled" />
            </el-select>
          </el-form-item>
          <el-form-item label="升级类型">
            <el-select 
              v-model="searchForm.upgradeType" 
              placeholder="请选择类型" 
              clearable
              style="width: 180px;"
            >
              <el-option label="基础版→VIP版" value="basic-to-vip" />
              <el-option label="VIP版→高级版" value="vip-to-premium" />
              <el-option label="基础版→高级版" value="basic-to-premium" />
            </el-select>
          </el-form-item>
          <el-form-item label="归属">
            <el-select 
              v-model="searchForm.ownership" 
              placeholder="请选择归属" 
              clearable
              style="width: 120px;"
            >
              <el-option label="自建" value="own" />
              <el-option label="购买" value="purchased" />
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

      <!-- 表格区域 -->
      <el-table
        :data="tableData"
        v-loading="loading"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="升级ID" width="100" />
        <el-table-column prop="userId" label="用户ID" width="100" />
        <el-table-column prop="userName" label="用户名" width="120" />
        <el-table-column prop="ownership" label="归属" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.ownership === 'own' ? 'success' : 'info'">
              {{ scope.row.ownership === 'own' ? '自建' : '购买' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="currentPlan" label="当前套餐" width="120" />
        <el-table-column prop="targetPlan" label="目标套餐" width="120" />
        <el-table-column prop="priceDiff" label="差价金额" width="120">
          <template #default="scope">
            <span class="price">¥{{ scope.row.priceDiff }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="completeTime" label="完成时间" width="180" />
        <el-table-column label="操作" width="320" fixed="right">
          <template #default="scope">
            <template v-if="scope.row.ownership === 'own'">
              <el-button
                type="primary"
                size="small"
                @click="handleDirectUpgrade(scope.row)"
              >
                直接升级
              </el-button>
              <el-button
                type="success"
                size="small"
                @click="openGiftDialog(scope.row)"
              >
                赠予购买
              </el-button>
            </template>
            <template v-else>
              <el-button
                type="warning"
                size="small"
                @click="handleRequestUpgrade(scope.row)"
              >
                发起升级
              </el-button>
              <el-button
                v-if="scope.row.status === 'awaiting_approval'"
                size="small"
                @click="handleSimulateApprove(scope.row)"
              >
                模拟同意
              </el-button>
              <el-button
                v-if="scope.row.status === 'pending'"
                type="success"
                size="small"
                @click="handlePay(scope.row)"
              >
                支付差价
              </el-button>
              <el-button
                v-if="scope.row.status === 'pending'"
                type="danger"
                size="small"
                @click="handleCancel(scope.row)"
              >
                取消升级
              </el-button>
            </template>
            <el-button
              type="info"
              size="small"
              @click="handleViewDetail(scope.row)"
            >
              查看详情
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

    <!-- 升级对话框 -->
    <el-dialog
      v-model="showUpgradeDialog"
      title="发起套餐升级"
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
        <el-form-item label="当前套餐" prop="currentPlan">
          <el-select v-model="formData.currentPlan" placeholder="请选择当前套餐">
            <el-option label="基础版" value="basic" />
            <el-option label="VIP版" value="vip" />
          </el-select>
        </el-form-item>
        <el-form-item label="目标套餐" prop="targetPlan">
          <el-select v-model="formData.targetPlan" placeholder="请选择目标套餐">
            <el-option label="VIP版" value="vip" />
            <el-option label="高级版" value="premium" />
          </el-select>
        </el-form-item>
        <el-form-item label="升级原因">
          <el-input
            v-model="formData.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入升级原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showUpgradeDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCalculatePrice">计算差价</el-button>
      </template>
    </el-dialog>

    <!-- 支付对话框 -->
    <el-dialog
      v-model="showPayDialog"
      title="支付差价"
      width="500px"
    >
      <div class="payment-info">
      <el-descriptions :column="1" border>
          <el-descriptions-item label="用户ID">{{ payData.userId }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ payData.userName }}</el-descriptions-item>
        <el-descriptions-item label="当前资源池">{{ payData.currentPoolName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="目标资源池">{{ payData.targetPoolName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="差价金额">
            <span class="price-large">¥{{ payData.priceDiff }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      
      <div class="payment-methods">
        <h4>选择支付方式</h4>
        <el-radio-group v-model="paymentMethod">
          <el-radio label="alipay">
            <el-icon><CreditCard /></el-icon>
            支付宝
          </el-radio>
          <el-radio label="wechat">
            <el-icon><CreditCard /></el-icon>
            微信支付
          </el-radio>
          <el-radio label="bank">
            <el-icon><CreditCard /></el-icon>
            银行卡
          </el-radio>
        </el-radio-group>
      </div>
      
      <template #footer>
        <el-button @click="showPayDialog = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmPay">确认支付</el-button>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      title="升级详情"
      width="600px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="升级ID">{{ detailData.id }}</el-descriptions-item>
        <el-descriptions-item label="用户ID">{{ detailData.userId }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ detailData.userName }}</el-descriptions-item>
        <el-descriptions-item label="当前套餐">{{ detailData.currentPlan }}</el-descriptions-item>
        <el-descriptions-item label="目标套餐">{{ detailData.targetPlan }}</el-descriptions-item>
        <el-descriptions-item label="差价金额">¥{{ detailData.priceDiff }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(detailData.status)">
            {{ getStatusText(detailData.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detailData.createTime }}</el-descriptions-item>
        <el-descriptions-item label="完成时间" v-if="detailData.completeTime">
          {{ detailData.completeTime }}
        </el-descriptions-item>
        <el-descriptions-item label="升级原因" :span="2">
          {{ detailData.reason || '无' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 赠予购买对话框 -->
    <el-dialog
      v-model="showGiftDialog"
      title="赠予购买"
      width="520px"
    >
      <el-form :model="giftForm" label-width="120px">
        <el-form-item label="受赠用户ID">
          <el-input v-model="giftForm.recipientUserId" placeholder="请输入用户ID" />
        </el-form-item>
        <el-form-item label="目标套餐">
          <el-select v-model="giftForm.targetPlan" placeholder="请选择套餐">
            <el-option label="基础版" value="basic" />
            <el-option label="VIP版" value="vip" />
            <el-option label="高级版" value="premium" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showGiftDialog = false">取消</el-button>
        <el-button type="primary" @click="handleGift">确认赠予</el-button>
      </template>
    </el-dialog>

    <!-- 升级记录对话框 -->
    <el-dialog
      v-model="showRecordsDialog"
      title="升级记录"
      width="900px"
    >
      <el-table :data="upgradeRecords" border stripe>
        <el-table-column prop="id" label="记录ID" width="160" />
        <el-table-column prop="userId" label="用户ID" width="100" />
        <el-table-column prop="ownership" label="归属" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.ownership === 'own' ? 'success' : 'info'">
              {{ scope.row.ownership === 'own' ? '自建' : '购买' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="action" label="动作" width="100" />
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
        <el-table-column prop="time" label="时间" width="180" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { TrendCharts, Search, Refresh, CreditCard } from '@element-plus/icons-vue'
import { useUpgradeStore } from '../stores/upgrade'
import { usePackagesStore } from '../stores/packages'

// 响应式数据
const loading = ref(false)
const showUpgradeDialog = ref(false)
const showPayDialog = ref(false)
const showDetailDialog = ref(false)
const showGiftDialog = ref(false)
const showRecordsDialog = ref(false)
const formRef = ref()
const paymentMethod = ref('alipay')

// 搜索表单
const searchForm = reactive({
  userId: '',
  status: '',
  upgradeType: '',
  ownership: ''
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
    id: 'UP001',
    userId: 'U001',
    userName: '张三',
    currentPlan: '基础版',
    targetPlan: 'VIP版',
    priceDiff: 299,
    ownership: 'own',
    status: 'pending',
    createTime: '2024-01-15 10:30:00',
    completeTime: null,
    reason: '需要更多功能'
  },
  {
    id: 'UP002',
    userId: 'U002',
    userName: '李四',
    currentPlan: 'VIP版',
    targetPlan: '高级版',
    priceDiff: 599,
    ownership: 'purchased',
    status: 'completed',
    createTime: '2024-01-14 14:20:00',
    completeTime: '2024-01-14 14:25:00',
    reason: '业务需求'
  },
  {
    id: 'UP003',
    userId: 'U003',
    userName: '王五',
    currentPlan: '基础版',
    targetPlan: '高级版',
    priceDiff: 799,
    ownership: 'purchased',
    status: 'cancelled',
    createTime: '2024-01-13 09:15:00',
    completeTime: null,
    reason: '临时取消'
  }
])

// 表单数据
const formData = reactive({
  userId: '',
  currentPlan: '',
  targetPlan: '',
  reason: ''
})

// 支付数据
const payData = reactive({
  userId: '',
  userName: '',
  currentPoolId: '',
  currentPoolName: '',
  targetPoolId: '',
  targetPoolName: '',
  priceDiff: 0
})

// 详情数据
const detailData = reactive({
  id: '',
  userId: '',
  userName: '',
  currentPlan: '',
  targetPlan: '',
  priceDiff: 0,
  status: '',
  createTime: '',
  completeTime: '',
  reason: ''
})

// 表单验证规则
const formRules = {
  userId: [
    { required: true, message: '请输入用户ID', trigger: 'blur' }
  ],
  currentPlan: [
    { required: true, message: '请选择当前套餐', trigger: 'change' }
  ],
  targetPlan: [
    { required: true, message: '请选择目标套餐', trigger: 'change' }
  ]
}

// 套餐价格配置
const planPrices = {
  basic: 99,
  vip: 398,
  premium: 997
}

// 升级记录
const upgradeRecords = ref([])

// 赠予数据
const giftForm = reactive({
  recipientUserId: '',
  targetPlan: ''
})

// Store
const upgradeStore = useUpgradeStore()
const packagesStore = usePackagesStore()

// 方法
const getStatusType = (status) => {
  const statusMap = {
    pending: 'warning',
    completed: 'success',
    cancelled: 'danger',
    awaiting_approval: 'info'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status) => {
  const statusMap = {
    pending: '待支付',
    completed: '已完成',
    cancelled: '已取消',
    awaiting_approval: '待同意'
  }
  return statusMap[status] || '未知'
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
  searchForm.status = ''
  searchForm.upgradeType = ''
  handleSearch()
}

const appendRecord = (record) => {
  upgradeRecords.value.unshift({
    id: `REC${Date.now()}`,
    ...record,
    time: new Date().toLocaleString()
  })
}

// 自建直接升级
const handleDirectUpgrade = (row) => {
  const currentKey = row.currentPlan === '基础版' ? 'basic' : row.currentPlan === 'VIP版' ? 'vip' : 'premium'
  const targetKey = row.targetPlan === '基础版' ? 'basic' : row.targetPlan === 'VIP版' ? 'vip' : 'premium'
  const diff = planPrices[targetKey] - planPrices[currentKey]
  if (diff <= 0) {
    ElMessage.warning('目标套餐价格需高于当前套餐')
    return
  }
  appendRecord({
    userId: row.userId,
    ownership: 'own',
    action: '直接升级',
    currentPlan: row.currentPlan,
    targetPlan: row.targetPlan,
    priceDiff: diff,
    status: 'completed'
  })
  ElMessage.success('已直接升级并记录')
}

// 购买的发起升级（需同意）
const handleRequestUpgrade = (row) => {
  const currentKey = row.currentPlan === '基础版' ? 'basic' : row.currentPlan === 'VIP版' ? 'vip' : 'premium'
  const targetKey = row.targetPlan === '基础版' ? 'basic' : row.targetPlan === 'VIP版' ? 'vip' : 'premium'
  const diff = planPrices[targetKey] - planPrices[currentKey]
  if (diff <= 0) {
    ElMessage.warning('目标套餐价格需高于当前套餐')
    return
  }
  row.status = 'awaiting_approval'
  upgradeStore.addRequest({
    id: row.id,
    userId: row.userId,
    currentPlan: row.currentPlan,
    targetPlan: row.targetPlan,
    // 在资源池升级模型下，可附带资源池信息（此处演示使用套餐名映射）
    priceDiff: diff,
    status: 'awaiting_approval'
  })
  appendRecord({
    userId: row.userId,
    ownership: 'purchased',
    action: '发起资源池升级',
    currentPlan: row.currentPlan,
    targetPlan: row.targetPlan,
    priceDiff: diff,
    status: 'awaiting_approval'
  })
  ElMessage.success('已发起升级，等待同意')
}

// 模拟同意 -> 进入待支付
const handleSimulateApprove = (row) => {
  if (row.status !== 'awaiting_approval') return
  row.status = 'pending'
  upgradeStore.approveRequest(row.id)
  appendRecord({
    userId: row.userId,
    ownership: 'purchased',
    action: '同意升级',
    currentPlan: row.currentPlan,
    targetPlan: row.targetPlan,
    priceDiff: row.priceDiff,
    status: 'pending'
  })
  ElMessage.success('已同意升级，进入待支付')
}

// 打开赠予对话框
const openGiftDialog = (row) => {
  giftForm.recipientUserId = ''
  giftForm.targetPlan = row.targetPlan || 'vip'
  showGiftDialog.value = true
}

// 确认赠予
const handleGift = () => {
  if (!giftForm.recipientUserId || !giftForm.targetPlan) {
    ElMessage.warning('请完善受赠人和目标套餐')
    return
  }
  appendRecord({
    userId: giftForm.recipientUserId,
    ownership: 'own',
    action: '赠予购买',
    currentPlan: '-',
    targetPlan: giftForm.targetPlan,
    priceDiff: planPrices[giftForm.targetPlan] || 0,
    status: 'completed'
  })
  showGiftDialog.value = false
  ElMessage.success('赠予成功并已记录')
}

const handlePay = (row) => {
  Object.assign(payData, {
    userId: row.userId,
    userName: row.userName,
    currentPlan: row.currentPlan,
    targetPlan: row.targetPlan,
    priceDiff: row.priceDiff
  })
  showPayDialog.value = true
}

const handleCancel = async (row) => {
  try {
    await ElMessageBox.confirm('确定要取消这个升级申请吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    row.status = 'cancelled'
    ElMessage.success('已取消升级申请')
  } catch {
    ElMessage.info('已取消操作')
  }
}

const handleViewDetail = (row) => {
  Object.assign(detailData, row)
  showDetailDialog.value = true
}

const handleDialogClose = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    userId: '',
    currentPlan: '',
    targetPlan: '',
    reason: ''
  })
}

const handleCalculatePrice = async () => {
  try {
    await formRef.value.validate()
    
    const currentPrice = planPrices[formData.currentPlan]
    const targetPrice = planPrices[formData.targetPlan]
    const priceDiff = targetPrice - currentPrice
    
    if (priceDiff <= 0) {
      ElMessage.warning('目标套餐价格不能低于当前套餐')
      return
    }
    
    // 创建升级记录
    const newUpgrade = {
      id: `UP${Date.now()}`,
      userId: formData.userId,
      userName: `用户${formData.userId}`,
      currentPlan: formData.currentPlan,
      targetPlan: formData.targetPlan,
      priceDiff: priceDiff,
      status: 'pending',
      createTime: new Date().toLocaleString(),
      completeTime: null,
      reason: formData.reason
    }
    
    tableData.value.unshift(newUpgrade)
    showUpgradeDialog.value = false
    ElMessage.success('升级申请已创建，请支付差价')
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const handleConfirmPay = () => {
  ElMessage.success(`使用${paymentMethod.value === 'alipay' ? '支付宝' : paymentMethod.value === 'wechat' ? '微信支付' : '银行卡'}支付成功`)
  
  // 更新状态
  const currentRow = tableData.value.find(item => 
    item.userId === payData.userId && 
    item.status === 'pending'
  )
  if (currentRow) {
    currentRow.status = 'completed'
    currentRow.completeTime = new Date().toLocaleString()
    // 同步store中对应请求为已支付
    upgradeStore.markPaid(currentRow.id)
    // 购买完成：记录到 thali_dept（门店套餐）
    packagesStore.addDeptPurchase({
      buyerUserId: currentRow.userId,
      planId: currentRow.id,
      planTitle: `${currentRow.targetPlan}`,
      currentPlan: currentRow.currentPlan,
      targetPlan: currentRow.targetPlan,
      priceDiff: currentRow.priceDiff,
      sourceConfigId: currentRow.id,
    })
  }
  
  showPayDialog.value = false
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
.upgrade-migration {
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

.pagination {
  margin-top: 20px;
  text-align: right;
}

.price {
  color: #f56c6c;
  font-weight: bold;
}

.price-large {
  color: #f56c6c;
  font-size: 18px;
  font-weight: bold;
}

.payment-info {
  margin-bottom: 20px;
}

.payment-methods {
  margin-top: 20px;
}

.payment-methods h4 {
  margin-bottom: 15px;
  color: #606266;
}

.payment-methods .el-radio {
  display: block;
  margin-bottom: 10px;
}
</style>
