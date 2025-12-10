/**
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
  "closing-mass-care-activities": {
    id: "closing-mass-care-activities",
    title: "Closing Mass Care Activities Task Sheet",
    category: "Mass Care",
    subActivity: "mass-care",
    phase: "closing",
    relatedGroup: "Logistics",
    readTime: "10 min",
    lastUpdated: "Mar 2025",
    version: "0.2",
    summary: "Process for closing Mass Care activities as service delivery comes to an end",
    type: "task-sheet",
    content: `## Description

Process for closing Mass Care activities as service delivery comes to an end

## Typically performed by

HQ Mass Care Chiefs,

## Supporting on the task

Logistics section and Workforce section

## Considerations

- When all objectives for a Mass Care activity have been met and there are no indications of future need, the activity can be closed and all workers reassigned or sent home.
- Typically, Mass Care ends when all of the Red Cross shelters are closed and the DRO is nearing the demobilization phase.

## What To Do

- Confirm all objectives for each Mass Care activity have been met.
Example: When deciding to close out the Sheltering activity, a reliable indicator is if all shelters have successfully closed and there are currently no indications that sheltering will be needed again for this event.
- Provide the AD/Operations with any key information needed for the Demobilization Transition Plan.
Example: There are Feeding vendors that will submit Feeding invoices in the near future. Alert the AD/Operations to ensure the transition meeting communicates a point of contact (POC) for the local region to contact when they receive the invoices.
- Verify with other sections and activities that there are no outstanding items for the Mass Care activity to complete.
- Common activities include Workforce and Logistics.
- When you feel confident an activity is ready for closure, submit your recommendation for approval by the AD/Operations.
- Once the AD/Operations has approved the closure of the activity, inform all key stakeholders (ie. Logistics, Workforce, and External Relations) that the activity is closed.

## Links/Related Information

- Demobilization Transition Plan`,
    relatedDocs: [
      { id: "mass-care-program-overview", title: "Mass Care Program Overview" },
      { id: "resource-management", title: "Mass Care Resource Management Task Sheet" }
    ],
  },
  "mass-care-standards": {
    id: "mass-care-standards",
    title: "Mass Care Group Standards",
    category: "Mass Care",
    subActivity: "mass-care",
    phase: "planning",
    relatedGroup: "Information & Planning",
    readTime: "10 min",
    lastUpdated: "Mar 2025",
    version: "0.2",
    summary: "Over-arching standards that must be followed by the Mass Care group. (For activity-level standards, like Sheltering, see the standards for each activity.)",
    type: "standard",
    content: `## Description

Over-arching standards that must be followed by the Mass Care group. (For activity-level standards, like Sheltering, see the standards for each activity.)

### M.1 - Regions must be able to initiate mass care service delivery within 2 hours of notification of displacement.

Regions are accountable for building a Mass Care program that is able to deliver initial Mass Care services to communities within 2 hours of receiving a notification of mass care needs.

### Initial Mass Care services usually include (but are not limited to):

- Opening and operating shelters and mass care service sites (including Warming Centers, Cooling Centers, Evacuation Points, etc.)
- Sending workforce and/or supplies to shelters managed by partner agencies
- Feeding to support mass care delivery sites
- Reunification services
- Distribution of Emergency Supplies support to mass care delivery sites
- Coordinating resources to support household pets.

## Related Articles

‏ • Mass Care Program Essentials

### M.2– The DRO Director must ensure all Mass Care service sites meet safety and service delivery requirements.

DRO Directors are responsible for collaborating with their teams to consider the following when selecting all Mass Care service delivery sites that being used or supported by the Red Cross:
- Accessibility: Sites should be accessible to those with functional and access needs.
- Transportation Accessibility: Consider a site’s location related to major highways and other transportation factors, as well as the impact of traffic (including new traffic patterns caused by the disaster)
- Safety: All sites must be safe to operate inside and near their location. DRO Directors also consider the perception of safety at sites. (Though a site may be safe, if the community perceives the site is unsafe, it may not be a good choice).
- Risk of hazards: Factor in any possible follow-on hazards (including flooding, rainfall, surge inundation, winds, etc. after a storm) that may take place at the site.
- Communications: All sites should be able to communicate with DRO Headquarters.

### M.3 – The Red Cross supports evacuation and warming/cooling centers when clients do not need dormitory services and when resources allow.

Centers are considered Mass Care service delivery sites. Disaster leaders must treat the opening and operation of Red Cross-managed and partner-managed shelters as priority, so disaster resources should always remain available to initiate and deliver sheltering services (over centers).

## Related Articles

- Determining Whether a Center Should be Opened or  Supported and Whether to Transition to a Shelter

### M.4 – The Red Cross collaborates with local Emergency Management and community partners when offering mass care service delivery.

Mass Care leaders work with local relationship holders or the external relations section to coordinate mass care service delivery with local emergency management agencies where the disaster occurs, including:
- Location of service delivery
- Clarity on Red Cross role at the site
- Establish clarity on Red Cross standards/principles
- Establish clarity on government and partners roles (including provision of services, workforce, and/or materials)

While coordination and support from government partners is ideal, the Red Cross is an independent agency. Humanitarian need may require Red Cross to conduct mass care service delivery without government partner support.

### M.5 – Mass Care leadership must prioritize the stabilization of Red Cross Shelters.

Mass Care leaders prioritize the resourcing and services of Red Cross shelters during the initiation phase of a response. This may require Mass Care leaders to delay community feeding or distribution of emergency supply efforts to prioritize shelter stabilization.

### M.6 – Mass care services are initially based on a community’s stated needs, transitioning to verified needs as information becomes available.

Initiation of mass care services is often based on needs identified by Emergency Management or situational awareness. As information is verified, the DRO Director and AD of Operations adjust service delivery to reflect verified community needs.

## Related Articles

- Red Cross Support to Centers Standards
- Using Mapping Tools to Inform Service Delivery Task Sheet

### M.7 – Mass Care coordinates with Logistics, External Relations, and Workforce when opening and closing mass care service delivery sites.

Mass Care leadership are coordinates mass care service delivery sites with the Logistics, External Relations, and Workforce sections of the disaster relief operation.
- The Logistics section provides guidance on actions needed to open, sustain operations, and/or close a site.
- The External Relations section alerts external stakeholders of site status and helps maintain unified messaging about the site.
- The Workforce section supports the workforce assigned to the site by maintaining Volunteer Connection data and other workforce support functions.

### M.8 - Mass care operational objectives and tactics prioritize community need and social vulnerability.

When a DRO receives a request from a government agency for mass care services, the DRO uses available data to prioritize requests based on community needs, social vulnerability, and available Red Cross resources.

## Related Articles

- Using Mapping Tools to Inform Service Delivery Task Sheet

### M.9 - Mass care service delivery sites must be documented in WebEOC and SCIA, updating status in real time.

All service delivery sites must be documented and maintained in WebEOC and SCIA. This includes providing real-time information about site location, site services, and for shelters, overnight stays (which entered daily into SCIA).

A Mass Care delivery site is any site where the Red Cross supports or delivers Mass Care services. As part of the planning process, DRO leaders communicate and discuss Mass Care Service delivery sites in the Operational Tactics meeting and the DRO Planning meeting.

## Related Articles

- Shelter Activity Standards
- Feeding Activity Standards
- DES Activity Standards
- WebEOC Information Hub
- Using SCIA for Nightly Shelter Counts and Client Registration

### M.10 - Mass Care service delivery must be informed by approved functional plans.

Ideally, each Mass Care activity has a functional plan during the initiation phase of a disaster. A functional plan is required as each Mass Care activity reaches stabilization. All Mass Care Functional Plans must be aligned with approved Mass Care Planning Assumptions, Advanced Operational Plans (AOPs), and Service Delivery Plans (SDPs).

## Related Articles

- Functional Plan
-

### M.11 - Mass Care group and activity leadership must conduct site visits at Mass Care delivery sites on a regular basis.

Mass Care leadership must get out to Mass Care delivery sites to ensure that the site is:
- Operating in alignment with service delivery plans
- Achieving or exceeding standards
- Establish a relationship with field leaders

The frequency of these visits will ultimately be determined in collaboration with the AD of Operation; however, these visits should be prioritized during the initiation phase of a site.`,
    relatedDocs: [
      { id: "mass-care-program-overview", title: "Mass Care Program Overview" },
      { id: "mass-care-roles", title: "Mass Care Roles and Reporting" }
    ],
  },
  "mass-care-program-overview": {
    id: "mass-care-program-overview",
    title: "Mass Care Program Overview",
    category: "Mass Care",
    subActivity: "mass-care",
    phase: "planning",
    relatedGroup: "Information & Planning",
    readTime: "10 min",
    lastUpdated: "Mar 2025",
    version: "0.2",
    summary: "Provides an executive or high-level overview of the Mass Care Program and service delivery principles",
    type: "overview",
    content: `## Description

Provides an executive or high-level overview of the Mass Care Program and service delivery principles

## Overview

“Mass care” refers to the coordinated delivery of lifesaving and life-sustaining services to households and communities whose ability to meet basic needs has been disrupted by disaster. Mass Care programs are designed to limit displacement, shorten the duration of displacement, and reduce the risk of long-term hardship for affected populations.
The American Red Cross collaborates with local communities, states, and the federal government to plan for and deliver mass care services to achieve the following four outcomes for households:
- Mitigate the conditions experienced by displaced people,
- Shorten the duration of displacement,
- Prevent displacement whenever possible, and
- Reduce the risk of households falling into poverty after being displaced.

## Leadership Overview

### Mass Care Service Delivery Principles

Mass care activities and operational decisions must be guided by the Fundamental Principles of the Red Cross and Red Crescent Network and the Mass Care program principles listed below.
- The goals of mass care services are to:
- Reduce the suffering of those affected by a disaster
- Enable disaster-affected people to begin their recovery as soon as possible
- Help people to stay in habitable homes after a disaster
- Support other Red Cross activities that reduce the risk of post-disaster poverty for clients who were housed prior to a disaster.
- During evacuations, mass care services will be available to clients with stated needs.
After a disaster moves into the sustainment phase, mass care services focus on those communities and individuals that have verified disaster needs.
- Regions and divisions must have an effective readiness strategy to ensure we deliver mass care services effectively on all levels of disaster response.
- An effective readiness strategy includes deliberate planning.
- Planning includes discussion and agreement with other government and community agencies.
- Stated vs Verified needs

## Mass Care Services

To achieve the four displacement outcomes in the immediate aftermath of a disaster, the American Red Cross provides the following services as part of the Mass Care program.
### Shelter Services

Activities provided to individuals and families staying in a safe and temporary place when displaced due to a disaster. Shelter Services include the following activities
- Shelter Management - Coordination, operation, and support of partner shelters to ensure they are safe, organized, and equipped to meet the needs of displaced individuals. This activity ensures that shelters are managed efficiently and that residents’ needs are addressed in an orderly and respectful manner.

- Shelter Resident Transition Casework - Providing casework to help displaced individuals transition from emergency shelter to more stable living arrangements. Caseworkers assist individuals and families in identifying long-term housing solutions, accessing financial assistance, and navigating available recovery programs. This activity provides emotional support and referrals for further resources.

- Shelter Feeding - Provision of meals and snacks to shelter residents to meet their nutritional needs. This service ensures that displaced individuals and families have access to balanced meals, snacks, and clean water while staying in temporary shelters.

- Pet Shelter and Care - Coordinating temporary shelter and care for pets and animals of displaced households staying in an emergency shelter. This activity helps families care for their pets by offering safe, secure shelters for animals in disaster areas, and includes pet feeding and other necessary services for animal well-being.

### Community Operations

Activities provided within communities to support families from becoming displaced and improve conditions while community leaders restore a community's infrastructure. Community services focus on preventing displacement and supporting a community's early recovery efforts: Community Services include the following activities
- Community Feeding - the provision of nutritious meals, snacks, and hydration in disaster-affected communities to supplement dietary needs, especially to those who may not yet be able to reach a shelter or who may become displaced due to a lack of food infrastructure in their community.

- Distribution of Emergency supplies and services – The provision of life-saving food, water, and sanitation supplies, along with life-sustaining cleaning products, partner services, and other essential items to help communities safely clean and return to their homes.

- Reunification - Assisting families separated during the disaster by helping them reconnect with loved ones.

## Initiating Mass Care Services

Mass care services are designed to address the needs of entire communities, rather than individual households. The Red Cross initiates Mass Care services when multiple households are impacted by a disaster or there is a threat of impact from an impending disaster.
The initiation of mass care services involves several key steps:
- Clarifying the scope and impact of the disaster – Understanding the scale and severity of the disaster to accurately assess the needs of the affected population.
- Identifying current and anticipated needs – Assessing the immediate and future needs of impacted households, including shelter, food, water, and other critical services.
- Providing mass care services – Delivering essential services to the affected population based on the identified needs. This may include sheltering, feeding, health services, and more.
Through this process, the Red Cross, in coordination with local governments and other stakeholders, ensures that all people affected by the disaster receive appropriate, equitable, and timely services.

## Triggers for Initiating Mass Care Services

Disaster leaders evaluate the following triggers, which may result in the Red Cross initiating mass care services:
- A significant number of individuals or households are expected to be displaced.
- Evacuations are expected, ordered, or occurring.
- Government and/or community resources are unable to meet the basic needs of a community.
- Local officials or community organizations request support from the Red Cross.

## Related Resources

- Mass Care Standards
- Initiating Mass Care Services
- Mass Care Roles and Reporting
- Sheltering Overview
- Feeding Overview
- Reunification Overview
- Shelter Resident Transition Overview
- Distribution of Emergency Supplies Overview
- Household Pet Support Overview
- Unsolicited Donations Management Overview
Questions?
For questions about Mass Care activities, refer to the resources above. For additional assistance, contact Masscare@redcross.org.`,
    relatedDocs: [
      { id: "mass-care-standards", title: "Mass Care Group Standards" },
      { id: "mass-care-roles", title: "Mass Care Roles and Reporting" }
    ],
  },
  "mass-care-roles": {
    id: "mass-care-roles",
    title: "Mass Care Group Roles and Reporting",
    category: "Mass Care",
    subActivity: "mass-care",
    phase: "planning",
    relatedGroup: "Information & Planning",
    readTime: "10 min",
    lastUpdated: "Mar 2025",
    version: "0.2",
    summary: "Provides a list of roles in the Mass Care group with their GAP requirements, reporting structure, and high-level responsibilities",
    type: "role",
    content: `## Description

Provides a list of roles in the Mass Care group with their GAP requirements, reporting structure, and high-level responsibilities
DRO Headquarters
AD Operations
- Accountable for prioritizing, achieving, and sustaining Mass Care standards
HQ Mass Care Chief
- Minimum GAP: MC//CH
- Reports to Assistant Director of Operations (AD/Ops)
- Typically needed for complex Mass Care operations (Level 4+).
- Responsible for leading and managing the Mass Care group and all of its activities.
- Responsible for supporting the activities of any Activity Manager position that is vacant.
- Accountable for ensuring all Mass Care activities follow program standards.
HQ Mass Care Manager
- Minimum GAP: MC/GEN/MN
- Reports to Assistant Director of Operations (AD/Ops) or HQ Mass Care Chief
- Typically needed for Mass Care operations (Level 2-3)
- Responsible for leading and managing the Mass Care group and all its activities.
- Responsible for filling any Activity Manager position that is vacant
- Accountable for ensuring that all Mass Care activities are conducting service delivery in accordance with program standards.
- In complex Mass Care operations (level 4+) this position can be assigned to support the Mass Care Chief with managing the Mass Care group. In these situations, they can be assigned to support Mass Care Sheltering or Community Services.
Mass Care Admin
- Minimum GAP: MC/All/SA
- Reports to HQ Mass Care Chief
- This position is typically needed on a complex Mass Care operation (Level 4+).
- Typically this position supports an operation by supporting administrative tasks. Such as supporting data collection, completing planning documents, and maintaining systems.
- Responsible for supporting the Mass Care group as directed by their supervisor.
Tables of Organization
- Mass Care group and activity table of organization can be found in the latest ConOps Tables of Organization and Position-Assignment Charts.
- National Disaster Operations Coordination Center (DOCC) table of organization can be found here.
- For current roster of activated Disaster Operations Coordination Center (DOCC) Watch Officers and activation level please check out the national operations summary.
Additional Resources
- Mass Care Program Overview
- Mass Care Standards
- Sheltering Roles and Reporting
- Feeding Roles and Reporting
- DES Roles and Reporting
- Reunification Roles and Reporting
- Household Pets Roles and Reporting
Questions
For more information, contact masscare@recross.org`,
    relatedDocs: [
      { id: "mass-care-program-overview", title: "Mass Care Program Overview" },
      { id: "mass-care-standards", title: "Mass Care Group Standards" }
    ],
  },
  "accessing-situational-awareness-reports": {
    id: "accessing-situational-awareness-reports",
    title: "Ensuring the Mass Care Team has access to Situational Awareness Reports Task Sheet",
    category: "Mass Care",
    subActivity: "mass-care",
    phase: "operations",
    relatedGroup: "Information & Planning",
    readTime: "10 min",
    lastUpdated: "Mar 2025",
    version: "0.2",
    summary: "Guidance for reviewing staffing rosters and distribution lists to ensure access to DRO reports, meetings, and emails",
    type: "task-sheet",
    content: `## Description

Guidance for reviewing staffing rosters and distribution lists to ensure access to DRO reports, meetings, and emails

## Typically performed by

HQ Mass Care Chiefs

Supporting on the task: Workforce section, Information & Planning section, and External Relations section

## Considerations

- On any disaster relief operation (DRO), information is communicated via a series of systems, reports, and meetings. This information is designed to be shared with the specific roles who need it.
- Due to the temporary nature of DRO assignments, the HQ Mass Care Chief must ensure the individuals assigned to the operation are included in the distribution of these reports.
- Some DRO information is also available via systems, like the DRO Teams site, RC View, and WebEOC.
- WebEOC boards are available by role/assignment. See the WebEOC Information Hub for information about role-specific access to WebEOC.
- Mass Care Activity Leadership should have access to the National Operations Summary (to link).

## What To Do

Work with the Information & Planning section to get a list of reports, daily emails, distribution lists, and other sources that the disaster relief operation (DRO) uses to communicate about planning and service delivery.
- Some reports, such as the Incident Action Plan (IAP), are distributed for every operations period via an automatic distribution list linked to Volunteer Connection.
If someone is not getting the IAP, please work with Workforce to ensure they are assigned to the operations correctly.
Typically, an operational period lasts for 24 hours. However there are Operations in week the operations period may be for several days (i.e. 72 hours or 7-days).

Common items include DRO Teams site and Operational Planning Worksheets (215).
Connect with the Workforce section to get a list of reports, daily emails, distribution lists, and other sources that the disaster relief operation uses to communicate about staffing.
Common reports include the responder application, staffing rosters, Arrival Roster, and Air Travel Roster.
- Review the staff roster for your headquarters staff. Ensure the staff roster is correct and complete, and review the roster to identify which individuals (by role) need access to reports.
If you do not have a staff roster, work with the Workforce section to get one.
Work with the Workforce Section to resolve any corrections needed.
- Submit the names of people who should receive reports to the Information & Planning and Workforce sections.

## Links / Related Information

- WebEOC Information Hub
- Using MS Teams for DROs`,
    relatedDocs: [
      { id: "attending-daily-dro-meetings", title: "Attending Daily DRO and Mass Care Meetings Task Sheet" },
      { id: "mass-care-roles", title: "Mass Care Roles and Reporting" }
    ],
  },
  "attending-daily-dro-meetings": {
    id: "attending-daily-dro-meetings",
    title: "Attending Daily DRO and Mass Care Meetings Task Sheet",
    category: "Mass Care",
    subActivity: "mass-care",
    phase: "operations",
    relatedGroup: "Information & Planning",
    readTime: "10 min",
    lastUpdated: "Mar 2025",
    version: "0.2",
    summary: "Provides a list of likely meetings attended by Mass Care leaders, along with guidance for preparing for and attending meetings",
    type: "task-sheet",
    content: `## Description

Provides a list of likely meetings attended by Mass Care leaders, along with guidance for preparing for and attending meetings

## Typically performed by

Mass Care activity managers

Supporting on the task: HQ Mass Care Chiefs, Information & Planning section, and External Relations section

## Considerations

Each disaster relief operation (DRO) has standard meetings that are part of the planning process.
Disaster Relief Operation Meetings
- Mandatory meetings typically include:
Daily Sheltering Support Coordination Meeting (for Level 4+ DROs)
Operations Tactics Meeting
Operations Briefing (sometimes referred to as the “All-Hands Call”)
On some DROs, you may also be expected to attend:
Leadership Briefing/ Meeting
Planning Meeting
Mass Care-Specific Meetings
Consider holding daily meetings with your Mass Care team. These meetings can be used to provide inspiration to the team, gain situational awareness, outline expectations, and discuss issues that need to be resolved.

## What To Do

Prepare for and Attend Disaster Relief Operation Meetings
- Review the Incident Action Planning (IAP) meeting agenda section for the meetings you are required to attend.
Consult the HQ Mass Care Chief to understand your role in the meeting, what is expected from you, and what information you need to have available before the meeting.
- Based on the meeting agenda, gather the information and situational awareness required.
For example, if you are preparing for the Operations Tactics Meeting, ensure each Mass Care activity has completed and submitted their Operational Planning Worksheets (215).
- Review all the information you are going to present and use for the meeting.
- During the meeting take note of all action items required of you and your team.
- Share action items with the team and communicate timing and reporting needed to finalize the action item.
Hold Mass Care-Specific Meetings
- Ensure that all members of the team receive an invitation to the meeting.
- Create an agenda for the meeting.
- Review the agenda and meeting purpose with the team at the beginning of the meeting
- Foster honest and open two-way communication with the team.
- During the meeting, record action items required of you and your team.
- Reiterate action items with the team via email and communicate timing and reporting needed to finalize the action item.

## Links / Related Information

Incident Action Planning Job Tool`,
    relatedDocs: [
      { id: "accessing-situational-awareness-reports", title: "Accessing Situational Awareness Reports Task Sheet" },
      { id: "daily-tactics-planning", title: "Daily Tactics Planning Task Sheet" }
    ],
  },
  "coordinating-site-visits": {
    id: "coordinating-site-visits",
    title: "Supporting Visits to Mass Care Sites Task Sheet",
    category: "Mass Care",
    subActivity: "mass-care",
    phase: "operations",
    relatedGroup: "External Relations",
    readTime: "10 min",
    lastUpdated: "Mar 2025",
    version: "0.2",
    summary: "Guidance for Mass Care leaders in supporting visits to mass care service delivery sites",
    type: "task-sheet",
    content: `## Description

Guidance for Mass Care leaders in supporting visits to mass care service delivery sites

## Typically performed by

HQ Mass Care Chiefs and Mass Care activity managers

## Supported by

External Relations section

## Considerations

- Typically, the External Relations section coordinates and manages site visits by major donors and organizational VIPs.
- External Relations schedules visits, determines agendas, and often accompanies visitors on their site tours or assignments.
- Site visits by operational leadership, activity leadership, organizational VIPs, and external partners are a critical component to Mass Care operations. If coordinated correctly they can:
- Raise client and staff morale.
- Highlight the work of the Red Cross.
- Help leadership understand shelter operations and any unmet needs or concerns.

## What To Do

- Understand the reason for the visit.
- Ask questions to understand what the prospective site visitor hopes to gain from their site visit.
- Coordinate the site visit requirements with the site to provide the best opportunity to meet stated needs.
- It is best to have several options available.
- Ensure all stakeholders are aware of the site visit.
- Provide options to prospective site visitors and confirm details about site visit.
- Coordinate with site managers about upcoming visits and provide all available details.
- Consult with the site manager about their preferred timing of the visit and if there are any concerns about the site being a good option for a visit.
- If site selection and timing have already been determined, inform the site manager of the visitor’s requirements and discuss how these can be supported to ensure a successful visit.
- Set expectations with prospective site visitors.
- Inform them of the type of conditions they should expect (like heavy traffic, no water, limited staffing, etc.).
- Ask visitors to make a note of any issues and observations and report them to you to resolve. The site visit must not interfere with shelter operations or staff management structures.
- When the visit is complete, conduct a follow-up with both site manager and site visitor.
- Use visit reports as an opportunity to gain feedback about field operations, issues, and staff and client morale at the shelter.

## Links / Related Information`,
    relatedDocs: [
      { id: "mass-care-program-overview", title: "Mass Care Program Overview" }
    ],
  },
  "resource-management": {
    id: "resource-management",
    title: "Mass Care Resource Management Task Sheet (Hold until RID is released)",
    category: "Mass Care",
    subActivity: "mass-care",
    phase: "operations",
    relatedGroup: "Logistics",
    readTime: "10 min",
    lastUpdated: "Mar 2025",
    version: "0.2",
    summary: "Procedures for HQ Mass Care Chiefs in making, tracking, and approving requests for staff, material resources, and services",
    type: "task-sheet",
    content: `## Description

Procedures for HQ Mass Care Chiefs in making, tracking, and approving requests for staff, material resources, and services

## Typically performed by

HQ Mass Care Chiefs

## Supporting on the task

Mass Care activity managers, Logistics section, and Finance Section

## Considerations

Mass Care activity managers submit requests for staff, material resources, and services.
WebEOC is the system of record for requesting material resources and services.
Submit staff requests using the Staff Request Form.
All DROs or incidents have resource and spending limits.
Concept of Operations 5.0 lists the finical authority for all leadership positions. This is used until authority is delegated.
Delegated budget/resource authority is typically documented in the Advance Operational Plan (AOP) and Service Delivery Plan (SDP).
HQ Mass Care Chiefs have an assigned signing authority, which limits the dollar amount of any request they can approve. Confirm your signing authority for the DRO with the Finance section or the AD / Operations.
- What To Do
Submit Requests for Staff, Material Resources, and Services
Prior to submitting requests through WebEOC or staffing forms, communicate with the Logistics and/or Workforce section. Tell them when to expect your request and discuss expectations for filling the request.
Submit requests based on need, often identified during tactics meetings, sheltering coordination meetings, and daily team meetings.
Ensure that requests are not duplicated and monitor the costs and quantities of staff and supplies being ordered.
Understand and adhere to DRO resource and spending/resource limits.
Tracking Material Resource Requests in WebEOC
Use WebEOC to track material resource and service requests.
- Log into WebEOC and access the RID board. (If you do not have access to WebEOC work with the Information & Planning section to get access.)
- Select the Request/Task tab.
- Use the Filter/Search section to select the information you need to review.
The Mass Care group is part of the OPS section. All requests/tasks are listed under Mass Care.
Do the task several times a day to monitor requests, especially before meetings that require status updates for requests.
Approving Mass Care Requests in WebEOC
- Log into WebEOC and access the RID board.
- In Filter/Search, select the Request Approval section.
- Select the tasks you need to review.
The Pending DRO Approval status is the most common.
- Review the requests that are pending for the Mass Care activity.
Maintain awareness of what was already approved and rejected.
- Ensure all requests are within the approved limits, planning assumptions, and functional plan.
- If a request is needed but exceeds spending limits, consult the AD of Operations as an update to Service Delivery or Functional plan may be required.
- If a request exceeds your signing authority but you have verified with the requester that the request is valid, refer it to the AD / Operations.
- Reject any requests that cannot be validated and notify the requester.

Tracking Staffing Resource Requests
Open staffing requests and current staffing levels can be seen in the National Operations Summary under the Logistics Tab.
For the most up to date information, work with the DRO Workforce section to get updated information.

## Links / Related Information

- WebEOC Information Hub`,
    relatedDocs: [
      { id: "creating-functional-plans", title: "Creating Mass Care Functional Plans Task Sheet" },
      { id: "daily-tactics-planning", title: "Daily Tactics Planning Task Sheet" }
    ],
  },
  "transitioning-leadership-role": {
    id: "transitioning-leadership-role",
    title: "Transitioning a Mass Care Leadership Role Task Sheet",
    category: "Mass Care",
    subActivity: "mass-care",
    phase: "operations",
    relatedGroup: "Workforce",
    readTime: "10 min",
    lastUpdated: "Mar 2025",
    version: "0.2",
    summary: "Provides detailed guidance for how to support the transition between DRO Headquarters Mass Care leaders on a DRO",
    type: "task-sheet",
    content: `## Description

Provides detailed guidance for how to support the transition between DRO Headquarters Mass Care leaders on a DRO

## Typically performed by

HQ Mass Care Chiefs and Mass Care activity managers

## Supporting on the task

AD of Operations and Workforce section

## Considerations

Leadership transitions are normal during disaster relief operations (DROs).
Most assignments last for about 2 to 3 weeks. Regional responses may result in shorter or longer assignments.
Leadership positions often take longer for the Workforce section to fill, so plan at least 5 days for the planned leadership transition.

## What To Do

- Determine the out-processing date of the Mass Care leader.
The out-processing date is the last work day of a deployed worker and can be found on the Daily Staffing Roster (see Ensuring the Mass Care Team has access to Situational Awareness Reports Task Sheet for information on how to get this report) .
- Submit an approved staff request to backfill the position with a travel date at least 24 hours before the day the replacement is needed.
- Review the Arrival Roster for the name of the replacement (see Ensuring the Mass Care Team has access to Situational Awareness Reports Task Sheet for information on how to get this report) .
Ensure the incoming worker has access to all necessary information, including documents, Teams sites, shared documents and WebEOC as appropriate for their role.
The leaving Mass Care leader is responsible for communicating the following:
Service delivery sites.
Pending missions or issues.
- Current staff rosters and anticipated needs.
- What phase (initiating, stabilization, or closing) the DRO is currently operating in.

## Links/Related Information

- Any Workforce information about worker transitions
- DRO Staff Request Form
- Ensuring the Mass Care Team has access to Situational Awareness Reports Task Sheet`,
    relatedDocs: [
      { id: "accessing-situational-awareness-reports", title: "Accessing Situational Awareness Reports Task Sheet" },
      { id: "mass-care-roles", title: "Mass Care Roles and Reporting" }
    ],
  },
  "using-mapping-tools": {
    id: "using-mapping-tools",
    title: "Using Mapping Tools to Inform Mass Care Service Delivery Task Sheet",
    category: "Mass Care",
    subActivity: "mass-care",
    phase: "operations",
    relatedGroup: "Information & Planning",
    readTime: "10 min",
    lastUpdated: "Mar 2025",
    version: "0.2",
    summary: "An overview of information available in RC View that should be used to inform Mass Care service delivery",
    type: "task-sheet",
    content: `## Description

An overview of information available in RC View that should be used to inform Mass Care service delivery

## Typically performed by

Mass Care activity managers

## Supporting on the task

HQ Mass Care Chiefs, Information & Planning section, Considerations

RC View
Use RC View to maintain awareness of activities, service delivery statistics, and other relevant information on the disaster relief operation (DRO).
- The National Operations Summary visualizes information and illustrates a clear operational view of the DRO.
Section 1 – Situational Summary Map contains useful information about all current DROs, weather, potential weather threat and storm reports, and other information.
Section 3 – Sheltering contains the official overnight shelter count and aggregated data collected from the Shelter Client Information Application (SCIA).
Section 6 – SAD & DRO contains Contact Center data, disaster assessment information, and the social vulnerability index.
Members of the Information & Planning section can provide more information about navigating RC View.
The morning National Sync call often provides a useful tour of the data and information in RC View.

## What To Do

- Navigate to RC View: National Operations Summary
- Navigate to Section 3 - Sheltering
- Check the overnight shelter count
- There is a dashboard called Shelter Intake which has useful information from the Shelter Client Information Application (SCIA).
- Navigate to Section 6 - SAD & DRO
- Select the Active DRO tab
- Manipulate the map data to get useful information about the DRO
Use the layer tool to expose or hide information such as Contact Center, disaster assessment, open shelters, etc.
- Review service delivery plans and check for alignment with the data in RC View.
Example: Using the DRO Contact Center information can identify if incoming calls for assistance align with service delivery.
- Adjust plans as needed based on the data available and other factors that inform service delivery plans.

## Links / Related Information

- ArcGIS Online (AGOL) Information Hub`,
    relatedDocs: [
      { id: "mass-care-standards", title: "Mass Care Group Standards" },
      { id: "daily-tactics-planning", title: "Daily Tactics Planning Task Sheet" }
    ],
  },
  "daily-tactics-planning": {
    id: "daily-tactics-planning",
    title: "Daily Tactics Planning (completing the 215s) & Communicating Mass Care Needs to DRO Leaders Task Sheet",
    category: "Mass Care",
    subActivity: "mass-care",
    phase: "planning",
    relatedGroup: "Information & Planning",
    readTime: "10 min",
    lastUpdated: "Mar 2025",
    version: "0.2",
    summary: "Provides guidance on daily tactics planning and communicating mass care needs to operational leadership.",
    type: "task-sheet",
    content: `## Description

Provides guidance on daily tactics planning and communicating mass care needs to operational leadership.

## Typically performed by

Mass Care activity managers & HQ Mass Care Chiefs

Supporting on the task: AD of Operations, Information & Planning section, and External Relations section

## Considerations

- Each disaster relief operation (DRO) follows the standard Incident Command System (ICS) incident planning process.
- The incident planning process is designed to identify critical pathways, resource requirements, and roadblocks for each mass care delivery site. Successful application of the planning process requires close collaboration with the Information & Planning section and discipline to keep to the deadlines and meetings required by the process.
- Tactics and work assignments are updated during the operational period (normally 24 hours) using an Operational Planning Worksheet (215) and presented in the Tactics meeting.
- It’s equally important that Mass Care leaders are deliberate in communicating Mass Care leaders' needs or constraints to DRO Leaders. The planning process gives Mass Care leaders the framework to effectively communicate these needs.

## What To Do

Operational Tactics & Preparing the Operational Planning Worksheet (215)
- Review the incident objectives in the Incident Action Plan (IAP) and/or obtain incident objectives from the AD of Operations.
- Understand the current situation
- Use WebEOC and other information sources (including your supervisor) to figure out pending requests, current service sites/delivery, projected requests, etc.
- Pull up your Mass Care Planning Assumptions, functional plans, and information from DRO leadership to determine the Mass Care service delivery requirements.
- An example: Leadership has communicated the need to fulfill all pending shelter requests as soon as possible. Currently there are 15 shelters missions in the WebEOC mission tracker that we must resource and open. We then need 15 shelter teams to support these 15 shelter missions.
- Open the Operational Planning Worksheet (215)
- Complete the Operational Planning Worksheet (215) using the instructions in the sheet. Please note this is the plan for the next operational period, not the current one.
- Resource Identifier is where you place the worksite (ie. a Kitchen site, DES route, shelter site etc.). This is also where you identify teams that are assigned to a general area and will complete critical missions that come up during the operational period (i.e.. Shelter Team #1 is on-standby to activate a shelter in Orleans Parish, Address TBD).
- When the DR is still initiating and the service delivery is still not stabilized, it is a best practice to keep some teams on alert to fulfill urgent requests that come in.
- For example, let’s say you have 10 ERVs at Kitchen #1, you may have 7 defined feeding routes. You should consider having 3 ERVs on alert to handle urgent missions. If no urgent missions come, you can work with Information and Planning to come up with alternative routes for the ERV to do seek and serve if no missions come up.
- Review the completed Operational Planning Worksheet (215) make note of:
- Resource shortfalls
- Resource surpluses
- Resources on alert/stand-by
- Missions or tasks that cannot be fulfilled during this operational period
- Ensure 215s are ready to be reviewed at the 1300 Tactics Meeting.
- It is imperative that the 215 is complete and ready before the tactics meeting. If that’s not possible this must be communicated to your supervisor.
- If needed, adjust 215s as the situation evolves. It is imperative that any changes be communicated to your supervisor and ultimately the AD of Operations as well as other key stakeholders.
Identifying Critical Pathways, resource requirements, and Roadblocks
- Assemble your team to review the 215 before the tactics meeting to determine what shortfalls or other considerations may/will impact your ability to execute the plan.
- Considerations may include (but are not limited to):
- Resource shortfalls
- Transportation
- Traffic/ Road accessibility
- Travel Time/ location of resources
- Curfews
- Make note of these items and be prepared to discuss during the Tactics Meeting. If the Mass Care Chief is representing you in the meeting, brief them on these items before the tactics meeting.
Conveying Critical Pathways and Roadblocks
- Once you have a good understanding of critical pathways and roadblocks, convey the information to operational leadership (this is typically done in the Tactics Meeting).
- Making sure to include:
- The roadblock/ critical pathway
- What is needed to overcome roadblocks
- Proposed alternatives or options (if possible)
- Impacts on service delivery
- It is important to use precise language when conveying these. Instead of being vague and saying, “We can’t do this,” say “We need 20 more ERV drivers to achieve this task.”

## Links / Related Information

- Operational Planning Worksheet`,
    relatedDocs: [
      { id: "creating-functional-plans", title: "Creating Mass Care Functional Plans Task Sheet" },
      { id: "attending-daily-dro-meetings", title: "Attending Daily DRO and Mass Care Meetings Task Sheet" }
    ],
  },
  "creating-functional-plans": {
    id: "creating-functional-plans",
    title: "Creating Mass Care Functional Plans Task Sheet",
    category: "Mass Care",
    subActivity: "mass-care",
    phase: "planning",
    relatedGroup: "Information & Planning",
    readTime: "10 min",
    lastUpdated: "Mar 2025",
    version: "0.2",
    summary: "Guide for Mass Care activity managers in creating functional plans",
    type: "task-sheet",
    content: `## Description

Guide for Mass Care activity managers in creating functional plans

## Typically performed by

Mass Care activity managers

## Supporting on the task

HQ Mass Care Chiefs, DOCC Watch Officers

## Considerations

- A functional plan is an operational plan that guides and directs a specific functional area (like Feeding) or objective (like community feeding) during a disaster relief operation.
- Functional plans typically address short-term actions and define and communicate operational details needed to deliver specified service(s).
- A functional plan must reflect approved mass care planning assumptions, including the goals, priorities, and courses of action.
- The HQ Mass Care Chief approves Mass Care activity functional plans, gains concurrence with other operational leaders, and shares the finalized plans with other sections who support functional plans. See the Approving and Supporting Mass Care Functional Plans Task Sheet.

## What To Do

- Assemble the leadership team of an activity: HQ activity Manager, District Activity Coordinators, and other key activity stakeholders (ie. assistant activity managers).
- Open the DRO Functional Plan Template.
- When updating a functional plan, start with the most recent approved plan that needs to be updated.
- Consult the approved mass care planning assumptions for the DRO.
- Complete each section of the functional plan and ensure it aligned with the mass care planning assumptions. Sections to complete include:
- Situation
- Timeline
- Priorities
- Goals
- Strategies
- Operational Tasks
- Workforce & Resources Needs
- Use your experience, expertise, and common sense to review the plan. Every plan should be simple, achievable, in alignment with the DRO/ other Mass Care activities, and generally make sense.
- Share the plan details with your Mass Care leadership, like the HQ Mass Care Chief and related Mass Care activity managers.
- For complex operations or if you want a subject-matter expert to review your plan, share the functional plan with the appropriate activity DOCC Watch officer for comments and feedback.
- Use the feedback to update the functional plan (if needed) and re-send to Mass Care leadership for approval.
- Share the plan with the HQ Mass Care Chief for approval and cross-functional concurrence. (HQ Mass Care Chiefs refer to Approving and Supporting Mass Care Functional Plans Task Sheet.)
- Once approved, share the functional plan with your team.
- The HQ Mass Care Chief shares the plan with supporting teams, like Logistics, Workforce, etc.

## Links/Related Information

- DRO Functional Plan Template
- Mass Care Planning Assumptions Task Sheet
- Approving and Supporting Mass Care Functional Plans Task Sheet`,
    relatedDocs: [
      { id: "approving-functional-plans", title: "Approving and Supporting Mass Care Functional Plans Task Sheet" },
      { id: "determining-planning-assumptions", title: "Determine Mass Care Planning Assumptions Task Sheet" }
    ],
  },
  "determining-planning-assumptions": {
    id: "determining-planning-assumptions",
    title: "Supporting the creation of Mass Care Planning Assumptions, Goals, and Strategy Task Sheet",
    category: "Mass Care",
    subActivity: "mass-care",
    phase: "planning",
    relatedGroup: "Information & Planning",
    readTime: "10 min",
    lastUpdated: "Mar 2025",
    version: "0.2",
    summary: "Information about and process for supporting the creation of planning assumptions, goals, and strategies for providing mass care services in an affected community",
    type: "task-sheet",
    content: `## Description

Information about and process for supporting the creation of planning assumptions, goals, and strategies for providing mass care services in an affected community

Typically performed by: National Planners or the Information & Planning Section with support from Mass Care Chiefs & Mass Care Activity Managers

## Considerations

### Mass Care Planning

Local DRO leaders (Level 2-3) and National Planners (Level 4-7) create mass care planning assumptions during the initiation and sustainment phases of an operation
DRO and Mass Care leadership use these assumptions to inform resource levels and allocations.
Planning assumptions are typically updated multiple times during the response.
The Information & Planning Section or the National Planners leads the process of documenting Mass Care Planning Assumptions.
Planning Assumptions Documentation
Mass care planning assumptions may be documented in several documents:
- Advance Operational Plan (AOP): Typically used on nationally lead disaster relief operations (Level 4+) during the initiation and sustainment phases.
- Initial Planning Tool (IPT): Used instead of an AOP, during the initiation phase of a smaller disaster relief operation (DRO).
- Service Delivery Plan (SDP): Used every disaster relief operation and replaces both the AOP and IPT when completed. This may be updated numerous times during the life of a DRO.
Updating Existing Mass Care Planning Assumptions
Creating and updating mass care planning assumptions involves following the same steps (below).
When updating mass care planning assumptions, ensure you use the latest approved planning assumption document to speed the process.

## What To Do

- Understand the situation
Check the essential elements of information that are available to you. Information & Planning and External Relations sections may provide vital support and information.
Check Red Cross systems such as WebEOC, SCIA, and the National Operations Summary (Tab 6) for additional data and information.
Key data points to consider are the number of:
Missions in WebEOC
Sites in WebEOC and/or SCIA
Clients
Call volume from the national Contact Center
- Determine Mass Care planning assumptions
Collaborate with the Information & Planning section to determine the event type, levels of impact, estimated impacted population, and the population needing mass care services.
On Level 4+ DROs or complex operations NHQ will assign a National Planner to lead the completion of the Mass Care Planning tool.
- Review service delivery resource requirements and adjust as needed
The Mass Care Planning Tool process provides the total number of resources needed.
Review these numbers to ensure they meet the needs of the operation.
- Propose goals and objectivities
Based on your outputs from the Mass Care Planning tool, come up with goals and objectives for the DRO to achieve.
Goals are broad, general statements that indicate milestones and outcomes. An example: Achieve the capacity to shelter 1,500 people at 15 different sites by March 21.
- Propose course of action and locations for service delivery
With the mass care planning assumptions and goals/objectivities, work with the Information & Planning section to determine locations of service delivery and different courses of action for DRO leadership to consider.
- Get approval
The Information & Planning section is responsible for getting mass care planning assumptions approved.
Once approved, the HQ Mass Care Chief shares the document with other Mass Care activity managers.

## Links / Related Information

Essential Elements of Information
DRO Advance Operational Planning Job Tool`,
    relatedDocs: [
      { id: "creating-functional-plans", title: "Creating Mass Care Functional Plans Task Sheet" },
      { id: "using-regional-plans", title: "Using Regional Plans on DROs Task Sheet" }
    ],
  },
  "using-regional-plans": {
    id: "using-regional-plans",
    title: "Using Regional Plans on Disaster Relief Operations Task Sheet",
    category: "Mass Care",
    subActivity: "mass-care",
    phase: "planning",
    relatedGroup: "Information & Planning",
    readTime: "10 min",
    lastUpdated: "Mar 2025",
    version: "0.2",
    summary: "Provides guidance for ensuring regional steady-state planning is used to guide Mass Care service delivery",
    type: "task-sheet",
    content: `## Description

Provides guidance for ensuring regional steady-state planning is used to guide Mass Care service delivery

## Typically performed by

Mass Care activity managers

## Supporting on the task

HQ Mass Care Chiefs and regional steady-state leaders

## Considerations

- Regions do readiness work during steady state.
- This includes deliberate planning, supportive community conversations, training the workforce, and forming local agreements/ partnerships.
- It is critical that this work be incorporated into DRO Mass Care service delivery planning.
- Every community is unique, which requires consideration when developing Mass Care service delivery plans.
- Using a region’s resources informs DRO decision makers, who often do not live in the immediate area, about important community differences.

## What To Do

- Talk to your supervisor to understand if a transition was conducted with the region. If there was one, check to see if any regional mass care information was already provided by the region.
- Find out who is the regional point of contact for your activity.
- Normally, this is a member of the Regional Steady-State Table of Organization, the Regional Mass Care Manager or a local staff member.
- If not from the local area, consult the Regional Disaster Officer (RDO) or regional point of contact.
- Ask for any regional plans or key information the region has to support service delivery planning.
- Use the existing plans and key information to help drive/support the development of mass care planning assumptions and functional plans.
- Collaborate with your supervisor, other DRO sections, and local leadership to develop a plan to incorporate available regional leaders and staff in the service delivery.
- This can include assigning people as assistants at DRO Headquarters or using local community volunteers (LCVs) and disaster event-based volunteers (DEBVs) in staffing plans.

## Links / Related Information

- Disaster Event-Based Volunteer (DEBV) Standards & Procedures
- Regional Steady-State Table of Organization
- Mass Care Planning Assumptions – Task Sheet
- Functional Plans – Task Sheet`,
    relatedDocs: [
      { id: "determining-planning-assumptions", title: "Determine Mass Care Planning Assumptions Task Sheet" },
      { id: "creating-functional-plans", title: "Creating Mass Care Functional Plans Task Sheet" }
    ],
  },
  "approving-functional-plans": {
    id: "approving-functional-plans",
    title: "Approving and Supporting Mass Care Functional Plans Task Sheet",
    category: "Mass Care",
    subActivity: "mass-care",
    phase: "planning",
    relatedGroup: "Information & Planning",
    readTime: "10 min",
    lastUpdated: "Mar 2025",
    version: "0.2",
    summary: "Guidance for HQ Mass Care Chiefs in approving the functional plans prepared by the activity managers",
    type: "task-sheet",
    content: `## Description

Guidance for HQ Mass Care Chiefs in approving the functional plans prepared by the activity managers

## Typically performed by

HQ Mass Care Chiefs

## Supporting on task

Mass Care activity managers, DOCC Watch Officers, other operational leaders

## Considerations

A functional plan is an operational plan that guides and directs a specific functional area (like Feeding) or objective (like community feeding) during a disaster relief operation.
Functional plans typically address short-term actions and define and communicate operational details needed to deliver specified service(s).
A functional plan must reflect approved mass care planning assumptions, including the goals, priorities, and courses of action.
- Functional plans are created by the Mass Care activity mangers. See the Creating Mass Care Functional Plans Task Sheet.

## What To Do

- Review all functional plans received to ensure each active Mass Care activity has a proposed functional plan.
- Review each section of the Functional Plan and ensure it is in alignment with most recent DRO Mass Care Planning Assumptions.
- Use your experience, expertise, and common sense to check the plan. Every plan should be simple, achievable, in alignment with the DRO/ other Mass Care activities, and generally make sense.
- Share plans with Operations leadership for awareness. This is easily done during the Tactics meeting.
- You don’t necessarily need to share the document -- instead give them a briefing of the key points.
For complex operations or if you want a subject-matter expert to review your plan, share the functional plan with the appropriate activity DOCC Watch Officer for comments and feedback.
First ask the activity manager if the DOCC Watch Officer has already reviewed.
- Compile all the feedback and share it with the Mass Care activity manager for them to update and finalize.
- Once you approve the plan and leadership is in concurrence, share the functional plan widely with both your team and other teams supporting the plan, as appropriate (like Logistics or Workforce, etc.)
- Share approval with activity managers so they can communicate and share the plan with their teams.

## Links / Related Information

- DRO Functional Plan Template
- Creating Mass Care Functional Plans Task Sheet`,
    relatedDocs: [
      { id: "creating-functional-plans", title: "Creating Mass Care Functional Plans Task Sheet" },
      { id: "determining-planning-assumptions", title: "Determine Mass Care Planning Assumptions Task Sheet" }
    ],
  },
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
