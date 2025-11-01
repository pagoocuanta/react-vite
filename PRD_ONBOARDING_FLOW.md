# Product Requirements Document: Employee Onboarding Flow

## Executive Summary

This PRD outlines a comprehensive 2-week employee onboarding flow that leverages existing OnboardFlow components (dashboard, quiz, learning path) and task views. The solution provides a structured onboarding journey from preboarding through independent work, with minimal new design requirements.

---

## 1. Product Overview

### 1.1 Objectives
- Enable employees to prepare before their first day (preboarding)
- Provide structured guidance during the first two weeks of employment
- Create clear task tracking for both managers and new employees
- Facilitate evaluation and reflection throughout the onboarding process
- Leverage existing UI components to minimize development effort

### 1.2 Success Metrics
- Employee completion rate of onboarding tasks (target: >85%)
- Time-to-productivity (days until independent task completion)
- Employee satisfaction ratings (smiley/star ratings)
- Manager engagement with task tracking and notes

### 1.3 Target Users
- **Primary:** New employees starting their first day/week
- **Secondary:** Managers/team leads managing the onboarding process
- **Tertiary:** Admin users configuring onboarding templates

---

## 2. User Journey Overview

### 2.1 Onboarding Timeline
**Preboarding** → **Day 1** → **Week 1** → **Week 2** → **Progress Review**

### 2.2 Phase Breakdown

| Phase | Timeline | Focus | Key Activities |
|-------|----------|-------|----------------|
| Preboarding | Before Day 1 | Preparation | Team intro, safety rules, Day 1 expectations |
| Day 1 | First day | Getting acquainted | Personal welcome, tour, practical setup |
| Week 1 | Days 2-5 | Learning & practicing | Team introduction, first task parts, systems training |
| Week 2 | Days 6-10 | Independence | Job shadowing, complete tasks, check-ins, reflection |

---

## 3. Screen Specifications

### Screen 1: Login & Welcome
**Purpose:** Professional entry point with clear context

**Existing Component:** Onboardr login page ("Teamwork made easy")

**Modifications:**
- Add subtitle: "Your first day starts here."
- CTA button: "Login"
- No new design required

**User Story:** As a new employee, I want to see a welcoming login screen so I understand this is my onboarding portal.

---

### Screen 2: Preboarding Dashboard
**Purpose:** Pre-start preparation overview

**Existing Component:** Choose Your Learning Path visual (3-6 tiles)

**Content:**
- **Title:** "Before You Start – Get to know your new workplace"
- **3 Tiles:**
  1. **Meet the Team** 
     - Icon: 👥 (team)
     - Description: "See who your first colleagues are (1-4 people)"
  2. **Safety & Practical Agreements**
     - Icon: 🛡️ (safety)
     - Description: "Read house rules, work hours, and practical info"
  3. **Day 1 Explained**
     - Icon: 📅 (day planning)
     - Description: "See what to expect on your first workday"

**Implementation:** 100% reuse of learning path layout, text replacement only

**User Story:** As a new employee, I want to access preparation materials before my first day so I feel confident and informed.

---

### Screen 3: Team Introduction Detail
**Purpose:** Humanize the onboarding with personal connections

**Existing Component:** Quiz or learning card visual (like Team Collaboration)

**Content:**
- **Title:** "Who is who in your team?"
- **Elements:**
  - 3 profile photos or avatars
  - Brief description per person
  - Contact details (NAW - Name, Address, Work info)

**Implementation:** Reuse quiz/learning card style with image swap

**User Story:** As a new employee, I want to see my team members' faces and contact info so I know who to approach on my first day.

---

### Screen 4: Day 1 Dashboard
**Purpose:** Track first-day activities for both employee and manager

**Existing Component:** Task board with "To Do / In Progress / Completed" columns

**Content:**
- **Title:** "Work Day 1 – Getting acquainted on location"
- **Tasks:**
  1. Personal welcome
  2. Tour
  3. Practical matters
- **Features:**
  - Subtasks (e.g., laptop setup, system access)
  - Show 1 task "In Progress" and 1 "Completed"
  - Manager notes field

**Implementation:** 1:1 reuse of task board, title updates only

**User Story:** As a manager, I want to track Day 1 tasks so I ensure nothing is forgotten during the new employee's first day.

---

### Screen 5: Task Detail - Tour
**Purpose:** Show detail level and note-taking capability

**Existing Component:** Task detail card (like "Onboard new employee")

**Content:**
- **Title:** Tour of the company
- **Subtasks:**
  - Show workplace
  - Cafeteria
  - Emergency exits
- **Note field:** "Space for manager remarks"

**Implementation:** Full reuse, text replacement only

**User Story:** As a manager, I want to add notes to specific tasks so I can document what was covered and any special observations.

---

### Screen 6: Week 1 Dashboard
**Purpose:** Show progression from introduction to practice

**Existing Component:** Choose Your Learning Path layout (same as Screen 2)

