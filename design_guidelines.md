# Eclipse-MD Hosting Platform Design Guidelines

## Design Approach

**Reference-Based Approach**: Draw inspiration from modern deployment platforms (Vercel, Railway, Render) combined with dashboard tools (Linear). Focus on clarity, efficiency, and technical sophistication while maintaining accessibility through the required dark/light theme system.

### Design Principles
- **Technical Clarity**: Clear information hierarchy for deployment status, logs, and configuration
- **Efficient Workflows**: Streamlined deployment process with helpful guidance
- **Professional Polish**: Clean, modern aesthetic that builds trust
- **Accessible Theming**: Robust black/white theme toggle throughout

---

## Typography

**Font Family**: 
- Primary: Inter (Google Fonts) - clean, technical, excellent readability
- Monospace: JetBrains Mono - for logs, code snippets, session IDs

**Type Scale**:
- Hero/Display: text-4xl to text-5xl, font-bold
- Page Titles: text-3xl, font-bold
- Section Headers: text-xl to text-2xl, font-semibold
- Body Text: text-base, font-normal
- Small/Meta: text-sm, font-medium
- Monospace Content: text-sm font-mono

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, 12, 16** for consistent rhythm
- Component padding: p-4 to p-8
- Section spacing: space-y-6 to space-y-8
- Card gaps: gap-4 to gap-6
- Page margins: px-4 md:px-6 lg:px-8

**Container Strategy**:
- Max width: max-w-7xl mx-auto for main content
- Forms/Cards: max-w-2xl for focused content
- Dashboard grids: Full width with internal max-w-7xl

---

## Component Library

### Navigation Header
- Fixed top navigation with logo "Eclipse-MD"
- Right-aligned: Coin balance display, theme toggle, user menu
- Height: h-16
- Border bottom for separation

### Authentication Pages (Login/Signup)
- Centered card layout (max-w-md)
- Clean forms with floating labels or top-aligned labels
- Clear CTA buttons
- Subtle background pattern or gradient

### Session ID Input Section
- Prominent help link above input: "Need help getting a session ID?" linking to https://eclipse-session.onrender.com
- Link styling: Underline on hover, external link icon
- Input field: Large, monospace font for session ID
- Clear validation states

### Deployment Form
- Two-column layout on desktop (md:grid-cols-2)
- Single column on mobile
- Required fields clearly marked
- Grouped sections: Essential Config, Optional Features
- Expandable/collapsible optional settings
- Sticky footer with deployment CTA and coin cost display

### Dashboard
- Grid layout for bot cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Each card shows:
  - Bot status badge (running/stopped)
  - Deployment date/time
  - Quick actions: View Logs, Restart, Delete
  - Environment summary (BOT_NUMBER displayed)

### Log Viewer
- Full-width modal or dedicated page
- Terminal-style interface with monospace font
- Dark background (even in light mode) for traditional log appearance
- Auto-scroll toggle
- Timestamp formatting
- Search/filter functionality

### Bot Cards
- Border with subtle shadow
- Status indicator (colored dot: green=running, red=stopped, yellow=deploying)
- Card padding: p-6
- Hover state: subtle elevation increase

### Theme Toggle
- Toggle switch positioned in header
- Icons: Sun (light) / Moon (dark)
- Smooth transition between themes
- Persist preference in localStorage

### Buttons
- Primary: Bold, full rounded (rounded-lg)
- Secondary: Outlined variant
- Danger: For delete actions
- Sizes: Small (buttons in cards), Default (forms), Large (main CTAs)

### Status Badges
- Pill-shaped: rounded-full
- Colored based on state (success, warning, error, info)
- Small text: text-xs font-semibold

### Empty States
- Centered illustration or icon
- Helpful messaging
- Primary CTA to deploy first bot

---

## Theme System (Critical)

**Light Mode**:
- Background: White to light gray (gray-50)
- Cards: White with gray-200 borders
- Text: gray-900 (primary), gray-600 (secondary)
- Accents: Blue-600 for interactive elements

**Dark Mode**:
- Background: gray-900 to gray-950
- Cards: gray-800 with gray-700 borders
- Text: gray-100 (primary), gray-400 (secondary)
- Accents: Blue-400 for interactive elements

**Implementation**: Use Tailwind's dark: modifier throughout for seamless switching

---

## Page Structure

### Landing/Home (Pre-Auth)
- Hero section: Bold headline about Eclipse-MD bot hosting
- Feature cards: Easy deployment, Log viewing, Coin system
- CTA: Sign up to get 10 free coins
- Social proof if applicable

### Dashboard (Post-Auth)
- Welcome header with coin balance
- "Deploy New Bot" prominent CTA
- Grid of deployed bots
- Empty state for new users

### Deployment Page
- Stepper/progress indicator (optional)
- Form sections with clear hierarchy
- Real-time validation feedback
- Confirmation modal before deployment

---

## Animations

**Minimal and Purposeful**:
- Theme toggle: Smooth 200ms transition
- Button hovers: Scale or brightness shift
- Card hovers: Subtle elevation (shadow transition)
- Loading states: Simple spinner or skeleton screens
- NO scroll-triggered or decorative animations

---

## Images

**Hero Section**: Use a clean, technical illustration or abstract geometric pattern representing connectivity/deployment (not a large photo). Keep it understated to maintain professional tone.

**Empty States**: Simple iconography or minimal illustrations

**No decorative images** in dashboard/utility areas - maintain focus on functionality