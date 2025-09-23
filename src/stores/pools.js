import { defineStore } from 'pinia'

export const usePoolsStore = defineStore('pools', {
  state: () => ({
    pools: [
      { id: 'POOL_BASIC', name: '基础会员池', tenantId: '000000', deptId: 'D001', poolType: 'config', quota: 1000, used: 650, status: 'active', lowThreshold: 20 },
      { id: 'POOL_VIP', name: 'VIP会员池', tenantId: '000000', deptId: 'D001', poolType: 'config', quota: 500, used: 400, status: 'active', lowThreshold: 15 },
      { id: 'POOL_ENT', name: '企业会员池', tenantId: '000000', deptId: 'D001', poolType: 'config', quota: 500, used: 200, status: 'active', lowThreshold: 10 }
    ]
  }),
  getters: {
    all(state) {
      return state.pools
    },
    byId: (state) => (id) => state.pools.find(p => p.id === id),
    usageRate: (state) => (id) => {
      const p = state.pools.find(x => x.id === id)
      if (!p || !p.quota) return 0
      return Math.round((p.used / p.quota) * 100)
    }
  },
  actions: {
    addPool(pool) {
      const id = pool.id || `POOL${Date.now()}`
      const record = { id, status: 'active', lowThreshold: 10, ...pool }
      this.pools.unshift(record)
      return record
    },
    updatePool(id, patch) {
      const idx = this.pools.findIndex(p => p.id === id)
      if (idx > -1) this.pools[idx] = { ...this.pools[idx], ...patch }
    },
    canAllocate(id, count = 1) {
      const p = this.pools.find(x => x.id === id)
      if (!p) return false
      return p.used + count <= p.quota
    },
    allocate(id, count = 1) {
      const p = this.pools.find(x => x.id === id)
      if (!p) return false
      if (p.used + count > p.quota) return false
      p.used += count
      return true
    },
    release(id, count = 1) {
      const p = this.pools.find(x => x.id === id)
      if (!p) return false
      p.used = Math.max(0, p.used - count)
      return true
    }
  }
})


