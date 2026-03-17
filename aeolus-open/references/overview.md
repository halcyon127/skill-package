# 外部版资源概念概览

## 资源层级

- `dashboard` 是仪表盘容器，保存仪表盘级元信息。
- `dashboardSheet` 是仪表盘页面；一个 dashboard 可以包含多个 sheet。
- `chart` 是图表资源，通常绑定一个 `dataset`。
- `dataset` 是图表查询依赖的数据集定义。

## 外部版关注点

外部版 CLI 只覆盖“查找资源”和“拉取本地 JSON”：

1. 用 `search` 找到 dashboard / chart / dataset 的 ID。
2. 用 `pull` 把远端资源落到本地 `app/<appId>/...`。
3. 在本地阅读 JSON，理解资源结构和依赖关系。

## 拉取后的常见文件

- Dashboard: `app/<appId>/dashboard/<dashboardId>/dashboard.json`
- Sheet: `app/<appId>/dashboard/<dashboardId>/sheet/<sheetId>.json`
- Chart: `app/<appId>/chart/<chartId>.json`
- Dataset: `app/<appId>/dataset/<datasetId>.json`

## 使用边界

外部版不提供资源创建、回写同步或查询执行能力。涉及修改远端资源时，需要切换到内部全量版 CLI。
