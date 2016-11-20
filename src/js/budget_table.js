$(document).ready(function() {
  var $tableHead = $('#budgetTable table thead'),
      $tableBody = $('#budgetTable table tbody');
  $('#budgetMenu .item[data-tab="second"]').click(function() {
    $('#budgetTable .menu .item:first-child()').click();
  })
  $('#budgetTable .menu .item').click(function() {
    $('#budgetTable .menu .active').removeClass('active');
    $(this).addClass('active');
    var viewType = $(this).attr('view-type');

    $tableHead.empty();
    $tableBody.empty();

    switch (viewType) {
      case '1':
        table_all();
        break;
      case '2':
        table_dept();
        break;
      case '3':
        table_subject();
        break;
    }
  });
  function table_all() {
    $tableHead.html('<tr><th>款</th><th>科</th><th>目</th><th>金額</th><th>前一年差距</th></tr>');
    $.each(budgetDataJson, function(key, val) {
      var dept = val['款'],
          subject = val['科'],
          item = val['目'],
          amount= parseInt(val['金額']),
          lastMoney = parseInt(val['前年度預算']);
      var diffPrice = amount-lastMoney;

      var tableData = '<tr><td>' + dept + '</td><td>' + subject + '</td><td>' + item + '</td><td>' + amount.toLocaleString('en-US') + '</td><td>' + diffPrice.toLocaleString('en-US') + '<span class="' + diffPriceColor(diffPrice) + '">' + diffPercent(diffPrice, amount) + '</span>' + '</td>' +'  </tr>';

      $tableBody.append(tableData);
    })
  }
  function table_dept() {
    $tableHead.html('<tr><th>款別</th><th>金額</th><th>前一年差距</th></tr>');
    $.each(budgetAll['children'], function(key, val) {
      var dept = val.dept,
          label = val.label,
          amount = val.amount,
          lastMoney = val.last_amount;
      var diffPrice = amount-lastMoney;

      var tableData = '<tr><td>' + dept + '</td><td>' + amount.toLocaleString('en-US') + '</td><td>' + diffPrice.toLocaleString('en-US') + '<span class="' + diffPriceColor(diffPrice) + '">' + diffPercent(diffPrice, amount) + '</span>' + '</td>' +'  </tr>';

      $tableBody.append(tableData);
    });
  }
  function table_subject() {
    $tableHead.html('<tr><th>款</th><th>科</th><th>金額</th><th>前一年差距</th></tr>');
    $.each(budgetAll['children'], function(ik, iv) {
      $.each(iv['children'], function(jk, jv) {
        var dept = jv.dept,
            label = jv.label,
            amount = jv.amount,
            lastMoney = jv.last_amount;
        var diffPrice = amount-lastMoney;

        var tableData = '<tr><td>' + dept + '</td><td>' + label + '</td><td>' + amount.toLocaleString('en-US') + '</td><td>' + diffPrice.toLocaleString('en-US') + '<span class="' + diffPriceColor(diffPrice) + '">' + diffPercent(diffPrice, amount) + '</span>' + '</td>' +'  </tr>';

        $tableBody.append(tableData);
      })
    })
  }

  function diffPercent(diffPrice, amount) {
    var prefix = '';
    if (diffPrice < 0) {
      num = num*-1;
      prefix = '-';
    }
    else if (diffPrice > 0) {
      prefix = '+';
    }

    var diffPercent = ' ' + prefix + (diffPrice/amount*100).toFixed(2) + '%';

    return ' (' + diffPercent + ')';
  }
  function diffPriceColor(diffPrice) {
    if (diffPrice > 0) {
      return 'upper';
    }
    else if (diffPrice < 0) {
      return 'lower';
    }
    else {
      return '';
    }
  }

});
