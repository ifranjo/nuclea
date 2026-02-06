#!/usr/bin/env python3
"""
NUCLEA PDF to HTML Report Generator
Extracts content from NUCLEA_Capsules_Detallado_Actualizado_v2_2.pdf
and creates an HTML report following CLAUDE.md style guidelines.
"""

import pdfplumber
import re
from datetime import datetime

def extract_pdf_content(pdf_path):
    """Extract all text and tables from PDF"""
    content = {
        'text': [],
        'tables': [],
        'metadata': {}
    }

    with pdfplumber.open(pdf_path) as pdf:
        content['metadata']['pages'] = len(pdf.pages)
        content['metadata']['title'] = pdf.metadata.get('Title', 'NUCLEA Capsules Analysis')
        content['metadata']['author'] = pdf.metadata.get('Author', 'Unknown')

        for i, page in enumerate(pdf.pages):
            # Extract text
            text = page.extract_text()
            if text:
                content['text'].append({
                    'page': i + 1,
                    'text': text
                })

            # Extract tables
            tables = page.extract_tables()
            if tables:
                for j, table in enumerate(tables):
                    content['tables'].append({
                        'page': i + 1,
                        'table_num': j + 1,
                        'data': table
                    })

    return content

def clean_text(text):
    """Clean and normalize text"""
    # Remove excessive whitespace
    text = re.sub(r'\n+', '\n', text)
    text = re.sub(r' +', ' ', text)
    return text.strip()

def parse_sections(content):
    """Parse extracted content into structured sections"""
    full_text = '\n'.join([page['text'] for page in content['text']])

    sections = {
        'titulo': '',
        'subtitulo': '',
        'secciones': []
    }

    # Extract title (first non-empty lines)
    lines = full_text.split('\n')
    non_empty = [l.strip() for l in lines if l.strip()]

    if non_empty:
        sections['titulo'] = non_empty[0]
        if len(non_empty) > 1:
            sections['subtitulo'] = non_empty[1]

    return sections

def generate_html_report(content, output_path):
    """Generate HTML report following CLAUDE.md style"""

    sections = parse_sections(content)
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M')

    # Build tables HTML
    tables_html = ""
    for table in content['tables']:
        tables_html += f'<div class="table-container"><h4>Tabla (Página {table["page"]})</h4>'
        tables_html += '<table><tbody>'
        for row in table['data']:
            tables_html += '<tr>'
            for cell in row:
                cell_clean = str(cell).strip() if cell else ''
                tables_html += f'<td>{cell_clean}</td>'
            tables_html += '</tr>'
        tables_html += '</tbody></table></div>'

    # Build text content
    full_text = '\n'.join([page['text'] for page in content['text']])

    html = f'''<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{sections['titulo'] or 'NUCLEA Capsules - Análisis Completo'}</title>
    <style>
        :root {{
            --beige-light: #F5F1EB;
            --beige: #E8E0D5;
            --beige-dark: #D4C8B8;
            --gray-light: #9A9A9A;
            --gray: #6B6B6B;
            --gray-dark: #3D3D3D;
            --accent: #8B7355;
        }}

        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        body {{
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            background-color: var(--beige-light);
            color: var(--gray-dark);
            line-height: 1.6;
            padding: 40px;
        }}

        .container {{
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 60px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }}

        header {{
            border-bottom: 2px solid var(--beige);
            padding-bottom: 30px;
            margin-bottom: 40px;
        }}

        h1 {{
            font-size: 2.5em;
            font-weight: 300;
            color: var(--gray-dark);
            margin-bottom: 10px;
        }}

        .subtitle {{
            font-size: 1.2em;
            color: var(--gray);
            font-weight: 300;
        }}

        .metadata {{
            display: flex;
            gap: 30px;
            margin-top: 20px;
            font-size: 0.9em;
            color: var(--gray-light);
        }}

        .section {{
            margin-bottom: 40px;
            padding: 30px;
            background: var(--beige-light);
            border-left: 4px solid var(--accent);
        }}

        h2 {{
            font-size: 1.5em;
            font-weight: 400;
            color: var(--gray-dark);
            margin-bottom: 20px;
        }}

        h3 {{
            font-size: 1.2em;
            font-weight: 500;
            color: var(--gray);
            margin: 20px 0 10px;
        }}

        h4 {{
            font-size: 1em;
            font-weight: 500;
            color: var(--gray-dark);
            margin-bottom: 10px;
        }}

        p {{
            margin-bottom: 15px;
            text-align: justify;
        }}

        ul, ol {{
            margin-left: 20px;
            margin-bottom: 15px;
        }}

        li {{
            margin-bottom: 8px;
        }}

        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 0.9em;
        }}

        th, td {{
            border: 1px solid var(--beige-dark);
            padding: 10px 12px;
            text-align: left;
        }}

        th {{
            background: var(--beige);
            font-weight: 500;
            color: var(--gray-dark);
        }}

        tr:nth-child(even) {{
            background: var(--beige-light);
        }}

        .table-container {{
            margin: 20px 0;
            overflow-x: auto;
        }}

        .kpi-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }}

        .kpi-card {{
            background: white;
            padding: 25px;
            text-align: center;
            border: 1px solid var(--beige);
        }}

        .kpi-value {{
            font-size: 2em;
            font-weight: 300;
            color: var(--accent);
        }}

        .kpi-label {{
            font-size: 0.9em;
            color: var(--gray);
            margin-top: 5px;
        }}

        .highlight {{
            background: var(--beige);
            padding: 20px;
            border-radius: 4px;
            margin: 20px 0;
        }}

        footer {{
            margin-top: 60px;
            padding-top: 30px;
            border-top: 1px solid var(--beige);
            text-align: center;
            color: var(--gray-light);
            font-size: 0.9em;
        }}

        .page-break {{ page-break-before: always; }}

        pre {{
            background: var(--gray-dark);
            color: var(--beige-light);
            padding: 20px;
            overflow-x: auto;
            font-size: 0.85em;
            border-radius: 4px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>{sections['titulo'] or 'NUCLEA Capsules'}</h1>
            <p class="subtitle">{sections['subtitulo'] or 'Análisis Estratégico y Documentación Técnica'}</p>
            <div class="metadata">
                <span>Páginas: {content['metadata']['pages']}</span>
                <span>Generado: {timestamp}</span>
            </div>
        </header>

        <div class="kpi-grid">
            <div class="kpi-card">
                <div class="kpi-value">{content['metadata']['pages']}</div>
                <div class="kpi-label">Páginas</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-value">{len(content['tables'])}</div>
                <div class="kpi-label">Tablas</div>
            </div>
        </div>

        {tables_html}

        <footer>
            <p>Documento generado automáticamente | NUCLEA Analysis Report</p>
        </footer>
    </div>
</body>
</html>'''

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html)

    print(f"Report generated: {output_path}")
    return html

if __name__ == '__main__':
    import sys

    pdf_path = sys.argv[1] if len(sys.argv) > 1 else 'NUCLEA_Capsules_Detallado_Actualizado_v2_2.pdf'
    output_path = sys.argv[2] if len(sys.argv) > 2 else 'NUCLEA_Report.html'

    print(f"Extracting content from: {pdf_path}")
    content = extract_pdf_content(pdf_path)
    print(f"Found {len(content['text'])} pages with text")
    print(f"Found {len(content['tables'])} tables")

    generate_html_report(content, output_path)
