import { defineStore } from 'pinia'

export const useUpgradeStore = defineStore('upgrade', {
  state: () => ({
    requests: [],
  }),
  getters: {
    pendingCount(state) {
      return state.requests.filter(r => r.status === 'awaiting_approval').length
    },
    allRequests(state) {
      return state.requests
    },
  },
  actions: {
    addRequest(request) {
      // ensure id
      const id = request.id || `REQ${Date.now()}`
      const record = { id, ...request }
      this.requests.unshift(record)
      return record
    },
    approveRequest(id) {
      const req = this.requests.find(r => r.id === id)
      if (req && req.status === 'awaiting_approval') {
        req.status = 'pending' // waiting for payment after approval
      }
      return req
    },
    rejectRequest(id, reason = '') {
      const req = this.requests.find(r => r.id === id)
      if (req && (req.status === 'awaiting_approval' || req.status === 'pending')) {
        req.status = 'rejected'
        req.rejectReason = reason
      }
      return req
    },
    markPaid(id) {
      const req = this.requests.find(r => r.id === id)
      if (req && req.status === 'pending') {
        req.status = 'completed'
        req.completeTime = new Date().toLocaleString()
      }
      return req
    },
    refresh() {
      // placeholder for future API polling
      return true
    }
  }
})


