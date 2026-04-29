"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Download,
  DownloadCloud,
  Check,
  Share2,
  Clock,
  Sparkles,
  ChevronRight,
  ChevronDown,
  List,
  MessageSquare,
  WifiOff,
  X,
  ThumbsUp,
  ThumbsDown,
  Info,
  Loader2,
  ArrowUp,
  Link as LinkIcon,
  Mail,
  MessageCircle,
  Printer,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Screen } from "../app-shell"
import type { JSX } from "react/jsx-runtime" // Import JSX to resolve undeclared variable error
import { massCareContent } from "@/lib/mass-care-content"

interface DoctrineDetailScreenProps {
  doctrineId: string | null
  onNavigate: (screen: Screen, disasterType?: string, doctrineId?: string, group?: string) => void
}

const doctrineContent: Record<
  string,
  {
    title: string
    category: string
    disasterType: string
    readTime: string
    lastUpdated: string
    version: string
    summary: string
    content: string
    relatedDocs: Array<{ id: string; title: string }>
  }
> = {
  "shelter-pet-policy": {
    title: "Pet Policy in Emergency Shelters",
    category: "Sheltering",
    disasterType: "General",
    readTime: "6 min",
    lastUpdated: "Nov 2024",
    version: "3.2",
    summary: "Guidelines for accommodating pets and service animals in Red Cross emergency shelters.",
    content: `
## Overview

The American Red Cross recognizes that pets are important family members. Many disaster survivors will refuse to evacuate or seek shelter if they cannot bring their pets with them. This doctrine outlines the policies and procedures for accommodating pets in emergency shelters while ensuring the safety and comfort of all shelter residents.

Our approach balances the emotional needs of pet owners with the health and safety requirements of the broader shelter population. When properly managed, pet-friendly sheltering increases evacuation compliance and supports the mental health of disaster survivors.

## Service Animals

Under the Americans with Disabilities Act (ADA), service animals must be permitted in all areas of the shelter where residents are allowed. This is a legal requirement, not a discretionary policy.

**Definition:** Service animals are defined as dogs (and in some cases miniature horses) that are individually trained to perform specific tasks for individuals with disabilities. The task the animal performs must be directly related to the person's disability.

**Key Points:**
- Residents are not required to provide documentation, certification, or proof of training for service animals
- You may only ask two questions: (1) Is this a service animal required because of a disability? (2) What task has the dog been trained to perform?
- Service animals must be under control at all times, either by leash, harness, or voice command
- Service animals are not required to wear a vest or special identification

**When Service Animals May Be Excluded:**
- The animal is out of control and the handler does not take effective action
- The animal is not housebroken
- The animal poses a direct threat to the health or safety of others

## Household Pets

Household pets may be accommodated in designated pet-friendly shelters or separate pet areas when available. Not all Red Cross shelters can accommodate pets, so advance planning is essential.

**Pet-Friendly Shelter Requirements:**

When establishing a pet-friendly shelter, the following requirements must be met:

1. **Separate area** - Pets must be housed in a designated area separate from the general population sleeping areas
2. **Ventilation** - The pet area must have adequate ventilation and climate control
3. **Outdoor access** - Easy access to outdoor areas for pet relief
4. **Supervision** - Pet areas require regular monitoring by trained volunteers
5. **Supplies** - Stock appropriate supplies including crates, bowls, cleaning materials, and waste disposal items

**Owner Responsibilities:**

Pet owners are responsible for the care and control of their animals at all times. The Red Cross does not provide pet food, medications, or veterinary care. Owners must provide:

- Current vaccination records (rabies vaccination is required for all dogs and cats)
- A pet carrier or crate appropriate for the size of the animal
- Minimum 3-day supply of pet food and any necessary medications
- Leash and collar with current ID tags
- Food and water bowls
- Waste disposal supplies (bags, litter, etc.)
- Bedding or comfort items for the pet

## Prohibited Animals

Certain animals cannot be accommodated in Red Cross shelters under any circumstances. This policy exists to protect the safety of all shelter residents and staff.

**The following are NOT permitted:**
- Exotic animals (snakes, lizards, birds of prey, primates, etc.)
- Farm animals (horses, goats, chickens, pigs, etc.)
- Venomous reptiles or insects
- Wild or feral animals
- Animals showing signs of illness, disease, or aggression
- Unvaccinated dogs or cats

**Alternative Resources:**

When residents arrive with prohibited animals, assist them in finding alternative arrangements:
- Local animal control or humane society
- Agricultural fairgrounds (often used for large animals during disasters)
- Boarding facilities that may offer emergency rates
- Friends or family outside the disaster area
- Veterinary clinics that may provide emergency boarding

## Managing Pet Areas

Effective management of pet areas is essential for the safety and wellbeing of both animals and shelter residents.

**Daily Operations:**
- Conduct regular wellness checks on all animals (minimum twice daily)
- Ensure owners are providing adequate food, water, and care
- Monitor for signs of illness or distress
- Maintain cleanliness through regular sanitation
- Document any incidents or concerns

**Addressing Allergies and Fear:**

Some shelter residents may have allergies to or fear of animals. To address these concerns:
- Locate pet areas as far as possible from general sleeping areas
- Ensure HVAC systems do not circulate air from pet areas to general population
- Provide allergen-free zones within the shelter
- Allow residents to request relocation if needed

**Incident Response:**

If a pet bites, scratches, or otherwise injures a person:
1. Provide first aid and seek medical attention if needed
2. Document the incident thoroughly
3. Isolate the animal from other pets and people
4. Contact local animal control as required by law
5. The animal may be required to leave the shelter

## Communication with Residents

Clear communication about pet policies prevents misunderstandings and conflicts.

**Upon Arrival:**
- Explain all pet policies clearly during registration
- Provide written guidelines in the resident's preferred language
- Show pet owners the designated pet area
- Explain owner responsibilities and shelter rules

**Ongoing:**
- Post pet policies visibly in the shelter
- Include pet-related announcements in regular shelter briefings
- Address concerns or complaints promptly and fairly

## Special Considerations

**Emotional Support Animals:**

Emotional support animals (ESAs) are not considered service animals under the ADA. They may be accommodated in pet-friendly areas but are not guaranteed access to general shelter areas. Treat ESAs as household pets for shelter purposes.

**Pet Loss and Grief:**

Some disaster survivors may have lost pets in the disaster. Be sensitive to this loss and provide emotional support. Connect grieving pet owners with mental health resources if needed.

**Reunification:**

Work with local animal services to help reunite separated pets with their owners. Maintain a log of pets in the shelter and share information with local lost pet databases when appropriate.
    `,
    relatedDocs: [
      { id: "shelter-setup", title: "Shelter Setup Guidelines" },
      { id: "shelter-duration", title: "Shelter Stay Duration Policy" },
    ],
  },
  "shelter-duration": {
    title: "Shelter Stay Duration Policy",
    category: "Sheltering",
    disasterType: "General",
    readTime: "8 min",
    lastUpdated: "Oct 2024",
    version: "2.1",
    summary: "Guidelines for managing shelter stay duration and transitioning residents to permanent housing.",
    content: `
## Overview

Emergency shelters provide temporary refuge during and immediately after disasters. They are not designed for long-term housing. This doctrine establishes guidelines for shelter stay duration and transition planning to help residents return to permanent housing as quickly and safely as possible.

The goal of emergency sheltering is stabilization, not permanent solution. From the moment a resident enters the shelter, our focus should be on connecting them with resources that will help them recover and return to self-sufficiency.

## Standard Duration Guidelines

Red Cross emergency shelters typically operate for 2-14 days depending on the scope and nature of the disaster.

**Short-term Events (2-5 days):**
- Localized incidents such as apartment fires or gas leaks
- Brief evacuations for weather events that pass quickly
- Situations where most residents have alternative housing options

**Medium-term Events (5-14 days):**
- Widespread disasters affecting multiple neighborhoods
- Events requiring damage assessment before residents can return
- Situations where many residents need assistance finding housing

**Extended Operations (14+ days):**
- Catastrophic disasters with widespread destruction
- Events requiring long-term recovery coordination
- Situations where housing stock is significantly reduced

Extended sheltering beyond 14 days requires coordination with local emergency management, long-term recovery organizations, and government agencies. The Red Cross works with partners to transition from emergency sheltering to longer-term housing solutions.

## Working with Residents

Every resident should have a casework conversation within 48 hours of arriving at the shelter. This conversation should:

- Assess their immediate needs and situation
- Understand their housing situation before the disaster
- Identify resources available to them (insurance, family, savings)
- Begin developing a recovery plan
- Connect them with appropriate services

**Setting Expectations:**

Be clear with residents about the temporary nature of shelter stays. This conversation should happen during intake:

"This shelter is here to provide you with a safe place to stay while you work on your next steps. Our caseworkers will help you create a plan to find more permanent housing. Most people stay here for just a few days while they make arrangements."

## Transition Planning

Transition planning should begin immediately, not when the shelter is about to close.

**Key Elements of Transition Planning:**

1. **Housing Assessment** - What are the resident's housing options? Can they return home? Do they have family or friends? Do they need rental assistance?

2. **Resource Connection** - What assistance do they need? Financial help? Document replacement? Medical care? Connect them with appropriate agencies.

3. **Timeline Development** - Work with the resident to create a realistic timeline for leaving the shelter. Set milestones and check in regularly on progress.

4. **Follow-up Planning** - Ensure residents leaving the shelter have follow-up support scheduled. No one should leave without knowing their next step.

**Before Residents Leave:**

Ensure each resident has:
- Safe and habitable housing identified and confirmed
- Transportation to their next destination
- Emergency supplies for at least 72 hours
- Important documents and contact information
- Connection to ongoing recovery services if needed
- Knowledge of community resources available to them
- Follow-up casework appointment scheduled (if applicable)

## Vulnerable Populations

Some populations require additional time and support for safe transition. Identify these individuals early and provide enhanced casework services.

**Populations Requiring Special Attention:**
- Elderly individuals, especially those living alone
- People with disabilities or chronic health conditions
- Families with infants or young children
- Individuals with mental health challenges
- People experiencing homelessness before the disaster
- Those with limited English proficiency
- Undocumented individuals who may fear seeking assistance

**Enhanced Support:**

For vulnerable populations, consider:
- More frequent casework check-ins
- Coordination with social services agencies
- Warm handoffs to receiving organizations
- Extended timelines when necessary and appropriate
- Additional follow-up after shelter departure

## Managing Extended Stays

Some residents may have difficulty leaving the shelter. Address this proactively rather than waiting until the shelter closes.

**Common Barriers to Transition:**
- Financial inability to afford housing
- Lack of available housing in the community
- Fear or anxiety about leaving the shelter
- Unresolved insurance or assistance claims
- Medical needs requiring stability before moving
- Complexity of their situation

**Strategies for Extended Stays:**

1. **Increased Casework** - Residents staying beyond the expected duration need more intensive support, not less. Increase casework frequency.

2. **Partner Engagement** - Bring in partner agencies who specialize in housing, financial assistance, or other needed services.

3. **Clear Communication** - Be honest about shelter closure timelines. Give residents adequate notice and support to make arrangements.

4. **Government Coordination** - For large-scale disasters, work with FEMA and local government on transitional housing programs.

## Shelter Closure

When closing a shelter, ensure no one is left without a safe place to go.

**Closure Timeline:**
- Announce closure date at least 48-72 hours in advance
- Provide daily updates on remaining days
- Conduct final casework conversations with all remaining residents
- Arrange transportation for those who need it
- Document the status and plan for each departing resident

**Final Day Procedures:**
- Morning briefing with clear timeline for the day
- Final walkthrough with each resident
- Provide written information on ongoing resources
- Ensure all residents have departed safely before securing the facility

## Documentation

Maintain accurate records throughout the shelter operation:
- Daily population counts
- Casework notes for each resident
- Transition plans and outcomes
- Incidents or concerns
- Final status of each resident upon departure

This documentation supports quality improvement and may be needed for reimbursement or reporting purposes.
    `,
    relatedDocs: [
      { id: "shelter-pet-policy", title: "Pet Policy in Emergency Shelters" },
      { id: "client-casework", title: "Client Casework Essentials" },
    ],
  },
  "dietary-restrictions": {
    title: "Supporting Dietary Restrictions in Disaster Feeding",
    category: "Feeding",
    disasterType: "General",
    readTime: "7 min",
    lastUpdated: "Nov 2024",
    version: "4.0",
    summary:
      "Guidance for inclusive feeding services that respect and accommodate the dietary needs of all disaster survivors.",
    content: `
## Overview

Disaster feeding operations must accommodate diverse dietary needs. People don't stop having food allergies, medical conditions, or religious practices because of a disaster. In fact, stress can make some conditions worse, making proper nutrition even more important.

This doctrine provides guidance for inclusive feeding services that respect and accommodate the dietary needs of all disaster survivors.

## Medical Dietary Needs

Medical dietary restrictions take priority and must be accommodated whenever possible. Failure to do so can result in serious health consequences.

**Common Medical Diets:**

**Diabetic Diet**
- Consistent carbohydrate meals
- Avoid sugary drinks and desserts
- Regular meal timing is important
- Have glucose tablets or juice available for low blood sugar emergencies

**Renal (Kidney) Diet**
- Low sodium, low potassium, low phosphorus
- Limited protein in some cases
- Fluid restrictions may apply
- Avoid processed foods, bananas, oranges, tomatoes

**Cardiac/Heart Healthy Diet**
- Low sodium (less than 2000mg daily)
- Low saturated fat
- Emphasis on fruits, vegetables, whole grains
- Avoid fried foods and processed meats

**Soft/Mechanical Soft Diet**
- For those with difficulty chewing or swallowing
- Foods that are soft, moist, and easy to chew
- May need pureed options for some individuals
- Avoid tough meats, raw vegetables, crusty breads

**Documentation:**

During shelter registration, ask about medical dietary needs and document them clearly. Include:
- Specific restrictions or requirements
- Severity (preference vs. medical necessity)
- Any foods that cause severe reactions
- Medications that interact with foods

## Food Allergies

Food allergies can be life-threatening. Treat all reported allergies seriously.

**The "Big Nine" Allergens:**
1. Milk/Dairy
2. Eggs
3. Peanuts
4. Tree nuts (almonds, cashews, walnuts, etc.)
5. Fish
6. Shellfish
7. Wheat/Gluten
8. Soy
9. Sesame

**Severity Levels:**

Understand that allergies range from mild discomfort to life-threatening anaphylaxis:
- **Mild:** Stomach upset, hives, minor swelling
- **Moderate:** Significant swelling, difficulty breathing, widespread hives
- **Severe (Anaphylaxis):** Throat closing, severe breathing difficulty, loss of consciousness - THIS IS A MEDICAL EMERGENCY

**Prevention:**

The only way to prevent an allergic reaction is to avoid the allergen completely. This means:
- Read all ingredient labels carefully
- When in doubt, don't serve it to someone with allergies
- Never tell someone a food is "safe" if you're not 100% certain
- Ask about allergies before serving, not after

## Preventing Cross-Contamination

Cross-contamination occurs when allergens transfer from one food to another through shared surfaces, utensils, or improper handling.

**Best Practices:**

1. **Separate preparation areas** - Prepare allergen-free meals in a dedicated space if possible

2. **Dedicated utensils** - Use separate cutting boards, knives, and serving utensils for allergen-free foods. Consider color-coding.

3. **Order of preparation** - Prepare allergen-free meals first, before any potential contamination

4. **Handwashing** - Wash hands thoroughly between handling different foods

5. **Clean surfaces** - Sanitize all surfaces before preparing allergen-free meals

6. **Serving precautions** - Serve allergen-free meals first or separately to avoid contamination at serving stations

**Labeling:**

All food should be clearly labeled with ingredients. For allergen-free items:
- Mark clearly as "GLUTEN-FREE," "NUT-FREE," etc.
- List all ingredients
- Keep labels with the food at all times
- Train volunteers to direct questions to supervisors

## Religious and Cultural Dietary Practices

Respect for religious and cultural dietary practices is essential for inclusive disaster services.

**Halal (Islamic)**
- No pork or pork products
- Meat must be slaughtered according to Islamic law
- No alcohol or alcohol-derived ingredients
- Many Muslims will accept vegetarian options if halal meat is unavailable

**Kosher (Jewish)**
- No pork or shellfish
- Meat and dairy cannot be mixed
- Meat must be slaughtered according to Jewish law
- Many observant Jews will accept vegetarian options if kosher food is unavailable

**Vegetarian/Vegan**
- Vegetarian: No meat, poultry, or fish
- Vegan: No animal products of any kind (including dairy, eggs, honey)
- Check ingredients carefully - many products contain hidden animal ingredients

**Hindu**
- Many Hindus are vegetarian
- Those who eat meat typically avoid beef
- Some avoid onion and garlic

**Buddhist**
- Many Buddhists are vegetarian
- Some avoid onion, garlic, and strong spices

**Practical Approach:**

You cannot stock every possible specialty food. Instead:
- Always have vegetarian and vegan options available
- Clearly label all ingredients
- When in doubt, simple is better (plain rice, steamed vegetables, fresh fruit)
- Treat requests with respect, not skepticism

## Infant and Child Feeding

Young children have unique nutritional needs during disasters.

**Infants (0-12 months):**
- Support breastfeeding mothers with privacy, hydration, and adequate nutrition
- Stock infant formula in multiple types (milk-based, soy-based, hypoallergenic)
- Never microwave breast milk or formula - use warm water baths
- Provide clean bottles and sanitization supplies
- Ready-to-feed formula is safest when water quality is uncertain

**Toddlers (1-3 years):**
- Cut foods into small pieces to prevent choking
- Avoid whole grapes, hot dogs, popcorn, and other choking hazards
- Provide whole milk or appropriate alternative
- Simple, familiar foods are often most accepted

**Children (3+ years):**
- Offer familiar comfort foods when possible
- Involve children in food choices when appropriate
- Be patient with picky eaters - stress affects appetite
- Maintain regular meal times for stability

## Practical Tips for Feeding Operations

**Menu Planning:**
- Include vegetarian options at every meal
- Have allergen-free alternatives readily available
- Plan for variety - people tire of the same foods quickly
- Consider cultural diversity of your community

**Communication:**
- Post menus with ingredients listed
- Train all volunteers on allergy protocols
- Create a system for special diet requests
- Have supervisor available for questions

**Documentation:**
- Log all special diet requests and how they were accommodated
- Document any allergic reactions or incidents
- Track inventory of specialty items
- Note feedback for future planning
    `,
    relatedDocs: [
      { id: "bulk-feeding", title: "Bulk Feeding Operations" },
      { id: "food-safety", title: "Food Safety Standards" },
    ],
  },
  "post-fire-support": {
    title: "Support Services After a House Fire",
    category: "Client Care",
    disasterType: "Fire",
    readTime: "10 min",
    lastUpdated: "Nov 2024",
    version: "2.8",
    summary: "Comprehensive guide to Red Cross services and community resources available to house fire survivors.",
    content: `
## Overview

A house fire is one of the most devastating experiences a person can face. In minutes, families can lose their home, possessions, and sense of security. The American Red Cross responds to home fires every day, providing immediate assistance and connecting survivors with resources for recovery.

This doctrine outlines the support services available to fire survivors and provides guidance for volunteers on how to connect clients with appropriate help.

## The Fire Response Process

When the Red Cross is notified of a home fire, a trained Disaster Action Team (DAT) responds to the scene. Here's what happens:

**At the Scene:**
1. Wait for fire department clearance before approaching residents
2. Introduce yourself and explain Red Cross services
3. Provide immediate comfort - blankets, water, stuffed animals for children
4. Assess immediate needs through conversation
5. Complete client intake and needs assessment
6. Provide emergency financial assistance
7. Connect with additional resources

**Timing Considerations:**
- Respond within 2 hours of notification when possible
- If residents have left the scene, attempt phone contact
- Follow up within 24-72 hours for additional needs assessment
- Schedule casework follow-up within 7 days for significant fires

## Immediate Assistance

Red Cross provides immediate emergency assistance to help fire survivors through the first few days after a fire.

**What We Provide:**

**Financial Assistance**
Emergency funds are provided via prepaid debit cards or vouchers. Standard amounts are based on household size and assessed needs. Funds can be used for:
- Temporary lodging (hotel/motel)
- Food and groceries
- Clothing and personal items
- Medications and medical supplies
- Other emergency needs

**Comfort Items**
Depending on availability and situation:
- Blankets and pillows
- Hygiene kits (toothbrush, soap, etc.)
- Stuffed animals for children
- Clean clothing (if available from partner donations)

**Referrals and Information**
- Local shelter locations
- Community resources
- Government assistance programs
- Recovery planning guidance

**What We Don't Provide:**
- Cash (always use cards or vouchers)
- Replacement of specific items
- Insurance claim assistance (we provide information, not advocacy)
- Long-term housing
- Legal advice

## Casework Services

For fires affecting multiple units or causing significant displacement, clients should receive follow-up casework services.

**Casework Includes:**

**Recovery Planning**
Help clients think through their recovery:
- What are their immediate priorities?
- What resources do they have available?
- What obstacles are they facing?
- What's their timeline for finding housing?

**Resource Connection**
Connect clients with community resources:
- Salvation Army for additional assistance
- Local community action agencies
- Faith-based organizations
- Government programs (SNAP, Medicaid, etc.)
- Utility assistance programs

**Advocacy Support**
While we don't advocate directly, we can:
- Explain how to navigate insurance claims
- Provide information about tenant rights
- Help clients understand available programs
- Provide documentation of Red Cross assistance

**Follow-up Contact**
All fire clients should receive follow-up contact:
- Within 7 days for significant fires
- Check on their status and progress
- Assess any additional needs
- Provide additional referrals as needed

## Housing Assistance

Finding new housing is often the biggest challenge after a fire.

**Immediate Options:**
- Friends or family (most common)
- Hotels/motels (Red Cross can assist with 1-3 nights typically)
- Emergency shelters
- Faith community resources

**Short-term Options:**
- Extended stay hotels
- Furnished apartments
- Temporary rentals
- Transitional housing programs

**Resources for Finding Housing:**
- Local housing authorities
- 211 (community resource hotline)
- Apartment locator services
- Social services agencies
- Faith-based housing assistance

**For Renters:**
- Review lease terms about fire damage
- Understand tenant rights in your state
- May not be liable for remaining lease if unit is uninhabitable
- Security deposit should be returned if fire wasn't tenant's fault

**For Homeowners:**
- Contact insurance company immediately
- Document all damage with photos before cleanup
- Keep receipts for all fire-related expenses
- May need temporary housing while rebuilding

## Insurance Navigation

Many fire survivors have insurance but don't know how to use it effectively.

**Homeowners/Renters Insurance:**

**What to Tell Clients:**
- Contact insurance company within 24 hours
- Document everything - photos, videos, written inventory
- Keep all receipts for fire-related expenses
- Don't throw anything away until adjuster has visited
- They have the right to dispute claim decisions

**Common Coverage:**
- Dwelling/structure damage (homeowners)
- Personal property/contents
- Additional living expenses (hotel, meals, etc.)
- Liability coverage

**What Red Cross Can Do:**
- Explain the general claims process
- Encourage clients to contact their insurance
- Provide documentation of Red Cross assistance
- Refer to state insurance commission if there are disputes

**Uninsured Clients:**
Many fire survivors, especially renters, have no insurance. These clients will need more extensive referrals to community resources.

## Emotional Support

The emotional impact of a fire is profound and lasting. Survivors experience a range of emotions:

**Common Reactions:**
- Shock and disbelief
- Grief over lost possessions and memories
- Anxiety about the future
- Guilt (especially if others were affected)
- Anger at themselves or others
- Sleep disturbances and nightmares
- Difficulty concentrating

**How to Help:**

**Listen** - Sometimes people just need to tell their story. Let them talk without rushing to solve problems.

**Normalize** - Let them know their feelings are normal. "Most people feel overwhelmed after something like this."

**Acknowledge Loss** - Recognize that lost items may have deep sentimental value. Don't minimize by saying "at least you're alive."

**Provide Comfort** - Simple acts matter. A blanket, a cup of coffee, a stuffed animal for a child.

**Watch for Warning Signs:**
- Statements about self-harm
- Inability to function or make decisions
- Extreme withdrawal or agitation
- Substance abuse
- Persistent symptoms after several weeks

**Mental Health Resources:**
- Local mental health crisis lines
- Disaster Distress Helpline: 1-800-985-5990
- Community mental health centers
- Employee assistance programs (if employed)

## Special Populations

Some fire survivors need additional support and specialized referrals.

**Elderly:**
- May be more disoriented and confused
- May have mobility or health limitations
- May be more attached to possessions
- Connect with senior services agencies

**Children:**
- May not understand what happened
- May have nightmares or regression
- Need stability and routine as soon as possible
- Schools can provide support services

**People with Disabilities:**
- May have lost assistive devices
- May need accessible housing
- Medical equipment may need replacement
- Connect with disability services agencies

**Non-English Speakers:**
- Use interpreter services
- Provide written materials in their language
- Connect with cultural community organizations

**Undocumented Residents:**
- Red Cross services are available regardless of immigration status
- Be sensitive to fears about seeking help
- Know which community resources are available without documentation

## Document Replacement

Fire survivors often lose important documents. Help them understand how to replace them.

**Vital Documents:**
- **Birth Certificates** - State vital records office (many waive fees for disaster survivors)
- **Social Security Cards** - Social Security Administration (free)
- **Driver's License** - State DMV (may waive fees)
- **Passports** - Post office or passport agency

**Financial Documents:**
- **Bank Records** - Contact bank directly
- **Tax Returns** - IRS can provide transcripts
- **Credit Cards** - Contact each issuer

**Medical Records:**
- Contact healthcare providers directly
- Hospitals maintain records for many years
- Pharmacies can provide medication history

**Other Important Documents:**
- Insurance policies (contact insurance company)
- Vehicle titles (state DMV)
- Property deeds (county recorder)
- Custody documents (court records)

Many agencies offer fee waivers for disaster survivors. Encourage clients to ask.

## Working with Partners

No single organization can meet all the needs of fire survivors. Build relationships with community partners.

**Common Partners:**
- Salvation Army
- Local churches and faith communities
- Community action agencies
- St. Vincent de Paul
- United Way / 211
- Local government social services
- Civic organizations (Lions Club, Rotary, etc.)

**Coordinating Assistance:**
- Share information about what Red Cross has provided
- Avoid duplicating services
- Refer clients to partners for needs we can't meet
- Follow up to ensure clients received help
    `,
    relatedDocs: [
      { id: "client-casework", title: "Client Casework Essentials" },
      { id: "spiritual-care", title: "Spiritual Care Guidelines" },
    ],
  },
}

