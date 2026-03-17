# Aeolus Open Commands Reference

This reference mirrors the CLI help and current command behavior exposed by the external `aeolus-open` package.

## Overview

`aeolus-open` provides these command families:

- `config`: save host/token config in the workspace root
- `search`: find datasets, charts, and dashboards by keyword
- `pull`: fetch remote resources into local JSON files

## Global Behavior

- Help:
  - `aeolus-open --help`
  - `aeolus-open <command> --help`
- Version:
  - `aeolus-open --version`
  - `aeolus-open -v`
- Global config flags accepted by `search` and `pull`:
  - `--host <host>` or `--host=<host>`
  - `--token <token>` or `--token=<token>`
- `--host/--token` update workspace-root `.aeolus/config.json` before `search` or `pull` logic runs.

## Common Local File Layout

- Dashboard: `app/<appId>/dashboard/<dashboardId>/dashboard.json`
- Dashboard sheet: `app/<appId>/dashboard/<dashboardId>/sheet/<sheetId>.json`
- Chart: `app/<appId>/chart/<chartId>.json`
- Dataset: `app/<appId>/dataset/<datasetId>.json`

Working-directory note:

- When running from workspace root, saved resources are resolved by searching `app/*`.
- When running inside `app/<appId>`, the current app workspace is used directly.

## `config`

### Purpose

Save host/token config into the current workspace before remote reads.

### Usage

```bash
aeolus-open config --host <host>
aeolus-open config --token <token>
aeolus-open config --host <host> --token <token>
```

### Options

- `--host <host>`: API host
- `--token <token>`: API token

### Output

Prints:

```text
config saved: <absolute-config-path>
```

## `search`

### Purpose

Look up datasets, charts, and dashboards by keyword before deciding what to pull.

### Usage

```bash
aeolus-open search <keyword> [--type <type>] [--offset <offset>] [--limit <limit>]
aeolus-open search --keyword <keyword> [--type <type>] [--offset <offset>] [--limit <limit>]
```

### Options

- `--keyword <keyword>`: explicit keyword string
- `--type <type>`: search type filter; supported values are `dataset`, `chart`, `dashboard`; may be repeated
- `--offset <offset>`: pagination offset, default `0`
- `--limit <limit>`: pagination size, default `20`

### Output

Prints a `SEARCHED` block:

```text
SEARCHED
QUERY <query>
TYPES <comma-separated-types>
OFFSET <offset>
LIMIT <limit>
RESULT_COUNT <count>
TOTAL <total>
```

Each result appends:

```text
RESOURCE <type>/<id>
NAME <display-name>
APP_ID <app-id-if-available>
APP <app-name-if-available>
LAST_VISITED_TIME <timestamp-if-available>
```

## `pull`

### Purpose

Fetch remote resources into local JSON files so the workspace has the latest readable source.

### Usage

```bash
aeolus-open pull dashboard/<dashboardId>
aeolus-open pull dashboard/<dashboardId>/sheet/<sheetId>
aeolus-open pull chart/<chartId>
aeolus-open pull dataset/<datasetId>
```

### Supported targets

- `dashboard/<dashboardId>`
- `dashboard/<dashboardId>/sheet/<sheetId>`
- `chart/<chartId>`
- `dataset/<datasetId>`

### Output

Prints `FETCHED`, followed by one or more resource blocks:

```text
FETCHED

RESOURCE <resource-path>
LOCAL_URI <absolute-path>
REMOTE_URI <remote-resource-url>
```

### Behavior notes

- `dashboard/<dashboardId>` fetches dashboard, sheets, charts, and datasets in that dashboard.
- `dashboard/<dashboardId>/sheet/<sheetId>` fetches the sheet plus charts and datasets used by that sheet.
- `chart/<chartId>` fetches the chart and its dataset together.
- `dataset/<datasetId>` fetches only the dataset.

## Examples

```bash
aeolus-open config --host <host> --token <your-token>
aeolus-open search "revenue" --type chart
aeolus-open pull dashboard/12345
aeolus-open pull dashboard/12345/sheet/67890
aeolus-open pull chart/999
aeolus-open pull dataset/555
```
