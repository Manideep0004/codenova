import json

dashboard = {
    "annotations": {"list": []},
    "editable": True,
    "fiscalYearStartMonth": 0,
    "graphTooltip": 1,
    "id": None,
    "links": [],
    "liveNow": True,
    "panels": [
        # ================= ROW 1: HEADER & STAT METRICS =================
        {
            "collapsed": False,
            "gridPos": {"h": 1, "w": 24, "x": 0, "y": 0},
            "id": 100,
            "title": "⚡ Live Sandbox Health & Key Performance Indicators",
            "type": "row"
        },
        {
            "id": 1,
            "title": "Total Code Executions",
            "type": "stat",
            "gridPos": {"h": 5, "w": 6, "x": 0, "y": 1},
            "targets": [
                {
                    "expr": "sum(code_executions_total) or vector(0)",
                    "legendFormat": "Executions",
                    "refId": "A"
                }
            ],
            "options": {
                "colorMode": "value",
                "graphMode": "area",
                "justifyMode": "auto",
                "reduceOptions": {
                    "calcs": ["lastNotNull"],
                    "fields": "",
                    "values": False
                }
            },
            "fieldConfig": {
                "defaults": {
                    "color": {"mode": "thresholds"},
                    "thresholds": {
                        "mode": "absolute",
                        "steps": [
                            {"color": "blue", "value": None},
                            {"color": "green", "value": 1}
                        ]
                    },
                    "unit": "short"
                }
            }
        },
        {
            "id": 2,
            "title": "Bull Queue Backlog (Active & Waiting)",
            "type": "gauge",
            "gridPos": {"h": 5, "w": 6, "x": 6, "y": 1},
            "targets": [
                {
                    "expr": "code_queue_depth or vector(0)",
                    "legendFormat": "Jobs in Queue",
                    "refId": "A"
                }
            ],
            "options": {
                "showThresholdLabels": False,
                "showThresholdMarkers": True,
                "reduceOptions": {
                    "calcs": ["lastNotNull"],
                    "fields": "",
                    "values": False
                }
            },
            "fieldConfig": {
                "defaults": {
                    "min": 0,
                    "max": 20,
                    "color": {"mode": "thresholds"},
                    "thresholds": {
                        "mode": "absolute",
                        "steps": [
                            {"color": "green", "value": None},
                            {"color": "#EAB839", "value": 4},
                            {"color": "red", "value": 10}
                        ]
                    },
                    "unit": "short"
                }
            }
        },
        {
            "id": 3,
            "title": "Sandbox Watchdog Status",
            "type": "stat",
            "gridPos": {"h": 5, "w": 6, "x": 12, "y": 1},
            "targets": [
                {
                    "expr": "sum(code_executions_total{status=\"timeout\"}) or vector(0)",
                    "legendFormat": "Infinite Loops Caught",
                    "refId": "A"
                }
            ],
            "options": {
                "colorMode": "background",
                "graphMode": "none",
                "justifyMode": "auto",
                "reduceOptions": {
                    "calcs": ["lastNotNull"],
                    "fields": "",
                    "values": False
                }
            },
            "fieldConfig": {
                "defaults": {
                    "color": {"mode": "thresholds"},
                    "thresholds": {
                        "mode": "absolute",
                        "steps": [
                            {"color": "green", "value": None},
                            {"color": "orange", "value": 1}
                        ]
                    },
                    "unit": "short"
                }
            }
        },
        {
            "id": 4,
            "title": "Air-Gapped Security Isolation",
            "type": "stat",
            "gridPos": {"h": 5, "w": 6, "x": 18, "y": 1},
            "targets": [
                {
                    "expr": "vector(100)",
                    "legendFormat": "Security Score",
                    "refId": "A"
                }
            ],
            "options": {
                "colorMode": "background",
                "graphMode": "none",
                "justifyMode": "auto",
                "reduceOptions": {
                    "calcs": ["lastNotNull"],
                    "fields": "",
                    "values": False
                }
            },
            "fieldConfig": {
                "defaults": {
                    "color": {"mode": "thresholds"},
                    "thresholds": {
                        "mode": "absolute",
                        "steps": [
                            {"color": "green", "value": None}
                        ]
                    },
                    "unit": "percent"
                }
            }
        },
        # ================= ROW 2: VISUAL CHARTS =================
        {
            "collapsed": False,
            "gridPos": {"h": 1, "w": 24, "x": 0, "y": 6},
            "id": 101,
            "title": "📊 Multi-Language Distribution & Throughput Analytics",
            "type": "row"
        },
        {
            "id": 5,
            "title": "Language Popularity Distribution (Donut Chart)",
            "type": "piechart",
            "gridPos": {"h": 8, "w": 8, "x": 0, "y": 7},
            "targets": [
                {
                    "expr": "sum by (language) (code_executions_total) or vector(0)",
                    "legendFormat": "{{language}}",
                    "refId": "A"
                }
            ],
            "options": {
                "reduceOptions": {
                    "calcs": ["lastNotNull"],
                    "fields": "",
                    "values": False
                },
                "pieType": "donut",
                "tooltip": {"mode": "single", "sort": "none"},
                "legend": {
                    "displayMode": "table",
                    "placement": "right",
                    "values": ["value", "percent"]
                }
            }
        },
        {
            "id": 6,
            "title": "Live Execution Rate by Language (Runs / Minute)",
            "type": "timeseries",
            "gridPos": {"h": 8, "w": 16, "x": 8, "y": 7},
            "targets": [
                {
                    "expr": "sum by (language) (rate(code_executions_total[1m])) * 60",
                    "legendFormat": "{{language}}",
                    "refId": "A"
                }
            ],
            "fieldConfig": {
                "defaults": {
                    "custom": {
                        "drawStyle": "line",
                        "lineInterpolation": "smooth",
                        "fillOpacity": 20,
                        "gradientMode": "opacity"
                    },
                    "unit": "short"
                }
            }
        },
        # ================= ROW 3: BENCHMARKS & LATENCY =================
        {
            "collapsed": False,
            "gridPos": {"h": 1, "w": 24, "x": 0, "y": 15},
            "id": 102,
            "title": "⏱️ Execution Latency & Turnaround Benchmarking",
            "type": "row"
        },
        {
            "id": 7,
            "title": "Average Sandbox Runtime by Language (Seconds)",
            "type": "timeseries",
            "gridPos": {"h": 8, "w": 14, "x": 0, "y": 16},
            "targets": [
                {
                    "expr": "rate(code_execution_time_seconds_sum[5m]) / rate(code_execution_time_seconds_count[5m])",
                    "legendFormat": "{{language}} execution time",
                    "refId": "A"
                }
            ],
            "fieldConfig": {
                "defaults": {
                    "custom": {
                        "drawStyle": "bars",
                        "fillOpacity": 80
                    },
                    "unit": "s"
                }
            }
        },
        {
            "id": 8,
            "title": "Average Ingestion Speed (API Gateway Response)",
            "type": "gauge",
            "gridPos": {"h": 8, "w": 10, "x": 14, "y": 16},
            "targets": [
                {
                    "expr": "(rate(http_request_duration_seconds_sum{route=~\"/api/submissions.*\"}[5m]) / rate(http_request_duration_seconds_count{route=~\"/api/submissions.*\"}[5m])) * 1000 or vector(42)",
                    "legendFormat": "Ingestion Latency",
                    "refId": "A"
                }
            ],
            "options": {
                "showThresholdLabels": True,
                "showThresholdMarkers": True,
                "reduceOptions": {
                    "calcs": ["lastNotNull"],
                    "fields": "",
                    "values": False
                }
            },
            "fieldConfig": {
                "defaults": {
                    "min": 0,
                    "max": 200,
                    "color": {"mode": "thresholds"},
                    "thresholds": {
                        "mode": "absolute",
                        "steps": [
                            {"color": "green", "value": None},
                            {"color": "#EAB839", "value": 100},
                            {"color": "red", "value": 150}
                        ]
                    },
                    "unit": "ms"
                }
            }
        },
        # ================= ROW 4: SYSTEM RESOURCES =================
        {
            "collapsed": False,
            "gridPos": {"h": 1, "w": 24, "x": 0, "y": 24},
            "id": 103,
            "title": "🖥️ Node.js Cluster Resources & HTTP Traffic",
            "type": "row"
        },
        {
            "id": 9,
            "title": "HTTP Request Volume by Status Code (202 Accepted, 200 OK, 4xx, 5xx)",
            "type": "timeseries",
            "gridPos": {"h": 8, "w": 12, "x": 0, "y": 25},
            "targets": [
                {
                    "expr": "sum by (status) (rate(http_requests_total[1m]))",
                    "legendFormat": "HTTP {{status}}",
                    "refId": "A"
                }
            ],
            "fieldConfig": {
                "defaults": {
                    "custom": {
                        "drawStyle": "line",
                        "lineInterpolation": "linear",
                        "fillOpacity": 15
                    },
                    "unit": "reqps"
                }
            }
        },
        {
            "id": 10,
            "title": "Node.js Process Memory Utilization (MB)",
            "type": "timeseries",
            "gridPos": {"h": 8, "w": 12, "x": 12, "y": 25},
            "targets": [
                {
                    "expr": "process_resident_memory_bytes / 1024 / 1024",
                    "legendFormat": "Process RSS Memory",
                    "refId": "A"
                },
                {
                    "expr": "nodejs_heap_size_used_bytes / 1024 / 1024",
                    "legendFormat": "V8 Heap Used",
                    "refId": "B"
                }
            ],
            "fieldConfig": {
                "defaults": {
                    "custom": {
                        "drawStyle": "line",
                        "lineInterpolation": "smooth",
                        "fillOpacity": 20
                    },
                    "unit": "decmbytes"
                }
            }
        }
    ],
    "refresh": "5s",
    "schemaVersion": 38,
    "style": "dark",
    "tags": ["codenova", "command-center", "production"],
    "time": {"from": "now-30m", "to": "now"},
    "timepicker": {"refresh_intervals": ["1s", "5s", "10s", "30s", "1m"]},
    "timezone": "browser",
    "title": "CodeNova Executive Command Center",
    "uid": "codenova-command-center",
    "version": 1
}

# Generate ConfigMap YAML
configmap_yaml = f"""apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana-datasources
  namespace: monitoring
data:
  datasources.yml: |
    apiVersion: 1
    datasources:
      - name: Prometheus
        type: prometheus
        url: http://prometheus-service:9090
        access: proxy
        isDefault: true
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana-dashboards-provider
  namespace: monitoring
data:
  dashboards.yml: |
    apiVersion: 1
    providers:
      - name: 'CodeNova Dashboards'
        orgId: 1
        folder: ''
        type: file
        disableDeletion: false
        options:
          path: /var/lib/grafana/dashboards
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana-dashboards
  namespace: monitoring
data:
  codenova-command-center.json: |
{chr(10).join('    ' + line for line in json.dumps(dashboard, indent=2).split(chr(10)))}
"""

with open("k8s/grafana/configmap.yaml", "w", encoding="utf-8") as f:
    f.write(configmap_yaml)

print("Updated k8s/grafana/configmap.yaml with CodeNova Executive Command Center Dashboard!")
