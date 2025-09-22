<template>
  <div class="quota-dashboard">
    <!-- 概览统计 -->
    <el-row :gutter="20" class="overview-cards">
      <el-col :span="6">
        <el-card class="overview-card">
          <div class="card-content">
            <div class="card-icon">
              <el-icon><User /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-number">{{ overviewData.totalMembers }}</div>
              <div class="card-label">总会员数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="overview-card">
          <div class="card-content">
            <div class="card-icon">
              <el-icon><DataBoard /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-number">{{ overviewData.totalQuota }}</div>
              <div class="card-label">总名额</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="overview-card">
          <div class="card-content">
            <div class="card-icon">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-number">{{ overviewData.usedQuota }}</div>
              <div class="card-label">已用名额</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="overview-card">
          <div class="card-content">
            <div class="card-icon">
              <el-icon><PieChart /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-number">{{ overviewData.usageRate }}%</div>
              <div class="card-label">使用率</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-section">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>会员库名额使用情况</span>
              <el-button type="primary" size="small" @click="refreshData">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </template>
          <div class="chart-container">
            <v-chart :option="quotaChartOption" style="height: 300px;" />
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>会员类型分布</span>
            </div>
          </template>
          <div class="chart-container">
            <v-chart :option="typeChartOption" style="height: 300px;" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 趋势图表 -->
    <el-row :gutter="20" class="chart-section">
      <el-col :span="24">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>名额使用趋势</span>
              <div class="header-controls">
                <el-select v-model="trendPeriod" size="small" style="width: 120px;">
                  <el-option label="最近7天" value="7d" />
                  <el-option label="最近30天" value="30d" />
                  <el-option label="最近90天" value="90d" />
                </el-select>
              </div>
            </div>
          </template>
          <div class="chart-container">
            <v-chart :option="trendChartOption" style="height: 400px;" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 详细数据表格 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>会员库详细数据</span>
          <div class="header-controls">
            <el-button type="primary" size="small" @click="exportData">
              <el-icon><Download /></el-icon>
              导出数据
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        :data="tableData"
        v-loading="loading"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="poolName" label="会员库名称" width="150" />
        <el-table-column prop="totalQuota" label="总名额" width="100" />
        <el-table-column prop="usedQuota" label="已用名额" width="100" />
        <el-table-column prop="availableQuota" label="可用名额" width="100" />
        <el-table-column prop="usageRate" label="使用率" width="120">
          <template #default="scope">
            <el-progress
              :percentage="scope.row.usageRate"
              :color="getProgressColor(scope.row.usageRate)"
              :stroke-width="8"
            />
          </template>
        </el-table-column>
        <el-table-column prop="memberCount" label="会员数量" width="100" />
        <el-table-column prop="activeMembers" label="活跃会员" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
              {{ scope.row.status === 'active' ? '正常' : '异常' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastUpdate" label="最后更新" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              @click="handleViewDetail(scope.row)"
            >
              详情
            </el-button>
            <el-button
              type="warning"
              size="small"
              @click="handleAdjustQuota(scope.row)"
            >
              调整名额
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      title="会员库详情"
      width="800px"
    >
      <div class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="会员库名称">{{ detailData.poolName }}</el-descriptions-item>
          <el-descriptions-item label="总名额">{{ detailData.totalQuota }}</el-descriptions-item>
          <el-descriptions-item label="已用名额">{{ detailData.usedQuota }}</el-descriptions-item>
          <el-descriptions-item label="可用名额">{{ detailData.availableQuota }}</el-descriptions-item>
          <el-descriptions-item label="使用率">{{ detailData.usageRate }}%</el-descriptions-item>
          <el-descriptions-item label="会员数量">{{ detailData.memberCount }}</el-descriptions-item>
          <el-descriptions-item label="活跃会员">{{ detailData.activeMembers }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="detailData.status === 'active' ? 'success' : 'danger'">
              {{ detailData.status === 'active' ? '正常' : '异常' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ detailData.createTime }}</el-descriptions-item>
          <el-descriptions-item label="最后更新">{{ detailData.lastUpdate }}</el-descriptions-item>
        </el-descriptions>
        
        <div class="detail-chart">
          <h4>使用趋势</h4>
          <v-chart :option="detailChartOption" style="height: 200px;" />
        </div>
      </div>
    </el-dialog>

    <!-- 调整名额对话框 -->
    <el-dialog
      v-model="showAdjustDialog"
      title="调整名额"
      width="500px"
    >
      <el-form :model="adjustForm" label-width="120px">
        <el-form-item label="会员库">
          <el-input v-model="adjustForm.poolName" disabled />
        </el-form-item>
        <el-form-item label="当前名额">
          <el-input v-model="adjustForm.currentQuota" disabled />
        </el-form-item>
        <el-form-item label="新名额" required>
          <el-input-number
            v-model="adjustForm.newQuota"
            :min="adjustForm.usedQuota"
            :max="10000"
            placeholder="请输入新名额"
          />
        </el-form-item>
        <el-form-item label="调整原因">
          <el-input
            v-model="adjustForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入调整原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAdjustDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAdjustSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { User, DataBoard, TrendCharts, PieChart, Refresh, Download } from '@element-plus/icons-vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, PieChart as EChartsPieChart, LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'

// 注册 ECharts 组件
use([
  CanvasRenderer,
  BarChart,
  EChartsPieChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

// 响应式数据
const loading = ref(false)
const showDetailDialog = ref(false)
const showAdjustDialog = ref(false)
const trendPeriod = ref('30d')

// 概览数据
const overviewData = reactive({
  totalMembers: 1250,
  totalQuota: 2000,
  usedQuota: 1250,
  usageRate: 62.5
})

// 表格数据
const tableData = ref([
  {
    poolName: '基础会员库',
    totalQuota: 1000,
    usedQuota: 650,
    availableQuota: 350,
    usageRate: 65,
    memberCount: 650,
    activeMembers: 580,
    status: 'active',
    lastUpdate: '2024-01-20 14:30:00',
    createTime: '2024-01-15 10:30:00'
  },
  {
    poolName: 'VIP会员库',
    totalQuota: 500,
    usedQuota: 400,
    availableQuota: 100,
    usageRate: 80,
    memberCount: 400,
    activeMembers: 380,
    status: 'active',
    lastUpdate: '2024-01-20 14:30:00',
    createTime: '2024-01-16 14:20:00'
  },
  {
    poolName: '企业会员库',
    totalQuota: 500,
    usedQuota: 200,
    availableQuota: 300,
    usageRate: 40,
    memberCount: 200,
    activeMembers: 180,
    status: 'active',
    lastUpdate: '2024-01-20 14:30:00',
    createTime: '2024-01-17 09:15:00'
  }
])

// 详情数据
const detailData = reactive({
  poolName: '',
  totalQuota: 0,
  usedQuota: 0,
  availableQuota: 0,
  usageRate: 0,
  memberCount: 0,
  activeMembers: 0,
  status: '',
  createTime: '',
  lastUpdate: ''
})

// 调整表单
const adjustForm = reactive({
  poolName: '',
  currentQuota: 0,
  usedQuota: 0,
  newQuota: 0,
  reason: ''
})

// 图表配置
const quotaChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  legend: {
    data: ['总名额', '已用名额', '可用名额']
  },
  xAxis: {
    type: 'category',
    data: tableData.value.map(item => item.poolName)
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '总名额',
      type: 'bar',
      data: tableData.value.map(item => item.totalQuota),
      itemStyle: { color: '#409eff' }
    },
    {
      name: '已用名额',
      type: 'bar',
      data: tableData.value.map(item => item.usedQuota),
      itemStyle: { color: '#67c23a' }
    },
    {
      name: '可用名额',
      type: 'bar',
      data: tableData.value.map(item => item.availableQuota),
      itemStyle: { color: '#e6a23c' }
    }
  ]
}))

const typeChartOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: 'left'
  },
  series: [
    {
      name: '会员类型',
      type: 'pie',
      radius: '50%',
      data: [
        { value: 650, name: '基础会员' },
        { value: 400, name: 'VIP会员' },
        { value: 200, name: '企业会员' }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
}))

