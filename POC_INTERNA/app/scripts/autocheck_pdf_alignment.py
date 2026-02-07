#!/usr/bin/env python3
"""
Validate that key onboarding/capsule phrases present in the app are grounded
in the source PDF design/spec files.
"""

from __future__ import annotations

import json
import re
import sys
import unicodedata
from pathlib import Path
from typing import Dict, List

from pypdf import PdfReader


def normalize(text: str) -> str:
    text = unicodedata.normalize("NFKD", text)
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = text.lower()
    text = re.sub(r"[^a-z0-9 ]+", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def extract_pdf_text(pdf_path: Path) -> str:
    reader = PdfReader(str(pdf_path))
    chunks: List[str] = []
    for page in reader.pages:
        chunks.append(page.extract_text() or "")
    return "\n".join(chunks)


def main() -> int:
    app_root = Path(__file__).resolve().parents[1]
    workspace_root = app_root.parents[1]
    pdf_root = workspace_root / "DISEÑO_ANDREA_PANTALLAS"
    results_dir = app_root / "test-results"
    results_dir.mkdir(parents=True, exist_ok=True)

    checks: Dict[str, List[str]] = {
        "NUCLEA_INICIO.pdf": [
            "Somos las historias que recordamos",
            "Haz que las tuyas permanezcan",
            "Elige tu cápsula",
            "Aquí guardas lo que no quieres perder",
        ],
        "NUCLEA_CAPSULAS.pdf": [
            "Legacy Capsule",
            "Together Capsule",
            "Social Capsule",
            "Pet Capsule",
            "Life Chapter Capsule",
            "Origin Capsule",
            "Legacy Capsule funciona como un diario personal",
            "cápsula creada para guardar la historia de una relación",
            "espacio para compartir momentos con amigos o familia",
            "pensada para guardar recuerdos de mascotas como parte de la familia",
            "creada por padres para guardar la historia de sus hijos desde el nacimiento",
            "pensada para guardar etapas concretas de la vida",
        ],
    }

    report = {
        "pdf_root": str(pdf_root),
        "checked_files": [],
        "total_phrases": 0,
        "matched_phrases": 0,
        "missing": [],
        "coverage_percent": 0.0,
    }

    for pdf_name, phrases in checks.items():
        pdf_path = pdf_root / pdf_name
        if not pdf_path.exists():
            report["missing"].append(
                {"pdf": pdf_name, "phrase": None, "reason": "pdf_not_found"}
            )
            continue

        raw_text = extract_pdf_text(pdf_path)
        norm_text = normalize(raw_text)
        file_result = {"pdf": pdf_name, "matches": [], "missing": []}

        for phrase in phrases:
            report["total_phrases"] += 1
            if normalize(phrase) in norm_text:
                report["matched_phrases"] += 1
                file_result["matches"].append(phrase)
            else:
                file_result["missing"].append(phrase)
                report["missing"].append({"pdf": pdf_name, "phrase": phrase})

        report["checked_files"].append(file_result)

    total = report["total_phrases"]
    matched = report["matched_phrases"]
    coverage = (matched / total * 100.0) if total else 0.0
    report["coverage_percent"] = round(coverage, 2)

    out_file = results_dir / "pdf-alignment-report.json"
    out_file.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"PDF alignment coverage: {report['coverage_percent']}% ({matched}/{total})")
    print(f"Report: {out_file}")

    # Hard fail if alignment drops below 90%
    return 0 if coverage >= 90.0 else 1


if __name__ == "__main__":
    sys.exit(main())
