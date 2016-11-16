var MAX_YEAR = 2016,
    MIN_YEAR = 2014;

var url = 'https://script.google.com/macros/s/AKfycbxzWsLrzHonUiQe9RCDhoVdcYpoU_3NuYcwi1RMBI_PN2qX6hva/exec';

var query_obj = {
  SELECT_COLUMN: [
    "款", "科", "目", "金額"
  ]
};
//
$.get(url, {query: JSON.stringify(query_obj)}, function(response){
  var inputData = response.output;
  var a = d3.nest()
            .key(function(d) { return d['款']; })
            .entries(inputData);
  console.log(a);
  d3.json(response.output, function(d){
    dataset = d.data;

    console.log(dataset, "原始資料"); //顯示原始資料

    var nodesByType = d3.nest() //轉換成巢狀架構
      .key(function(d) { return d.type; }) //回傳type
      .key(function(d) { return d.account; }) //回傳account
      .entries(dataset); //輸入的資料

    console.log(nodesByType, "基本d3.js巢狀結構轉換")
  });
});



var stroke_color = '#4993FA';
var can_buy;
var now_year = 2016;
var budgetSW = true;

var budgetJSON = {'name':  'flare', 'children': []};

$.getJSON('./data/budget_out.json', function(budgetData){
    for (var fund=0; fund<budgetData.length; fund++) {
    var totPrice = 0;
    var D3children =
      {
        'name': budgetData[fund]['fund'],
        'totPrice': 0,
        'children': []
      };
    var budgetFamily = budgetData[fund]['family'];
    for (var family=0; family<budgetFamily.length; family++) {
      var familyName = budgetFamily[family]['name'],
          budgetMesh = budgetFamily[family]['mesh'];
      var meshPrice = 0;
      var familyChild =
        {
            'name': familyName,
            'totPrice': 0,
            'children': []
        };
      // console.log({'name': familyName});

      for (var mesh=0; mesh<budgetMesh.length; mesh++) {
        // console.log(budgetMesh[mesh]);
        var meshName = budgetMesh[mesh]['name'],
            meshMoney = budgetMesh[mesh]['money'];
        meshPrice += parseInt(meshMoney);
        familyChild['children'][mesh] = ({'name': meshName, 'size': meshMoney});
      }
      familyChild['totPrice'] = meshPrice;
      // console.log(familyChild);

      totPrice += familyChild['totPrice'];
      D3children['children'][family] = familyChild;
    }
    D3children['totPrice'] = totPrice;

    // console.log(D3children);
    budgetJSON['children'][fund] = D3children;
  }
  console.log(budgetJSON);

  // d3.select(window).on('resize', rendering);

  rendering();
});

$.getJSON('./data/canBuy.json', function(data){
  can_buy = data;
});

