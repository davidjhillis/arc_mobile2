# Content Mapping: Word Documents to App Information Architecture

## Overview
This document maps the Word documents from the OneDrive folder to the app's information architecture.

## App Structure

### Level 1: Home Screen Tiles (Sub-Activities)
These are the tiles shown in "By Assignment" section:
- Mass Care
- Sheltering
- Feeding
- Distribution Emergency Supplies
- Reunification
- Shelter Resident Transition

### Level 2: Related Groups (Shown when clicking a sub-activity)
When a user clicks on a sub-activity tile, they see related groups:
- Client Care
- Recovery
- Workforce
- Logistics
- Information & Planning
- External Relations

### Level 3: Doctrine Content (Shown when clicking a group)
When a user clicks on a related group, they see doctrine documents organized by:

1. **Overview Documents** - High-level program information
2. **Standards** - Operational standards and requirements
3. **Roles** - Role descriptions and reporting structures
4. **Task Sheets** - Operational procedures organized by phase:
   - Operations
   - Planning
   - Closing

## Content Mapping

### Mass Care Sub-Activity

#### Related Group: Information & Planning

**Overview Documents:**
- `mass-care-program-overview` - Mass Care Program Overview
- `mass-care-standards` - Mass Care Group Standards
- `mass-care-roles` - Mass Care Roles and Reporting

**Task Sheets - Operations:**
- `accessing-situational-awareness-reports` - Accessing Situational Awareness Reports Task Sheet
- `attending-daily-dro-meetings` - Attending Daily DRO and Mass Care Meetings Task Sheet
- `using-mapping-tools` - Using Mapping Tools to Inform Mass Care Service Delivery Task Sheet

**Task Sheets - Planning:**
- `daily-tactics-planning` - Daily Tactics Planning (completing the 215s) & Communicating Mass Care Needs to DRO Leaders Task Sheet
- `creating-functional-plans` - Creating Mass Care Functional Plans Task Sheet
- `determining-planning-assumptions` - Determine Mass Care Planning Assumptions Goals Strategy Task Sheet
- `using-regional-plans` - Using Regional Plans on DROs Task Sheet
- `approving-functional-plans` - Approving and Supporting Mass Care Functional Plans Task Sheet

**Task Sheets - Closing:**
- `closing-mass-care-activities` - Closing Mass Care Activities Task Sheet

#### Related Group: External Relations

**Task Sheets - Operations:**
- `coordinating-site-visits` - Coordinating Visits to Mass Care Sites Task Sheet

#### Related Group: Logistics

**Task Sheets - Operations:**
- `resource-management` - Mass Care Resource Management Task Sheet

**Task Sheets - Closing:**
- `closing-mass-care-activities` - Closing Mass Care Activities Task Sheet (also appears here)

#### Related Group: Workforce

**Task Sheets - Operations:**
- `transitioning-leadership-role` - Transitioning a Mass Care Leadership Role Task Sheet

## Document Categories

### Overview Documents
- Mass Care Program Overview
- Mass Care Group Standards
- Mass Care Roles and Reporting

### Task Sheets by Phase

**Operations Phase:**
1. Accessing Situational Awareness Reports
2. Attending Daily DRO and Mass Care Meetings
3. Coordinating Visits to Mass Care Sites
4. Mass Care Resource Management
5. Transitioning a Mass Care Leadership Role
6. Using Mapping Tools to Inform Mass Care Service Delivery

**Planning Phase:**
1. Daily Tactics Planning (completing the 215s) & Communicating Mass Care Needs to DRO Leaders
2. Creating Mass Care Functional Plans
3. Determine Mass Care Planning Assumptions Goals Strategy
4. Using Regional Plans on DROs
5. Approving and Supporting Mass Care Functional Plans

**Closing Phase:**
1. Closing Mass Care Activities

## Next Steps

1. Extract full content from all Word documents
2. Create structured content entries for each document
3. Update doctrine-detail-screen.tsx to display content from mass-care-content.ts
4. Update doctrine-screen.tsx to show related groups based on sub-activity
5. Add content for other sub-activities (Sheltering, Feeding, etc.) as documents become available
