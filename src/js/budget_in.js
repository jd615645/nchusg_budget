Highcharts.chart('budgetChart', {
  chart: {
    plotBackgroundColor: null,
    plotBorderWidth: null,
    plotShadow: false,
    type: 'pie'
  },
  title: {
    text: '2016 學生會歲入決算'
  },
  tooltip: {
    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
  },
  plotOptions: {
    pie: {
      allowPointSelect: true,
      cursor: 'pointer',
      dataLabels: {
        enabled: true,
        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
        style: {
          color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black',
          fontSize: '1.4em'
        }
      }
    }
  },
  series: [{
    colorByPoint: true,
    data: [
      {
        'name': '財務部',
        'y': 3350188
      },
      {
        'name': '學會部',
        'y': 104800
      },
      {
        'name': '生活部',
        'y': 20353
      },
      {
        'name': '活動部',
        'y': 3600
      },
      {
        'name': '學生代表大會',
        'y': 50000
      },
      {
        'name': '仲裁評議委員會',
        'y': 9999
      }
    ]
  }]
})
