$(document).ready(function() {
  var $tableHead = $('#budgetTable table thead'),
      $tableBody = $('#budgetTable table tbody');
  $('#budgetMenu .item[data-tab="second"]').click(function() {
    $('#budgetTable .menu .item:first-child()').click();
  })

  function showTable() {
    var keyword = $('#searchInput input').val();
    var viewType = $('#budgetTable .menu .active').attr('view-type');

    clearTable();

    switch (viewType) {
      case '1':
        table_all(keyword);
        break;
      case '2':
        table_dept(keyword);
        break;
      case '3':
        table_subject(keyword);
        break;
    }
  }

  $('#budgetTable .menu .item').click(function() {
    $('#budgetTable .menu .active').removeClass('active');
    $(this).addClass('active');
    showTable();
  });

  $('#searchInput')
    .on('click', 'button', function() {
      showTable();
      $('#searchInput input').val('');
    })
    .keypress(function(event) {

      if(event.which == 13) {
        showTable();
        $('#searchInput input').val('');
      }
    });

  function table_all(keyword) {
    $tableHead.html('<tr><th>款</th><th>科</th><th>目</th><th>金額</th><th>前一年差距</th></tr>');
    $.each(budgetDataJson, function(key, val) {
      var dept = val['款'],
          subject = val['科'],
          item = val['目'],
          amount= parseInt(val['金額']),
          lastMoney = parseInt(val['前年度預算']);
      var diffPrice = amount-lastMoney;

      var tableData = '<tr><td>' + dept + '</td><td>' + subject + '</td><td>' + item + '</td><td>' + amount.toLocaleString('en-US') + '</td><td>' + diffPrice.toLocaleString('en-US') + '<span class="' + diffPriceColor(diffPrice) + '">' + diffPercent(diffPrice, amount) + '</span>' + '</td>' +'  </tr>';

      if(keyword != '') {
        if (haveKeyword(dept, subject, item, keyword)) {
          $tableBody.append(tableData);
        }
      }
      else {
        // if no keyword input
        $tableBody.append(tableData);
      }
    })
  }
  function table_dept(keyword) {
    $tableHead.html('<tr><th>款別</th><th>金額</th><th>前一年差距</th></tr>');
    $.each(budgetAll['children'], function(key, val) {
      var dept = val.dept,
          subject = '',
          item = '',
          amount = val.amount,
          lastMoney = val.last_amount;
      var diffPrice = amount-lastMoney;

      var tableData = '<tr><td>' + dept + '</td><td>' + amount.toLocaleString('en-US') + '</td><td>' + diffPrice.toLocaleString('en-US') + '<span class="' + diffPriceColor(diffPrice) + '">' + diffPercent(diffPrice, amount) + '</span>' + '</td>' +'  </tr>';

      if(keyword != '') {
        if (haveKeyword(dept, subject, item, keyword)) {
          $tableBody.append(tableData);
        }
      }
      else {
        $tableBody.append(tableData);
      }
    });
  }
  function table_subject(keyword) {
    $tableHead.html('<tr><th>款</th><th>科</th><th>金額</th><th>前一年差距</th></tr>');
    $.each(budgetAll['children'], function(ik, iv) {
      $.each(iv['children'], function(jk, jv) {
        var dept = jv.dept,
            subject = jv.label,
            item = '',
            amount = jv.amount,
            lastMoney = jv.last_amount;
        var diffPrice = amount-lastMoney;

        var tableData = '<tr><td>' + dept + '</td><td>' + subject + '</td><td>' + amount.toLocaleString('en-US') + '</td><td>' + diffPrice.toLocaleString('en-US') + '<span class="' + diffPriceColor(diffPrice) + '">' + diffPercent(diffPrice, amount) + '</span>' + '</td>' +'  </tr>';

        if(keyword != '') {
          if (haveKeyword(dept, subject, item, keyword)) {
            $tableBody.append(tableData);
          }
        }
        else {
          $tableBody.append(tableData);
        }
      })
    })
  }

  function haveKeyword(dept, subject, item, keyword) {
    if ((dept.search(keyword) != -1) || (subject.search(keyword) != -1) || (item.search(keyword) != -1)) {
      return true;
    }
    return false;
  }

  function diffPercent(diffPrice, amount) {
    var prefix = '';
    if (amount == 0) {
      return '';
    }
    if (diffPrice < 0) {
      amount = amount*-1;
      prefix = '-';
    }
    else if (diffPrice > 0) {
      prefix = '+';
    }


    var diffPercent = prefix + (diffPrice/amount*100).toFixed(2) + '%';

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
  function clearTable() {
    $tableHead.empty();
    $tableBody.empty();
  }
});
