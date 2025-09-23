import { createRouter, createWebHistory } from 'vue-router'
import MemberPoolConfig from '../views/MemberPoolConfig.vue'
import UpgradeMigration from '../views/UpgradeMigration.vue'
import UserBinding from '../views/UserBinding.vue'
import QuotaDashboard from '../views/QuotaDashboard.vue'
import PlanDetail from '../views/PlanDetail.vue'
import CourseManagement from '../views/CourseManagement.vue'
import UpgradeApprovals from '../views/UpgradeApprovals.vue'

const routes = [
  {
    path: '/',
    redirect: '/member-pool'
  },
  {
    path: '/member-pool',
    name: 'MemberPool',
    component: MemberPoolConfig
  },
  {
    path: '/upgrade-migration',
    name: 'UpgradeMigration',
    component: UpgradeMigration
  },
  {
    path: '/user-binding',
    name: 'UserBinding',
    component: UserBinding
  },
  {
    path: '/quota-dashboard',
    name: 'QuotaDashboard',
    component: QuotaDashboard
  },
  {
    path: '/plan-detail',
    name: 'PlanDetail',
    component: PlanDetail
  },
  {
    path: '/course-management',
    name: 'CourseManagement',
    component: CourseManagement
  },
  {
    path: '/upgrade-approvals',
    name: 'UpgradeApprovals',
    component: UpgradeApprovals
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