const trendChartOption = computed(() => {
  const days = trendPeriod.value === '7d' ? 7 : trendPeriod.value === '30d' ? 30 : 90
  const dates = []
  const usedData = []
  const totalData = []
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    dates.push(date.toLocaleDateString())
    
    // 模拟数据
    const baseUsed = 1000 + Math.random() * 200
    const baseTotal = 2000 + Math.random() * 100
    usedData.push(Math.round(baseUsed))
    totalData.push(Math.round(baseTotal))
  }
  
  return {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['已用名额', '总名额']
    },
    xAxis: {
      type: 'category',
      data: dates
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '已用名额',
        type: 'line',
        data: usedData,
        smooth: true,
        itemStyle: { color: '#67c23a' }
      },
      {
        name: '总名额',
        type: 'line',
        data: totalData,
        smooth: true,
        itemStyle: { color: '#409eff' }
      }
    ]
  }
})

const detailChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category',
    data: ['1月', '2月', '3月', '4月', '5月', '6月']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '使用名额',
      type: 'line',
      data: [120, 200, 150, 80, 70, 110],
      smooth: true,
      itemStyle: { color: '#67c23a' }
    }
  ]
}))

// 方法
const getProgressColor = (percentage) => {
  if (percentage < 50) return '#67c23a'
  if (percentage < 80) return '#e6a23c'
  return '#f56c6c'
}

const refreshData = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('数据已刷新')
  }, 1000)
}

const handleViewDetail = (row) => {
  Object.assign(detailData, row)
  showDetailDialog.value = true
}

const handleAdjustQuota = (row) => {
  Object.assign(adjustForm, {
    poolName: row.poolName,
    currentQuota: row.totalQuota,
    usedQuota: row.usedQuota,
    newQuota: row.totalQuota,
    reason: ''
  })
  showAdjustDialog.value = true
}

const handleAdjustSubmit = () => {
  if (adjustForm.newQuota < adjustForm.usedQuota) {
    ElMessage.error('新名额不能小于已用名额')
    return
  }
  
  // 更新数据
  const pool = tableData.value.find(item => item.poolName === adjustForm.poolName)
  if (pool) {
    pool.totalQuota = adjustForm.newQuota
    pool.availableQuota = adjustForm.newQuota - pool.usedQuota
    pool.usageRate = Math.round((pool.usedQuota / pool.totalQuota) * 100)
  }
  
  showAdjustDialog.value = false
  ElMessage.success('名额调整成功')
}

const exportData = () => {
  ElMessage.success('数据导出成功')
}

onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
.quota-dashboard {
  height: 100%;
}

.overview-cards {
  margin-bottom: 20px;
}

.overview-card {
  height: 100px;
}

.card-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.card-icon {
  font-size: 32px;
  color: #409eff;
  margin-right: 15px;
}

.card-info {
  flex: 1;
}

.card-number {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.card-label {
  font-size: 14px;
  color: #909399;
}

.chart-section {
  margin-bottom: 20px;
}

.chart-card {
  height: 400px;
}

.table-card {
  height: 500px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.chart-container {
  padding: 10px 0;
}

.detail-content {
  max-height: 600px;
  overflow-y: auto;
}

.detail-chart {
  margin-top: 20px;
}

.detail-chart h4 {
  margin-bottom: 15px;
  color: #606266;
}
</style>
