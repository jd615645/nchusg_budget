#coding=utf-8

import requests
import json

sheet_src = '1MwsZOkzJpJJKMHpL2Tlv5IUzPHnQ40OP16vzHydfvmQ'
url = 'https://spreadsheets.google.com/feeds/list/' + sheet_src + '/1/public/values?alt=json'

budget = []
fund = ''
familyName = ''
family = []
mesh = []

oldFund = ''
oldFamily = ''

sheetData = requests.get(url).json()
for budgetData in sheetData['feed']['entry']:
  fundCol = budgetData['gsx$款']['$t']
  familyCol = budgetData['gsx$科']['$t']
  meshCol = budgetData['gsx$目']['$t']
  moneyCol = budgetData['gsx$金額']['$t']

  if (fundCol != ''):
    # 新部門資料input
    fund = fundCol

    if(oldFund == ''):
      oldFund = fund

    if(fund != oldFund):
      budget.append({'fund': oldFund, 'family': family})
      family = []
      oldFund = fund

  if(familyCol != ''):
    # 新科資料input
    familyName = familyCol

    if(oldFamily == ''):
      oldFamily = familyName

    if(familyName != oldFamily):
      family.append({'name': familyName, 'mesh': mesh})
      mesh = []
      oldFamily = familyName

  mesh.append({'name': meshCol, 'money': moneyCol})


with open('budget_out.json', 'w') as f:
  json.dump(budget, f)
