"""Dash app entrypoint for ENTROPICA."""

from __future__ import annotations

import base64
import io
import os
import tempfile
from typing import Any, Dict, List, Optional

import dash
from dash import Dash, dcc, html, dash_table, Input, Output, State, callback_context
import plotly.graph_objs as go

from src.pipeline import run_analysis


APP_TITLE = "ENTROPICA"


def _placeholder_summary() -> Dict[str, int]:
    return {"total_sequences": 0, "num_clusters": 0, "potential_novel_taxa": 0}


def _placeholder_table() -> List[Dict[str, Any]]:
    return []


def _placeholder_chart() -> go.Figure:
    fig = go.Figure()
    fig.update_layout(
        title="Abundance Distribution",
        xaxis_title="Cluster ID",
        yaxis_title="Relative Abundance",
        template="plotly_white",
    )
    return fig


app: Dash = Dash(__name__)
server = app.server


def summary_card(title: str, value_id: str) -> html.Div:
    return html.Div(
        className="summary-card",
        children=[
            html.Div(className="card-title", children=title),
            html.Div(className="card-value", id=value_id, children="-")
        ],
        style={
            "border": "1px solid #e5e7eb",
            "borderRadius": "8px",
            "padding": "16px",
            "background": "#ffffff",
            "boxShadow": "0 1px 2px rgba(0,0,0,0.05)",
            "minWidth": "220px",
        },
    )


def header() -> html.Div:
    return html.Div(
        className="header",
        children=[
            html.Div(
                className="logo-title",
                children=[
                    html.Div("🧬", className="logo", style={"fontSize": "28px", "marginRight": "8px"}),
                    html.H2(APP_TITLE, style={"margin": 0}),
                ],
                style={"display": "flex", "alignItems": "center"},
            )
        ],
        style={
            "display": "flex",
            "justifyContent": "space-between",
            "alignItems": "center",
            "padding": "16px 24px",
            "background": "#0f172a",
            "color": "#f8fafc",
            "borderBottom": "1px solid #1e293b",
        },
    )


def controls_panel() -> html.Div:
    return html.Div(
        className="controls",
        children=[
            html.Div([
                html.Label("Upload FASTQ", style={"fontWeight": 600}),
                dcc.Upload(
                    id="upload-fastq",
                    children=html.Div(["Drag and Drop or ", html.A("Select File")]),
                    style={
                        "width": "100%",
                        "height": "64px",
                        "lineHeight": "64px",
                        "borderWidth": "1px",
                        "borderStyle": "dashed",
                        "borderRadius": "8px",
                        "textAlign": "center",
                        "margin": "8px 0 0 0",
                        "background": "#f8fafc",
                    },
                    multiple=False,
                ),
            ], style={"flex": 1, "marginRight": "16px"}),
            html.Button(
                id="run-analysis",
                children="Run Analysis",
                n_clicks=0,
                style={
                    "height": "64px",
                    "padding": "0 24px",
                    "borderRadius": "8px",
                    "border": "1px solid #0ea5e9",
                    "background": "#0ea5e9",
                    "color": "#ffffff",
                    "fontWeight": 700,
                },
            ),
        ],
        style={
            "display": "flex",
            "alignItems": "flex-end",
            "padding": "16px 24px",
            "background": "#ffffff",
            "borderBottom": "1px solid #e5e7eb",
            "gap": "16px",
        },
    )


