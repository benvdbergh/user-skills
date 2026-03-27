#!/usr/bin/env python3
"""
Thin wrapper around markdrop CLI for PDF → Markdown conversion.
Use when the agent needs a single entrypoint (e.g. fixed output dir, logging).

Usage:
  python convert.py <input_path> [--output-dir DIR] [--add-tables] [--describe PROVIDER]

Requires: pip install markdrop (and optional extras for --describe).
"""

import argparse
import subprocess
import sys
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Convert PDF (or URL) to Markdown using markdrop."
    )
    parser.add_argument(
        "input_path",
        help="Path to PDF file or URL (e.g. https://example.com/doc.pdf)",
    )
    parser.add_argument(
        "--output-dir",
        "-o",
        default="./out",
        help="Output directory for Markdown and assets (default: ./out)",
    )
    parser.add_argument(
        "--add-tables",
        action="store_true",
        help="Enable table detection (Table Transformer)",
    )
    parser.add_argument(
        "--describe",
        metavar="PROVIDER",
        choices=["gemini", "openai", "anthropic", "groq", "openrouter", "litellm"],
        help="After convert, run markdrop describe with this AI provider",
    )
    args = parser.parse_args()

    cmd = [
        sys.executable,
        "-m",
        "markdrop",
        "convert",
        args.input_path,
        "--output_dir",
        str(Path(args.output_dir).resolve()),
    ]
    if args.add_tables:
        cmd.append("--add_tables")

    result = subprocess.run(cmd)
    if result.returncode != 0:
        return result.returncode

    if args.describe:
        # Find the generated .md in output_dir (markdrop typically creates one)
        out = Path(args.output_dir)
        md_files = list(out.glob("*.md"))
        if not md_files:
            print("No .md file found in output dir; skipping describe.", file=sys.stderr)
            return 0
        describe_cmd = [
            sys.executable,
            "-m",
            "markdrop",
            "describe",
            str(md_files[0]),
            "--ai_provider",
            args.describe,
            "--output_dir",
            str(out.resolve()),
        ]
        result = subprocess.run(describe_cmd)
        if result.returncode != 0:
            return result.returncode

    return 0


if __name__ == "__main__":
    sys.exit(main())
