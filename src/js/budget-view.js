$(document).ready(function() {
  var YEAR = 2016;
  var sheetKey = 'AKfycbxzWsLrzHonUiQe9RCDhoVdcYpoU_3NuYcwi1RMBI_PN2qX6hva';
  var url = 'https://script.google.com/macros/s/' + sheetKey + '/exec';
  var deptColor =
  [
    '#6C7A89', '#6C7A89', '#6C7A89', '#6C7A89', '#6C7A89',
    '#6C7A89', '#6C7A89', '#6C7A89', '#6C7A89', '#6C7A89',
    '#6C7A89', '#6C7A89', '#6C7A89', '#6C7A89'
  ]
  var query_obj = {
    SELECT_COLUMN: [
      "款", "科", "目", "金額", "前年度預算"
    ]
  };
  window.budgetAll = {'dept': '總預算','label': '總預算', 'amount': 0, 'last_amount': 0, 'children': []};

  var can_buy;

  var budgetData = [];
  $.getJSON('./data/canBuy.json', function(data){
    can_buy = data;
  });
  $.get('./data/budget.json', function(response) {
    window.budgetDataJson = response;
  // $.get(url, {query: JSON.stringify(query_obj)}, function(response) {
  //   var budgetDataJson = response.output;
  //   console.log(JSON.stringify(budgetDataJson));

    // 將budget data做巢狀結構
    $.each(budgetDataJson, function(key, val) {
      var dept = val['款'],
          money= parseInt(val['金額']),
          lastMoney = parseInt(val['前年度預算']);
      var deptIndex = _.findIndex(budgetData, {'label': dept});

      // 計算總金額
      budgetAll['amount'] += money;
      budgetAll['last_amount'] += lastMoney;

      if (deptIndex == -1) {
        budgetData.push({'dept': dept, 'label': dept, 'amount': 0, 'last_amount': 0, 'children': [], 'color': ''});
        deptIndex = _.findIndex(budgetData, {'label': dept});
        budgetData[deptIndex]['color'] = deptColor[deptIndex];
      }
      budgetData[deptIndex]['amount'] += money;
      budgetData[deptIndex]['last_amount'] += lastMoney;
      budgetData[deptIndex]['children'].push(val);
    });
    // 將budget data做巢狀結構
    $.each(budgetData, function(ik, iv) {
      var subjectData = [];
      $.each(iv['children'], function(jk, jv) {
        var dept = jv['款'],
            subject = jv['科'],
            item = jv['目'],
            money= parseInt(jv['金額']),
            lastMoney = parseInt(jv['前年度預算']);
        var subjectIndex = _.findIndex(subjectData, {'dept': dept, 'label': subject});

        // 計算各部門金額
        budgetData[ik]['amount'] += money;
        budgetData[ik]['last_amount'] += lastMoney;
        if (subjectIndex == -1) {
          subjectData.push({'dept': dept, 'label': subject, 'amount': 0, 'last_amount': 0, 'children': []});
          subjectIndex = _.findIndex(subjectData, {'label': subject});
        }
        subjectData[subjectIndex]['amount'] += money;
        subjectData[subjectIndex]['last_amount'] += lastMoney;

        var itemData =
        {
          'dept': dept,
          'subject': subject,
          'label': item,
          'amount': money,
          'last_amount': lastMoney
        };
        subjectData[subjectIndex]['children'].push(itemData);
      });
      budgetData[ik]['children'] = subjectData;
    });

    var onNodeClick = function(node) {
      var dept = node.dept,
          label = node.label,
          subject = node.subject,
          amount = node.amount,
          last_amount = node.last_amount;

      var deptHeader = dept;
      var prefix = '+';
      var diffPrice = amount - last_amount;
      if (diffPrice < 0) {
        prefix = '-';
        diffPrice = Math.abs(diffPrice);
      }
      var diffPercent = ' ' + prefix + (diffPrice/amount*100).toFixed(2) + '%';

      if (subject !== undefined) {
        deptHeader += (' > ' + subject);
      }
      if (dept != label) {
        deptHeader += (' > ' + label);
      }

      $('#deptHeader').text(deptHeader);
      $('#amount').text(' ' + formatNumber(amount));
      $('#lastAmount').text(' ' + formatNumber(last_amount));
      $('#diffPercent').text(diffPercent);
      $('#canBuy').text(canBuy(amount));

      // reload FB SDK
      $('.fb-comments').attr('data-href', 'http://budget.sakamoto.com.tw/' + YEAR + label);
      FB.XFBML.parse();
    };

    function canBuy(price) {
      var randItem = Math.floor(Math.random()*(can_buy.length));
      var itemName = can_buy[randItem]['name'],
          itemPrice = can_buy[randItem]['price'],
          itemUnit = can_buy[randItem]['unit'];
      if (price <= 1) {
        return '';
      }
      else {
        var conver = price/itemPrice;
        var fixNum = 2;
        if (conver == 0) {
          fixNum = 0;
        }
        conver = (conver).toFixed(fixNum);
        return formatNumber(conver) + itemUnit + ' ' + itemName;
      }
    }

    // copy from bubbletree.js
    function formatNumber(num) {
      var prefix = '';
      if (num < 0) {
        num = num*-1;
        prefix = '-';
      }
      if (num >= 10000) return prefix+Math.round(num / 1000)/10 + ' 萬';
      if (num >= 1000) return prefix+Math.round(num / 100)/10 + ' 千';
      else return prefix+num;
    }

    budgetAll['children'] = budgetData;

    // view all budget data
    // console.log(budgetAll);
    new BubbleTree({
      data: budgetAll,
      container: '.bubbletree',
      nodeClickCallback: onNodeClick,
      firstNodeCallback: onNodeClick
    });
  });
})
