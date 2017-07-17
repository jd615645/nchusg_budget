var vm = new Vue({
  el: '#app',
  data() {
    return {
      budget: [],
      active: 0,
      table_all: [],
      table_dept: [],
      table_subject: [],
      budgetData: [],
      keyword: ''
    }
  },
  computed: {
    titles() {
      let title = [['款', '科', '目', '決算金額'], ['款別', '決算金額'], ['款', '科', '決算金額']]
      return title[this.active]
    },
  tableAll() {
    if (this.keyword !== '') {
      let filter = []
      _.each(this.table_all, (val) => {
        if (this.haveKeyword(val.dept, val.subject, val.item, this.keyword)) {
          filter.push(val)
        }
      })
      return filter
    }else {
      return this.table_all
    }
  },
  tableDept() {
    if (this.keyword !== '') {
      let filter = []
      _.each(this.table_all, (val) => {
        if (this.haveKeyword(val.dept, '', '', this.keyword)) {
          filter.push(val)
        }
      })
      return filter
    }else {
      return this.table_dept
    }
  },
  tableSubject() {
    if (this.keyword !== '') {
      let filter = []
      _.each(this.table_all, (val) => {
        if (this.haveKeyword(val.dept, val.subject, '', this.keyword)) {
          filter.push(val)
        }
      })
      return filter
    }else {
      return this.table_all
    }
  }
  },
  mounted() {
    $.getJSON('./data/budgetAll_out.json').success((data) => {
      this.budget = data

      // 將budget data做巢狀結構
      _.each(data, (val) => {
        let dept = val['款']
        let money = parseInt(val['決算'])

        let deptIndex = _.findIndex(this.budgetData, {'label': dept})

        if (deptIndex === -1) {
          this.budgetData.push({'dept': dept, 'label': dept, 'amount': 0, 'children': []})
          deptIndex = _.findIndex(this.budgetData, {'label': dept})
        }
        this.budgetData[deptIndex]['amount'] += money
        this.budgetData[deptIndex]['children'].push(val)
      })
      $.each(this.budgetData, (ik, iv) => {
        let subjectData = []
        $.each(iv['children'], (jk, jv) => {
          let dept = jv['款']
          let subject = jv['科']
          let item = jv['目']
          let money = parseInt(jv['決算'])

          var subjectIndex = _.findIndex(subjectData, {'dept': dept, 'label': subject})

          if (subjectIndex === -1) {
            subjectData.push({'dept': dept, 'label': subject, 'amount': 0, 'children': []})
            subjectIndex = _.findIndex(subjectData, {'label': subject})
          }
          subjectData[subjectIndex]['amount'] += money

          var itemData = {
            'dept': dept,
            'subject': subject,
            'label': item,
            'amount': money
          }
          subjectData[subjectIndex]['children'].push(itemData)
        })
        this.budgetData[ik]['children'] = subjectData
      })
    }).then((data) => {
      _.each(data, (val) => {
        let dept = val['款']
        let subject = val['科']
        let item = val['目']
        let amount = _.parseInt(val['決算'])

        this.table_all.push({
          dept: dept,
          subject: subject,
          item: item,
          amount: amount.toLocaleString('en-US')
        })
      })
      _.each(this.budgetData, (val) => {
        let dept = val.dept
        let amount = val.amount

        this.table_dept.push({
          dept: dept,
          amount: amount.toLocaleString('en-US')
        })
      })

      _.each(this.budgetData, (iv, ik) => {
        _.each(iv['children'], (jv, jk) => {
          let dept = jv.dept
          let subject = jv.label
          let amount = jv.amount

          this.table_subject.push({
            dept: dept,
            subject: subject,
            amount: amount.toLocaleString('en-US')
          })
        })
      })
    })
  },
  methods: {
    haveKeyword(dept, subject, item, keyword) {
      if ((dept.search(keyword) != -1) || (subject.search(keyword) != -1) || (item.search(keyword) != -1)) {
        return true
      }
      return false
    }
  }
})
