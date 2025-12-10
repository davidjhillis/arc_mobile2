#!/usr/bin/env python3
"""
Extract and format all Word documents from OneDrive folder
Converts to properly formatted markdown
"""

import re
import subprocess
import os
from pathlib import Path

def clean_markdown(text):
    """Clean and format text to proper markdown"""
    if not text:
        return ""
    
    # Remove excessive whitespace
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    # Fix bullet points - convert tabs and bullets to proper markdown
    lines = text.split('\n')
    cleaned_lines = []
    for line in lines:
        # Convert tab-indented bullets
        if line.startswith('\t•') or line.startswith('	•'):
            cleaned_lines.append('- ' + line.lstrip('\t•').strip())
        elif line.startswith('\t-') or line.startswith('	-'):
            cleaned_lines.append('- ' + line.lstrip('\t-').strip())
        elif line.startswith('\t') and re.match(r'^\t\d+\.', line):
            # Numbered list
            cleaned_lines.append(re.sub(r'^\t(\d+\.)', r'\1', line))
        else:
            # Remove leading tabs
            cleaned_lines.append(line.lstrip('\t'))
    
    text = '\n'.join(cleaned_lines)
    
    # Fix headers - ensure proper spacing
    text = re.sub(r'\n(##+)\s*([^\n]+)\n([^\n#])', r'\n\1 \2\n\n\3', text)
    
    # Clean up multiple spaces
    text = re.sub(r' {2,}', ' ', text)
    
    return text.strip()

def extract_doc_content(filepath):
    """Extract text from Word document"""
    try:
        result = subprocess.run(
            ['textutil', '-convert', 'txt', '-stdout', filepath],
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout
    except Exception as e:
        print(f"Error extracting {filepath}: {e}")
        return None

def parse_document(content, filename):
    """Parse document content and extract structured information"""
    lines = content.split('\n')
    
    # Extract title (first non-empty line)
    title = None
    description = None
    typically_performed_by = None
    supporting_on_task = None
    
    body_start = 0
    for i, line in enumerate(lines):
        line = line.strip()
        if not line:
            continue
        if not title:
            title = line
            body_start = i + 1
        elif line.startswith('Description:'):
            description = line.replace('Description:', '').strip()
        elif line.startswith('Typically performed by:'):
            typically_performed_by = line.replace('Typically performed by:', '').strip()
        elif 'Supporting on' in line or 'Supported by' in line:
            supporting_on_task = line.split(':', 1)[1].strip() if ':' in line else line
    
    # Get body content
    body = '\n'.join(lines[body_start:]).strip()
    
    # Clean the body
    body = clean_markdown(body)
    
    return {
        'title': title or filename,
        'description': description or '',
        'typically_performed_by': typically_performed_by or '',
        'supporting_on_task': supporting_on_task or '',
        'content': body,
    }

def main():
    base_dir = Path("OneDrive_1_8-14-2025 2")
    
    # Find all Word documents
    docx_files = list(base_dir.rglob("*.docx"))
    
    print(f"Found {len(docx_files)} documents")
    
    documents = []
    
    for docx_file in sorted(docx_files):
        print(f"Processing: {docx_file.name}")
        content = extract_doc_content(str(docx_file))
        if content:
            parsed = parse_document(content, docx_file.stem)
            parsed['filename'] = docx_file.name
            parsed['filepath'] = str(docx_file)
            documents.append(parsed)
    
    # Write to JSON for inspection
    import json
    with open('/tmp/extracted_docs.json', 'w') as f:
        json.dump(documents, f, indent=2)
    
    print(f"\nExtracted {len(documents)} documents")
    print("Sample content preview:")
    if documents:
        print(f"Title: {documents[0]['title']}")
        print(f"Content preview: {documents[0]['content'][:200]}...")

if __name__ == '__main__':
    main()