**Content:**
- **Title:** "Work Week 1 – Getting acquainted & practicing"
- **4 Tiles:**
  1. **Meet the rest of the team**
     - "Who works on which days?"
  2. **First part of a task**
     - "Learn step-by-step how it works"
  3. **Lunch or coffee moment**
     - "An informal conversation with the team"
  4. **Key work methods or systems**
     - "Learn how we work here"

**Implementation:** Same layout as Screen 2, title and icon replacement

**User Story:** As a new employee, I want a clear overview of Week 1 activities so I can mentally prepare for each learning step.

---

### Screen 7: Week 2 Dashboard
**Purpose:** Independence and evaluation phase

**Existing Component:** Quiz page + dashboard style (like OnboardFlow "Progress 40%")

**Content:**
- **Title:** "Work Week 2 – Working independently"
- **5 Cards/Quiz blocks:**
  1. **Job Shadowing**
     - Choose activity (customer conversation, production, project)
  2. **First complete task**
     - Execute independently and discuss together
  3. **Short check-in**
     - Give a smiley rating on how it's going
  4. **First weeks reflection**
     - What went well, what do you still want to learn?
  5. **Coming weeks preview**
     - Planning your next steps

**Features:**
- Reuse existing smiley/star rating system
- Note fields for both employee and manager

**Implementation:** Reuse quiz style, title and short text replacement

**User Story:** As a manager, I want to conduct structured check-ins so I can evaluate progress and provide targeted support.

---

### Screen 8: Employee Progress Overview
**Purpose:** End state showing 2-week onboarding completion

**Existing Component:** Dashboard "Progress 40%" style

**Content:**
- **Header:** "Welcome back, Lisa"
- **Statistics:**
  - 85% completed
  - 4 smileys earned
  - 2 conversations planned
- **CTA:** "Plan next steps"

**Implementation:** Reuse existing dashboard, update numbers and name only

**User Story:** As a new employee, I want to see my onboarding progress so I feel a sense of accomplishment and know what's remaining.

---

## 4. Detailed Feature Requirements

### 4.1 Preboarding Features

#### 4.1.1 Team Introduction
- **Input:** 1-4 team member profiles
- **Content:** Photo/video, short text, contact details (NAW)
- **Optional (v2):** Quiz "Who does what?"

#### 4.1.2 Safety & Practical Info
- **Content:** House rules, safety info, practical first-day info
- **Details:** Lunch arrangements, dress code, arrival time, parking/bike/public transport
- **Format:** Text explanation + optional quiz

#### 4.1.3 Day 1 Explanation
- **Input:** Manager-filled content
- **Format:** Text (and/or audio?)
- **Purpose:** Set expectations for first day

---

### 4.2 Day 1 Features

#### 4.2.1 Personal Welcome
- **Type:** Manager task (visible to employee)
- **Format:** Checklist with manager note space

#### 4.2.2 Tour
- **Type:** Manager task (visible to employee)
- **Format:** Checklist with manager note space

#### 4.2.3 Practical Matters
- **Type:** Manager task (visible to employee)
- **Checklist items:** Laptop, phone, systems, clothing
- **Format:** Checklist with manager note space

---

### 4.3 Week 1 Features

#### 4.3.1 Extended Team Introduction
- **Content:** Who does what, who works which days, contact details (NAW)
- **Format:** Photos/videos with text
- **Optional (v2):** Quiz "Who does what?"

#### 4.3.2 First Task Part
- **Process:** Manager explains → Employee executes → Discuss together
- **Checklist includes:**
  - Task title
  - What you need to start
  - What explanation you need
  - Step-by-step instructions
  - Who can help you
  - Check-in moment: How's it going?
- **Completion:** Smiley reward + note space for both manager and employee
- **Feature:** Button to add more (first) task parts
- **v2:** Remember created tasks for reuse with other employees

#### 4.3.3 Lunch/Coffee Team Moment
- **Setup:** Admin fills when and who is contact person
- **Process:** Task to check off, discuss together afterward
- **Completion:** Smiley reward + note space for both

#### 4.3.4 Work Methods/Systems Explanation
- **Format:** Checklist that can be filled
- **Per item:** Manager can add notes
- **Features:** Check-in moment, smiley reward + note space

---

### 4.4 Week 2 Features

#### 4.4.1 Job Shadowing
- **Setup:** Manager fills in details
- **Default options:** Customer conversation, production, order processing, project, other
- **Manager input:** Choose topic, add notes (when, who is contact)

#### 4.4.2 First Complete Task
- **Process:** Manager explains → Employee executes independently → Discuss together
- **Checklist includes:**
  - Task title
  - What you need to start
  - What explanation you need
  - Step-by-step instructions
  - Who can help you
  - Check-in moment: How's it going?
- **Completion:** Smiley reward + note space for both
- **Feature:** Button to add more complete tasks
- **v2:** Remember created tasks for reuse

#### 4.4.3 General Check-in
- **Input:** Both manager and employee fill, then discuss together
- **Questions:** How's it going? What's better/worse than expected? What do you need?
- **Format:** Quick rating quiz (stars or smileys)
- **Notes:** Space for manager and employee remarks

