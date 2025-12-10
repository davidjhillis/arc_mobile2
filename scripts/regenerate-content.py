#!/usr/bin/env python3
"""
Regenerate mass-care-content.ts with all documents and proper markdown formatting
"""

import json
import re

def format_markdown_content(text):
    """Convert Word doc text to properly formatted markdown"""
    if not text:
        return ""
    
    lines = text.split('\n')
    formatted_lines = []
    in_list = False
    
    for i, line in enumerate(lines):
        line = line.rstrip()
        
        # Skip empty lines (we'll add them back strategically)
        if not line.strip():
            if formatted_lines and formatted_lines[-1].strip():
                formatted_lines.append('')
            continue
        
        # Remove tabs
        line = line.replace('\t', ' ')
        
        # Convert bullet points (• or -)
        if re.match(r'^\s*[•-]\s+', line):
            line = re.sub(r'^\s*[•-]\s+', '- ', line)
            in_list = True
        elif re.match(r'^\s*\d+\.\s+', line):
            # Numbered list - keep as is but clean spacing
            line = re.sub(r'^\s*(\d+\.)\s+', r'\1 ', line)
            in_list = True
        elif line.startswith('  ') and in_list:
            # Sub-item in list
            pass
        else:
            in_list = False
        
        # Detect section headers - lines that are labels followed by colons
        if ':' in line and not line.startswith('-') and len(line) < 100:
            parts = line.split(':', 1)
            if len(parts) == 2:
                label = parts[0].strip()
                value = parts[1].strip()
                # Common section headers
                if label in ['Description', 'Typically performed by', 'Supporting on the task', 
                            'Supporting on task', 'Supported by', 'Considerations', 
                            'What To Do', 'Links', 'Links / Related Information',
                            'Related Articles', 'Related Resources']:
                    if formatted_lines and formatted_lines[-1].strip():
                        formatted_lines.append('')
                    # Remove colon from header
                    formatted_lines.append('## ' + label)
                    formatted_lines.append('')
                    if value:
                        formatted_lines.append(value)
                        formatted_lines.append('')
                    continue
        
        # Detect standalone section headers (all caps short lines)
        if (line.isupper() and 10 < len(line) < 50 and 
            not line.startswith('-') and 
            not re.match(r'^\d', line)):
            if formatted_lines and formatted_lines[-1].strip():
                formatted_lines.append('')
            formatted_lines.append('## ' + line.title())
            formatted_lines.append('')
            continue
        
        # Clean up excessive spaces
        line = re.sub(r' {2,}', ' ', line)
        
        formatted_lines.append(line)
    
    # Join and clean up
    result = '\n'.join(formatted_lines)
    
    # Fix multiple blank lines
    result = re.sub(r'\n{3,}', '\n\n', result)
    
    # Ensure headers have proper spacing
    result = re.sub(r'\n(##+)\s+([^\n]+)\n([^\n#\n])', r'\n\1 \2\n\n\3', result)
    
    # Fix headers without spaces after ##
    result = re.sub(r'\n(##+)([^\s#\n])', r'\n\1 \2', result)
    
    return result.strip()

def create_content_entry(doc, doc_id):
    """Create a TypeScript content entry from document"""
    
    # Determine type
    doc_type = "task-sheet"
    if "overview" in doc_id.lower() or "program overview" in doc['title'].lower():
        doc_type = "overview"
    elif "standards" in doc_id.lower() or "standards" in doc['title'].lower():
        doc_type = "standard"
    elif "roles" in doc_id.lower() or "roles" in doc['title'].lower():
        doc_type = "role"
    
    # Determine related group
    related_group = "Information & Planning"
    if "coordinating" in doc_id or "visits" in doc_id:
        related_group = "External Relations"
    elif "resource" in doc_id or "closing" in doc_id:
        related_group = "Logistics"
    elif "transitioning" in doc_id:
        related_group = "Workforce"
    
    # Format content
    content = format_markdown_content(doc['content'])
    
    # Escape backticks and dollar signs for template literals
    content = content.replace('`', '\\`').replace('${', '\\${')
    
    # Create entry
    entry = f'''  "{doc_id}": {{
    id: "{doc_id}",
    title: {json.dumps(doc['title'])},
    category: "Mass Care",
    subActivity: "mass-care",
    relatedGroup: "{related_group}",
    readTime: "10 min",
    lastUpdated: "{doc.get('lastUpdated', 'Mar 2025')}",
    version: "{doc.get('version', '0.2')}",
    summary: {json.dumps(doc['description'][:200])},
    type: "{doc_type}",
    content: `{content}`,
    relatedDocs: [],
  }},'''
    
    return entry

def main():
    # Load extracted documents
    with open('/tmp/extracted_docs.json', 'r') as f:
        docs = json.load(f)
    
    # Create doc ID mapping
    doc_id_map = {
        "Closing Mass Care Activities Task Sheet": "closing-mass-care-activities",
        "Mass Care Group Standards": "mass-care-standards",
        "Mass Care Program Overview": "mass-care-program-overview",
        "Mass Care Group Roles and Reporting": "mass-care-roles",
        "Ensuring the Mass Care Team has access to Situational Awareness Reports Task Sheet": "accessing-situational-awareness-reports",
        "Attending Daily DRO and Mass Care Meetings Task Sheet": "attending-daily-dro-meetings",
        "Supporting Visits to Mass Care Sites Task Sheet": "coordinating-site-visits",
        "Mass Care Resource Management Task Sheet (Hold until RID is released)": "resource-management",
        "Transitioning a Mass Care Leadership Role Task Sheet": "transitioning-leadership-role",
        "Using Mapping Tools to Inform Mass Care Service Delivery Task Sheet": "using-mapping-tools",
        "Daily Tactics Planning (completing the 215s) & Communicating Mass Care Needs to DRO Leaders Task Sheet": "daily-tactics-planning",
        "Creating Mass Care Functional Plans Task Sheet": "creating-functional-plans",
        "Supporting the creation of Mass Care Planning Assumptions, Goals, and Strategy Task Sheet": "determining-planning-assumptions",
        "Using Regional Plans on Disaster Relief Operations Task Sheet": "using-regional-plans",
        "Approving and Supporting Mass Care Functional Plans Task Sheet": "approving-functional-plans",
    }
    
    entries = []
    for doc in docs:
        doc_id = doc_id_map.get(doc['title'], doc['title'].lower().replace(' ', '-'))
        entry = create_content_entry(doc, doc_id)
        entries.append(entry)
    
    # Write to file
    output = '\n'.join(entries)
    print(f"Generated {len(entries)} content entries")
    print(f"Total length: {len(output)} characters")
    
    # Write preview
    with open('/tmp/content_preview.txt', 'w') as f:
        f.write(output[:5000])
    
    print("\nPreview written to /tmp/content_preview.txt")
    print("\nFirst entry preview:")
    print(entries[0][:500])

if __name__ == '__main__':
    main()
