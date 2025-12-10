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
  Play,
  Pause,
  WifiOff,
  FileText,
  Headphones,
  X,
  SkipBack,
  SkipForward,
  Gauge,
  ThumbsUp,
  ThumbsDown,
  Info,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Screen } from "../app-shell"
import type { JSX } from "react/jsx-runtime" // Import JSX to resolve undeclared variable error
import { massCareContent } from "@/lib/mass-care-content"

interface DoctrineDetailScreenProps {
  doctrineId: string | null
  onNavigate: (screen: Screen) => void
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
  const [isDownloading, setIsDownloading] = useState(false)
  const [readProgress, setReadProgress] = useState(0)
  const [showToc, setShowToc] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [showSummary, setShowSummary] = useState(false)
  const [showAskAI, setShowAskAI] = useState(false)
  const [showListenPlayer, setShowListenPlayer] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [summaryGenerated, setSummaryGenerated] = useState(false)
  const [aiSummary, setAiSummary] = useState<string>("")
  const [aiKeyPoints, setAiKeyPoints] = useState<string[]>([])
  const [askAIQuestion, setAskAIQuestion] = useState("")
  const [askAIAnswer, setAskAIAnswer] = useState("")
  const [isAskingAI, setIsAskingAI] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioLoading, setAudioLoading] = useState(false)
  const [audioLoadingMessage, setAudioLoadingMessage] = useState("Preparing audio...")
  const [audioProgress, setAudioProgress] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const [audioCurrentTime, setAudioCurrentTime] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const audioRef = useRef<HTMLAudioElement | null>(null)

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

          // Parse final summary and key points
          const lines = fullText.split("\n").filter((line: string) => line.trim())
          const summaryLines: string[] = []
          const keyPoints: string[] = []
          let foundBullets = false

          lines.forEach((line: string) => {
            const trimmed = line.trim()
            // Check for bullet points (various formats)
            if (trimmed.match(/^[-•*]\s/) || trimmed.match(/^\d+\.\s/)) {
              foundBullets = true
              const cleaned = trimmed.replace(/^[-•*]\s/, "").replace(/^\d+\.\s/, "").trim()
              if (cleaned) {
                keyPoints.push(cleaned)
              }
            } else if (trimmed && !foundBullets) {
              // Text before bullets = summary
              summaryLines.push(trimmed)
            } else if (trimmed && foundBullets && !trimmed.match(/^[-•*]/) && !trimmed.match(/^\d+\./)) {
              // Additional summary text after bullets (shouldn't happen but handle it)
              if (keyPoints.length === 0) {
                summaryLines.push(trimmed)
              }
            }
          })

          // Set final parsed content
          const finalSummary = summaryLines.join(" ").trim() || fullText.split("\n").filter((l: string) => !l.match(/^[-•*]/) && !l.match(/^\d+\./)).join(" ").trim()
          setAiSummary(finalSummary || "Summary generated")
          
          if (keyPoints.length > 0) {
            setAiKeyPoints(keyPoints)
          } else {
            // If no bullets found, try to extract from full text
            const fallbackBullets = fullText.split("\n")
              .filter((l: string) => l.trim().match(/^[-•*]/) || l.trim().match(/^\d+\./))
              .map((l: string) => l.replace(/^[-•*]\s/, "").replace(/^\d+\.\s/, "").trim())
              .filter((l: string) => l.length > 0)
            
            if (fallbackBullets.length > 0) {
              setAiKeyPoints(fallbackBullets)
            }
          }
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
  }

  const renderContent = (content: string) => {
    const lines = content.trim().split("\n")
    const elements: JSX.Element[] = []
    let listItems: string[] = []
    let inList = false
    let h2Index = 0
    let h3Index = 0

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="space-y-2 my-4 ml-4">
            {listItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span className="text-foreground/80">{item}</span>
              </li>
            ))}
          </ul>,
        )
        listItems = []
      }
      inList = false
    }

    lines.forEach((line, idx) => {
      const trimmed = line.trim()

      if (trimmed.startsWith("## ")) {
        flushList()
        h2Index++
        h3Index = 0
        const title = trimmed.replace("## ", "")
        const id = `section-${h2Index}`
        elements.push(
          <h2 key={idx} id={id} className="text-lg font-semibold text-foreground mt-8 mb-3 first:mt-0 scroll-mt-20">
            {title}
          </h2>,
        )
      } else if (trimmed.startsWith("### ")) {
        flushList()
        h3Index++
        const title = trimmed.replace("### ", "")
        const id = `subsection-${h2Index}-${h3Index}`
        elements.push(
          <h3 key={idx} id={id} className="text-base font-semibold text-foreground mt-6 mb-2 scroll-mt-20">
            {title}
          </h3>,
        )
      } else if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
        flushList()
        elements.push(
          <h3 key={idx} className="text-base font-semibold text-foreground mt-6 mb-2">
            {trimmed.replace(/\*\*/g, "")}
          </h3>,
        )
      } else if (trimmed.startsWith("- ")) {
        inList = true
        listItems.push(trimmed.replace("- ", ""))
      } else if (trimmed.match(/^\d+\.\s/)) {
        inList = true
        listItems.push(trimmed.replace(/^\d+\.\s/, ""))
      } else if (trimmed === "") {
        flushList()
      } else if (trimmed) {
        flushList()
        // Handle inline bold
        const parts = trimmed.split(/(\*\*[^*]+\*\*)/)
        elements.push(
          <p key={idx} className="text-foreground/80 leading-relaxed my-3">
            {parts.map((part, pIdx) => {
              if (part.startsWith("**") && part.endsWith("**")) {
                return (
                  <strong key={pIdx} className="font-semibold text-foreground">
                    {part.replace(/\*\*/g, "")}
                  </strong>
                )
              }
              return part
            })}
          </p>,
        )
      }
    })

    flushList()
    return elements
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


  // Load audio file when listen player opens (uses blob storage, checks cache first)
  useEffect(() => {
    if (showListenPlayer && isOnline && !audioUrl && doctrineId) {
      const loadAudio = async () => {
        setAudioLoading(true)
        setAudioLoadingMessage("Checking cache...")
        const startTime = Date.now()
        
        try {
          // Generate audio via API (API checks blob cache first, then generates if needed)
          console.log("Loading audio for:", doctrineId)
          
          const response = await fetch("/api/ai/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              text: doctrine.content,
              voice: "nova",
              doctrineId: doctrineId
            }),
          })

          if (response.ok) {
            const data = await response.json()
            const elapsed = Date.now() - startTime
            
            if (data.audioUrl) {
              if (data.cached) {
                console.log(`[Frontend] Audio loaded from cache in ${elapsed}ms:`, data.audioUrl)
                setAudioLoadingMessage("Loading audio...")
                // Small delay to show "Loading audio..." message for cached files
                setTimeout(() => {
                  setAudioUrl(data.audioUrl)
                  setAudioLoading(false)
                }, 100)
              } else {
                console.log(`[Frontend] Audio generated in ${elapsed}ms:`, data.audioUrl)
                setAudioLoadingMessage("Generating audio...")
                setAudioUrl(data.audioUrl)
                setAudioLoading(false)
              }
            } else {
              throw new Error("No audio URL received from AI TTS service")
            }
          } else {
            const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
            console.error("AI TTS API error:", errorData)
            throw new Error(errorData.error || errorData.details || "AI TTS service failed")
          }
        } catch (error) {
          console.error("AI TTS error:", error)
          setAudioLoading(false)
          alert(`AI TTS failed: ${error instanceof Error ? error.message : "Unknown error"}. Please check your API configuration.`)
          setShowListenPlayer(false)
        }
      }

      loadAudio()
    }
  }, [showListenPlayer, isOnline, doctrineId, doctrine.content, audioUrl])

  // Reset audio when doctrine changes
  useEffect(() => {
    if (doctrineId) {
      setAudioUrl(null)
      setAudioCurrentTime(0)
      setAudioProgress(0)
      setIsPlaying(false)
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
    }
  }, [doctrineId])


  // Update playback speed when changed
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.playbackRate = playbackSpeed
  }, [playbackSpeed])

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current
    if (!audio) {
      console.error("Audio element not found")
      return
    }

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play().catch((error) => {
        console.error("Error playing audio:", error)
        alert("Unable to play audio. Please try again.")
      })
    }
  }, [isPlaying])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const skipBackward = useCallback(() => {
    const audio = audioRef.current
    if (audio && audio.duration) {
      audio.currentTime = Math.max(0, audio.currentTime - 10)
    }
  }, [])

  const skipForward = useCallback(() => {
    const audio = audioRef.current
    if (audio && audio.duration) {
      audio.currentTime = Math.min(audio.duration, audio.currentTime + 10)
    }
  }, [])

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio || !audio.duration) return

    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    audio.currentTime = percent * audio.duration
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-muted z-20">
        <div className="h-full bg-primary transition-all duration-150" style={{ width: `${readProgress}%` }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-10 bg-background">
        <div className="px-5 pt-12 pb-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => onNavigate("doctrine")}
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-all",
                  isBookmarked ? "bg-primary/10" : "bg-muted",
                )}
              >
                {isBookmarked ? (
                  <BookmarkCheck className="w-5 h-5 text-primary" />
                ) : (
                  <Bookmark className="w-5 h-5 text-foreground" />
                )}
              </button>
              <button
                onClick={handleDownload}
                disabled={isDownloading || isDownloaded}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-all",
                  isDownloaded ? "bg-green-100" : "bg-muted",
                )}
              >
                {isDownloading ? (
                  <DownloadCloud className="w-5 h-5 text-muted-foreground animate-pulse" />
                ) : isDownloaded ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Download className="w-5 h-5 text-foreground" />
                )}
              </button>
              <button className="w-10 h-10 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform">
                <Share2 className="w-5 h-5 text-foreground" />
              </button>
            </div>
          </div>

          {/* Meta tags */}
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
              {doctrine.category}
            </span>
            <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">
              {doctrine.disasterType}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-xl font-semibold text-foreground leading-tight text-balance">{doctrine.title}</h1>

          {/* Reading info */}
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {doctrine.readTime} read
            </span>
            <span>v{doctrine.version}</span>
            <span>Updated {doctrine.lastUpdated}</span>
          </div>
        </div>
      </header>

      {/* AI Assists - Above TOC */}
      <div className="px-5 pt-2 pb-4">
        <div id="ai-tools-container" className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              if (showSummary) {
                setShowSummary(false)
              } else {
                // Close other widgets
                setShowListenPlayer(false)
                setShowAskAI(false)
                // Reset summary state to allow regeneration
                setSummaryGenerated(false)
                setAiSummary("")
                setAiKeyPoints([])
                // Open summary
                setShowSummary(true)
              }
            }}
            className={cn(
              "inline-flex items-center gap-2 px-5 py-3 bg-muted/50 rounded-2xl text-sm font-semibold transition-all active:scale-[0.97] shadow-sm",
              showSummary
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-foreground hover:bg-muted",
            )}
          >
            <Sparkles className={cn("w-4 h-4", showSummary && "text-primary-foreground")} />
            <span>Summarize</span>
          </button>
          <button
            onClick={() => {
              if (!isOnline) return
              if (showListenPlayer) {
                setShowListenPlayer(false)
                setIsPlaying(false)
                setAudioUrl(null)
                if (audioRef.current) {
                  audioRef.current.pause()
                  audioRef.current.currentTime = 0
                }
              } else {
                // Close other widgets
                setShowSummary(false)
                setShowAskAI(false)
                // Open listen player
                setShowListenPlayer(true)
              }
            }}
            disabled={!isOnline}
            className={cn(
              "inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold transition-all active:scale-[0.97] shadow-sm",
              !isOnline
                ? "bg-muted/30 text-muted-foreground opacity-50 cursor-not-allowed"
                : showListenPlayer
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted/50 text-foreground hover:bg-muted",
            )}
          >
            <Headphones className={cn("w-4 h-4", showListenPlayer && "text-primary-foreground")} />
            <span>Listen</span>
          </button>
          <button
            onClick={() => {
              if (showAskAI) {
                setShowAskAI(false)
              } else {
                // Close other widgets
                setShowSummary(false)
                setShowListenPlayer(false)
                // Open ask AI
                setShowAskAI(true)
              }
            }}
            className={cn(
              "inline-flex items-center gap-2 px-5 py-3 bg-muted/50 rounded-2xl text-sm font-semibold transition-all active:scale-[0.97] shadow-sm",
              showAskAI
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-foreground hover:bg-muted",
            )}
          >
            <MessageSquare className={cn("w-4 h-4", showAskAI && "text-primary-foreground")} />
            <span>Ask AI</span>
          </button>
        </div>

        {/* AI Widgets - Appear directly below buttons */}
        {showSummary && (
          <div className="mt-4 p-6 border-2 border-border rounded-xl bg-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <h4 className="text-sm font-semibold text-foreground">AI Summary</h4>
              </div>
              <button
                onClick={() => setShowSummary(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {!aiSummary && !summaryGenerated ? (
              <div className="flex items-center gap-3 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
                </div>
                <span className="text-sm text-muted-foreground">Generating summary...</span>
              </div>
            ) : (
              <div>
                <div className="prose prose-sm max-w-none">
                  {aiSummary && (
                    <p className="text-foreground/80 leading-relaxed mb-4">
                      {aiSummary}
                    </p>
                  )}
                  {aiKeyPoints.length > 0 && (
                    <>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Key Points:</h4>
                      <ul className="space-y-2 mb-4 ml-4">
                        {aiKeyPoints.map((point, idx) => (
                          <li key={idx} className="text-sm text-foreground/80 list-disc">
                            {point}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  {!aiSummary && summaryGenerated && (
                    <p className="text-sm text-muted-foreground">Generating summary...</p>
                  )}
                </div>
                <div className="text-right mb-4">
                  <button className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                    <Info className="w-3.5 h-3.5" />
                    <span>About AI-based content</span>
                  </button>
                </div>
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">How was this response?</p>
                    <div className="flex items-center gap-3">
                      <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:border-green-500 hover:text-green-600 hover:bg-green-50 transition-colors">
                        <ThumbsUp className="w-4 h-4" />
                        <span>Yes</span>
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:border-red-500 hover:text-red-600 hover:bg-red-50 transition-colors">
                        <ThumbsDown className="w-4 h-4" />
                        <span>No</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {showListenPlayer && isOnline && (
          <div className="mt-4 p-6 border-2 border-border rounded-xl bg-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Headphones className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Listen to Article</h4>
                  <p className="text-xs text-muted-foreground">{doctrine.title}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowListenPlayer(false)
                  setIsPlaying(false)
                  setAudioUrl(null)
                  setAudioCurrentTime(0)
                  setAudioProgress(0)
                  if (audioRef.current) {
                    audioRef.current.pause()
                    audioRef.current.currentTime = 0
                  }
                }}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Loading State */}
            {audioLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  <span className="text-sm text-muted-foreground">{audioLoadingMessage}</span>
                </div>
              </div>
            )}

            {/* Hidden audio element */}
            {audioUrl && (
              <audio
                ref={audioRef}
                src={audioUrl}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onLoadedMetadata={() => {
                  if (audioRef.current?.duration) {
                    setAudioDuration(audioRef.current.duration)
                    console.log("Audio loaded, duration:", audioRef.current.duration)
                  }
                }}
                onCanPlay={() => {
                  console.log("Audio can play")
                }}
                onTimeUpdate={() => {
                  if (audioRef.current) {
                    setAudioCurrentTime(audioRef.current.currentTime)
                    if (audioRef.current.duration) {
                      setAudioProgress((audioRef.current.currentTime / audioRef.current.duration) * 100)
                    }
                  }
                }}
                onEnded={() => {
                  setIsPlaying(false)
                  setAudioCurrentTime(0)
                  setAudioProgress(0)
                }}
                onError={(e) => {
                  console.error("Audio playback error:", e)
                  const audio = audioRef.current
                  if (audio) {
                    console.error("Audio error details:", audio.error)
                  }
                  alert("Error playing audio. Please try again.")
                  setIsPlaying(false)
                }}
                preload="auto"
                crossOrigin="anonymous"
              />
            )}

            {/* Audio Player */}
            {!audioLoading && audioUrl && (
              <>
                {/* Progress Bar */}
                <div className="mb-4">
                  <div
                    onClick={handleProgressClick}
                    className="w-full bg-muted rounded-full h-2 cursor-pointer"
                  >
                    <div
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 h-2 rounded-full transition-all"
                      style={{ width: `${audioProgress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                    <span>{formatTime(audioCurrentTime)}</span>
                    <span>{formatTime(audioDuration)}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={togglePlayPause}
                      className="flex items-center justify-center px-4 py-2.5 rounded-lg border border-border hover:bg-muted transition-all"
                    >
                      <div className="w-7 h-7 rounded-full border border-border bg-muted flex items-center justify-center">
                        {isPlaying ? (
                          <Pause className="w-4 h-4 text-foreground" />
                        ) : (
                          <Play className="w-4 h-4 text-foreground" />
                        )}
                      </div>
                    </button>
                    <button
                      onClick={skipBackward}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <SkipBack className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={skipForward}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <SkipForward className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-muted-foreground" />
                    <select
                      value={playbackSpeed}
                      onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                      className="text-xs bg-muted border border-border rounded-lg px-3 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value={1}>1x</option>
                      <option value={1.25}>1.25x</option>
                      <option value={1.5}>1.5x</option>
                      <option value={2}>2x</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Error State */}
            {!audioLoading && !audioUrl && (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-2">Unable to generate AI audio.</p>
                <p className="text-xs text-muted-foreground">Please check your API configuration and try again.</p>
              </div>
            )}
          </div>
        )}

        {showAskAI && (
          <div className="mt-4 p-6 border-2 border-border rounded-xl bg-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <h4 className="text-sm font-semibold text-foreground">Ask about this article</h4>
              </div>
              <button
                onClick={() => setShowAskAI(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Question Input */}
            <div className="mb-4">
              <div className="flex gap-2">
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
                  placeholder="Ask a question about this article..."
                  disabled={isAskingAI}
                  className="flex-1 px-4 py-2.5 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                />
                <button
                  onClick={() => {
                    if (askAIQuestion.trim() && !isAskingAI) {
                      handleAskAI(askAIQuestion.trim())
                    }
                  }}
                  disabled={isAskingAI || !askAIQuestion.trim()}
                  className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all font-semibold text-sm disabled:opacity-50"
                >
                  {isAskingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ask"}
                </button>
              </div>
            </div>

            {/* Quick Questions */}
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-2">Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleAskAI(`What is ${doctrine.category}?`)}
                  disabled={isAskingAI}
                  className="px-3 py-1.5 bg-muted border border-border rounded-lg text-xs font-medium text-foreground hover:bg-muted/80 transition-colors disabled:opacity-50"
                >
                  What is {doctrine.category}?
                </button>
                <button
                  onClick={() => handleAskAI("How do I implement this?")}
                  disabled={isAskingAI}
                  className="px-3 py-1.5 bg-muted border border-border rounded-lg text-xs font-medium text-foreground hover:bg-muted/80 transition-colors disabled:opacity-50"
                >
                  How do I implement this?
                </button>
                <button
                  onClick={() => handleAskAI("What are the key points?")}
                  disabled={isAskingAI}
                  className="px-3 py-1.5 bg-muted border border-border rounded-lg text-xs font-medium text-foreground hover:bg-muted/80 transition-colors disabled:opacity-50"
                >
                  What are the key points?
                </button>
              </div>
            </div>

            {/* Answer Area */}
            <div className="pt-4 border-t border-border">
              {isAskingAI ? (
                <div className="flex items-center gap-3 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
                  </div>
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              ) : askAIAnswer ? (
                <div>
                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground mb-1">Question:</p>
                    <p className="text-sm font-medium text-foreground">{askAIQuestion}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground mb-2">Answer:</p>
                    <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{askAIAnswer}</p>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Was this answer helpful?</p>
                      <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:border-green-500 hover:text-green-600 hover:bg-green-50 transition-colors">
                          <ThumbsUp className="w-4 h-4" />
                          <span>Yes</span>
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:border-red-500 hover:text-red-600 hover:bg-red-50 transition-colors">
                          <ThumbsDown className="w-4 h-4" />
                          <span>No</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Ask a question to get started</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* TOC Button - Always visible */}
      {tocItems.length > 0 && (
        <div className="px-5 pb-4 border-b border-border">
          <button
            onClick={() => setShowToc(!showToc)}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 border-2 border-border bg-card rounded-lg hover:border-primary transition-colors"
          >
            <div className="flex items-center gap-2">
              <List className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium text-foreground">Table of Contents</span>
            </div>
            <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform", showToc && "rotate-180")} />
          </button>
          {showToc && (
            <div className="mt-3 max-h-64 overflow-y-auto">
              <nav className="space-y-1">
                {tocItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={cn(
                      "w-full text-left px-4 py-2 rounded-lg text-sm transition-colors",
                      item.level === 2
                        ? "font-medium text-foreground hover:bg-muted"
                        : "text-muted-foreground hover:bg-muted pl-8",
                    )}
                  >
                    {item.title}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>
      )}

      {/* Article content */}
      <div className="flex-1 overflow-y-auto" onScroll={handleScroll}>
        <div className="px-5 py-6">
          {/* Summary */}
          <p className="text-base text-foreground/90 leading-relaxed font-medium mb-6 pb-6 border-b border-border">
            {doctrine.summary}
          </p>

          {/* Video Player */}
          {isOnline ? (
            <div className="mb-8 rounded-xl overflow-hidden border border-border bg-card">
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
            <div className="mb-8 rounded-xl overflow-hidden border border-border bg-card">
              <div className="aspect-video bg-muted flex items-center justify-center p-6">
                <div className="text-center">
                  <WifiOff className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium text-foreground mb-1">Video unavailable offline</p>
                  <p className="text-xs text-muted-foreground">This content requires an internet connection</p>
                </div>
              </div>
            </div>
          )}

          {/* Main content */}
          <article className="prose-mobile">{renderContent(doctrine.content)}</article>

          {/* Related documents */}
          <div className="mt-8 pt-6 border-t border-border">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
              Related Doctrine
            </h3>
            <div className="space-y-2">
              {doctrine.relatedDocs.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => {
                    // Navigate to related doc
                  }}
                  className="w-full flex items-center justify-between p-4 bg-card rounded-xl border border-border active:scale-[0.99] transition-transform"
                >
                  <span className="text-sm font-medium text-foreground">{doc.title}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>

          {/* Bottom padding for safe area */}
          <div className="h-24" />
        </div>
      </div>
    </div>
  )
}