#### 4.4.4 First Weeks Reflection
- **Input:** Both fill, then discuss together
- **Topics:** What went well? What do you want to learn? How and when will we do that?
- **Format:** Quick rating quiz (stars or smileys)
- **Notes:** Space for both parties
- **Additional use:** Manager can use this to conclude trial period and discuss continuation

#### 4.4.5 Coming Weeks Preview
- **Input:** Both fill, then discuss together
- **Content:** Outstanding actions, important reminders
- **Format:** Note space for both parties

---

## 5. Technical Requirements

### 5.1 Component Reuse Matrix

| Screen | Base Visual | Modification Type | Development Effort |
|--------|------------|-------------------|-------------------|
| 1 | Login page | Text addition | Minimal |
| 2 | Learning Path | Titles + icons | Minimal |
| 3 | Quiz card | Images + text | Low |
| 4 | Task board | Titles + progress | Minimal |
| 5 | Task detail | Subtasks + notes | Minimal |
| 6 | Learning Path | Titles + icons | Minimal |
| 7 | Quiz + dashboard | Titles + questions | Low |
| 8 | Dashboard | Name + statistics | Minimal |

### 5.2 Data Model Requirements

#### Employee Profile
- Name, photo
- Start date
- Team assignment
- Manager assignment
- Onboarding phase (preboarding, day1, week1, week2)

#### Task Object
- Title, description
- Type (manager-task, employee-task, shared)
- Subtasks array
- Status (todo, in-progress, completed)
- Notes field (manager)
- Notes field (employee)
- Due date
- Assigned to
- Created by

#### Progress Tracking
- Completed tasks count
- Smiley/star ratings
- Scheduled conversations
- Overall completion percentage

### 5.3 User Roles & Permissions

| Role | Capabilities |
|------|-------------|
| **Admin** | Configure onboarding templates, manage all users, view all progress |
| **Manager** | Assign tasks, add notes, view assigned employees' progress, conduct check-ins |
| **Employee** | View assigned tasks, complete tasks, add notes to shared tasks, view own progress |

### 5.4 Notification Requirements
- Reminder for upcoming tasks (day before)
- Task completion confirmations
- Manager notifications when employee completes tasks
- Check-in/meeting reminders

---

## 6. UI/UX Guidelines

### 6.1 Visual Consistency
- Maintain existing OnboardFlow color scheme and typography
- Use existing icon library (expand as needed)
- Preserve existing card, button, and form styles

### 6.2 Responsive Design
- All screens must work on mobile, tablet, and desktop
- Task boards should stack vertically on mobile
- Learning path tiles should adapt to screen size

### 6.3 Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility

---

## 7. Future Enhancements (Version 2)

### 7.1 Template Library
- Save and reuse task configurations
- Pre-built onboarding flows by role/department
- Clone and customize existing flows

### 7.2 Enhanced Quizzes
- "Who does what?" team quiz with scoring
- Knowledge verification quizzes
- Gamification elements

### 7.3 Multimedia Support
- Video introductions from team members
- Audio instructions for tasks
- Screen recordings for system training

### 7.4 Analytics Dashboard
- Onboarding completion trends
- Task bottleneck identification
- Employee satisfaction metrics
- Time-to-productivity analytics

---

## 8. Implementation Phases

### Phase 1: MVP (Weeks 1-4)
- Screen 1-5 implementation
- Basic task tracking
- Manager and employee note capability
- Simple progress dashboard

### Phase 2: Full Flow (Weeks 5-8)
- Screens 6-8 implementation
- Check-in and reflection features
- Smiley/star rating system
- Complete progress tracking

### Phase 3: Enhancement (Weeks 9-12)
- Template reuse functionality
- Notification system
- Mobile optimization
- Admin configuration tools

---

## 9. Success Criteria

### 9.1 Launch Criteria
- All 8 screens functional
- Task creation and completion works
- Manager and employee notes save correctly
- Progress tracking displays accurately
- No critical bugs

### 9.2 Post-Launch KPIs (90 days)
- 80%+ employee onboarding completion rate
- 4.0+ average employee satisfaction (out of 5)
- 50%+ reduction in manager time spent on onboarding admin
- 90%+ manager adoption rate

---

## 10. Appendix

### 10.1 Summary Table

| Slide | Base Visual | Change Type | Purpose |
|-------|------------|-------------|---------|
| 1 | Login page | Small text addition | Introduction |
| 2 | Learning Path | Titles + icons | Preboarding overview |
| 3 | Quiz card | Images + text | Team introduction |
| 4 | Task board | Titles + progress | Day 1 overview |
| 5 | Task detail | Subtasks + notes | Show depth |
| 6 | Learning Path | Titles + icons | Week 1 learning path |
| 7 | Quiz + dashboard | Titles + questions | Week 2 evaluation |
| 8 | Dashboard | Name + statistics | Final progress view |

### 10.2 Key Terminology
- **NAW:** Name, Address, Work info (contact details)
- **Preboarding:** Activities before official start date
- **Check-in:** Formal discussion between manager and employee
- **Task part:** Component of a larger task for learning purposes
- **Complete task:** Full task executed independently

---

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Author:** Product Team  
**Status:** Ready for Development Review
