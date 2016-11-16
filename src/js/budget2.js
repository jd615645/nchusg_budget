$(document).ready(function() {
  var sheetKey = 'AKfycbxzWsLrzHonUiQe9RCDhoVdcYpoU_3NuYcwi1RMBI_PN2qX6hva';
  var url = 'https://script.google.com/macros/s/' + sheetKey + '/exec';

  var query_obj = {
    SELECT_COLUMN: [
      "款", "科", "目", "金額"
    ]
  };
  var budgetAll = {'label': '總預算', 'amount': 0, 'children': []};

  var budgetData = [];
  $.get(url, {query: JSON.stringify(query_obj)}, function(response) {
    var inputData = response.output;

    // 將budget data做巢狀結構
    $.each(inputData, function(key, val) {
      var dept = val['款'],
          money= parseInt(val['金額']);
      var deptIndex = _.findIndex(budgetData, {'label': dept});

      // 計算總金額
      budgetAll['amount'] += money;

      if (deptIndex == -1) {
        budgetData.push({'label': dept, 'amount': 0, 'children': []});
        deptIndex = _.findIndex(budgetData, {'label': dept});
      }
      budgetData[deptIndex]['amount'] += money;
      budgetData[deptIndex]['children'].push(val);
    });
    // 將budget data做巢狀結構
    $.each(budgetData, function(ik, iv) {
      var subjectData = [];
      $.each(iv['children'], function(jk, jv) {
        var dept = jv['款'],
            subject = jv['科'],
            item = jv['目'],
            money= parseInt(jv['金額']);
        var subjectIndex = _.findIndex(subjectData, {'label': subject});

        // 計算各部門金額
        budgetData[ik]['amount'] += money;
        if (subjectIndex == -1) {
          subjectData.push({'label': subject, 'amount': 0, 'children': []});
          subjectIndex = _.findIndex(subjectData, {'label': subject});
        }
        // console.log(subjectData);
        subjectData[subjectIndex]['amount'] += money;
        var itemData =
        {
          'label': item,
          'amount': money
        };
        subjectData[subjectIndex]['children'].push(itemData);
      });
      budgetData[ik]['children'] = subjectData;
    });


    budgetAll['children'] = budgetData;
    // console.log(JSON.stringify(budgetAll));
    console.log(budgetAll);
    new BubbleTree({
      data: budgetAll,
      container: '.bubbletree'
    });
  });
})
