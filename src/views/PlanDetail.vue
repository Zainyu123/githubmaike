<template>
  <div class="plan-detail">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <span>套餐详细管理</span>
          <el-button type="primary" @click="showAddDialog = true">
            <el-icon><Plus /></el-icon>
            新增套餐
          </el-button>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="套餐名称">
            <el-input
              v-model="searchForm.planName"
              placeholder="请输入套餐名称"
              clearable
              style="width: 200px;"
            />
          </el-form-item>
          <el-form-item label="套餐类型">
            <el-select 
              v-model="searchForm.planType" 
              placeholder="请选择套餐类型" 
              clearable
              style="width: 150px;"
            >
              <el-option label="基础版" value="basic" />
              <el-option label="VIP版" value="vip" />
              <el-option label="高级版" value="premium" />
              <el-option label="企业版" value="enterprise" />
            </el-select>
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
        <el-table-column prop="id" label="套餐ID" width="100" />
        <el-table-column prop="planName" label="套餐名称" width="150" />
        <el-table-column prop="planType" label="套餐类型" width="120">
          <template #default="scope">
            <el-tag :type="getPlanTypeColor(scope.row.planType)">
              {{ getPlanTypeName(scope.row.planType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="100">
          <template #default="scope">
            <span class="price">¥{{ scope.row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="courseCount" label="绑定课程数" width="120" />
        <el-table-column prop="duration" label="有效期(天)" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
              {{ scope.row.status === 'active' ? '启用' : '禁用' }}
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
              @click="handleManageCourses(scope.row)"
            >
              管理课程
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

    <!-- 新增/编辑套餐对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="isEdit ? '编辑套餐' : '新增套餐'"
      width="800px"
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
            <el-form-item label="套餐名称" prop="planName">
              <el-input v-model="formData.planName" placeholder="请输入套餐名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="套餐类型" prop="planType">
              <el-select v-model="formData.planType" placeholder="请选择套餐类型">
                <el-option label="基础版" value="basic" />
                <el-option label="VIP版" value="vip" />
                <el-option label="高级版" value="premium" />
                <el-option label="企业版" value="enterprise" />
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
            <el-form-item label="有效期(天)" prop="duration">
              <el-input-number
                v-model="formData.duration"
                :min="1"
                placeholder="请输入有效期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="套餐描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入套餐描述"
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="inactive">禁用</el-radio>
          </el-radio-group>
        </el-form-item>

         <!-- 课程绑定区域 -->
         <el-form-item label="绑定课程">
           <div class="course-binding-area">
             <div class="selection-buttons">
               <el-button type="primary" @click="showCourseSelectionDialog = true">
                 <el-icon><Search /></el-icon>
                 选择课程
               </el-button>
               <el-button type="success" @click="showMemberSelectionDialog = true">
                 <el-icon><User /></el-icon>
                 选择会员
               </el-button>
             </div>
             
             <div class="selected-items">
               <div class="selected-courses" v-if="boundCourses.length > 0">
                 <h4>已选课程 ({{ boundCourses.length }})</h4>
                 <el-table :data="boundCourses" size="small" max-height="200">
                   <el-table-column prop="name" label="课程名称" />
                   <el-table-column prop="category" label="分类" width="120" />
                   <el-table-column prop="duration" label="时长(分钟)" width="120" />
                   <el-table-column label="操作" width="80">
                     <template #default="scope">
                       <el-button
                         type="danger"
                         size="small"
                         @click="removeCourse(scope.$index)"
                       >
                         移除
                       </el-button>
                     </template>
                   </el-table-column>
                 </el-table>
               </div>
               
               <div class="selected-members" v-if="boundMembers.length > 0">
                 <h4>已选会员 ({{ boundMembers.length }})</h4>
                 <el-table :data="boundMembers" size="small" max-height="200">
                   <el-table-column prop="name" label="会员名称" />
                   <el-table-column prop="level" label="会员等级" width="120" />
                   <el-table-column prop="type" label="会员类型" width="120" />
                   <el-table-column label="操作" width="80">
                     <template #default="scope">
                       <el-button
                         type="danger"
                         size="small"
                         @click="removeMember(scope.$index)"
                       >
                         移除
                       </el-button>
                     </template>
                   </el-table-column>
                 </el-table>
               </div>
             </div>
           </div>
         </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 课程管理对话框 -->
    <el-dialog
      v-model="showCourseDialog"
      title="管理课程绑定"
      width="900px"
    >
      <div class="course-management">
        <div class="course-info">
          <h3>{{ currentPlan.planName }} - 课程管理</h3>
          <p>套餐类型: {{ getPlanTypeName(currentPlan.planType) }} | 价格: ¥{{ currentPlan.price }}</p>
        </div>

        <div class="course-actions">
          <el-button type="primary" @click="showAddCourseDialog = true">
            <el-icon><Plus /></el-icon>
            添加课程
          </el-button>
          <el-button @click="refreshCourseList">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>

        <el-table :data="planCourses" border>
          <el-table-column prop="name" label="课程名称" />
          <el-table-column prop="category" label="分类" width="120" />
          <el-table-column prop="instructor" label="讲师" width="120" />
          <el-table-column prop="duration" label="时长(分钟)" width="120" />
          <el-table-column prop="difficulty" label="难度" width="100">
            <template #default="scope">
              <el-tag :type="getDifficultyColor(scope.row.difficulty)">
                {{ scope.row.difficulty }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="bindingTime" label="绑定时间" width="180" />
          <el-table-column label="操作" width="120">
            <template #default="scope">
              <el-button
                type="danger"
                size="small"
                @click="unbindCourse(scope.row)"
              >
                解绑
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>

    <!-- 添加课程对话框 -->
    <el-dialog
      v-model="showAddCourseDialog"
      title="添加课程到套餐"
      width="600px"
    >
      <div class="add-course-form">
        <el-form :model="courseForm" label-width="100px">
          <el-form-item label="选择课程">
            <el-select
              v-model="courseForm.courseId"
              placeholder="请选择课程"
              filterable
              style="width: 100%"
            >
              <el-option
                v-for="course in availableCourses"
                :key="course.id"
                :label="course.name"
                :value="course.id"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="showAddCourseDialog = false">取消</el-button>
        <el-button type="primary" @click="bindCourseToPlan">确定</el-button>
      </template>
    </el-dialog>

     <!-- 课程选择弹窗 -->
     <el-dialog
       v-model="showCourseSelectionDialog"
       title="选择课程"
       width="1000px"
       @close="handleCourseSelectionClose"
     >
       <div class="course-selection-container">
         <!-- 搜索区域 -->
         <div class="search-section">
           <el-form :inline="true" :model="courseSearchForm" class="search-form">
             <el-form-item label="课程名称">
               <el-input
                 v-model="courseSearchForm.name"
                 placeholder="请输入课程名称"
                 clearable
                 style="width: 200px;"
               />
             </el-form-item>
             <el-form-item label="分类">
               <el-select v-model="courseSearchForm.category" placeholder="请选择分类" clearable style="width: 150px;">
                 <el-option label="前端开发" value="前端开发" />
                 <el-option label="后端开发" value="后端开发" />
                 <el-option label="数据库" value="数据库" />
                 <el-option label="架构设计" value="架构设计" />
                 <el-option label="运维" value="运维" />
               </el-select>
             </el-form-item>
             <el-form-item label="难度">
               <el-select v-model="courseSearchForm.difficulty" placeholder="请选择难度" clearable style="width: 120px;">
                 <el-option label="初级" value="初级" />
                 <el-option label="中级" value="中级" />
                 <el-option label="高级" value="高级" />
               </el-select>
             </el-form-item>
             <el-form-item>
               <el-button type="primary" @click="searchCourses">
                 <el-icon><Search /></el-icon>
                 搜索
               </el-button>
               <el-button @click="resetCourseSearch">
                 <el-icon><Refresh /></el-icon>
                 重置
               </el-button>
             </el-form-item>
           </el-form>
         </div>

         <!-- 课程列表 -->
         <div class="course-list-section">
           <div class="section-header">
             <h4>课程列表 ({{ coursePagination.total }})</h4>
             <div class="batch-actions">
               <el-button size="small" @click="selectAllCourses">全选</el-button>
               <el-button size="small" @click="clearCourseSelection">清空</el-button>
             </div>
           </div>
           
           <el-table
             :data="paginatedCourses"
             v-loading="courseLoading"
             border
             stripe
             @selection-change="handleCourseSelectionChange"
             style="width: 100%"
           >
             <el-table-column type="selection" width="55" />
             <el-table-column prop="name" label="课程名称" width="200" />
             <el-table-column prop="category" label="分类" width="120" />
             <el-table-column prop="instructor" label="讲师" width="120" />
             <el-table-column prop="duration" label="时长(分钟)" width="120" />
             <el-table-column prop="difficulty" label="难度" width="100">
               <template #default="scope">
                 <el-tag :type="getDifficultyColor(scope.row.difficulty)">
                   {{ scope.row.difficulty }}
                 </el-tag>
               </template>
             </el-table-column>
             <el-table-column prop="price" label="价格" width="100">
               <template #default="scope">
                 <span class="price">¥{{ scope.row.price }}</span>
               </template>
             </el-table-column>
             <el-table-column label="操作" width="120">
               <template #default="scope">
                 <el-button
                   type="primary"
                   size="small"
                   @click="viewCourseDetail(scope.row)"
                 >
                   详情
                 </el-button>
               </template>
             </el-table-column>
           </el-table>

           <!-- 课程分页 -->
           <div class="course-pagination">
             <el-pagination
               v-model:current-page="coursePagination.currentPage"
               v-model:page-size="coursePagination.pageSize"
               :page-sizes="[5, 10, 20, 50]"
               :total="coursePagination.total"
               layout="total, sizes, prev, pager, next, jumper"
               @size-change="handleCourseSizeChange"
               @current-change="handleCourseCurrentChange"
             />
           </div>
         </div>
       </div>
       
       <template #footer>
         <div class="selection-summary">
           <span>已选择 {{ selectedCourses.length }} 门课程</span>
         </div>
         <el-button @click="showCourseSelectionDialog = false">取消</el-button>
         <el-button type="primary" @click="confirmCourseSelection">确定选择</el-button>
       </template>
     </el-dialog>

     <!-- 会员选择弹窗 -->
     <el-dialog
       v-model="showMemberSelectionDialog"
       title="选择会员"
       width="1000px"
       @close="handleMemberSelectionClose"
     >
       <div class="member-selection-container">
         <!-- 搜索区域 -->
         <div class="search-section">
           <el-form :inline="true" :model="memberSearchForm" class="search-form">
             <el-form-item label="会员名称">
               <el-input
                 v-model="memberSearchForm.name"
                 placeholder="请输入会员名称"
                 clearable
                 style="width: 200px;"
               />
             </el-form-item>
             <el-form-item label="会员等级">
               <el-select v-model="memberSearchForm.level" placeholder="请选择等级" clearable style="width: 150px;">
                 <el-option label="普通会员" value="普通会员" />
                 <el-option label="银牌会员" value="银牌会员" />
                 <el-option label="金牌会员" value="金牌会员" />
                 <el-option label="钻石会员" value="钻石会员" />
               </el-select>
             </el-form-item>
             <el-form-item label="会员类型">
               <el-select v-model="memberSearchForm.type" placeholder="请选择类型" clearable style="width: 150px;">
                 <el-option label="个人会员" value="个人会员" />
                 <el-option label="企业会员" value="企业会员" />
                 <el-option label="VIP会员" value="VIP会员" />
               </el-select>
             </el-form-item>
             <el-form-item>
               <el-button type="primary" @click="searchMembers">
                 <el-icon><Search /></el-icon>
                 搜索
               </el-button>
               <el-button @click="resetMemberSearch">
                 <el-icon><Refresh /></el-icon>
                 重置
               </el-button>
             </el-form-item>
           </el-form>
         </div>

         <!-- 会员列表 -->
         <div class="member-list-section">
           <div class="section-header">
             <h4>会员列表 ({{ filteredMembers.length }})</h4>
             <div class="batch-actions">
               <el-button size="small" @click="selectAllMembers">全选</el-button>
               <el-button size="small" @click="clearMemberSelection">清空</el-button>
             </div>
           </div>
           
           <el-table
             :data="filteredMembers"
             v-loading="memberLoading"
             border
             stripe
             @selection-change="handleMemberSelectionChange"
             style="width: 100%"
           >
             <el-table-column type="selection" width="55" />
             <el-table-column prop="name" label="会员名称" width="200" />
             <el-table-column prop="level" label="会员等级" width="120">
               <template #default="scope">
                 <el-tag :type="getMemberLevelColor(scope.row.level)">
                   {{ scope.row.level }}
                 </el-tag>
               </template>
             </el-table-column>
             <el-table-column prop="type" label="会员类型" width="120">
               <template #default="scope">
                 <el-tag :type="getMemberTypeColor(scope.row.type)">
                   {{ scope.row.type }}
                 </el-tag>
               </template>
             </el-table-column>
             <el-table-column prop="phone" label="联系电话" width="150" />
             <el-table-column prop="email" label="邮箱" width="200" />
             <el-table-column prop="joinTime" label="加入时间" width="150" />
             <el-table-column label="操作" width="120">
               <template #default="scope">
                 <el-button
                   type="primary"
                   size="small"
                   @click="viewMemberDetail(scope.row)"
                 >
                   详情
                 </el-button>
               </template>
             </el-table-column>
           </el-table>
         </div>
       </div>
       
       <template #footer>
         <div class="selection-summary">
           <span>已选择 {{ selectedMembers.length }} 个会员</span>
         </div>
         <el-button @click="showMemberSelectionDialog = false">取消</el-button>
         <el-button type="primary" @click="confirmMemberSelection">确定选择</el-button>
       </template>
     </el-dialog>

     <!-- 课程详情弹窗 -->
     <el-dialog
       v-model="showCourseDetailDialog"
       title="课程详情"
       width="600px"
     >
       <el-descriptions :column="2" border>
         <el-descriptions-item label="课程名称">{{ courseDetailData.name }}</el-descriptions-item>
         <el-descriptions-item label="分类">{{ courseDetailData.category }}</el-descriptions-item>
         <el-descriptions-item label="讲师">{{ courseDetailData.instructor }}</el-descriptions-item>
         <el-descriptions-item label="时长">{{ courseDetailData.duration }}分钟</el-descriptions-item>
         <el-descriptions-item label="难度">
           <el-tag :type="getDifficultyColor(courseDetailData.difficulty)">
             {{ courseDetailData.difficulty }}
           </el-tag>
         </el-descriptions-item>
         <el-descriptions-item label="价格">¥{{ courseDetailData.price }}</el-descriptions-item>
         <el-descriptions-item label="课程描述" :span="2">{{ courseDetailData.description }}</el-descriptions-item>
       </el-descriptions>
     </el-dialog>

     <!-- 会员详情弹窗 -->
     <el-dialog
       v-model="showMemberDetailDialog"
       title="会员详情"
       width="600px"
     >
       <el-descriptions :column="2" border>
         <el-descriptions-item label="会员名称">{{ memberDetailData.name }}</el-descriptions-item>
         <el-descriptions-item label="会员等级">
           <el-tag :type="getMemberLevelColor(memberDetailData.level)">
             {{ memberDetailData.level }}
           </el-tag>
         </el-descriptions-item>
         <el-descriptions-item label="会员类型">
           <el-tag :type="getMemberTypeColor(memberDetailData.type)">
             {{ memberDetailData.type }}
           </el-tag>
         </el-descriptions-item>
         <el-descriptions-item label="联系电话">{{ memberDetailData.phone }}</el-descriptions-item>
         <el-descriptions-item label="邮箱">{{ memberDetailData.email }}</el-descriptions-item>
         <el-descriptions-item label="加入时间">{{ memberDetailData.joinTime }}</el-descriptions-item>
         <el-descriptions-item label="备注" :span="2">{{ memberDetailData.remark || '无' }}</el-descriptions-item>
       </el-descriptions>
     </el-dialog>

     <!-- 套餐详情对话框 -->
     <el-dialog
       v-model="showDetailDialog"
       title="套餐详情"
       width="700px"
     >
       <el-descriptions :column="2" border>
         <el-descriptions-item label="套餐ID">{{ detailData.id }}</el-descriptions-item>
         <el-descriptions-item label="套餐名称">{{ detailData.planName }}</el-descriptions-item>
         <el-descriptions-item label="套餐类型">
           <el-tag :type="getPlanTypeColor(detailData.planType)">
             {{ getPlanTypeName(detailData.planType) }}
           </el-tag>
         </el-descriptions-item>
         <el-descriptions-item label="价格">¥{{ detailData.price }}</el-descriptions-item>
         <el-descriptions-item label="有效期">{{ detailData.duration }}天</el-descriptions-item>
         <el-descriptions-item label="绑定课程数">{{ detailData.courseCount }}</el-descriptions-item>
         <el-descriptions-item label="状态">
           <el-tag :type="detailData.status === 'active' ? 'success' : 'danger'">
             {{ detailData.status === 'active' ? '启用' : '禁用' }}
           </el-tag>
         </el-descriptions-item>
         <el-descriptions-item label="创建时间">{{ detailData.createTime }}</el-descriptions-item>
         <el-descriptions-item label="套餐描述" :span="2">{{ detailData.description }}</el-descriptions-item>
       </el-descriptions>
     </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { usePackagesStore } from '../stores/packages'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const packagesStore = usePackagesStore()
const showAddDialog = ref(false)
const showCourseDialog = ref(false)
const showAddCourseDialog = ref(false)
const showDetailDialog = ref(false)
const showCourseSelectionDialog = ref(false)
const showMemberSelectionDialog = ref(false)
const showCourseDetailDialog = ref(false)
const showMemberDetailDialog = ref(false)
const isEdit = ref(false)
const formRef = ref()
const selectedCourse = ref('')
const currentPlan = ref({})
const courseLoading = ref(false)
const memberLoading = ref(false)

// 搜索表单
const searchForm = reactive({
  planName: '',
  planType: '',
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
    id: 'P001',
    planName: '基础学习套餐',
    planType: 'basic',
    price: 299,
    courseCount: 5,
    duration: 365,
    status: 'active',
    createTime: '2024-01-15 10:30:00',
    description: '适合初学者的基础课程套餐'
  },
  {
    id: 'P002',
    planName: 'VIP专业套餐',
    planType: 'vip',
    price: 899,
    courseCount: 12,
    duration: 365,
    status: 'active',
    createTime: '2024-01-16 14:20:00',
    description: 'VIP用户专享的高级课程套餐'
  },
  {
    id: 'P003',
    planName: '企业培训套餐',
    planType: 'enterprise',
    price: 1999,
    courseCount: 20,
    duration: 730,
    status: 'active',
    createTime: '2024-01-17 09:15:00',
    description: '企业级培训课程套餐'
  }
])

// 表单数据
const formData = reactive({
  id: null,
  planName: '',
  planType: '',
  price: 0,
  duration: 365,
  description: '',
  status: 'active'
})

// 详情数据
const detailData = reactive({
  id: '',
  planName: '',
  planType: '',
  price: 0,
  duration: 0,
  courseCount: 0,
  status: '',
  createTime: '',
  description: ''
})

// 课程相关数据
const availableCourses = ref([
  { id: 'C001', name: 'Vue3基础入门', category: '前端开发', duration: 120, difficulty: '初级' },
  { id: 'C002', name: 'JavaScript高级编程', category: '前端开发', duration: 180, difficulty: '中级' },
  { id: 'C003', name: 'React实战项目', category: '前端开发', duration: 240, difficulty: '高级' },
  { id: 'C004', name: 'Node.js后端开发', category: '后端开发', duration: 200, difficulty: '中级' },
  { id: 'C005', name: '数据库设计与优化', category: '数据库', duration: 160, difficulty: '中级' },
  { id: 'C006', name: '微服务架构', category: '架构设计', duration: 300, difficulty: '高级' },
  { id: 'C007', name: 'Docker容器化', category: '运维', duration: 150, difficulty: '中级' },
  { id: 'C008', name: 'Kubernetes集群管理', category: '运维', duration: 220, difficulty: '高级' }
])

const boundCourses = ref([])
const boundMembers = ref([])
const planCourses = ref([])
const courseForm = reactive({
  courseId: ''
})

// 课程选择相关数据
const courseSearchForm = reactive({
  name: '',
  category: '',
  difficulty: ''
})

const allCourses = ref([
  { id: 'C001', name: 'Vue3基础入门', category: '前端开发', instructor: '张老师', duration: 120, difficulty: '初级', price: 199, description: 'Vue3框架基础入门课程' },
  { id: 'C002', name: 'JavaScript高级编程', category: '前端开发', instructor: '李老师', duration: 180, difficulty: '中级', price: 299, description: 'JavaScript高级特性与最佳实践' },
  { id: 'C003', name: 'React实战项目', category: '前端开发', instructor: '王老师', duration: 240, difficulty: '高级', price: 399, description: 'React项目实战开发' },
  { id: 'C004', name: 'Node.js后端开发', category: '后端开发', instructor: '赵老师', duration: 200, difficulty: '中级', price: 349, description: 'Node.js服务端开发' },
  { id: 'C005', name: '数据库设计与优化', category: '数据库', instructor: '钱老师', duration: 160, difficulty: '中级', price: 249, description: '数据库设计原理与优化技巧' },
  { id: 'C006', name: '微服务架构', category: '架构设计', instructor: '孙老师', duration: 300, difficulty: '高级', price: 599, description: '微服务架构设计与实现' },
  { id: 'C007', name: 'Docker容器化', category: '运维', instructor: '周老师', duration: 150, difficulty: '中级', price: 199, description: 'Docker容器化技术' },
  { id: 'C008', name: 'Kubernetes集群管理', category: '运维', instructor: '吴老师', duration: 220, difficulty: '高级', price: 499, description: 'K8s集群管理与运维' }
])

const selectedCourses = ref([])
const courseDetailData = reactive({
  name: '',
  category: '',
  instructor: '',
  duration: 0,
  difficulty: '',
  price: 0,
  description: ''
})

// 课程分页数据
const coursePagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 会员选择相关数据
const memberSearchForm = reactive({
  name: '',
  level: '',
  type: ''
})

const allMembers = ref([
  { id: 'M001', name: '张三', level: '普通会员', type: '个人会员', phone: '13800138001', email: 'zhangsan@example.com', joinTime: '2024-01-15', remark: '新用户' },
  { id: 'M002', name: '李四', level: '银牌会员', type: '个人会员', phone: '13800138002', email: 'lisi@example.com', joinTime: '2024-01-10', remark: '活跃用户' },
  { id: 'M003', name: '王五', level: '金牌会员', type: '企业会员', phone: '13800138003', email: 'wangwu@example.com', joinTime: '2024-01-05', remark: '企业用户' },
  { id: 'M004', name: '赵六', level: '钻石会员', type: 'VIP会员', phone: '13800138004', email: 'zhaoliu@example.com', joinTime: '2024-01-01', remark: 'VIP用户' },
  { id: 'M005', name: '钱七', level: '普通会员', type: '个人会员', phone: '13800138005', email: 'qianqi@example.com', joinTime: '2024-01-20', remark: '新注册' },
  { id: 'M006', name: '孙八', level: '银牌会员', type: '企业会员', phone: '13800138006', email: 'sunba@example.com', joinTime: '2024-01-12', remark: '企业用户' }
])

const selectedMembers = ref([])
const memberDetailData = reactive({
  name: '',
  level: '',
  type: '',
  phone: '',
  email: '',
  joinTime: '',
  remark: ''
})

// 表单验证规则
const formRules = {
  planName: [
    { required: true, message: '请输入套餐名称', trigger: 'blur' }
  ],
  planType: [
    { required: true, message: '请选择套餐类型', trigger: 'change' }
  ],
  price: [
    { required: true, message: '请输入价格', trigger: 'blur' }
  ],
  duration: [
    { required: true, message: '请输入有效期', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 计算属性
const getPlanTypeColor = (type) => {
  const colorMap = {
    basic: 'info',
    vip: 'warning',
    premium: 'success',
    enterprise: 'danger'
  }
  return colorMap[type] || 'info'
}

const getPlanTypeName = (type) => {
  const nameMap = {
    basic: '基础版',
    vip: 'VIP版',
    premium: '高级版',
    enterprise: '企业版'
  }
  return nameMap[type] || type
}

const getDifficultyColor = (difficulty) => {
  const colorMap = {
    '初级': 'success',
    '中级': 'warning',
    '高级': 'danger'
  }
  return colorMap[difficulty] || 'info'
}

const getMemberLevelColor = (level) => {
  const colorMap = {
    '普通会员': 'info',
    '银牌会员': 'warning',
    '金牌会员': 'success',
    '钻石会员': 'danger'
  }
  return colorMap[level] || 'info'
}

const getMemberTypeColor = (type) => {
  const colorMap = {
    '个人会员': 'info',
    '企业会员': 'warning',
    'VIP会员': 'success'
  }
  return colorMap[type] || 'info'
}

// 计算属性
const filteredCourses = computed(() => {
  let courses = allCourses.value
  
  if (courseSearchForm.name) {
    courses = courses.filter(course => 
      course.name.toLowerCase().includes(courseSearchForm.name.toLowerCase())
    )
  }
  
  if (courseSearchForm.category) {
    courses = courses.filter(course => course.category === courseSearchForm.category)
  }
  
  if (courseSearchForm.difficulty) {
    courses = courses.filter(course => course.difficulty === courseSearchForm.difficulty)
  }
  
  return courses
})

// 分页后的课程数据
const paginatedCourses = computed(() => {
  const start = (coursePagination.currentPage - 1) * coursePagination.pageSize
  const end = start + coursePagination.pageSize
  return filteredCourses.value.slice(start, end)
})

const filteredMembers = computed(() => {
  let members = allMembers.value
  
  if (memberSearchForm.name) {
    members = members.filter(member => 
      member.name.toLowerCase().includes(memberSearchForm.name.toLowerCase())
    )
  }
  
  if (memberSearchForm.level) {
    members = members.filter(member => member.level === memberSearchForm.level)
  }
  
  if (memberSearchForm.type) {
    members = members.filter(member => member.type === memberSearchForm.type)
  }
  
  return members
})

// 方法
const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('搜索完成')
  }, 1000)
}

const handleReset = () => {
  searchForm.planName = ''
  searchForm.planType = ''
  searchForm.status = ''
  handleSearch()
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(formData, row)
  // 加载已绑定的课程
  boundCourses.value = [
    { id: 'C001', name: 'Vue3基础入门', category: '前端开发', duration: 120 },
    { id: 'C002', name: 'JavaScript高级编程', category: '前端开发', duration: 180 }
  ]
  showAddDialog.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这个套餐吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const index = tableData.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      tableData.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  } catch {
    ElMessage.info('已取消删除')
  }
}

const handleManageCourses = (row) => {
  currentPlan.value = row
  // 模拟加载套餐绑定的课程
  planCourses.value = [
    {
      id: 'C001',
      name: 'Vue3基础入门',
      category: '前端开发',
      instructor: '张老师',
      duration: 120,
      difficulty: '初级',
      bindingTime: '2024-01-15 10:30:00'
    },
    {
      id: 'C002',
      name: 'JavaScript高级编程',
      category: '前端开发',
      instructor: '李老师',
      duration: 180,
      difficulty: '中级',
      bindingTime: '2024-01-15 10:35:00'
    }
  ]
  showCourseDialog.value = true
}

const handleViewDetail = (row) => {
  Object.assign(detailData, row)
  showDetailDialog.value = true
}

const handleDialogClose = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    id: null,
    planName: '',
    planType: '',
    price: 0,
    duration: 365,
    description: '',
    status: 'active'
  })
  boundCourses.value = []
  boundMembers.value = []
  isEdit.value = false
}

const addCourse = () => {
  if (!selectedCourse.value) {
    ElMessage.warning('请选择要绑定的课程')
    return
  }
  
  const course = availableCourses.value.find(c => c.id === selectedCourse.value)
  if (course) {
    // 检查是否已经绑定
    const exists = boundCourses.value.find(c => c.id === course.id)
    if (exists) {
      ElMessage.warning('该课程已经绑定')
      return
    }
    
    boundCourses.value.push({ ...course })
    selectedCourse.value = ''
    ElMessage.success('课程添加成功')
  }
}

const removeCourse = (index) => {
  boundCourses.value.splice(index, 1)
  ElMessage.success('课程移除成功')
}

const removeMember = (index) => {
  boundMembers.value.splice(index, 1)
  ElMessage.success('会员移除成功')
}

// 课程选择相关方法
const searchCourses = () => {
  courseLoading.value = true
  setTimeout(() => {
    courseLoading.value = false
    coursePagination.currentPage = 1
    coursePagination.total = filteredCourses.value.length
    ElMessage.success('搜索完成')
  }, 500)
}

const resetCourseSearch = () => {
  courseSearchForm.name = ''
  courseSearchForm.category = ''
  courseSearchForm.difficulty = ''
  searchCourses()
}

const selectAllCourses = () => {
  selectedCourses.value = [...filteredCourses.value]
  ElMessage.success(`已选择 ${selectedCourses.value.length} 门课程`)
}

const clearCourseSelection = () => {
  selectedCourses.value = []
  ElMessage.success('已清空选择')
}

// 课程分页相关方法
const handleCourseSizeChange = (val) => {
  coursePagination.pageSize = val
  coursePagination.currentPage = 1
}

const handleCourseCurrentChange = (val) => {
  coursePagination.currentPage = val
}

const handleCourseSelectionChange = (selection) => {
  selectedCourses.value = selection
}

const confirmCourseSelection = () => {
  if (selectedCourses.value.length === 0) {
    ElMessage.warning('请至少选择一门课程')
    return
  }
  
  // 合并到已绑定课程列表，避免重复
  selectedCourses.value.forEach(course => {
    const exists = boundCourses.value.find(c => c.id === course.id)
    if (!exists) {
      boundCourses.value.push(course)
    }
  })
  
  showCourseSelectionDialog.value = false
  ElMessage.success(`已添加 ${selectedCourses.value.length} 门课程`)
}

const handleCourseSelectionClose = () => {
  selectedCourses.value = []
}

const viewCourseDetail = (course) => {
  Object.assign(courseDetailData, course)
  showCourseDetailDialog.value = true
}

// 会员选择相关方法
const searchMembers = () => {
  memberLoading.value = true
  setTimeout(() => {
    memberLoading.value = false
    ElMessage.success('搜索完成')
  }, 500)
}

const resetMemberSearch = () => {
  memberSearchForm.name = ''
  memberSearchForm.level = ''
  memberSearchForm.type = ''
  searchMembers()
}

const selectAllMembers = () => {
  selectedMembers.value = [...filteredMembers.value]
  ElMessage.success(`已选择 ${selectedMembers.value.length} 个会员`)
}

const clearMemberSelection = () => {
  selectedMembers.value = []
  ElMessage.success('已清空选择')
}

const handleMemberSelectionChange = (selection) => {
  selectedMembers.value = selection
}

const confirmMemberSelection = () => {
  if (selectedMembers.value.length === 0) {
    ElMessage.warning('请至少选择一个会员')
    return
  }
  
  // 合并到已绑定会员列表，避免重复
  selectedMembers.value.forEach(member => {
    const exists = boundMembers.value.find(m => m.id === member.id)
    if (!exists) {
      boundMembers.value.push(member)
    }
  })
  
  showMemberSelectionDialog.value = false
  ElMessage.success(`已添加 ${selectedMembers.value.length} 个会员`)
}

const handleMemberSelectionClose = () => {
  selectedMembers.value = []
}

const viewMemberDetail = (member) => {
  Object.assign(memberDetailData, member)
  showMemberDetailDialog.value = true
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    const submitData = {
      ...formData,
      courseCount: boundCourses.value.length,
      memberCount: boundMembers.value.length,
      createTime: isEdit.value ? formData.createTime : new Date().toLocaleString()
    }
    
    if (isEdit.value) {
      // 编辑
      const index = tableData.value.findIndex(item => item.id === formData.id)
      if (index > -1) {
        tableData.value[index] = { ...submitData }
      }
      ElMessage.success('编辑成功')
    } else {
      // 新增
      const newItem = {
        ...submitData,
        id: `P${Date.now()}`
      }
      tableData.value.unshift(newItem)
      // 保存到 thali_info（套餐配置）
      packagesStore.addConfig({
        id: newItem.id,
        title: newItem.planName,
        description: newItem.description,
        price: newItem.price,
        courseCount: newItem.courseCount,
        status: newItem.status,
        createTime: newItem.createTime,
      })
      ElMessage.success('新增成功')
    }
    
    showAddDialog.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const refreshCourseList = () => {
  ElMessage.success('课程列表已刷新')
}

const bindCourseToPlan = () => {
  if (!courseForm.courseId) {
    ElMessage.warning('请选择要绑定的课程')
    return
  }
  
  const course = availableCourses.value.find(c => c.id === courseForm.courseId)
  if (course) {
    const newBinding = {
      ...course,
      instructor: '讲师' + Math.floor(Math.random() * 100),
      bindingTime: new Date().toLocaleString()
    }
    planCourses.value.push(newBinding)
    courseForm.courseId = ''
    showAddCourseDialog.value = false
    ElMessage.success('课程绑定成功')
  }
}

const unbindCourse = async (row) => {
  try {
    await ElMessageBox.confirm('确定要解绑这个课程吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const index = planCourses.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      planCourses.value.splice(index, 1)
      ElMessage.success('课程解绑成功')
    }
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
  coursePagination.total = allCourses.value.length
})
</script>

<style scoped>
.plan-detail {
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

.course-binding-area {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 15px;
  background-color: #fafafa;
}

.course-selection {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.bound-courses h4 {
  margin-bottom: 10px;
  color: #606266;
}

.course-management {
  max-height: 600px;
  overflow-y: auto;
}

.course-info {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.course-info h3 {
  margin: 0 0 10px 0;
  color: #303133;
}

.course-info p {
  margin: 0;
  color: #606266;
}

.course-actions {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.add-course-form {
  padding: 10px 0;
}

.selection-buttons {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.selected-items {
  margin-top: 20px;
}

.selected-courses,
.selected-members {
  margin-bottom: 20px;
}

.selected-courses h4,
.selected-members h4 {
  margin-bottom: 10px;
  color: #606266;
}

.course-selection-container,
.member-selection-container {
  max-height: 600px;
  overflow-y: auto;
}

.search-section {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-header h4 {
  margin: 0;
  color: #303133;
}

.batch-actions {
  display: flex;
  gap: 10px;
}

.selection-summary {
  margin-right: 20px;
  color: #606266;
  font-size: 14px;
}

.course-pagination {
  margin-top: 15px;
  text-align: right;
}
</style>
