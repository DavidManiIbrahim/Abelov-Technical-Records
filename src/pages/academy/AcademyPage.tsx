import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Shield, Zap, Database, Box, Route, Key, Terminal, FileType, GitBranch, Eye } from 'lucide-react';

const features = [
  {
    title: 'Authentication & User Management',
    items: [
      'Simple Login/Signup (Local) for development',
      'Protected Routes in frontend',
      'Session Persistence via localStorage',
      'Convex Auth integration',
    ],
    icon: Shield,
  },
  {
    title: 'Hub Record Management',
    items: [
      'Create: Add new service requests with comprehensive details',
      'Read: View all records on the dashboard or individual details',
      'Update: Edit any existing record',
      'Delete: Remove records from the system',
      'Search & Filter: Find records by customer name, phone, device, ID, or status',
    ],
    icon: Database,
  },
  {
    title: 'Comprehensive Form',
    items: [
      'Single-Page Form: All fields visible on one scrollable page (no tabs)',
      'Shop Information (shop name, technician, date)',
      'Customer Information (name, phone, email, address)',
      'Device Information (model, brand, serial number, OS, accessories)',
      'Problem Description (detailed issue report)',
      'Diagnosis & Repair (diagnosis date, technician, fault, parts, action, status)',
      'Cost Summary (service charge, parts cost, auto-calculated totals and balance)',
      'Repair Timeline (track multiple repair steps with dates and notes)',
      'Customer Confirmation (signature, device collection, technician sign-off)',
    ],
    icon: FileType,
  },
  {
    title: 'Dashboard Features',
    items: [
      'Statistics Cards: Total requests, completed, pending, in-progress, revenue, outstanding balance',
      'Record Cards: Quick overview of each entry with essential info',
      'Fast Actions: Edit, view details, or delete from the dashboard',
      'Smart Search: Real-time search across multiple fields',
      'Real-Time Updates: Data automatically syncs across clients',
    ],
    icon: BarChart3,
  },
  {
    title: 'Cost Management',
    items: [
      'Auto-Calculation: Total cost = service charge + parts cost',
      'Balance Tracking: Balance = total cost - deposit paid',
      'Payment Status: Mark payments as completed',
      'Financial Overview: Dashboard shows total revenue and outstanding balance',
    ],
    icon: Zap,
  },
  {
    title: 'Data Persistence & Backend',
    items: [
      'Backend: Convex (Serverless)',
      'Database: Convex Database',
      'Real-time: Built-in websocket subscriptions',
      'Authentication: Custom auth functions on Convex',
      'Type Safety: End-to-end type safety from database to frontend',
    ],
    icon: Box,
  },
];

const techStack = [
  { name: 'React', description: 'Frontend' },
  { name: 'TypeScript', description: 'Language' },
  { name: 'Tailwind CSS', description: 'Styling' },
  { name: 'shadcn-ui', description: 'UI Components' },
  { name: 'React Router v6', description: 'Routing' },
  { name: 'Convex', description: 'Backend' },
  { name: 'Vite', description: 'Build Tool' },
  { name: 'Lucide React', description: 'Icons' },
  { name: 'React Query', description: 'State Management' },
];

const projectStructure = [
  { label: 'convex/', description: 'Convex backend', detail: 'schema.ts, auth.ts, hubRecords.ts' },
  { label: 'src/', description: 'Frontend', detail: 'pages, components, lib' },
  { label: 'src/lib/api.ts', description: 'API client (Convex)' },
  { label: 'src/lib/api.rest.ts', description: 'Old REST API (backup)' },
  { label: 'convex.json', description: 'Convex configuration' },
];

function BarChart3({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  );
}

export default function AcademyPage() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-primary">Abelov Hub Records</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            A comprehensive record management system for tracking product entries, verifications, and distribution with full CRUD functionality and a real-time Convex backend.
          </p>
        </div>

        {/* Quick Start */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-primary flex items-center gap-2">
            <Zap className="w-6 h-6" />
            Quick Start
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Prerequisites</h3>
              <p className="text-sm text-muted-foreground">Node.js 18+ and npm. A Convex account (free tier available at convex.dev)</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Setup Instructions</h3>
              <div className="space-y-3">
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-mono mb-1">1. Install Dependencies</p>
                  <code className="text-sm bg-background px-3 py-1.5 rounded block">npm install</code>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-mono mb-1">2. Initialize Convex</p>
                  <code className="text-sm bg-background px-3 py-1.5 rounded block">npx convex dev</code>
                  <p className="text-xs text-muted-foreground mt-2">Creates .env.local, starts Convex dev server, generates TypeScript types</p>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-mono mb-1">3. Start the Frontend</p>
                  <code className="text-sm bg-background px-3 py-1.5 rounded block">npm run dev</code>
                  <p className="text-xs text-muted-foreground mt-2">Or run both together: <code className="text-xs bg-background px-1 rounded">npm run dev:all</code></p>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-mono mb-1">4. Open in Browser</p>
                  <code className="text-sm bg-background px-3 py-1.5 rounded block">http://localhost:5173</code>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Key Features */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-primary flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">{feature.title}</h3>
                    <ul className="space-y-2">
                      {feature.items.map((item) => (
                        <li key={item} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-0.5 shrink-0">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Technology Stack */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-primary flex items-center gap-2">
            <Terminal className="w-6 h-6" />
            Technology Stack
          </h2>
          <div className="flex flex-wrap gap-2">
            {techStack.map((tech) => (
              <Badge key={tech.name} variant="secondary" className="text-sm px-3 py-1.5">
                {tech.name}
                <span className="text-muted-foreground ml-1.5 font-normal">({tech.description})</span>
              </Badge>
            ))}
          </div>
        </Card>

        {/* Project Structure */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-primary flex items-center gap-2">
            <GitBranch className="w-6 h-6" />
            Project Structure
          </h2>
          <div className="space-y-2 font-mono text-sm">
            <p className="text-muted-foreground">abelov-hub-records/</p>
            {projectStructure.map((item) => (
              <div key={item.label} className="ml-4">
                <p>
                  <span className="text-primary">├──</span> {item.label}
                  {item.description && <span className="text-muted-foreground ml-2"># {item.description}</span>}
                </p>
                {item.detail && <p className="text-xs text-muted-foreground ml-8">{item.detail}</p>}
              </div>
            ))}
          </div>
        </Card>

        {/* Environment Variables */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-primary flex items-center gap-2">
            <Key className="w-6 h-6" />
            Environment Variables
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            The project uses .env.local which is automatically generated by Convex:
          </p>
          <div className="bg-muted p-4 rounded-lg">
            <code className="text-sm">VITE_CONVEX_URL=https://your-project.convex.cloud</code>
          </div>
        </Card>

        {/* Migration Notes */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-primary flex items-center gap-2">
            <Route className="w-6 h-6" />
            Migration Notes
          </h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5 shrink-0">•</span>
              This project was migrated from Express + MongoDB to Convex.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5 shrink-0">•</span>
              Old backend code is still in server/ but deprecated.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5 shrink-0">•</span>
              Old API client is backed up at src/lib/api.rest.ts.
            </li>
          </ul>
        </Card>

        {/* License */}
        <Card className="p-6 text-center">
          <p className="text-lg font-semibold text-primary">MIT License</p>
        </Card>
      </div>
    </div>
  );
}
