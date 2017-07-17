$(document).ready(function () {
  var YEAR = 2016

  var deptColor =
  [
    '#86d4bd', '#9cec93', '#9adabe', '#8bd49c', '#bfe5ac',
    '#52c7a7', '#7bd0b0', '#8fd6b8', '#7ed097', '#aadd9c',
    '#aadd9c', '#c6e6a1', '#00b790', '#49c59f'
  ]
  var query_obj = {
    SELECT_COLUMN: [
      '款', '科', '目', '金額', '與預算差額', '備註'
    ]
  }
  window.budgetOutAll = {'dept': '總決算','label': '總決算', 'amount': 0, 'last_amount': 0, 'budget': 0, 'children': []}

  var can_buy

  var budgetData = []
  $.getJSON('./data/canBuy.json', function (data) {
    can_buy = data
  })
  $.get('./data/budget_out.json', function (response) {
    window.budgetOutDataJson = response

    // 將budget data做巢狀結構
    $.each(budgetOutDataJson, function (key, val) {
      var dept = val['款']
      var money = parseInt(val['金額'])
      var lastMoney = parseInt(val['與預算差額'])
      var detail = val['備註']

      // console.log(val)
      var deptIndex = _.findIndex(budgetData, {'label': dept})

      // 計算總金額
      budgetOutAll['amount'] += money
      if (money === 87) {
        budgetOutAll['budget'] += 0
      }else {
        budgetOutAll['budget'] += money
      }
      budgetOutAll['last_amount'] += lastMoney

      if (deptIndex == -1) {
        budgetData.push({'dept': dept, 'label': dept, 'amount': 0, 'last_amount': 0, 'budget': 0, 'children': [], 'color': '', 'detail': detail})
        deptIndex = _.findIndex(budgetData, {'label': dept})
        budgetData[deptIndex]['color'] = deptColor[deptIndex]
      }
      budgetData[deptIndex]['amount'] += money
      if (money === 87) {
        budgetData[deptIndex]['budget'] += 0
      }else {
        budgetData[deptIndex]['budget'] += money
      }
      budgetData[deptIndex]['last_amount'] += lastMoney
      budgetData[deptIndex]['children'].push(val)
    })

    // 將budget data做巢狀結構
    $.each(budgetData, function (ik, iv) {
      var subjectData = []
      $.each(iv['children'], function (jk, jv) {
        var dept = jv['款']
        var subject = jv['科']
        var item = jv['目']
        var money = parseInt(jv['金額'])
        var lastMoney = parseInt(jv['與預算差額'])
        var detail = jv['備註']

        var subjectIndex = _.findIndex(subjectData, {'dept': dept, 'label': subject})

        if (subjectIndex == -1) {
          subjectData.push({'dept': dept, 'label': subject, 'amount': 0, 'last_amount': 0, 'budget': 0, 'children': [], 'detail': detail})
          subjectIndex = _.findIndex(subjectData, {'label': subject})
        }
        subjectData[subjectIndex]['amount'] += money
        if (money === 87) {
          subjectData[subjectIndex]['budget'] += 0
        }else {
          subjectData[subjectIndex]['budget'] += money
        }
        subjectData[subjectIndex]['last_amount'] += lastMoney

        var tempMoney = money
        if (tempMoney === 87) {
          tempMoney = 0
        }
        var itemData =
        {
          'dept': dept,
          'subject': subject,
          'label': item,
          'amount': money,
          'last_amount': lastMoney,
          'budget': tempMoney,
          'detail': detail
        }
        subjectData[subjectIndex]['children'].push(itemData)
      })
      budgetData[ik]['children'] = subjectData
    })

    var onNodeClick = function (node) {
      var dept = node.dept
      var label = node.label
      var subject = node.subject
      var amount = node.amount
      var last_amount = node.last_amount
      var budget = node.budget

      var deptHeader = dept
      var prefix = '+'
      var diffPrice = budget - last_amount
      if (diffPrice < 0) {
        prefix = '-'
        diffPrice = Math.abs(diffPrice)
      }
      var diffPercent = ' ' + prefix + (diffPrice / budget * 100).toFixed(2) + '%'

      if (subject !== undefined) {
        deptHeader += (' > ' + subject)
      }
      if (dept != label) {
        deptHeader += (' > ' + label)
      }

      $('#budgetList li').remove()
      $('#budgetList').hide()
      if (node.children.length === 1) {
        let children = node['children'][0]['children']
        _.each(children, function (val) {
          $('#budgetList').append('<li>' + val.label + '</li>')
        })
        $('#budgetList').show()
      }

      $('#deptHeaderOut').text(deptHeader)
      $('#amountOut').text(' ' + formatNumber(budget))
      $('#lastAmountOut').text(' ' + formatNumber(last_amount))
      $('#diffPercentOut').text(diffPercent)
      if (budget !== 0) {
        $('#canBuyOut').show()
        $('#canBuyOut').text(canBuy(budget))
      }else {
        $('#canBuyOut').hide()
      }

      $('.bubbletree-amount').each(function () {
        if ($(this).html() === '87') {
          $(this).html('0')
        }
      })

      // reload FB SDK
      $('.fb-comments').attr('data-href', 'http://budget.sakamoto.com.tw/out-' + YEAR + label)
      FB.XFBML.parse()
    }

    function canBuy (price) {
      var randItem = Math.floor(Math.random() * (can_buy.length))
      var itemName = can_buy[randItem]['name']
      var itemPrice = can_buy[randItem]['price']
      var itemUnit = can_buy[randItem]['unit']
      if (price <= 1) {
        return ''
      }else {
        var conver = price / itemPrice
        var fixNum = 2
        if (conver == 0) {
          fixNum = 0
        }
        conver = (conver).toFixed(fixNum)
        return '約為 ' + formatNumber(conver) + itemUnit + ' ' + itemName
      }
    }

    // copy from bubbletree.js
    function formatNumber (num) {
      var prefix = ''
      if (num < 0) {
        num = num * -1
        prefix = '-'
      }
      if (num >= 10000) return prefix + Math.round(num / 1000) / 10 + ' 萬'
      if (num >= 1000) return prefix + Math.round(num / 100) / 10 + ' 千'
      else return prefix + num
    }

    budgetOutAll['children'] = budgetData

    // view all budget data
    // console.log(budgetOutAll)
    new BubbleTree({
      data: budgetOutAll,
      container: '.bubbletree',
      nodeClickCallback: onNodeClick,
      firstNodeCallback: onNodeClick
    })
  })
})
