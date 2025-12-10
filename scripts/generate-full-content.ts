#!/usr/bin/env python3
"""
Generate complete mass-care-content.ts file with all documents properly formatted
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
    
    for line in lines:
        line = line.rstrip()
        
        if not line.strip():
            if formatted_lines and formatted_lines[-1].strip():
                formatted_lines.append('')
            continue
        
        # Remove tabs
        line = line.replace('\t', ' ')
        
        # Convert bullet points
        if re.match(r'^\s*[•-]\s+', line):
            line = re.sub(r'^\s*[•-]\s+', '- ', line)
            in_list = True
        elif re.match(r'^\s*\d+\.\s+', line):
            line = re.sub(r'^\s*(\d+\.)\s+', r'\1 ', line)
            in_list = True
        else:
            in_list = False
        
        # Detect section headers with colons
        if ':' in line and not line.startswith('-') and len(line) < 100:
            parts = line.split(':', 1)
            if len(parts) == 2:
                label = parts[0].strip()
                value = parts[1].strip()
                if label in ['Description', 'Typically performed by', 'Supporting on the task', 
                            'Supporting on task', 'Supported by', 'Considerations', 
                            'What To Do', 'Links', 'Links / Related Information',
                            'Related Articles', 'Related Resources']:
                    if formatted_lines and formatted_lines[-1].strip():
                        formatted_lines.append('')
                    formatted_lines.append('## ' + label)
                    formatted_lines.append('')
                    if value:
                        formatted_lines.append(value)
                        formatted_lines.append('')
                    continue
        
        # Detect standalone section headers (no colon) - check if line matches exactly
        standalone_headers = ['Considerations', 'What To Do', 'Links', 'Links / Related Information',
                            'Links/Related Information', 'Related Articles', 'Related Resources', 
                            'Overview', 'Leadership Overview', 'Mass Care Services', 
                            'Initiating Mass Care Services', 'Triggers for Initiating Mass Care Services',
                            'Stated vs Verified Needs', 'Stated vs Verified needs']
        line_stripped = line.strip()
        if line_stripped in standalone_headers and not line.startswith('-') and not line.startswith('#'):
            if formatted_lines and formatted_lines[-1].strip():
                formatted_lines.append('')
            formatted_lines.append('## ' + line_stripped)
            formatted_lines.append('')
            continue
        
        # Detect subsection headers (title case, no colon, short lines)
        if (not line.startswith('-') and not line.startswith('#') and 
            len(line_stripped) < 80 and len(line_stripped) > 5 and
            (line_stripped[0].isupper() and ' ' in line_stripped) and
            not re.match(r'^\d+\.', line_stripped)):
            # Check if previous line was empty or a header - likely a section header
            if formatted_lines and (not formatted_lines[-1].strip() or formatted_lines[-1].startswith('##')):
                # Check if it looks like a header (title case, common patterns)
                if any(word in line_stripped for word in ['Services', 'Principles', 'Overview', 'Management', 
                                                         'Operations', 'Feeding', 'Shelter', 'Care', 'Support']):
                    formatted_lines.append('### ' + line_stripped)
                    formatted_lines.append('')
                    continue
        
        # Detect standards format (M.1, M.2, etc.)
        if re.match(r'^M\.\d+', line_stripped):
            if formatted_lines and formatted_lines[-1].strip():
                formatted_lines.append('')
            formatted_lines.append('### ' + line_stripped)
            formatted_lines.append('')
            continue
        
        # Clean up spaces
        line = re.sub(r' {2,}', ' ', line)
        formatted_lines.append(line)
    
    result = '\n'.join(formatted_lines)
    
    # Fix "Description:" at start - should be a header
    result = re.sub(r'^Description:\s*', '## Description\n\n', result)
    
    # Fix multiple blank lines
    result = re.sub(r'\n{3,}', '\n\n', result)
    
    # Ensure headers have space after ##
    result = re.sub(r'\n(##+)([^\s#\n])', r'\n\1 \2', result)
    
    # Fix "Links/Related Information" that might have been missed
    result = re.sub(r'\n(Links/Related Information)\n', r'\n## \1\n\n', result)
    
    # Fix common section titles that should be headers
    section_titles = [
        (r'Stated vs Verified needs?', '###'),
        (r'Shelter Services', '###'),
        (r'Community Operations', '###'),
        (r'Pet Shelter and Care', '###'),
        (r'Shelter Management', '###'),
        (r'Shelter Resident Transition Casework', '###'),
        (r'Shelter Feeding', '###'),
        (r'Community Feeding', '###'),
        (r'Distribution of Emergency Supplies and Services', '###'),
        (r'Reunification', '###'),
    ]
    
    for title_pattern, header_level in section_titles:
        # Catch lines with dashes after
        result = re.sub(
            rf'\n({title_pattern})\s*[–-]\s*',
            rf'\n{header_level} \1\n\n',
            result,
            flags=re.IGNORECASE
        )
        # Catch standalone lines (not already headers)
        result = re.sub(
            rf'\n({title_pattern})\s*\n(?!#)',
            rf'\n{header_level} \1\n\n',
            result,
            flags=re.IGNORECASE
        )
        # Catch lines at end of bullet lists
        result = re.sub(
            rf'\n- .+\n({title_pattern})\s*\n',
            rf'\n- .+\n\n{header_level} \1\n\n',
            result,
            flags=re.IGNORECASE
        )
    
    return result.strip()

def escape_for_template(text):
    """Escape backticks and ${ for template literals"""
    return text.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')

def create_content_entry(doc, doc_id, metadata):
    """Create a TypeScript content entry"""
    
    doc_type = metadata.get('type', 'task-sheet')
    phase = metadata.get('phase', 'operations')
    related_group = metadata.get('relatedGroup', 'Information & Planning')
    last_updated = metadata.get('lastUpdated', 'Mar 2025')
    version = metadata.get('version', '0.2')
    
    content = format_markdown_content(doc['content'])
    content = escape_for_template(content)
    
    # Build related docs
    related_docs = metadata.get('relatedDocs', [])
    related_docs_str = '[\n' + ',\n'.join([
        f'      {{ id: "{rd["id"]}", title: {json.dumps(rd["title"])} }}'
        for rd in related_docs
    ]) + '\n    ]' if related_docs else '[]'
    
    phase_str = f'phase: "{phase}",' if phase else ''
    
    entry = f'''  "{doc_id}": {{
    id: "{doc_id}",
    title: {json.dumps(doc['title'])},
    category: "Mass Care",
    subActivity: "mass-care",
    {phase_str}
    relatedGroup: "{related_group}",
    readTime: "{metadata.get('readTime', '10 min')}",
    lastUpdated: "{last_updated}",
    version: "{version}",
    summary: {json.dumps(doc['description'][:200])},
    type: "{doc_type}",
    content: `{content}`,
    relatedDocs: {related_docs_str},
  }},'''
    
    return entry

def main():
    with open('/tmp/extracted_docs.json', 'r') as f:
        docs = json.load(f)
    
    # Document metadata - organized by folder structure (phase)
    metadata_map = {
        # Closing phase
        "Closing Mass Care Activities Task Sheet": {
            'id': 'closing-mass-care-activities',
            'type': 'task-sheet',
            'phase': 'closing',
            'relatedGroup': 'Logistics',
            'relatedDocs': [
                {'id': 'mass-care-program-overview', 'title': 'Mass Care Program Overview'},
                {'id': 'resource-management', 'title': 'Mass Care Resource Management Task Sheet'},
            ]
        },
        # Planning phase - includes overview, standards, roles
        "Mass Care Group Standards": {
            'id': 'mass-care-standards',
            'type': 'standard',
            'phase': 'planning',
            'relatedGroup': 'Information & Planning',
            'relatedDocs': [
                {'id': 'mass-care-program-overview', 'title': 'Mass Care Program Overview'},
                {'id': 'mass-care-roles', 'title': 'Mass Care Roles and Reporting'},
            ]
        },
        "Mass Care Program Overview": {
            'id': 'mass-care-program-overview',
            'type': 'overview',
            'phase': 'planning',
            'relatedGroup': 'Information & Planning',
            'relatedDocs': [
                {'id': 'mass-care-standards', 'title': 'Mass Care Group Standards'},
                {'id': 'mass-care-roles', 'title': 'Mass Care Roles and Reporting'},
            ]
        },
        "Mass Care Group Roles and Reporting": {
            'id': 'mass-care-roles',
            'type': 'role',
            'phase': 'planning',
            'relatedGroup': 'Information & Planning',
            'relatedDocs': [
                {'id': 'mass-care-program-overview', 'title': 'Mass Care Program Overview'},
                {'id': 'mass-care-standards', 'title': 'Mass Care Group Standards'},
            ]
        },
        # Operations phase
        "Ensuring the Mass Care Team has access to Situational Awareness Reports Task Sheet": {
            'id': 'accessing-situational-awareness-reports',
            'type': 'task-sheet',
            'phase': 'operations',
            'relatedGroup': 'Information & Planning',
            'relatedDocs': [
                {'id': 'attending-daily-dro-meetings', 'title': 'Attending Daily DRO and Mass Care Meetings Task Sheet'},
                {'id': 'mass-care-roles', 'title': 'Mass Care Roles and Reporting'},
            ]
        },
        "Attending Daily DRO and Mass Care Meetings Task Sheet": {
            'id': 'attending-daily-dro-meetings',
            'type': 'task-sheet',
            'phase': 'operations',
            'relatedGroup': 'Information & Planning',
            'relatedDocs': [
                {'id': 'accessing-situational-awareness-reports', 'title': 'Accessing Situational Awareness Reports Task Sheet'},
                {'id': 'daily-tactics-planning', 'title': 'Daily Tactics Planning Task Sheet'},
            ]
        },
        "Supporting Visits to Mass Care Sites Task Sheet": {
            'id': 'coordinating-site-visits',
            'type': 'task-sheet',
            'phase': 'operations',
            'relatedGroup': 'External Relations',
            'relatedDocs': [
                {'id': 'mass-care-program-overview', 'title': 'Mass Care Program Overview'},
            ]
        },
        "Mass Care Resource Management Task Sheet (Hold until RID is released)": {
            'id': 'resource-management',
            'type': 'task-sheet',
            'phase': 'operations',
            'relatedGroup': 'Logistics',
            'relatedDocs': [
                {'id': 'creating-functional-plans', 'title': 'Creating Mass Care Functional Plans Task Sheet'},
                {'id': 'daily-tactics-planning', 'title': 'Daily Tactics Planning Task Sheet'},
            ]
        },
        "Transitioning a Mass Care Leadership Role Task Sheet": {
            'id': 'transitioning-leadership-role',
            'type': 'task-sheet',
            'phase': 'operations',
            'relatedGroup': 'Workforce',
            'relatedDocs': [
                {'id': 'accessing-situational-awareness-reports', 'title': 'Accessing Situational Awareness Reports Task Sheet'},
                {'id': 'mass-care-roles', 'title': 'Mass Care Roles and Reporting'},
            ]
        },
        "Using Mapping Tools to Inform Mass Care Service Delivery Task Sheet": {
            'id': 'using-mapping-tools',
            'type': 'task-sheet',
            'phase': 'operations',
            'relatedGroup': 'Information & Planning',
            'relatedDocs': [
                {'id': 'mass-care-standards', 'title': 'Mass Care Group Standards'},
                {'id': 'daily-tactics-planning', 'title': 'Daily Tactics Planning Task Sheet'},
            ]
        },
        # Planning phase - task sheets
        "Daily Tactics Planning (completing the 215s) & Communicating Mass Care Needs to DRO Leaders Task Sheet": {
            'id': 'daily-tactics-planning',
            'type': 'task-sheet',
            'phase': 'planning',
            'relatedGroup': 'Information & Planning',
            'relatedDocs': [
                {'id': 'creating-functional-plans', 'title': 'Creating Mass Care Functional Plans Task Sheet'},
                {'id': 'attending-daily-dro-meetings', 'title': 'Attending Daily DRO and Mass Care Meetings Task Sheet'},
            ]
        },
        "Creating Mass Care Functional Plans Task Sheet": {
            'id': 'creating-functional-plans',
            'type': 'task-sheet',
            'phase': 'planning',
            'relatedGroup': 'Information & Planning',
            'relatedDocs': [
                {'id': 'approving-functional-plans', 'title': 'Approving and Supporting Mass Care Functional Plans Task Sheet'},
                {'id': 'determining-planning-assumptions', 'title': 'Determine Mass Care Planning Assumptions Task Sheet'},
            ]
        },
        "Supporting the creation of Mass Care Planning Assumptions, Goals, and Strategy Task Sheet": {
            'id': 'determining-planning-assumptions',
            'type': 'task-sheet',
            'phase': 'planning',
            'relatedGroup': 'Information & Planning',
            'relatedDocs': [
                {'id': 'creating-functional-plans', 'title': 'Creating Mass Care Functional Plans Task Sheet'},
                {'id': 'using-regional-plans', 'title': 'Using Regional Plans on DROs Task Sheet'},
            ]
        },
        "Using Regional Plans on Disaster Relief Operations Task Sheet": {
            'id': 'using-regional-plans',
            'type': 'task-sheet',
            'phase': 'planning',
            'relatedGroup': 'Information & Planning',
            'relatedDocs': [
                {'id': 'determining-planning-assumptions', 'title': 'Determine Mass Care Planning Assumptions Task Sheet'},
                {'id': 'creating-functional-plans', 'title': 'Creating Mass Care Functional Plans Task Sheet'},
            ]
        },
        "Approving and Supporting Mass Care Functional Plans Task Sheet": {
            'id': 'approving-functional-plans',
            'type': 'task-sheet',
            'phase': 'planning',
            'relatedGroup': 'Information & Planning',
            'relatedDocs': [
                {'id': 'creating-functional-plans', 'title': 'Creating Mass Care Functional Plans Task Sheet'},
                {'id': 'determining-planning-assumptions', 'title': 'Determine Mass Care Planning Assumptions Task Sheet'},
            ]
        },
    }
    
    entries = []
    for doc in docs:
        meta = metadata_map.get(doc['title'], {})
        doc_id = meta.get('id', doc['title'].lower().replace(' ', '-').replace('(', '').replace(')', ''))
        entry = create_content_entry(doc, doc_id, meta)
        entries.append(entry)
    
    # Generate full file
    header = '''/**
 * Mass Care Content Data
 * 
 * This file contains content extracted from the OneDrive Word documents
 * and mapped to the app's information architecture.
 * 
 * Structure:
 * - Sub-activities (tiles on home screen): Mass Care, Sheltering, Feeding, etc.
 * - Related groups (shown when clicking a sub-activity): Client Care, Recovery, Workforce, etc.
 * - Doctrine content (detailed content for each document)
 */

export interface DoctrineContent {
  id: string
  title: string
  category: string
  subActivity: string
  relatedGroup?: string
  readTime: string
  lastUpdated: string
  version: string
  summary: string
  content: string
  relatedDocs: Array<{ id: string; title: string }>
  type: "overview" | "standard" | "task-sheet" | "role"
}

export const massCareContent: Record<string, DoctrineContent> = {
'''
    
    footer = '''
}

// Task Sheets organized by phase
export const taskSheets = {
  operations: [
    {
      id: "accessing-situational-awareness-reports",
      title: "Accessing Situational Awareness Reports Task Sheet",
      subActivity: "mass-care",
      relatedGroup: "Information & Planning",
    },
    {
      id: "attending-daily-dro-meetings",
      title: "Attending Daily DRO and Mass Care Meetings Task Sheet",
      subActivity: "mass-care",
      relatedGroup: "Information & Planning",
    },
    {
      id: "coordinating-site-visits",
      title: "Coordinating Visits to Mass Care Sites Task Sheet",
      subActivity: "mass-care",
      relatedGroup: "External Relations",
    },
    {
      id: "resource-management",
      title: "Mass Care Resource Management Task Sheet",
      subActivity: "mass-care",
      relatedGroup: "Logistics",
    },
    {
      id: "transitioning-leadership-role",
      title: "Transitioning a Mass Care Leadership Role Task Sheet",
      subActivity: "mass-care",
      relatedGroup: "Workforce",
    },
    {
      id: "using-mapping-tools",
      title: "Using Mapping Tools to Inform Mass Care Service Delivery Task Sheet",
      subActivity: "mass-care",
      relatedGroup: "Information & Planning",
    },
  ],
  planning: [
    {
      id: "daily-tactics-planning",
      title: "Daily Tactics Planning (completing the 215s) & Communicating Mass Care Needs to DRO Leaders Task Sheet",
      subActivity: "mass-care",
      relatedGroup: "Information & Planning",
    },
    {
      id: "creating-functional-plans",
      title: "Creating Mass Care Functional Plans Task Sheet",
      subActivity: "mass-care",
      relatedGroup: "Information & Planning",
    },
    {
      id: "determining-planning-assumptions",
      title: "Determine Mass Care Planning Assumptions Goals Strategy Task Sheet",
      subActivity: "mass-care",
      relatedGroup: "Information & Planning",
    },
    {
      id: "using-regional-plans",
      title: "Using Regional Plans on DROs Task Sheet",
      subActivity: "mass-care",
      relatedGroup: "Information & Planning",
    },
    {
      id: "approving-functional-plans",
      title: "Approving and Supporting Mass Care Functional Plans Task Sheet",
      subActivity: "mass-care",
      relatedGroup: "Information & Planning",
    },
  ],
  closing: [
    {
      id: "closing-mass-care-activities",
      title: "Closing Mass Care Activities Task Sheet",
      subActivity: "mass-care",
      relatedGroup: "Logistics",
    },
  ],
}
'''
    
    full_content = header + '\n'.join(entries) + footer
    
    # Write to file
    with open('lib/mass-care-content.ts', 'w') as f:
        f.write(full_content)
    
    print(f"✅ Generated complete mass-care-content.ts")
    print(f"   - {len(entries)} documents")
    print(f"   - {len(full_content)} characters")
    print(f"   - File written to lib/mass-care-content.ts")

if __name__ == '__main__':
    main()
