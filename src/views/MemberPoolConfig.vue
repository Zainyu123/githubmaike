<template>
  <div class="member-pool-config">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <span>会员库配置</span>
          <el-button type="primary" @click="showAddDialog = true">
            <el-icon><Plus /></el-icon>
            添加会员库
          </el-button>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="会员库名称">
            <el-input
              v-model="searchForm.name"
              placeholder="请输入会员库名称"
              clearable
              style="width: 200px;"
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-select 
              v-model="searchForm.status" 
              placeholder="请选择状态" 
              clearable
              style="width: 120px;"
            >
              <el-option label="启用" value="active" />
              <el-option label="禁用" value="inactive" />
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
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="会员库名称" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="memberCount" label="会员数量" width="120" />
        <el-table-column prop="quota" label="名额限制" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
              {{ scope.row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="250" align="center">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              @click="handleEdit(scope.row)"
            >
              编辑
            </el-button>
            <el-button
              type="success"
              size="small"
              @click="handleInitData(scope.row)"
            >
              初始化数据
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleDelete(scope.row)"
            >
              删除
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

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="isEdit ? '编辑会员库' : '添加会员库'"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item label="会员库名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入会员库名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述"
          />
        </el-form-item>
        <el-form-item label="名额限制" prop="quota">
          <el-input-number
            v-model="formData.quota"
            :min="1"
            :max="10000"
            placeholder="请输入名额限制"
          />
        </el-form-item>
        <el-form-item label="低阈值(%)" prop="lowThreshold">
          <el-input-number
            v-model="formData.lowThreshold"
            :min="0"
            :max="100"
            placeholder="低于该比率进行预警"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="inactive">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 初始化数据对话框 -->
    <el-dialog
      v-model="showInitDialog"
      title="初始化会员数据"
      width="500px"
    >
      <el-form :model="initForm" label-width="120px">
        <el-form-item label="会员库">
          <el-input v-model="initForm.poolName" disabled />
        </el-form-item>
        <el-form-item label="初始化数量">
          <el-input-number
            v-model="initForm.count"
            :min="1"
            :max="1000"
            placeholder="请输入初始化数量"
          />
        </el-form-item>
        <el-form-item label="会员类型">
          <el-select v-model="initForm.memberType" placeholder="请选择会员类型">
            <el-option label="普通会员" value="normal" />
            <el-option label="VIP会员" value="vip" />
            <el-option label="高级会员" value="premium" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showInitDialog = false">取消</el-button>
        <el-button type="primary" @click="handleInitSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const showAddDialog = ref(false)
const showInitDialog = ref(false)
const isEdit = ref(false)
const formRef = ref()

// 搜索表单
const searchForm = reactive({
  name: '',
  status: ''
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
    id: 1,
    name: '基础会员库',
    description: '基础会员服务库',
    memberCount: 150,
    quota: 500,
    status: 'active',
    createTime: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    name: 'VIP会员库',
    description: 'VIP会员专属服务库',
    memberCount: 80,
    quota: 200,
    status: 'active',
    createTime: '2024-01-16 14:20:00'
  },
  {
    id: 3,
    name: '企业会员库',
    description: '企业级会员服务库',
    memberCount: 25,
    quota: 100,
    status: 'inactive',
    createTime: '2024-01-17 09:15:00'
  }
])

// 表单数据
const formData = reactive({
  id: null,
  name: '',
  description: '',
  quota: 100,
  status: 'active'
})

// 初始化表单
const initForm = reactive({
  poolName: '',
  count: 10,
  memberType: 'normal'
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入会员库名称', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入描述', trigger: 'blur' }
  ],
  quota: [
    { required: true, message: '请输入名额限制', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 方法
const handleSearch = () => {
  loading.value = true
  // 模拟搜索
  setTimeout(() => {
    loading.value = false
    ElMessage.success('搜索完成')
  }, 1000)
}

const handleReset = () => {
  searchForm.name = ''
  searchForm.status = ''
  handleSearch()
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(formData, row)
  showAddDialog.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这个会员库吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 模拟删除
    const index = tableData.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      tableData.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  } catch {
    ElMessage.info('已取消删除')
  }
}

const handleInitData = (row) => {
  initForm.poolName = row.name
  initForm.count = 10
  initForm.memberType = 'normal'
  showInitDialog.value = true
}

const handleDialogClose = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    id: null,
    name: '',
    description: '',
    quota: 100,
    status: 'active'
  })
  isEdit.value = false
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    if (isEdit.value) {
      // 编辑
      const index = tableData.value.findIndex(item => item.id === formData.id)
      if (index > -1) {
        tableData.value[index] = { ...formData }
      }
      ElMessage.success('编辑成功')
    } else {
      // 添加
      const newItem = {
        ...formData,
        id: Date.now(),
        memberCount: 0,
        createTime: new Date().toLocaleString()
      }
      tableData.value.unshift(newItem)
      ElMessage.success('添加成功')
    }
    
    showAddDialog.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const handleInitSubmit = () => {
  ElMessage.success(`成功初始化 ${initForm.count} 个${initForm.memberType}会员`)
  showInitDialog.value = false
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
.member-pool-config {
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
</style>
