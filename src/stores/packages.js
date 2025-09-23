import { defineStore } from 'pinia'

// thali_info: 自己创建的套餐配置（可被其他门店购买）
// thali_dept: 门店已购买的套餐（属于具体门店/部门）
export const usePackagesStore = defineStore('packages', {
  state: () => ({
    thali_info: [],
    thali_dept: [],
  }),
  getters: {
    allConfigs(state) {
      return state.thali_info
    },
    allDeptPackages(state) {
      return state.thali_dept
    },
  },
  actions: {
    addConfig(config) {
      const id = config.id || `CFG${Date.now()}`
      const record = { id, ...config, createTime: config.createTime || new Date().toLocaleString() }
      this.thali_info.unshift(record)
      return record
    },
    addDeptPurchase(purchase) {
      const id = purchase.id || `DEP${Date.now()}`
      const record = {
        id,
        deptId: purchase.deptId || 'DEFAULT_DEPT',
        buyerUserId: purchase.buyerUserId || '',
        planId: purchase.planId || '',
        planTitle: purchase.planTitle || '',
        currentPlan: purchase.currentPlan || '',
        targetPlan: purchase.targetPlan || '',
        priceDiff: purchase.priceDiff || 0,
        sourceConfigId: purchase.sourceConfigId || '',
        time: new Date().toLocaleString(),
      }
      this.thali_dept.unshift(record)
      return record
    },
    clearAll() {
      this.thali_info = []
      this.thali_dept = []
    }
  }
})


