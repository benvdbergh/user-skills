#!/usr/bin/env python3
"""Compute basic triage and SLA metrics from GitHub issues export JSON."""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timedelta, timezone
from statistics import median
from typing import Any


def parse_iso8601(value: str | None) -> datetime | None:
    if not value:
        return None
    raw = value.replace("Z", "+00:00")
    try:
        return datetime.fromisoformat(raw)
    except ValueError:
        return None


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Summarize triage throughput and SLA compliance."
    )
    parser.add_argument("--input", required=True, help="Path to issues JSON export.")
    parser.add_argument(
        "--sla-hours-first-response",
        type=int,
        default=48,
        help="SLA threshold for first maintainer response in hours (default: 48).",
    )
    parser.add_argument(
        "--sla-days-close-needs-info",
        type=int,
        default=14,
        help="Expected close timeout for needs-info state in days (default: 14).",
    )
    parser.add_argument(
        "--now",
        default=None,
        help="Override current UTC time (ISO-8601). Useful for deterministic runs.",
    )
    return parser.parse_args()


def load_items(path: str) -> list[dict[str, Any]]:
    with open(path, "r", encoding="utf-8") as f:
        payload = json.load(f)
    if isinstance(payload, dict) and "items" in payload and isinstance(payload["items"], list):
        return [x for x in payload["items"] if isinstance(x, dict)]
    if isinstance(payload, list):
        return [x for x in payload if isinstance(x, dict)]
    raise ValueError("Unsupported JSON shape. Expected list or {'items': [...]} format.")


def label_names(item: dict[str, Any]) -> set[str]:
    labels = item.get("labels", [])
    out: set[str] = set()
    if isinstance(labels, list):
        for lbl in labels:
            if isinstance(lbl, dict):
                name = lbl.get("name")
                if isinstance(name, str):
                    out.add(name)
            elif isinstance(lbl, str):
                out.add(lbl)
    return out


def first_non_author_comment_time(
    comments: Any, author_login: str | None
) -> datetime | None:
    if not isinstance(comments, list):
        return None
    for c in comments:
        if not isinstance(c, dict):
            continue
        user = c.get("user")
        login = user.get("login") if isinstance(user, dict) else None
        created = parse_iso8601(c.get("created_at"))
        if created is None:
            continue
        if author_login and login == author_login:
            continue
        return created
    return None


def hours_between(start: datetime | None, end: datetime | None) -> float | None:
    if start is None or end is None:
        return None
    return (end - start).total_seconds() / 3600.0


def main() -> int:
    args = parse_args()
    items = load_items(args.input)
    now = parse_iso8601(args.now) if args.now else datetime.now(timezone.utc)
    if now is None:
        raise ValueError("--now must be an ISO-8601 datetime.")

    first_response_hours: list[float] = []
    first_response_within_sla = 0
    triage_over_sla = 0
    open_count = 0
    pull_request_count = 0
    needs_info_open_overdue = 0

    for item in items:
        if "pull_request" in item:
            pull_request_count += 1
            continue

        state = item.get("state")
        if state == "open":
            open_count += 1

        created_at = parse_iso8601(item.get("created_at"))
        user = item.get("user")
        author_login = user.get("login") if isinstance(user, dict) else None
        comments = item.get("comments_data", item.get("comments"))
        first_comment_at = first_non_author_comment_time(comments, author_login)
        response_h = hours_between(created_at, first_comment_at)
        if response_h is not None:
            first_response_hours.append(response_h)
            if response_h <= args.sla_hours_first_response:
                first_response_within_sla += 1

        labels = label_names(item)
        age_h = hours_between(created_at, now)
        if (
            state == "open"
            and "status:triage-needed" in labels
            and age_h is not None
            and age_h > args.sla_hours_first_response
        ):
            triage_over_sla += 1

        if state == "open" and "status:needs-info" in labels:
            updated_at = parse_iso8601(item.get("updated_at"))
            idle_cutoff = now - timedelta(days=args.sla_days_close_needs_info)
            if updated_at is not None and updated_at < idle_cutoff:
                needs_info_open_overdue += 1

    total_issues = len(items) - pull_request_count
    responded = len(first_response_hours)
    median_first_response = median(first_response_hours) if first_response_hours else None
    sla_hit_rate = (first_response_within_sla / responded * 100.0) if responded else 0.0

    print("triage_metrics")
    print(f"issues_total: {total_issues}")
    print(f"issues_open: {open_count}")
    print(f"pull_requests_skipped: {pull_request_count}")
    print(f"issues_with_first_response: {responded}")
    if median_first_response is None:
        print("median_first_response_hours: n/a")
    else:
        print(f"median_first_response_hours: {median_first_response:.2f}")
    print(f"sla_first_response_hours: {args.sla_hours_first_response}")
    print(f"sla_first_response_hit_rate_percent: {sla_hit_rate:.2f}")
    print(f"triage_backlog_over_sla: {triage_over_sla}")
    print(f"needs_info_open_overdue: {needs_info_open_overdue}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