// Merge mass care content into doctrine content
const mergedDoctrineContent = {
  ...doctrineContent,
  ...Object.fromEntries(
    Object.entries(massCareContent).map(([key, value]) => [
      key,
      {
        title: value.title,
        category: value.category,
        disasterType: value.relatedGroup || "Mass Care",
        readTime: value.readTime,
        lastUpdated: value.lastUpdated,
        version: value.version,
        summary: value.summary,
        content: value.content,
        relatedDocs: value.relatedDocs,
      },
    ]),
  ),
}

const defaultDoctrine = mergedDoctrineContent["shelter-pet-policy"]

interface TocItem {
  id: string
  title: string
  level: number
}

export function DoctrineDetailScreen({ doctrineId, onNavigate }: DoctrineDetailScreenProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isDownloaded, setIsDownloaded] = useState(false)
  const [headerCondensed, setHeaderCondensed] = useState(false)
  const [aiSheetOpen, setAiSheetOpen] = useState(false)
  const [shareSheetOpen, setShareSheetOpen] = useState(false)
  const [shareState, setShareState] = useState<"idle" | "copied" | "failed">("idle")
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [readProgress, setReadProgress] = useState(0)
  const [showToc, setShowToc] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [showSummary, setShowSummary] = useState(false)
  const [showAskAI, setShowAskAI] = useState(false)
  const [summaryGenerated, setSummaryGenerated] = useState(false)
  const [aiSummary, setAiSummary] = useState<string>("")
  const [aiKeyPoints, setAiKeyPoints] = useState<string[]>([])
  const [askAIQuestion, setAskAIQuestion] = useState("")
  const [askAIAnswer, setAskAIAnswer] = useState("")
  const [isAskingAI, setIsAskingAI] = useState(false)

  const doctrine = doctrineId ? mergedDoctrineContent[doctrineId] || defaultDoctrine : defaultDoctrine

  // Extract TOC from markdown content
  const extractToc = (content: string): TocItem[] => {
    const toc: TocItem[] = []
    const lines = content.split("\n")
    let h2Index = 0
    let h3Index = 0

    lines.forEach((line) => {
      const trimmed = line.trim()
      if (trimmed.startsWith("## ")) {
        h2Index++
        h3Index = 0
        const title = trimmed.replace("## ", "")
        const id = `section-${h2Index}`
        toc.push({ id, title, level: 2 })
      } else if (trimmed.startsWith("### ")) {
        h3Index++
        const title = trimmed.replace("### ", "")
        const id = `subsection-${h2Index}-${h3Index}`
        toc.push({ id, title, level: 3 })
      }
    })

    return toc
  }

  const tocItems = extractToc(doctrine.content)

  // Check online status
  useEffect(() => {
    setIsOnline(navigator.onLine)
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Generate AI summary when summary widget is opened (with streaming)
  useEffect(() => {
    if (showSummary && doctrine.content && !summaryGenerated) {
      setSummaryGenerated(true) // Prevent multiple calls
      setAiSummary("") // Clear summary - don't show legacy content
      setAiKeyPoints([]) // Clear key points
      
      const generateSummary = async () => {
        try {
          const response = await fetch("/api/ai/summarize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: doctrine.content }),
          })

          if (!response.ok) {
            throw new Error("Summary generation failed")
          }

          // Handle streaming response
          const reader = response.body?.getReader()
          const decoder = new TextDecoder()
          let fullText = ""

          if (!reader) {
            throw new Error("No reader available")
          }

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split("\n").filter((line) => line.trim())

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6)
                if (data === "[DONE]") break

                try {
                  const json = JSON.parse(data)
                  if (json.content) {
                    fullText += json.content
                    // Update summary in real-time as it streams
                    setAiSummary(fullText)
                  }
                } catch (e) {
                  // Ignore parse errors
                }
              }
            }
          }

          // Keep the full streamed text as-is; AIMarkdown renders paragraphs,
          // bullets, and headings. Earlier post-processing was collapsing
          // newlines into spaces and splitting bullets into a separate array,
          // which made the summary "snap" from formatted to a wall of text.
          setAiSummary(fullText.trim() || "Summary generated")
          setAiKeyPoints([])
        } catch (error) {
          console.error("Failed to generate summary:", error)
          setAiSummary("Failed to generate summary. Please try again.")
          setAiKeyPoints([])
        }
      }

      generateSummary()
    }
  }, [showSummary, summaryGenerated, doctrine.content])

  // Reset summary when widget is closed
  useEffect(() => {
    if (!showSummary) {
      setSummaryGenerated(false)
      setAiSummary("")
      setAiKeyPoints([])
    }
  }, [showSummary])

  const handleDownload = () => {
    setIsDownloading(true)
    setTimeout(() => {
      setIsDownloading(false)
      setIsDownloaded(true)
    }, 1500)
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement
    const scrollHeight = target.scrollHeight - target.clientHeight
    const progress = (target.scrollTop / scrollHeight) * 100
    setReadProgress(Math.min(100, Math.max(0, progress)))
    setHeaderCondensed(target.scrollTop > 120)
  }

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Tiny markdown-to-react renderer for AI-generated copy.
  // Supports paragraphs, **bold**, *italic*, `code`, bullet lists, and headings (## / ###).
  const renderInlineSpans = (text: string, keyBase: string): React.ReactNode[] => {
    const out: React.ReactNode[] = []
    const re = /(\*\*[^*]+\*\*)|(\*[^*]+\*)|(`[^`]+`)/g
    let last = 0
    let m: RegExpExecArray | null
    let i = 0
    while ((m = re.exec(text))) {
      if (m.index > last) out.push(text.slice(last, m.index))
      const tok = m[0]
      if (tok.startsWith("**")) {
        out.push(
          <strong key={`${keyBase}-b-${i++}`} className="font-semibold">
            {tok.slice(2, -2)}
          </strong>
        )
      } else if (tok.startsWith("`")) {
        out.push(
          <code key={`${keyBase}-c-${i++}`} className="font-mono text-[0.92em] bg-card/70 px-1 py-0.5 rounded">
            {tok.slice(1, -1)}
          </code>
        )
      } else {
        out.push(
          <em key={`${keyBase}-i-${i++}`}>{tok.slice(1, -1)}</em>
        )
      }
      last = m.index + tok.length
    }
    if (last < text.length) out.push(text.slice(last))
    return out
  }

  const AIMarkdown = ({ text }: { text: string }) => {
    const blocks = text.replace(/\r\n/g, "\n").split(/\n{2,}/)
    return (
      <div className="space-y-3 text-[15px] leading-relaxed text-foreground">
        {blocks.map((block, bi) => {
          const lines = block.split("\n").filter((l) => l.length > 0)
          if (lines.length === 0) return null
          // Heading (## / ###) — render as a normal-cased subheading.
          if (/^#{2,3}\s+/.test(lines[0]) && lines.length === 1) {
            const text = lines[0].replace(/^#{2,3}\s+/, "")
            return (
              <h4 key={bi} className="text-[15px] font-semibold text-foreground pt-1">
                {text}
              </h4>
            )
          }
          // List
          if (lines.every((l) => /^\s*[-*]\s+/.test(l))) {
            return (
              <ul key={bi} className="list-disc pl-5 space-y-1.5">
                {lines.map((l, li) => (
                  <li key={li}>{renderInlineSpans(l.replace(/^\s*[-*]\s+/, ""), `${bi}-${li}`)}</li>
                ))}
              </ul>
            )
          }
          // Paragraph
          return (
            <p key={bi}>
              {lines.map((l, li) => (
                <span key={li}>
                  {renderInlineSpans(l, `${bi}-${li}`)}
                  {li < lines.length - 1 && <br />}
                </span>
              ))}
            </p>
          )
        })}
      </div>
    )
  }

  // Build the canonical share URL (used by every share option)
  const buildShareUrl = () =>
    typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname}?doc=${encodeURIComponent(doctrineId ?? "")}`
      : ""

  const flashShareState = (next: "copied" | "failed") => {
    setShareState(next)
    setTimeout(() => setShareState("idle"), 1800)
  }

  const shareCopyLink = async () => {
    const url = buildShareUrl()
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(`${doctrine.title}\n${url}`)
        flashShareState("copied")
      } else {
        flashShareState("failed")
      }
    } catch {
      flashShareState("failed")
    }
    setShareSheetOpen(false)
  }

  const shareEmail = () => {
    const url = buildShareUrl()
    const subject = encodeURIComponent(`Red Cross doctrine: ${doctrine.title}`)
    const body = encodeURIComponent(`${doctrine.summary}\n\n${url}`)
    window.location.href = `mailto:?subject=${subject}&body=${body}`
    setShareSheetOpen(false)
  }

  const shareSms = () => {
    const url = buildShareUrl()
    const body = encodeURIComponent(`${doctrine.title}\n${url}`)
    // iOS uses &, Android uses ?; using ? works on both.
    window.location.href = `sms:?body=${body}`
    setShareSheetOpen(false)
  }

  const sharePrint = () => {
    setShareSheetOpen(false)
    setTimeout(() => window.print(), 250)
  }

  // Map specific H2 section titles to a callout flavor that emphasises action.
  const calloutForHeading = (title: string): string | null => {
    const t = title.toLowerCase().trim()
    if (t === "what to do" || t === "steps" || t === "procedure") return "what-to-do"
    if (t === "considerations" || t === "things to consider" || t === "cautions") return "considerations"
    if (t.startsWith("typically performed by") || t === "performed by" || t === "who completes this")
      return "performed-by"
    if (t.startsWith("supporting on the task") || t === "supporting roles" || t === "who supports")
      return "supporting"
    return null
  }

  const renderContent = (content: string) => {
    const lines = content.trim().split("\n")
    // Group elements by H2 section. Each section can be tagged as a callout.
    type Section = {
      heading: { title: string; id: string; level: 2 | 3 } | null
      callout: string | null
      body: JSX.Element[]
    }
    const sections: Section[] = []
    let current: Section = { heading: null, callout: null, body: [] }
    let listItems: string[] = []
    let h2Index = 0
    let h3Index = 0
    let elIndex = 0

    const flushList = () => {
      if (listItems.length === 0) return
      const items = listItems
      listItems = []
      current.body.push(
        <ul key={`list-${elIndex++}`}>
          {items.map((item, idx) => (
            <li key={idx}>{renderInlineSpans(item, `${elIndex}-${idx}`)}</li>
          ))}
        </ul>
      )
    }

    const pushSection = () => {
      // Only push when there's content (skip an initial empty section)
      if (current.heading || current.body.length > 0) sections.push(current)
      current = { heading: null, callout: null, body: [] }
    }

    lines.forEach((line) => {
      const trimmed = line.trim()

      if (trimmed.startsWith("## ")) {
        flushList()
        pushSection()
        h2Index += 1
        h3Index = 0
        const title = trimmed.replace("## ", "")
        const id = `section-${h2Index}`
        current.heading = { title, id, level: 2 }
        current.callout = calloutForHeading(title)
        return
      }

      if (trimmed.startsWith("### ")) {
        flushList()
        h3Index += 1
        const title = trimmed.replace("### ", "")
        const id = `subsection-${h2Index}-${h3Index}`
        current.body.push(
          <h3 key={`h3-${elIndex++}`} id={id} className="scroll-mt-24">
            {title}
          </h3>
        )
        return
      }

      if (trimmed.startsWith("**") && trimmed.endsWith("**") && !trimmed.includes(" ")) {
        // Treat single-token bold-only line as a sub-heading
        flushList()
        current.body.push(
          <h3 key={`h3-${elIndex++}`}>{trimmed.replace(/\*\*/g, "")}</h3>
        )
        return
      }

      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        listItems.push(trimmed.replace(/^[-*]\s+/, ""))
        return
      }

      if (/^\d+\.\s/.test(trimmed)) {
        listItems.push(trimmed.replace(/^\d+\.\s/, ""))
        return
      }

      if (trimmed === "") {
        flushList()
        return
      }

      flushList()
      current.body.push(
        <p key={`p-${elIndex++}`}>{renderInlineSpans(trimmed, `p-${elIndex}`)}</p>
      )
    })

    flushList()
    pushSection()

    return sections.map((s, idx) => {
      const heading = s.heading ? (
        <h2 id={s.heading.id} className="scroll-mt-24">
          {s.heading.title}
        </h2>
      ) : null

      // Performed-by / supporting are short — render as compact label rows.
      if (s.callout === "performed-by" || s.callout === "supporting") {
        const label = s.callout === "performed-by" ? "Typically performed by" : "Supporting on the task"
        return (
          <div key={idx} data-callout={s.callout} id={s.heading?.id}>
            <h3>{label}</h3>
            <div className="text-[15px] text-foreground/90 mt-1">{s.body}</div>
          </div>
        )
      }

      if (s.callout) {
        return (
          <div key={idx} data-callout={s.callout} id={s.heading?.id}>
            <h3>{s.heading?.title ?? ""}</h3>
            {s.body}
          </div>
        )
      }

      return (
        <section key={idx}>
          {heading}
          {s.body}
        </section>
      )
    })
  }

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
      setShowToc(false) // Close mobile TOC after navigation
    }
  }

  const handleAskAI = async (question: string) => {
    if (!question.trim() || isAskingAI) return

    setIsAskingAI(true)
    setAskAIQuestion(question)
    setAskAIAnswer("")

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: question }],
          context: `Article Title: ${doctrine.title}\nCategory: ${doctrine.category}\n\n${doctrine.content}`, // Send full article content as context
        }),
      })

      if (!response.ok) {
        throw new Error("Chat request failed")
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullAnswer = ""

      if (!reader) {
        throw new Error("No reader available")
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split("\n").filter((line) => line.trim())

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6)
            if (data === "[DONE]") break

            try {
              const json = JSON.parse(data)
              if (json.content) {
                fullAnswer += json.content
                // Update answer in real-time
                setAskAIAnswer(fullAnswer)
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }

      if (!fullAnswer) {
        setAskAIAnswer("I'm sorry, I couldn't generate a response.")
      }
    } catch (error) {
      console.error("Ask AI error:", error)
      setAskAIAnswer("I'm sorry, I'm having trouble processing your question right now. Please try again later.")
    } finally {
      setIsAskingAI(false)
    }
  }


  return (
    <div className="relative flex flex-col h-full bg-background">
      {/* Reading-progress bar at the very top edge */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-muted z-30">
        <div
          className="h-full bg-interactive transition-all duration-150"
          style={{ width: `${readProgress}%` }}
        />
      </div>

      {/* Top rail — back · contextual title (on scroll) · action icons including Ask AI */}
      <header
        className={cn(
          "sticky top-0 z-20 transition-colors",
          headerCondensed ? "bg-background/95 backdrop-blur-md border-b border-border" : "bg-background"
        )}
      >
        <div className="flex items-center gap-1 px-2 pt-12 pb-2">
          <button
            onClick={() => onNavigate("doctrine")}
            aria-label="Back"
            className="w-11 h-11 rounded-full flex items-center justify-center active:scale-95 transition-transform hover:bg-muted shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1 min-w-0 px-1">
            {headerCondensed && (
              <p className="text-sm font-semibold text-foreground truncate">{doctrine.title}</p>
            )}
          </div>
          <button
            onClick={() => setAiSheetOpen(true)}
            aria-label="Ask AI about this article"
            className="w-11 h-11 rounded-full flex items-center justify-center active:scale-95 transition hover:bg-interactive-soft/40 shrink-0"
          >
            <Sparkles className="w-5 h-5 text-interactive" />
          </button>
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            aria-label={isBookmarked ? "Remove bookmark" : "Bookmark"}
            aria-pressed={isBookmarked}
            className="w-11 h-11 rounded-full flex items-center justify-center active:scale-95 transition hover:bg-muted shrink-0"
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-5 h-5 text-interactive" />
            ) : (
              <Bookmark className="w-5 h-5 text-foreground" />
            )}
          </button>
          <button
            onClick={handleDownload}
            disabled={isDownloading || isDownloaded}
            aria-label={isDownloaded ? "Saved offline" : "Save offline"}
            className="w-11 h-11 rounded-full flex items-center justify-center active:scale-95 transition hover:bg-muted shrink-0 disabled:opacity-100"
          >
            {isDownloading ? (
              <DownloadCloud className="w-5 h-5 text-muted-foreground animate-pulse" />
            ) : isDownloaded ? (
              <Check className="w-5 h-5 text-success" />
            ) : (
              <Download className="w-5 h-5 text-foreground" />
            )}
          </button>
          <button
            onClick={() => setShareSheetOpen(true)}
            aria-label="Share article"
            className="w-11 h-11 rounded-full flex items-center justify-center active:scale-95 transition hover:bg-muted shrink-0"
          >
            {shareState === "copied" ? (
              <Check className="w-5 h-5 text-success" />
            ) : (
              <Share2 className="w-5 h-5 text-foreground" />
            )}
          </button>
        </div>
      </header>

      {/* Scrollable article body */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto"
        onScroll={handleScroll}
      >
        {/* Hero — scrolls away when reading */}
        <div className="px-5 pt-2 pb-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-1 bg-muted text-foreground text-xs font-medium rounded-full">
              {doctrine.category}
            </span>
            {doctrine.disasterType && doctrine.disasterType !== doctrine.category && (
              <span className="px-2.5 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                {doctrine.disasterType}
              </span>
            )}
          </div>
          <h1 className="text-[1.75rem] leading-[1.15] font-bold text-foreground tracking-tight text-balance">
            {doctrine.title}
          </h1>
          <div className="flex items-center gap-3 mt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" aria-hidden />
              {doctrine.readTime}
            </span>
            <span aria-hidden>·</span>
            <span>v{doctrine.version}</span>
            <span aria-hidden>·</span>
            <span>Updated {doctrine.lastUpdated}</span>
          </div>
        </div>

        {/* Lead summary */}
        <div className="px-5">
          <p className="text-[17px] leading-[1.55] text-foreground/85 font-medium pb-5 border-b border-border">
            {doctrine.summary}
          </p>
        </div>

        {/* Optional TOC trigger — kept slim, opens an inline list */}
        {tocItems.length > 0 && (
          <div className="px-5 pt-4">
            <button
              onClick={() => setShowToc(!showToc)}
              aria-expanded={showToc}
              className="inline-flex items-center gap-2 px-3.5 h-10 rounded-full bg-muted hover:bg-muted/70 active:scale-95 transition text-sm font-medium text-foreground"
            >
              <List className="w-4 h-4 text-muted-foreground" aria-hidden />
              {showToc ? "Hide contents" : `Contents · ${tocItems.length}`}
              <ChevronDown
                className={cn("w-4 h-4 text-muted-foreground transition-transform", showToc && "rotate-180")}
                aria-hidden
              />
            </button>
            {showToc && (
              <nav className="mt-3 rounded-2xl bg-card border border-border max-h-72 overflow-y-auto">
                {tocItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={cn(
                      "w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-muted",
                      item.level === 2
                        ? "font-medium text-foreground"
                        : "text-muted-foreground pl-8"
                    )}
                  >
                    {item.title}
                  </button>
                ))}
              </nav>
            )}
          </div>
        )}

        {/* Video */}
        <div className="px-5 pt-5">
          {isOnline ? (
            <div className="rounded-2xl overflow-hidden border border-border bg-card">
              <div className="aspect-video w-full">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/j3-ilgrJPLY?enablejsapi=1&rel=0"
                  title="American Red Cross Training Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden border border-border bg-card">
              <div className="aspect-video bg-muted flex items-center justify-center p-6">
                <div className="text-center">
                  <WifiOff className="w-10 h-10 text-muted-foreground mx-auto mb-3" aria-hidden />
                  <p className="text-sm font-medium text-foreground">Video unavailable offline</p>
                  <p className="text-xs text-muted-foreground mt-1">Reconnect to play this training clip</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Article body */}
        <article className="prose-arc px-5 pt-6">{renderContent(doctrine.content)}</article>

        {/* Related — reframed for action */}
        {doctrine.relatedDocs.length > 0 && (
          <section className="px-5 pt-10">
            <h2 className="text-base font-semibold text-foreground mb-1">After this, you'll likely need</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Related task sheets and standards that pair with this article.
            </p>
            <div className="space-y-2">
              {doctrine.relatedDocs.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => onNavigate("doctrine-detail", undefined, doc.id)}
                  className="w-full flex items-center justify-between gap-3 p-4 bg-card rounded-2xl border border-border active:scale-[0.99] hover:border-interactive/40 transition"
                >
                  <span className="text-sm font-medium text-foreground text-left">{doc.title}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Spacer for FAB / nav */}
        <div className="h-32" />
      </div>

      {/* Subtle share confirmation — top-anchored, card surface, only when there's
          something to say (the OS share sheet already confirms a real share). */}
      {(shareState === "copied" || shareState === "failed") && (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            "fixed z-40 top-20 left-1/2 -translate-x-1/2",
            "inline-flex items-center gap-2 px-3.5 py-2 rounded-full",
            "bg-card border border-border shadow-md",
            "text-[13px] font-medium text-foreground",
            "animate-in fade-in slide-in-from-top-2 duration-200"
          )}
        >
          {shareState === "copied" ? (
            <>
              <Check className="w-3.5 h-3.5 text-success" aria-hidden />
              Link copied
            </>
          ) : (
            <span className="text-muted-foreground">Couldn't share</span>
          )}
        </div>
      )}

      {/* Read-progress percentage pill — bottom right, above the nav */}
      {readProgress > 3 && (
        <button
          onClick={scrollToTop}
          aria-label="Back to top"
          className="fixed z-30 bottom-24 h-10 px-3.5 rounded-full bg-card border border-border text-xs font-semibold text-muted-foreground shadow-sm active:scale-95 transition flex items-center gap-1.5"
          style={{ right: "max(1rem, calc(50vw - 16rem + 1rem))" }}
        >
          <ArrowUp className="w-3.5 h-3.5" aria-hidden />
          {Math.round(readProgress)}%
        </button>
      )}

      {/* AI bottom sheet — opens on FAB tap, hosts both Summarize and Ask flows */}
      {aiSheetOpen && (
        <>
          <button
            type="button"
            aria-hidden
            onClick={() => setAiSheetOpen(false)}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="AI assistance"
            className="fixed inset-x-0 bottom-0 z-50 max-w-lg mx-auto bg-card rounded-t-3xl border-t border-border shadow-2xl max-h-[85vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-card pt-2 pb-3 border-b border-border">
              <div className="mx-auto w-10 h-1.5 rounded-full bg-muted-foreground/30 mb-3" aria-hidden />
              <div className="flex items-center justify-between px-5">
                <h2 className="text-base font-semibold text-foreground">AI assistance</h2>
                <button
                  onClick={() => setAiSheetOpen(false)}
                  aria-label="Close"
                  className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted active:scale-95 transition"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="px-5 py-5 space-y-4">
              {/* Action chips */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (!showSummary) {
                      setShowAskAI(false)
                      setSummaryGenerated(false)
                      setAiSummary("")
                      setAiKeyPoints([])
                    }
                    setShowSummary(!showSummary)
                  }}
                  aria-pressed={showSummary}
                  className={cn(
                    "flex-1 inline-flex items-center justify-center gap-1.5 h-11 rounded-xl text-sm font-medium transition",
                    showSummary
                      ? "bg-interactive text-interactive-foreground"
                      : "bg-muted text-foreground hover:bg-muted/70"
                  )}
                >
                  <Sparkles className="w-4 h-4" />
                  Summarize
                </button>
                <button
                  onClick={() => {
                    if (!showAskAI) setShowSummary(false)
                    setShowAskAI(!showAskAI)
                  }}
                  aria-pressed={showAskAI}
                  className={cn(
                    "flex-1 inline-flex items-center justify-center gap-1.5 h-11 rounded-xl text-sm font-medium transition",
                    showAskAI
                      ? "bg-interactive text-interactive-foreground"
                      : "bg-muted text-foreground hover:bg-muted/70"
                  )}
                >
                  <MessageSquare className="w-4 h-4" />
                  Ask
                </button>
              </div>

              {/* Summary panel */}
              {showSummary && (
                <div className="rounded-2xl bg-interactive-soft/40 border border-interactive/15 overflow-hidden">
                  {/* Sticky panel header with close */}
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-interactive/15 bg-interactive-soft/30">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-interactive" aria-hidden />
                      <span className="text-xs font-semibold uppercase tracking-wide text-interactive-deep">
                        AI Summary
                      </span>
                    </div>
                    <button
                      onClick={() => setShowSummary(false)}
                      aria-label="Close summary"
                      className="w-8 h-8 rounded-full hover:bg-card flex items-center justify-center text-muted-foreground active:scale-95 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-5">
                    {!aiSummary && !summaryGenerated ? (
                      <div className="flex items-center gap-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-interactive rounded-full animate-pulse" />
                          <div className="w-2 h-2 bg-interactive rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
                          <div className="w-2 h-2 bg-interactive rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
                        </div>
                        <span className="text-sm text-muted-foreground">Generating summary…</span>
                      </div>
                    ) : (
                      <div>
                        {/* Render the full AI output as markdown — captures bold, lists,
                            headings, and inline emphasis without leaking literal asterisks. */}
                        {aiSummary && <AIMarkdown text={aiSummary} />}
                        {aiKeyPoints.length > 0 && !aiSummary.includes("Key Points") && !aiSummary.includes("**") && (
                          <>
                            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mt-3 mb-1.5">
                              Key points
                            </h4>
                            <ul className="space-y-1.5 list-disc pl-5 text-[15px] text-foreground">
                              {aiKeyPoints.map((point, idx) => (
                                <li key={idx}>{point}</li>
                              ))}
                            </ul>
                          </>
                        )}
                        <div className="flex items-center justify-between pt-3 mt-3 border-t border-interactive/15">
                          <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5" aria-hidden />
                            Verify against doctrine
                          </p>
                          <div className="flex items-center gap-1.5">
                            <button aria-label="Helpful" className="w-9 h-9 rounded-full hover:bg-card flex items-center justify-center text-muted-foreground hover:text-success transition">
                              <ThumbsUp className="w-4 h-4" />
                            </button>
                            <button aria-label="Not helpful" className="w-9 h-9 rounded-full hover:bg-card flex items-center justify-center text-muted-foreground hover:text-primary transition">
                              <ThumbsDown className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Ask AI panel */}
              {showAskAI && (
                <div className="rounded-2xl bg-card border border-border overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-interactive" aria-hidden />
                      <span className="text-xs font-semibold uppercase tracking-wide text-foreground">
                        Ask about this article
                      </span>
                    </div>
                    <button
                      onClick={() => setShowAskAI(false)}
                      aria-label="Close ask"
                      className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground active:scale-95 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-5">
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={askAIQuestion}
                      onChange={(e) => setAskAIQuestion(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey && askAIQuestion.trim() && !isAskingAI) {
                          e.preventDefault()
                          handleAskAI(askAIQuestion.trim())
                        }
                      }}
                      placeholder="Ask anything about this article…"
                      disabled={isAskingAI}
                      className="flex-1 h-11 px-4 rounded-xl bg-muted text-foreground placeholder:text-muted-foreground text-[15px] focus:outline-none focus:ring-2 focus:ring-interactive/40 disabled:opacity-50"
                    />
                    <button
                      onClick={() => askAIQuestion.trim() && !isAskingAI && handleAskAI(askAIQuestion.trim())}
                      disabled={isAskingAI || !askAIQuestion.trim()}
                      className="w-11 h-11 rounded-full bg-interactive text-interactive-foreground active:scale-95 transition flex items-center justify-center disabled:opacity-50"
                      aria-label="Send question"
                    >
                      {isAskingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUp className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {[
                      `What is ${doctrine.category}?`,
                      "How do I implement this?",
                      "What are the key points?",
                    ].map((q) => (
                      <button
                        key={q}
                        onClick={() => handleAskAI(q)}
                        disabled={isAskingAI}
                        className="px-3 py-1.5 rounded-full bg-muted text-xs font-medium text-foreground hover:bg-muted/70 active:scale-95 transition disabled:opacity-50"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                  <div className="pt-3 border-t border-border min-h-[3rem]">
                    {isAskingAI ? (
                      <div className="flex items-center gap-3 py-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-interactive rounded-full animate-pulse" />
                          <div className="w-2 h-2 bg-interactive rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
                          <div className="w-2 h-2 bg-interactive rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
                        </div>
                        <span className="text-sm text-muted-foreground">Thinking…</span>
                      </div>
                    ) : askAIAnswer ? (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">{askAIQuestion}</p>
                        <AIMarkdown text={askAIAnswer} />
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Tap a quick question or type your own.</p>
                    )}
                  </div>
                  </div>
                </div>
              )}

              {!showSummary && !showAskAI && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Pick an action above to summarise or ask about this article.
                </p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Custom Share sheet — fully styled, no native OS share sheet */}
      {shareSheetOpen && (
        <>
          <button
            type="button"
            aria-hidden
            onClick={() => setShareSheetOpen(false)}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Share article"
            className="fixed inset-x-0 bottom-0 z-50 max-w-lg mx-auto bg-card rounded-t-3xl border-t border-border shadow-2xl"
          >
            <div className="pt-2 pb-3">
              <div className="mx-auto w-10 h-1.5 rounded-full bg-muted-foreground/30 mb-3" aria-hidden />
              <div className="flex items-center justify-between px-5 mb-1">
                <h2 className="text-base font-semibold text-foreground">Share</h2>
                <button
                  onClick={() => setShareSheetOpen(false)}
                  aria-label="Close"
                  className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted active:scale-95 transition"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground px-5 line-clamp-2">{doctrine.title}</p>
            </div>

            <div className="px-3 pb-3">
              <div className="grid grid-cols-4 gap-1">
                <button
                  onClick={shareCopyLink}
                  className="flex flex-col items-center gap-2 py-3 rounded-2xl hover:bg-muted active:scale-95 transition"
                >
                  <span className="w-12 h-12 rounded-full bg-interactive-soft/50 flex items-center justify-center">
                    <LinkIcon className="w-5 h-5 text-interactive" aria-hidden />
                  </span>
                  <span className="text-[11px] font-medium text-foreground">Copy link</span>
                </button>
                <button
                  onClick={shareEmail}
                  className="flex flex-col items-center gap-2 py-3 rounded-2xl hover:bg-muted active:scale-95 transition"
                >
                  <span className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <Mail className="w-5 h-5 text-foreground" aria-hidden />
                  </span>
                  <span className="text-[11px] font-medium text-foreground">Email</span>
                </button>
                <button
                  onClick={shareSms}
                  className="flex flex-col items-center gap-2 py-3 rounded-2xl hover:bg-muted active:scale-95 transition"
                >
                  <span className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-foreground" aria-hidden />
                  </span>
                  <span className="text-[11px] font-medium text-foreground">Message</span>
                </button>
                <button
                  onClick={sharePrint}
                  className="flex flex-col items-center gap-2 py-3 rounded-2xl hover:bg-muted active:scale-95 transition"
                >
                  <span className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <Printer className="w-5 h-5 text-foreground" aria-hidden />
                  </span>
                  <span className="text-[11px] font-medium text-foreground">Print</span>
                </button>
              </div>
            </div>

            {/* Bottom-safe-area spacer for iOS home indicator */}
            <div className="h-6" />
          </div>
        </>
      )}
    </div>
  )
}
