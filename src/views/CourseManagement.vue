<template>
  <div class="course-management">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <span>课程管理</span>
          <el-button type="primary" @click="showAddDialog = true">
            <el-icon><Plus /></el-icon>
            新增课程
          </el-button>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="课程名称">
            <el-input
              v-model="searchForm.title"
              placeholder="请输入课程名称"
              clearable
              style="width: 200px;"
            />
          </el-form-item>
          <el-form-item label="课程类型">
            <el-select 
              v-model="searchForm.courseType" 
              placeholder="请选择课程类型" 
              clearable
              style="width: 150px;"
            >
              <el-option label="免费课程" value="0" />
              <el-option label="付费课程" value="1" />
              <el-option label="预约课程" value="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="课程模式">
            <el-select 
              v-model="searchForm.courseMode" 
              placeholder="请选择课程模式" 
              clearable
              style="width: 150px;"
            >
              <el-option label="线上" value="0" />
              <el-option label="线下" value="1" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select 
              v-model="searchForm.status" 
              placeholder="请选择状态" 
              clearable
              style="width: 120px;"
            >
              <el-option label="待上架" value="0" />
              <el-option label="已上架" value="1" />
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
        <el-table-column prop="courseId" label="课程ID" width="100" />
        <el-table-column prop="title" label="课程名称" width="200" />
        <el-table-column prop="courseType" label="课程类型" width="120">
          <template #default="scope">
            <el-tag :type="getCourseTypeColor(scope.row.courseType)">
              {{ getCourseTypeName(scope.row.courseType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="courseMode" label="课程模式" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.courseMode === '0' ? 'success' : 'warning'">
              {{ scope.row.courseMode === '0' ? '线上' : '线下' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="100">
          <template #default="scope">
            <span class="price">¥{{ scope.row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="timeType" label="时间类型" width="120">
          <template #default="scope">
            <el-tag :type="getTimeTypeColor(scope.row.timeType)">
              {{ getTimeTypeName(scope.row.timeType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="timeLength" label="时长" width="120">
          <template #default="scope">
            {{ scope.row.timeLength }}{{ getTimeUnitName(scope.row.timeUnit) }}
          </template>
        </el-table-column>
        <el-table-column prop="beginTime" label="开始时间" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === '1' ? 'success' : 'warning'">
              {{ scope.row.status === '1' ? '已上架' : '待上架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="250" fixed="right">
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
              @click="handleSchedule(scope.row)"
            >
              课程表
            </el-button>
            <el-button
              type="info"
              size="small"
              @click="handleViewDetail(scope.row)"
            >
              详情
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

    <!-- 新增/编辑课程对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="isEdit ? '编辑课程' : '新增课程'"
      width="1000px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="课程名称" prop="title">
              <el-input v-model="formData.title" placeholder="请输入课程名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="课程类型" prop="courseType">
              <el-select v-model="formData.courseType" placeholder="请选择课程类型">
                <el-option label="免费课程" value="0" />
                <el-option label="付费课程" value="1" />
                <el-option label="预约课程" value="2" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="课程模式" prop="courseMode">
              <el-radio-group v-model="formData.courseMode">
                <el-radio label="0">线上</el-radio>
                <el-radio label="1">线下</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="课程等级" prop="courseLevel">
              <el-select v-model="formData.courseLevel" placeholder="请选择课程等级">
                <el-option label="K2" value="0" />
                <el-option label="K4" value="1" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="价格" prop="price">
              <el-input-number
                v-model="formData.price"
                :min="0"
                :precision="2"
                placeholder="请输入价格"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="原价" prop="oldPrice">
              <el-input-number
                v-model="formData.oldPrice"
                :min="0"
                :precision="2"
                placeholder="请输入原价"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 时间设置区域 -->
        <el-divider content-position="left">时间设置</el-divider>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="时间类型" prop="timeType">
              <el-select v-model="formData.timeType" placeholder="请选择时间类型" @change="handleTimeTypeChange">
                <el-option label="时间长度" value="1" />
                <el-option label="时间段" value="2" />
                <el-option label="指定星期" value="3" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="formData.timeType === '1' || formData.timeType === '3'">
            <el-form-item label="时间长度" prop="timeLength">
              <el-input-number
                v-model="formData.timeLength"
                :min="0"
                placeholder="请输入时间长度"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20" v-if="formData.timeType === '1' || formData.timeType === '3'">
          <el-col :span="12">
            <el-form-item label="时间单位" prop="timeUnit">
              <el-select v-model="formData.timeUnit" placeholder="请选择时间单位">
                <el-option label="小时" value="hours" />
                <el-option label="分钟" value="minutes" />
                <el-option label="秒" value="seconds" />
                <el-option label="天" value="day" />
                <el-option label="周" value="week" />
                <el-option label="月" value="month" />
                <el-option label="年" value="year" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20" v-if="formData.timeType === '2'">
          <el-col :span="12">
            <el-form-item label="开始时间" prop="beginTime">
              <el-date-picker
                v-model="formData.beginTime"
                type="datetime"
                placeholder="请选择开始时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间" prop="endTime">
              <el-date-picker
                v-model="formData.endTime"
                type="datetime"
                placeholder="请选择结束时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20" v-if="formData.timeType === '3'">
          <el-col :span="24">
            <el-form-item label="指定星期" prop="weeks">
              <el-checkbox-group v-model="formData.weeks">
                <el-checkbox label="1">周一</el-checkbox>
                <el-checkbox label="2">周二</el-checkbox>
                <el-checkbox label="3">周三</el-checkbox>
                <el-checkbox label="4">周四</el-checkbox>
                <el-checkbox label="5">周五</el-checkbox>
                <el-checkbox label="6">周六</el-checkbox>
                <el-checkbox label="0">周日</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 报名时间设置 -->
        <el-divider content-position="left">报名时间设置</el-divider>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="报名开始时间" prop="signBeginTime">
              <el-date-picker
                v-model="formData.signBeginTime"
                type="datetime"
                placeholder="请选择报名开始时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="报名结束时间" prop="signEndTime">
              <el-date-picker
                v-model="formData.signEndTime"
                type="datetime"
                placeholder="请选择报名结束时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="最小报名人数" prop="minSignNum">
              <el-input-number
                v-model="formData.minSignNum"
                :min="0"
                placeholder="请输入最小报名人数"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="试看时间(秒)" prop="trySeeTime">
              <el-input-number
                v-model="formData.trySeeTime"
                :min="0"
                placeholder="请输入试看时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="课程描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入课程描述"
          />
        </el-form-item>

        <el-form-item label="标签" prop="tag">
          <el-input v-model="formData.tag" placeholder="请输入标签，多个标签用逗号分隔" />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio label="0">待上架</el-radio>
            <el-radio label="1">已上架</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 课程详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      title="课程详情"
      width="800px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="课程ID">{{ detailData.courseId }}</el-descriptions-item>
        <el-descriptions-item label="课程名称">{{ detailData.title }}</el-descriptions-item>
        <el-descriptions-item label="课程类型">
          <el-tag :type="getCourseTypeColor(detailData.courseType)">
            {{ getCourseTypeName(detailData.courseType) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="课程模式">
          <el-tag :type="detailData.courseMode === '0' ? 'success' : 'warning'">
            {{ detailData.courseMode === '0' ? '线上' : '线下' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="价格">¥{{ detailData.price }}</el-descriptions-item>
        <el-descriptions-item label="原价">¥{{ detailData.oldPrice }}</el-descriptions-item>
        <el-descriptions-item label="时间类型">
          <el-tag :type="getTimeTypeColor(detailData.timeType)">
            {{ getTimeTypeName(detailData.timeType) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="时长">
          {{ detailData.timeLength }}{{ getTimeUnitName(detailData.timeUnit) }}
        </el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ detailData.beginTime }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{ detailData.endTime }}</el-descriptions-item>
        <el-descriptions-item label="报名开始时间">{{ detailData.signBeginTime }}</el-descriptions-item>
        <el-descriptions-item label="报名结束时间">{{ detailData.signEndTime }}</el-descriptions-item>
        <el-descriptions-item label="最小报名人数">{{ detailData.minSignNum }}</el-descriptions-item>
        <el-descriptions-item label="试看时间">{{ detailData.trySeeTime }}秒</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="detailData.status === '1' ? 'success' : 'warning'">
            {{ detailData.status === '1' ? '已上架' : '待上架' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detailData.createTime }}</el-descriptions-item>
        <el-descriptions-item label="课程描述" :span="2">{{ detailData.description }}</el-descriptions-item>
        <el-descriptions-item label="标签" :span="2">{{ detailData.tag || '无' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 课程表对话框 -->
    <el-dialog
      v-model="showScheduleDialog"
      title="课程表"
      width="1200px"
    >
      <div class="schedule-container">
        <div class="schedule-header">
          <h3>{{ currentCourse.title }} - 课程表</h3>
          <div class="schedule-actions">
            <el-button type="primary" @click="showAddScheduleDialog = true">
              <el-icon><Plus /></el-icon>
              添加课程时间
            </el-button>
            <el-button @click="refreshSchedule">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>

        <div class="schedule-content">
          <el-calendar v-model="calendarValue">
            <template #date-cell="{ data }">
              <div class="calendar-cell">
                <div class="date">{{ data.day.split('-').slice(1).join('-') }}</div>
                <div class="schedule-list">
                  <div
                    v-for="schedule in getScheduleForDate(data.day)"
                    :key="schedule.id"
                    class="schedule-item"
                    :class="getScheduleStatusClass(schedule.status)"
                    @click="viewScheduleDetail(schedule)"
                  >
                    <div class="schedule-time">{{ schedule.startTime }}</div>
                    <div class="schedule-title">{{ schedule.title }}</div>
                    <div class="schedule-status">{{ getScheduleStatusText(schedule.status) }}</div>
                  </div>
                </div>
              </div>
            </template>
          </el-calendar>
        </div>
      </div>
    </el-dialog>

    <!-- 添加课程时间对话框 -->
    <el-dialog
      v-model="showAddScheduleDialog"
      title="添加课程时间"
      width="600px"
    >
      <el-form :model="scheduleForm" label-width="120px">
        <el-form-item label="课程时间">
          <el-date-picker
            v-model="scheduleForm.scheduleDate"
            type="date"
            placeholder="请选择日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="开始时间">
          <el-time-picker
            v-model="scheduleForm.startTime"
            placeholder="请选择开始时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-time-picker
            v-model="scheduleForm.endTime"
            placeholder="请选择结束时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="教室/地点">
          <el-input v-model="scheduleForm.location" placeholder="请输入教室或地点" />
        </el-form-item>
        <el-form-item label="讲师">
          <el-input v-model="scheduleForm.instructor" placeholder="请输入讲师姓名" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="scheduleForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddScheduleDialog = false">取消</el-button>
        <el-button type="primary" @click="addSchedule">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const showAddDialog = ref(false)
const showDetailDialog = ref(false)
const showScheduleDialog = ref(false)
const showAddScheduleDialog = ref(false)
const isEdit = ref(false)
const formRef = ref()
const calendarValue = ref(new Date())

// 搜索表单
const searchForm = reactive({
  title: '',
  courseType: '',
  courseMode: '',
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
    courseId: 'C001',
    title: 'Vue3基础入门',
    courseType: '0',
    courseMode: '0',
    price: 199,
    oldPrice: 299,
    timeType: '1',
    timeLength: 120,
    timeUnit: 'minutes',
    beginTime: null,
    endTime: null,
    weeks: null,
    signBeginTime: '2024-01-01 00:00:00',
    signEndTime: '2024-12-31 23:59:59',
    minSignNum: 10,
    trySeeTime: 300,
    status: '1',
    createTime: '2024-01-15 10:30:00',
    description: 'Vue3框架基础入门课程',
    tag: '前端,Vue3,基础'
  },
  {
    courseId: 'C002',
    title: 'JavaScript高级编程',
    courseType: '1',
    courseMode: '0',
    price: 399,
    oldPrice: 599,
    timeType: '2',
    timeLength: 0,
    timeUnit: null,
    beginTime: '2024-02-01 09:00:00',
    endTime: '2024-02-01 17:00:00',
    weeks: null,
    signBeginTime: '2024-01-15 00:00:00',
    signEndTime: '2024-01-30 23:59:59',
    minSignNum: 15,
    trySeeTime: 600,
    status: '1',
    createTime: '2024-01-16 14:20:00',
    description: 'JavaScript高级特性与最佳实践',
    tag: '前端,JavaScript,高级'
  },
  {
    courseId: 'C003',
    title: 'React实战项目',
    courseType: '2',
    courseMode: '1',
    price: 599,
    oldPrice: 799,
    timeType: '3',
    timeLength: 180,
    timeUnit: 'minutes',
    beginTime: null,
    endTime: null,
    weeks: '1,3,5',
    signBeginTime: '2024-01-20 00:00:00',
    signEndTime: '2024-02-20 23:59:59',
    minSignNum: 8,
    trySeeTime: 0,
    status: '0',
    createTime: '2024-01-17 09:15:00',
    description: 'React项目实战开发',
    tag: '前端,React,实战'
  }
])

// 表单数据
const formData = reactive({
  courseId: null,
  title: '',
  courseType: '0',
  courseMode: '0',
  courseLevel: '0',
  price: 0,
  oldPrice: 0,
  timeType: '1',
  timeLength: 0,
  timeUnit: 'minutes',
  beginTime: null,
  endTime: null,
  weeks: [],
  signBeginTime: null,
  signEndTime: null,
  minSignNum: 0,
  trySeeTime: 0,
  status: '0',
  description: '',
  tag: ''
})

// 详情数据
const detailData = reactive({
  courseId: '',
  title: '',
  courseType: '',
  courseMode: '',
  price: 0,
  oldPrice: 0,
  timeType: '',
  timeLength: 0,
  timeUnit: '',
  beginTime: '',
  endTime: '',
  weeks: '',
  signBeginTime: '',
  signEndTime: '',
  minSignNum: 0,
  trySeeTime: 0,
  status: '',
  createTime: '',
  description: '',
  tag: ''
})

// 课程表相关数据
const currentCourse = ref({})
const scheduleList = ref([
  {
    id: 'S001',
    courseId: 'C001',
    title: 'Vue3基础入门',
    scheduleDate: '2024-01-25',
    startTime: '09:00',
    endTime: '11:00',
    location: 'A101教室',
    instructor: '张老师',
    status: 'scheduled',
    remark: '基础语法讲解'
  },
  {
    id: 'S002',
    courseId: 'C001',
    title: 'Vue3基础入门',
    scheduleDate: '2024-01-27',
    startTime: '14:00',
    endTime: '16:00',
    location: 'A101教室',
    instructor: '张老师',
    status: 'completed',
    remark: '组件开发实践'
  },
  {
    id: 'S003',
    courseId: 'C002',
    title: 'JavaScript高级编程',
    scheduleDate: '2024-01-26',
    startTime: '09:00',
    endTime: '17:00',
    location: 'B201教室',
    instructor: '李老师',
    status: 'scheduled',
    remark: '全天课程'
  }
])

const scheduleForm = reactive({
  scheduleDate: null,
  startTime: null,
  endTime: null,
  location: '',
  instructor: '',
  remark: ''
})

// 表单验证规则
const formRules = {
  title: [
    { required: true, message: '请输入课程名称', trigger: 'blur' }
  ],
  courseType: [
    { required: true, message: '请选择课程类型', trigger: 'change' }
  ],
  courseMode: [
    { required: true, message: '请选择课程模式', trigger: 'change' }
  ],
  timeType: [
    { required: true, message: '请选择时间类型', trigger: 'change' }
  ]
}

// 计算属性
const getCourseTypeColor = (type) => {
  const colorMap = {
    '0': 'success',
    '1': 'warning',
    '2': 'danger'
  }
  return colorMap[type] || 'info'
}

const getCourseTypeName = (type) => {
  const nameMap = {
    '0': '免费课程',
    '1': '付费课程',
    '2': '预约课程'
  }
  return nameMap[type] || type
}

const getTimeTypeColor = (type) => {
  const colorMap = {
    '1': 'success',
    '2': 'warning',
    '3': 'danger'
  }
  return colorMap[type] || 'info'
}

const getTimeTypeName = (type) => {
  const nameMap = {
    '1': '时间长度',
    '2': '时间段',
    '3': '指定星期'
  }
  return nameMap[type] || type
}

const getTimeUnitName = (unit) => {
  const unitMap = {
    'hours': '小时',
    'minutes': '分钟',
    'seconds': '秒',
    'day': '天',
    'week': '周',
    'month': '月',
    'year': '年'
  }
  return unitMap[unit] || unit
}

const getScheduleForDate = (date) => {
  return scheduleList.value.filter(schedule => schedule.scheduleDate === date)
}

const getScheduleStatusClass = (status) => {
  const classMap = {
    'scheduled': 'status-scheduled',
    'completed': 'status-completed',
    'cancelled': 'status-cancelled'
  }
  return classMap[status] || ''
}

const getScheduleStatusText = (status) => {
  const textMap = {
    'scheduled': '已安排',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return textMap[status] || status
}

// 方法
const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('搜索完成')
  }, 1000)
}

const handleReset = () => {
  searchForm.title = ''
  searchForm.courseType = ''
  searchForm.courseMode = ''
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
    await ElMessageBox.confirm('确定要删除这个课程吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const index = tableData.value.findIndex(item => item.courseId === row.courseId)
    if (index > -1) {
      tableData.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  } catch {
    ElMessage.info('已取消删除')
  }
}

const handleSchedule = (row) => {
  currentCourse.value = row
  showScheduleDialog.value = true
}

const handleViewDetail = (row) => {
  Object.assign(detailData, row)
  showDetailDialog.value = true
}

const handleTimeTypeChange = (value) => {
  // 根据时间类型重置相关字段
  if (value === '1') {
    formData.beginTime = null
    formData.endTime = null
    formData.weeks = []
  } else if (value === '2') {
    formData.timeLength = 0
    formData.timeUnit = null
    formData.weeks = []
  } else if (value === '3') {
    formData.beginTime = null
    formData.endTime = null
  }
}

const handleDialogClose = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    courseId: null,
    title: '',
    courseType: '0',
    courseMode: '0',
    courseLevel: '0',
    price: 0,
    oldPrice: 0,
    timeType: '1',
    timeLength: 0,
    timeUnit: 'minutes',
    beginTime: null,
    endTime: null,
    weeks: [],
    signBeginTime: null,
    signEndTime: null,
    minSignNum: 0,
    trySeeTime: 0,
    status: '0',
    description: '',
    tag: ''
  })
  isEdit.value = false
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    const submitData = {
      ...formData,
      createTime: isEdit.value ? formData.createTime : new Date().toLocaleString()
    }
    
    if (isEdit.value) {
      // 编辑
      const index = tableData.value.findIndex(item => item.courseId === formData.courseId)
      if (index > -1) {
        tableData.value[index] = { ...submitData }
      }
      ElMessage.success('编辑成功')
    } else {
      // 新增
      const newItem = {
        ...submitData,
        courseId: `C${String(Date.now()).slice(-3)}`
      }
      tableData.value.unshift(newItem)
      ElMessage.success('新增成功')
    }
    
    showAddDialog.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const refreshSchedule = () => {
  ElMessage.success('课程表已刷新')
}

const addSchedule = () => {
  if (!scheduleForm.scheduleDate || !scheduleForm.startTime || !scheduleForm.endTime) {
    ElMessage.warning('请填写完整的课程时间信息')
    return
  }
  
  const newSchedule = {
    id: `S${String(Date.now()).slice(-3)}`,
    courseId: currentCourse.value.courseId,
    title: currentCourse.value.title,
    scheduleDate: scheduleForm.scheduleDate.toISOString().split('T')[0],
    startTime: scheduleForm.startTime,
    endTime: scheduleForm.endTime,
    location: scheduleForm.location,
    instructor: scheduleForm.instructor,
    status: 'scheduled',
    remark: scheduleForm.remark
  }
  
  scheduleList.value.push(newSchedule)
  
  // 重置表单
  Object.assign(scheduleForm, {
    scheduleDate: null,
    startTime: null,
    endTime: null,
    location: '',
    instructor: '',
    remark: ''
  })
  
  showAddScheduleDialog.value = false
  ElMessage.success('课程时间添加成功')
}

const viewScheduleDetail = (schedule) => {
  ElMessage.info(`查看课程详情: ${schedule.title}`)
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
.course-management {
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

.schedule-container {
  max-height: 600px;
  overflow-y: auto;
}

.schedule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.schedule-header h3 {
  margin: 0;
  color: #303133;
}

.schedule-actions {
  display: flex;
  gap: 10px;
}

.calendar-cell {
  height: 100px;
  padding: 5px;
  border: 1px solid #e4e7ed;
}

.date {
  font-weight: bold;
  margin-bottom: 5px;
  color: #303133;
}

.schedule-list {
  max-height: 70px;
  overflow-y: auto;
}

.schedule-item {
  padding: 2px 4px;
  margin-bottom: 2px;
  border-radius: 2px;
  cursor: pointer;
  font-size: 12px;
}

.schedule-item.status-scheduled {
  background-color: #e1f3d8;
  color: #67c23a;
}

.schedule-item.status-completed {
  background-color: #f0f9ff;
  color: #409eff;
}

.schedule-item.status-cancelled {
  background-color: #fef0f0;
  color: #f56c6c;
}

.schedule-time {
  font-weight: bold;
}

.schedule-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.schedule-status {
  font-size: 10px;
}
</style>