def layout_body() -> html.Div:
    return html.Div(
        className="body",
        children=[
            html.Div(
                className="summary",
                children=[
                    summary_card("Total Sequences Analyzed", "summary-total"),
                    summary_card("Number of Taxa Clusters", "summary-clusters"),
                    summary_card("Potential Novel Taxa", "summary-novel"),
                ],
                style={
                    "display": "flex",
                    "gap": "16px",
                    "padding": "16px 24px",
                    "flexWrap": "wrap",
                },
            ),

            html.Div(
                className="abundance-section",
                children=[
                    html.H3("Abundance Distribution", style={"margin": "0 0 8px 0"}),
                    dcc.Graph(id="abundance-chart", figure=_placeholder_chart()),
                ],
                style={"padding": "0 24px 16px 24px", "background": "#ffffff"},
            ),

            html.Div(
                className="table-section",
                children=[
                    html.H3("Taxa Analysis Table", style={"margin": "16px 0 8px 0"}),
                    dash_table.DataTable(
                        id="taxa-table",
                        columns=[
                            {"name": "Cluster ID", "id": "cluster_id", "type": "numeric"},
                            {"name": "Count", "id": "count", "type": "numeric"},
                            {"name": "Relative Abundance", "id": "relative_abundance", "type": "numeric", "format": {"specifier": ".3f"}},
                            {"name": "Mean Length", "id": "mean_length", "type": "numeric", "format": {"specifier": ".1f"}},
                        ],
                        data=_placeholder_table(),
                        page_current=0,
                        page_size=10,
                        page_action="native",
                        sort_action="native",
                        filter_action="native",
                        style_table={"overflowX": "auto"},
                        style_cell={"padding": "8px", "border": "1px solid #e5e7eb"},
                        style_header={"backgroundColor": "#f1f5f9", "fontWeight": "bold"},
                    ),
                ],
                style={"padding": "0 24px 24px 24px", "background": "#ffffff"},
            ),
        ],
        style={"background": "#f1f5f9", "minHeight": "calc(100vh - 120px)"},
    )


app.layout = html.Div(
    children=[
        header(),
        controls_panel(),
        layout_body(),
        dcc.Store(id="uploaded-path", storage_type="memory"),
        dcc.Store(id="analysis-results", storage_type="memory"),
    ],
    style={"fontFamily": "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"},
)


def _save_uploaded_content(contents: str, filename: str) -> Optional[str]:
    try:
        content_type, content_string = contents.split(",", 1)
        decoded = base64.b64decode(content_string)
        suffix = os.path.splitext(filename)[1] or ".fastq"
        fd, temp_path = tempfile.mkstemp(prefix="entropica_", suffix=suffix)
        with os.fdopen(fd, "wb") as tmp:
            tmp.write(decoded)
        return temp_path
    except Exception:
        return None


@app.callback(
    Output("uploaded-path", "data"),
    Input("upload-fastq", "contents"),
    State("upload-fastq", "filename"),
    prevent_initial_call=True,
)
def handle_upload(contents: Optional[str], filename: Optional[str]):
    if contents is None or not filename:
        return None
    path = _save_uploaded_content(contents, filename)
    return path


@app.callback(
    Output("summary-total", "children"),
    Output("summary-clusters", "children"),
    Output("summary-novel", "children"),
    Output("abundance-chart", "figure"),
    Output("taxa-table", "data"),
    Input("run-analysis", "n_clicks"),
    State("uploaded-path", "data"),
    prevent_initial_call=True,
)
def run_pipeline(n_clicks: int, uploaded_path: Optional[str]):
    if not uploaded_path or not os.path.exists(uploaded_path):
        fig = _placeholder_chart()
        return "-", "-", "-", fig, _placeholder_table()

    try:
        results = run_analysis(uploaded_path, metadata={"source": "dash"})
    except Exception:
        fig = _placeholder_chart()
        return "0", "0", "0", fig, _placeholder_table()

    summary = results.get("summary", _placeholder_summary())
    total = summary.get("total_sequences", 0)
    clusters = summary.get("num_clusters", 0)
    novel = summary.get("potential_novel_taxa", 0)

    chart_data = results.get("abundance_chart", {"x": [], "y": []})
    x = chart_data.get("x", [])
    y = chart_data.get("y", [])
    fig = go.Figure(data=[go.Bar(x=x, y=y, marker_color="#0ea5e9")])
    fig.update_layout(
        title="Abundance Distribution",
        xaxis_title="Cluster ID",
        yaxis_title="Relative Abundance",
        template="plotly_white",
    )

    table_rows = results.get("clusters_table", [])

    return f"{total}", f"{clusters}", f"{novel}", fig, table_rows


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 8050)), debug=False)


