# Campus App Feature Comparison Across IITs

An extensive comparison matrix evaluating the state of student-made and official campus companion platforms across top Indian Institutes of Technology. This document cross-references legacy institutional platforms against the newly constructed **IIT Ropar CP301** architecture.

### Feature Matrix Overview

| Institute | Primary Platform | Unified Feed & Notices | Blogs & Forums | Interactive Map & Nav | Mess Menu | Marketplace (Buy/Sell) | Lost & Found | Events Calendar | Quick Links | Profile / Access QR |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **IIT Bombay** | InstiApp | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| **IIT Madras** | InstiSpace | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| **IIT Kharagpur** | ApnaInsti + SETU | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ |
| **IIT Delhi** | OCS / NSS App | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **IIT Kanpur** | Campus Care App | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **IIT Guwahati**| OneStop IITG | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **IIT Gandhinagar** | InsIIT | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |
| **IIT Ropar** | **CP301 Platform** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅  | ❌ |

---

### Detailed Breakdown

#### 1. IIT Bombay: InstiApp
- **Type**: Singular native app developed by DevCom.
- **Strengths**: Extremely centralized; it provides an almost flawless "one-stop" experience. The inclusion of Profile Barcodes acting as backup physical ID cards is unique.
- **Weaknesses**: Missing dedicated modules for certain edge-cases like Lost & Found, leaning slightly more heavily on core administration metrics.

#### 2. IIT Madras: InstiSpace
- **Type**: Native companion app focusing heavily on community interactions.
- **Strengths**: Deeply personalized feeds and student interaction (help requests, travel companions). 
- **Weaknesses**: Misses out heavily on utility features such as campus navigation, marketplace, and mess timings.

#### 3. IIT Kharagpur: ApnaInsti & SETU
- **Type**: Fragmented (Student-led vs Authority-led).
- **Strengths**: Combined, they replicate Bombay's InstiApp. It’s highly detailed tracking everything from SOS alerts to General Championship leaderboards.
- **Weaknesses**: Forces students to juggle two separate applications depending on whether they need "life" updates or "logistics" updates.

#### 4. IIT Delhi & Kanpur & Roorkee
- **Type**: Strictly fragmented. Usually singular apps providing extreme niche utility (e.g. tracking placement interviews or raising electrical complaints) without any overarching ecosystem.
- **Strengths**: Narrow scope ensures highly polished web portals for specific tasks.
- **Weaknesses**: A severely decoupled student experience leading to communication silos.

### 🌟 Conclusion: IIT Ropar (CP301)
The **CP301** architecture explicitly establishes itself as one of the most comprehensive student platforms out of the box, competing purely against the giants of Bombay and Madras. 

**What IIT Ropar Provides that Others Miss:**
- **Advanced Navigation**: While others simply list maps, Ropar's web-native engine integrates direct A* Pathfinding logic dynamically overlaying interactive routes right inside the browser.
- **Full Utility Coverage**: Very few apps manage to merge *both* deep community modules (Blogs, Communities) with intensive logistical necessities (Lost & Found, Mess Menu, Quick Links). CP301 bridges that gap without fracturing into two apps.
- **Granular RBAC**: It pushes complex Role-Based Access Control down to the component level natively, allowing secure identity-swapping for official POR posts (Position of Responsibility)—a massive administrative gap in other systems.

**What IIT Ropar Currently Lacks:**
- **MyQR / Barcode Integration**: InstiApp's ability to digitize physical I-cards through scannable gates provides massive physical quality of life that CP301 currently doesn't simulate. 
- **Academic Timetable Sync**: Apps like InstiSpace provide deep timetable adjustments and class reminders dynamically synced to ERP systems. CP301 delegates academic scheduling out to existing AIMS portals via Quick Links.
