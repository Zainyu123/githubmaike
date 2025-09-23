<template>
  <div class="resource-pool-mgmt">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <span>资源池管理</span>
          <el-button type="primary" @click="openEdit()">
            新增资源池
          </el-button>
        </div>
      </template>

      <div class="search-area">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="资源池名称">
            <el-input v-model="searchForm.poolName" placeholder="请输入名称" clearable style="width: 220px;" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="状态" clearable style="width: 140px;">
              <el-option label="正常" value="0" />
              <el-option label="停用" value="1" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table :data="tableData" border stripe>
        <el-table-column prop="pool_id" label="ID" width="120" />
        <el-table-column prop="pool_name" label="资源池名称" />
        <el-table-column prop="tenant_id" label="租户编号" width="140" />
        <el-table-column prop="total_quota" label="总额度" width="100" />
        <el-table-column prop="used_quata" label="已用额度" width="100" />
        <el-table-column label="剩余额度" width="120">
          <template #default="scope">{{ calcRemaining(scope.row) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === '0' ? 'success' : 'danger'">{{ scope.row.status === '0' ? '正常' : '停用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="创建时间" width="180" />
        <el-table-column label="操作" width="250" align="center">
          <template #default="scope">
            <el-button size="small" type="primary" @click="openEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="warning" @click="adjustQuota(scope.row)">调整额度</el-button>
            <el-button size="small" type="danger" @click="removePool(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑 -->
    <el-dialog v-model="showEdit" :title="editForm.pool_id ? '编辑资源池' : '新增资源池'" width="700px" @close="onCloseEdit">
      <el-form ref="editRef" :model="editForm" :rules="editRules" label-width="120px">
        <el-form-item label="资源池名称" prop="pool_name">
          <el-input v-model="editForm.pool_name" placeholder="请输入资源池名称" />
        </el-form-item>
        <el-form-item label="租户编号" prop="tenant_id">
          <el-input v-model="editForm.tenant_id" placeholder="租户编号" />
        </el-form-item>
        <el-form-item label="总额度" prop="total_quota">
          <el-input-number v-model="editForm.total_quota" :min="0" :max="100000" style="width: 100%" />
        </el-form-item>
        <el-form-item label="已用额度" prop="used_quata">
          <el-input-number v-model="editForm.used_quata" :min="0" :max="editForm.total_quota || 0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="editForm.status">
            <el-radio label="0">正常</el-radio>
            <el-radio label="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEdit = false">取消</el-button>
        <el-button type="primary" @click="submitEdit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 调整额度 -->
    <el-dialog v-model="showAdjust" title="调整额度" width="520px">
      <el-form :model="adjustForm" label-width="120px">
        <el-form-item label="资源池">
          <el-input v-model="adjustForm.pool_name" disabled />
        </el-form-item>
        <el-form-item label="当前总额度">
          <el-input v-model="adjustForm.total_quota" disabled />
        </el-form-item>
        <el-form-item label="新总额度">
          <el-input-number v-model="adjustForm.new_total_quota" :min="adjustForm.used_quata" :max="100000" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAdjust = false">取消</el-button>
        <el-button type="primary" @click="submitAdjust">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { usePoolsStore } from '../stores/pools'

const poolsStore = usePoolsStore()

const searchForm = reactive({ poolName: '', status: '' })
const tableData = ref(poolsStore.all.map(p => toDbModel(p)))

const showEdit = ref(false)
const editRef = ref()
const editForm = reactive({
  pool_id: '',
  tenant_id: '000000',
  pool_name: '',
  total_quota: 0,
  used_quata: 0,
  status: '0',
  create_time: ''
})
const editRules = {
  pool_name: [{ required: true, message: '请输入资源池名称', trigger: 'blur' }],
  tenant_id: [{ required: true, message: '请输入租户编号', trigger: 'blur' }],
  total_quota: [{ required: true, message: '请输入总额度', trigger: 'blur' }]
}

const showAdjust = ref(false)
const adjustForm = reactive({ pool_id: '', pool_name: '', total_quota: 0, used_quata: 0, new_total_quota: 0 })

function toDbModel(p) {
  return {
    pool_id: p.id,
    tenant_id: p.tenantId || '000000',
    pool_name: p.name,
    total_quota: p.quota,
    used_quata: p.used,
    remaining_quota: Math.max(0, (p.quota || 0) - (p.used || 0)),
    status: p.status === 'active' ? '0' : '1',
    create_time: p.createTime || new Date().toLocaleString()
  }
}

function fromDbModel(db) {
  return {
    id: db.pool_id,
    tenantId: db.tenant_id,
    name: db.pool_name,
    quota: db.total_quota,
    used: db.used_quata,
    status: db.status === '0' ? 'active' : 'inactive',
  }
}

const calcRemaining = (row) => (row.total_quota || 0) - (row.used_quata || 0)

const handleSearch = () => {
  const name = (searchForm.poolName || '').toLowerCase()
  tableData.value = poolsStore.all
    .map(toDbModel)
    .filter(r => (!name || (r.pool_name || '').toLowerCase().includes(name)) && (!searchForm.status || r.status === searchForm.status))
}

const handleReset = () => {
  searchForm.poolName = ''
  searchForm.status = ''
  handleSearch()
}

const openEdit = (row) => {
  if (row) Object.assign(editForm, row)
  else Object.assign(editForm, { pool_id: '', tenant_id: '000000', pool_name: '', total_quota: 0, used_quata: 0, status: '0' })
  showEdit.value = true
}

const onCloseEdit = () => {
  editRef.value?.resetFields()
}

const submitEdit = async () => {
  await editRef.value.validate()
  if (!editForm.pool_id) {
    // create
    const created = poolsStore.addPool({ name: editForm.pool_name, tenantId: editForm.tenant_id, quota: editForm.total_quota, used: editForm.used_quata, status: editForm.status === '0' ? 'active' : 'inactive' })
    tableData.value.unshift(toDbModel(created))
    ElMessage.success('创建成功')
  } else {
    poolsStore.updatePool(editForm.pool_id, { name: editForm.pool_name, tenantId: editForm.tenant_id, quota: editForm.total_quota, used: editForm.used_quata, status: editForm.status === '0' ? 'active' : 'inactive' })
    handleSearch()
    ElMessage.success('更新成功')
  }
  showEdit.value = false
}

const adjustQuota = (row) => {
  Object.assign(adjustForm, { pool_id: row.pool_id, pool_name: row.pool_name, total_quota: row.total_quota, used_quata: row.used_quata, new_total_quota: row.total_quota })
  showAdjust.value = true
}

const submitAdjust = () => {
  if (adjustForm.new_total_quota < adjustForm.used_quata) {
    ElMessage.warning('新总额度不能小于已用额度')
    return
  }
  poolsStore.updatePool(adjustForm.pool_id, { quota: adjustForm.new_total_quota })
  handleSearch()
  showAdjust.value = false
  ElMessage.success('额度调整成功')
}

const removePool = async (row) => {
  try {
    await ElMessageBox.confirm('确认删除该资源池？', '提示', { type: 'warning' })
    poolsStore.pools = poolsStore.pools.filter(p => p.id !== row.pool_id)
    handleSearch()
    ElMessage.success('删除成功')
  } catch {}
}
</script>

<style scoped>
.resource-pool-mgmt { height: 100%; }
.page-card { height: 100%; }
.card-header { display:flex; justify-content: space-between; align-items:center; }
.search-area { margin-bottom: 20px; padding: 20px; background: #f5f7fa; border-radius: 4px; }
.search-form { margin: 0; }
</style>