function rendering() {

  var margin_size = 350;
  var window_size = $(window).width();
  if (window_size >= 1127) {
    margin_size = 300;
  }
  else if (window_size >= 933) {
    margin_size = 250;
  }
  else {
    margin_size = 200;
  }

  var margin = {top: margin_size, right: margin_size, bottom: margin_size, left: margin_size},
      radius = Math.min(margin.top, margin.right, margin.bottom, margin.left) - 10;
  // color
  var hue = d3.scale.category20();

  var luminance = d3.scale.sqrt()
      .domain([0, 1e6])
      .clamp(true)
      .range([90, 20]);

  var svg = d3.select('#budgetSvg').html('').append('svg')
      .attr('width', margin.left + margin.right)
      .attr('height', margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  var partition = d3.layout.partition()
      .sort(function(a, b) { return d3.ascending(a.name, b.name); })
      .size([2 * Math.PI, radius]);

  var arc = d3.svg.arc()
      .startAngle(function(d) { return d.x; })
      .endAngle(function(d) { return d.x + d.dx ; })
      .padAngle(.01)
      .padRadius(radius / 3)
      .innerRadius(function(d) { return radius / 3 * d.depth; })
      .outerRadius(function(d) { return radius / 3 * (d.depth + 1) - 1; });

  // d3.json('./data/org.json', function(error, root) {
    // Compute the initial layout on the entire tree to sum sizes.
    // Also compute the full name and fill color for each node,
    // and stash the children so they can be restored as we descend.

    // console.log(budget);
    root = budgetJSON;

    partition
        .value(function(d) { return d.size; })
        .nodes(root)
        .forEach(function(d) {
          d._children = d.children;
          d.sum = d.value;
          d.key = key(d);
          d.fill = fill(d);
        });

    // Now redefine the value function to use the previously-computed sum.
    partition
        .children(function(d, depth) { return depth < 2 ? d._children : null; })
        .value(function(d) { return d.sum; });

    var center = svg.append('circle')
        .attr('r', radius / 3)
        .on('click', zoomOut);

    center.append('title')
        .text('zoom out');

    var path = svg.selectAll('path')
        .data(partition.nodes(root).slice(1))
        .enter().append('path')
        .attr({'d': arc, 'stroke': stroke_color, 'stroke-linecap': 'butt', 'stroke-width': 0})
        .style('fill', function(d) { return d.fill; })
        .each(function(d) { this._current = updateArc(d); })
        .on('click', function(p) {
          zoomIn(p);
          clickView(p);
        })
        .on('mouseover', function(p) {
          hoverView(p);
          $(this).attr({'stroke-width': 3})
        })
        .on('mouseout', function(p) {
          $(this).attr({'stroke-width': 0})
        });

    function clickView(p) {
      // console.log(p);
      var dep = p.parent.name;
      var item = p.name;
      var price = p.size;
      $('#dep').text(dep);
      $('#item').text(item);
      $('#budget span').text('$ ' + formatPrice(price));
      $('#canBuy').text(canBuy(price));
    }

    function hoverView(p) {
      // console.log(p);
      if(typeof(p.size) !== 'undefined') {
        var dep = p.parent.name;
        var item = p.name;
        var price = p.size;
      }
      else {
        var dep = p.name;
        var item = '總金額';
        var price = p.totPrice;
      }

      $('#dep').text(dep);
      $('#item').text(item);
      $('#budget span').text('$ ' + formatPrice(price));
      $('#canBuy').text(canBuy(price));
    }

    function zoomIn(p) {
      console.log(p);
      if (p.depth > 1) p = p.parent;
      if (!p.children) return;
      zoom(p, p);
    }

    function zoomOut(p) {
      if (!p.parent) return;
      zoom(p.parent, p);
    }

    // Zoom to the specified new root.
    function zoom(root, p) {
      if (document.documentElement.__transition__) return;

      // Rescale outside angles to match the new layout.
      var enterArc,
          exitArc,
          outsideAngle = d3.scale.linear().domain([0, 2 * Math.PI]);

      function insideArc(d) {
        return p.key > d.key
            ? {depth: d.depth - 1, x: 0, dx: 0} : p.key < d.key
            ? {depth: d.depth - 1, x: 2 * Math.PI, dx: 0}
            : {depth: 0, x: 0, dx: 2 * Math.PI};
      }

      function outsideArc(d) {
        return {depth: d.depth + 1, x: outsideAngle(d.x), dx: outsideAngle(d.x + d.dx) - outsideAngle(d.x)};
      }

      center.datum(root);

      // When zooming in, arcs enter from the outside and exit to the inside.
      // Entering outside arcs start from the old layout.
      if (root === p) enterArc = outsideArc, exitArc = insideArc, outsideAngle.range([p.x, p.x + p.dx]);

      path = path.data(partition.nodes(root).slice(1), function(d) { return d.key; });

      // When zooming out, arcs enter from the inside and exit to the outside.
      // Exiting outside arcs transition to the new layout.
      if (root !== p) enterArc = insideArc, exitArc = outsideArc, outsideAngle.range([p.x, p.x + p.dx]);

      d3.transition().duration(d3.event.altKey ? 7500 : 750).each(function() {
        path.exit().transition()
            .style('fill-opacity', function(d) { return d.depth === 1 + (root === p) ? 1 : 0; })
            .attrTween('d', function(d) { return arcTween.call(this, exitArc(d)); })
            .remove();

        path.enter().append('path')
            .style('fill-opacity', function(d) { return d.depth === 2 - (root === p) ? 1 : 0; })
            .style('fill', function(d) { return d.fill; })
            .attr({'stroke': stroke_color, 'stroke-linecap': 'butt', 'stroke-width': 0})
            .on('click', function(p) {
              zoomIn(p);
              clickView(p);
            })
            .on('mouseover', function(p) {
              hoverView(p);
              $(this).attr({'stroke-width': 3})
            })
            .on('mouseout', function(p) {
              $(this).attr({'stroke-width': 0})
            })
            .each(function(d) { this._current = enterArc(d); });

        path.transition()
            .style('fill-opacity', 1)
            .attrTween('d', function(d) { return arcTween.call(this, updateArc(d)); });
      });
    }
  // });

  function key(d) {
    var k = [], p = d;
    while (p.depth) k.push(p.name), p = p.parent;
    return k.reverse().join('.');
  }

  function fill(d) {
    var p = d;
    while (p.depth > 1) p = p.parent;
    var c = d3.lab(hue(p.totPrice));
    c.l = luminance(d.sum);
    return c;
  }

  function arcTween(b) {
    var i = d3.interpolate(this._current, b);
    this._current = i(0);
    return function(t) {
      return arc(i(t));
    };
  }

  function updateArc(d) {
    return {depth: d.depth, x: d.x, dx: d.dx};
  }

  d3.select(self.frameElement).style('height', margin.top + margin.bottom + 'px');
}

function canBuy(price) {
  var randItem = Math.floor(Math.random()*(can_buy.length));
  var itemName = can_buy[randItem]['name'],
      itemPrice = can_buy[randItem]['price'],
      itemUnit = can_buy[randItem]['unit'];
  var conver = price/itemPrice;
  var fixNum = 2;
  if(conver < 1) {
    fixNum = 5;
  }
  return (conver).toFixed(fixNum) + itemUnit + itemName;
}

// ex: formatPrice(9487) -> 9,487
function formatPrice(number) {
  try {
    var num = number.toString();
    var pattern = /(-?\d+)(\d{3})/;

    while(pattern.test(num)) {
      num = num.replace(pattern, "$1,$2");
    }
    return num;
  } catch (e) {

  }
}

$('#budgetSW').click(function() {
  if (budgetSW) {
    $('#budgetSW span:nth-child(1)').hide();
    $('#budgetSW span:nth-child(2)').fadeIn();
  }
  else {
    $('#budgetSW span:nth-child(1)').fadeIn();
    $('#budgetSW span:nth-child(2)').hide();
  }
  budgetSW = !budgetSW;
})

$('#ctrlYear .left-btn').click(function() {
  if ((now_year-1) < MIN_YEAR) {
    // do nothing
  }
  else {
    now_year -= 1;
    $('#year .value').html(now_year);
  }
})
$('#ctrlYear .right-btn').click(function() {
  console.log('right');
  if ((now_year+1) > MAX_YEAR) {
    // do nothing
  }
  else {
    now_year += 1;
    $('#year .value').html(now_year);
  }
})
