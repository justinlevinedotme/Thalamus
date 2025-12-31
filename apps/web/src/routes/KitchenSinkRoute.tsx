/**
 * @file KitchenSinkRoute.tsx
 * @description Dev-only page that showcases ALL UI components, dialogs, warnings,
 * and patterns used in the application. Useful for design consistency checks and
 * rapid iteration on component styles.
 *
 * Access: /dev/kitchen-sink (dev builds only)
 */

import { useState } from "react";
import {
  AlertTriangle,
  Check,
  CreditCard,
  Download,
  FileText,
  FolderOpen,
  Info,
  Loader2,
  LogOut,
  Mail,
  Settings,
  Shield,
  Trash2,
  User,
} from "lucide-react";

// UI Primitives
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../components/ui/sheet";
import { Switch } from "../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Textarea } from "../components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";

// Custom Components
import Header from "../components/Header";
import MeSidebar from "../components/MeSidebar";

// Placeholder data
const PLACEHOLDER_USER = {
  id: "user-123",
  email: "test@example.com",
  name: "Test User",
  image: null,
};

const PLACEHOLDER_PROFILE = {
  plan: "plus" as const,
  maxGraphs: 50,
  retentionDays: 365,
};

// Section wrapper component
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">{title}</h2>
      {children}
    </div>
  );
}

// Subsection wrapper
function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      {children}
    </div>
  );
}

export default function KitchenSinkRoute() {
  // Dialog states
  const [basicDialogOpen, setBasicDialogOpen] = useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteDialogState, setDeleteDialogState] = useState<
    "default" | "pending" | "submitted" | "2fa" | "error"
  >("default");
  const [sheetOpen, setSheetOpen] = useState(false);

  // Form states
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [switchChecked, setSwitchChecked] = useState(false);
  const [selectValue, setSelectValue] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [textareaValue, setTextareaValue] = useState("");

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Page Header */}
        <div className="border-b border-border bg-card px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-foreground">Kitchen Sink</h1>
            <p className="text-sm text-muted-foreground">
              Dev-only component catalog. All UI primitives, dialogs, and patterns in one place.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-12">
          {/* ===== BUTTONS ===== */}
          <Section title="Buttons">
            <Subsection title="Variants">
              <div className="flex flex-wrap gap-2">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
            </Subsection>
            <Subsection title="Sizes">
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </Subsection>
            <Subsection title="States">
              <div className="flex flex-wrap gap-2">
                <Button disabled>Disabled</Button>
                <Button>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading
                </Button>
              </div>
            </Subsection>
          </Section>

          {/* ===== BADGES ===== */}
          <Section title="Badges">
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="plus">PLUS</Badge>
              <Badge variant="edu">EDU</Badge>
            </div>
          </Section>

          {/* ===== FORM INPUTS ===== */}
          <Section title="Form Inputs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Subsection title="Input">
                <Input
                  placeholder="Enter text..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </Subsection>
              <Subsection title="Input (disabled)">
                <Input placeholder="Disabled input" disabled />
              </Subsection>
              <Subsection title="Textarea">
                <Textarea
                  placeholder="Enter longer text..."
                  value={textareaValue}
                  onChange={(e) => setTextareaValue(e.target.value)}
                />
              </Subsection>
              <Subsection title="Select">
                <Select value={selectValue} onValueChange={setSelectValue}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                    <SelectItem value="option2">Option 2</SelectItem>
                    <SelectItem value="option3">Option 3</SelectItem>
                  </SelectContent>
                </Select>
              </Subsection>
              <Subsection title="Checkbox">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="checkbox-demo"
                    checked={checkboxChecked}
                    onCheckedChange={(checked) => setCheckboxChecked(checked === true)}
                  />
                  <Label htmlFor="checkbox-demo">Accept terms and conditions</Label>
                </div>
              </Subsection>
              <Subsection title="Switch">
                <div className="flex items-center gap-2">
                  <Switch
                    id="switch-demo"
                    checked={switchChecked}
                    onCheckedChange={setSwitchChecked}
                  />
                  <Label htmlFor="switch-demo">Enable notifications</Label>
                </div>
              </Subsection>
            </div>
          </Section>

          {/* ===== CARDS ===== */}
          <Section title="Cards">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Card Title</CardTitle>
                  <CardDescription>Card description goes here</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Card content area.</p>
                </CardContent>
                <CardFooter>
                  <Button size="sm">Action</Button>
                </CardFooter>
              </Card>

              <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <CardTitle className="text-amber-800 dark:text-amber-200">
                      Warning Card
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    This is a warning message pattern used for billing notices, etc.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <CardTitle className="text-red-800 dark:text-red-200">Error Card</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    This is an error/destructive message pattern.
                  </p>
                </CardContent>
              </Card>
            </div>
          </Section>

          {/* ===== TABS ===== */}
          <Section title="Tabs">
            <Tabs defaultValue="tab1" className="w-full max-w-md">
              <TabsList>
                <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                <TabsTrigger value="tab2">Tab 2</TabsTrigger>
                <TabsTrigger value="tab3">Tab 3</TabsTrigger>
              </TabsList>
              <TabsContent value="tab1">
                <p className="text-sm text-muted-foreground p-4 border rounded-md">
                  Content for Tab 1
                </p>
              </TabsContent>
              <TabsContent value="tab2">
                <p className="text-sm text-muted-foreground p-4 border rounded-md">
                  Content for Tab 2
                </p>
              </TabsContent>
              <TabsContent value="tab3">
                <p className="text-sm text-muted-foreground p-4 border rounded-md">
                  Content for Tab 3
                </p>
              </TabsContent>
            </Tabs>
          </Section>

          {/* ===== ACCORDION ===== */}
          <Section title="Accordion">
            <Accordion type="single" collapsible className="w-full max-w-md">
              <AccordionItem value="item-1">
                <AccordionTrigger>Is it accessible?</AccordionTrigger>
                <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Is it styled?</AccordionTrigger>
                <AccordionContent>
                  Yes. It comes with default styles that match your design system.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Is it animated?</AccordionTrigger>
                <AccordionContent>
                  Yes. It's animated by default with smooth transitions.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Section>

          {/* ===== OVERLAYS ===== */}
          <Section title="Overlays & Dialogs">
            <div className="flex flex-wrap gap-2">
              {/* Basic Dialog */}
              <Button variant="outline" onClick={() => setBasicDialogOpen(true)}>
                Open Dialog
              </Button>
              <Dialog open={basicDialogOpen} onOpenChange={setBasicDialogOpen}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Basic Dialog</DialogTitle>
                    <DialogDescription>
                      This is a basic dialog with a title and description.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <p className="text-sm text-muted-foreground">Dialog content goes here.</p>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setBasicDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setBasicDialogOpen(false)}>Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Alert Dialog */}
              <Button variant="outline" onClick={() => setAlertDialogOpen(true)}>
                Open Alert Dialog
              </Button>
              <AlertDialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction>Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {/* Sheet */}
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline">Open Sheet</Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Sheet Title</SheetTitle>
                    <SheetDescription>
                      This is a sheet/drawer component for side panels.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="py-4">
                    <p className="text-sm text-muted-foreground">Sheet content goes here.</p>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">Open Popover</Button>
                </PopoverTrigger>
                <PopoverContent>
                  <p className="text-sm">This is a popover with some content.</p>
                </PopoverContent>
              </Popover>

              {/* Tooltip */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Hover for Tooltip</Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>This is a tooltip</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </Section>

          {/* ===== DROPDOWN MENUS ===== */}
          <Section title="Dropdown Menus">
            <div className="flex flex-wrap gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Open Menu</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <FolderOpen className="mr-2 h-4 w-4" />
                    My Graphs
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User dropdown simulation */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-secondary text-muted-foreground transition hover:bg-secondary/80"
                    type="button"
                  >
                    <User className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="flex items-center gap-3 px-2 py-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-foreground">
                          {PLACEHOLDER_USER.name}
                        </span>
                        <Badge variant="plus" className="text-[10px] px-1.5 py-0">
                          PLUS
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {PLACEHOLDER_USER.email}
                      </span>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <FolderOpen className="mr-2 h-4 w-4" />
                    My Graphs
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Section>

          {/* ===== DELETE ACCOUNT DIALOG (CRITICAL) ===== */}
          <Section title="Delete Account Dialog (All States)">
            <p className="text-sm text-muted-foreground mb-4">
              Toggle different states to preview the delete account dialog variations.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <Button
                variant={deleteDialogState === "default" ? "default" : "outline"}
                size="sm"
                onClick={() => setDeleteDialogState("default")}
              >
                Default
              </Button>
              <Button
                variant={deleteDialogState === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() => setDeleteDialogState("pending")}
              >
                Pending
              </Button>
              <Button
                variant={deleteDialogState === "submitted" ? "default" : "outline"}
                size="sm"
                onClick={() => setDeleteDialogState("submitted")}
              >
                Submitted
              </Button>
              <Button
                variant={deleteDialogState === "2fa" ? "default" : "outline"}
                size="sm"
                onClick={() => setDeleteDialogState("2fa")}
              >
                2FA Required
              </Button>
              <Button
                variant={deleteDialogState === "error" ? "default" : "outline"}
                size="sm"
                onClick={() => setDeleteDialogState("error")}
              >
                Error
              </Button>
            </div>
            <Button
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-600"
              onClick={() => setDeleteDialogOpen(true)}
            >
              Open Delete Dialog ({deleteDialogState})
            </Button>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-red-600">
                    {deleteDialogState === "pending"
                      ? "Deletion Request Pending"
                      : "Delete Account"}
                  </DialogTitle>
                  <DialogDescription>
                    {deleteDialogState === "pending"
                      ? "Your account deletion request is being processed. You can cancel it if you've changed your mind."
                      : "This will permanently delete your account, all your graphs, and shared links. This action cannot be undone."}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  {deleteDialogState === "submitted" ? (
                    <div className="flex flex-col items-center gap-4 py-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
                        <Trash2 className="h-6 w-6 text-red-600" />
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-foreground">Content Deleted</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          All your graphs and shared links have been permanently deleted. Your
                          account will be fully removed within 30 days.
                        </p>
                      </div>
                    </div>
                  ) : deleteDialogState === "pending" ? (
                    <div className="space-y-4">
                      <div className="rounded-md bg-amber-50 p-4 dark:bg-amber-950/50">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
                          <div className="text-sm text-amber-800 dark:text-amber-200">
                            <p className="font-medium">Pending Deletion</p>
                            <p className="mt-1">
                              Your account is scheduled for deletion. All your data will be
                              permanently removed once processed.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="rounded-md bg-red-50 p-4 dark:bg-red-950/50">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                          <div className="text-sm text-red-800 dark:text-red-200">
                            <p className="font-medium">This action is immediate and irreversible</p>
                            <ul className="mt-2 list-inside list-disc space-y-1 text-red-700 dark:text-red-300">
                              <li>All your graphs will be permanently deleted</li>
                              <li>All shared links will stop working immediately</li>
                              <li>Your account settings and preferences will be removed</li>
                              <li>Your account will be fully removed within 30 days</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Why are you leaving? (optional)</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a reason" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="not-using">Not using it enough</SelectItem>
                            <SelectItem value="found-alternative">Found an alternative</SelectItem>
                            <SelectItem value="too-expensive">Too expensive</SelectItem>
                            <SelectItem value="other">Other reason</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Additional feedback (optional)</Label>
                        <Textarea
                          placeholder="Help us improve by sharing more details about your experience..."
                          rows={3}
                        />
                      </div>

                      {deleteDialogState === "2fa" && (
                        <div className="space-y-2 rounded-md border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/50">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-amber-600" />
                            <Label className="text-amber-800 dark:text-amber-200">
                              Two-Factor Authentication Required
                            </Label>
                          </div>
                          <p className="text-xs text-amber-700 dark:text-amber-300">
                            Enter the 6-digit code from your authenticator app to confirm deletion.
                          </p>
                          <Input
                            placeholder="000000"
                            className="text-center tracking-widest"
                            maxLength={6}
                          />
                        </div>
                      )}

                      {deleteDialogState === "error" && (
                        <p className="text-sm text-red-600">
                          Failed to process deletion request. Please try again later.
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                    {deleteDialogState === "submitted" ? "Close" : "Cancel"}
                  </Button>
                  {deleteDialogState !== "submitted" && (
                    <Button variant="destructive" onClick={() => setDeleteDialogOpen(false)}>
                      {deleteDialogState === "pending" ? "Cancel Deletion" : "Confirm Deletion"}
                    </Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Section>

          {/* ===== WARNING/ALERT PATTERNS ===== */}
          <Section title="Warning & Alert Patterns">
            <div className="space-y-4">
              {/* Billing Warning */}
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/50">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
                  <div className="text-sm text-amber-800 dark:text-amber-200">
                    <p className="font-medium">Billing is not yet available</p>
                    <p className="mt-1 text-amber-700 dark:text-amber-300">
                      This feature is coming soon. You're currently on the{" "}
                      <span className="font-medium capitalize">{PLACEHOLDER_PROFILE.plan}</span>{" "}
                      plan.
                    </p>
                  </div>
                </div>
              </div>

              {/* Info Banner */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/50">
                <div className="flex items-start gap-3">
                  <Info className="mt-0.5 h-5 w-5 text-blue-600" />
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-medium">Information</p>
                    <p className="mt-1 text-blue-700 dark:text-blue-300">
                      This is an informational banner for general notices.
                    </p>
                  </div>
                </div>
              </div>

              {/* Success Banner */}
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/50">
                <div className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 text-green-600" />
                  <div className="text-sm text-green-800 dark:text-green-200">
                    <p className="font-medium">Success</p>
                    <p className="mt-1 text-green-700 dark:text-green-300">
                      Your changes have been saved successfully.
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Banner */}
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/50">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />
                  <div className="text-sm text-red-800 dark:text-red-200">
                    <p className="font-medium">Error</p>
                    <p className="mt-1 text-red-700 dark:text-red-300">
                      Something went wrong. Please try again later.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* ===== PLAN/BILLING SECTION PREVIEW ===== */}
          <Section title="Plan Section Preview">
            <div className="rounded-lg border border-border bg-card p-6 max-w-md">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-medium text-foreground">Current Plan</h3>
                  <p className="text-sm text-muted-foreground">
                    You're on the{" "}
                    <span className="font-medium capitalize">{PLACEHOLDER_PROFILE.plan}</span> plan.
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">
                    {PLACEHOLDER_PROFILE.maxGraphs}
                  </span>{" "}
                  graphs allowed
                </p>
                <p>
                  <span className="font-medium text-foreground">50</span> saved nodes allowed
                </p>
                <p>
                  <span className="font-medium text-foreground">Unlimited</span> retention
                </p>
              </div>
            </div>
          </Section>

          {/* ===== ACCOUNT DETAILS PREVIEW ===== */}
          <Section title="Account Details Section Preview">
            <div className="rounded-lg border border-border bg-card p-6 max-w-md">
              <h3 className="text-lg font-medium text-foreground mb-4">Account Details</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Name</p>
                    <p className="text-sm text-muted-foreground">{PLACEHOLDER_USER.name}</p>
                  </div>
                  <button className="text-sm text-muted-foreground underline hover:text-foreground">
                    Edit
                  </button>
                </div>
                <div className="border-t border-border" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Email</p>
                    <p className="text-sm text-muted-foreground">{PLACEHOLDER_USER.email}</p>
                  </div>
                  <button className="text-sm text-muted-foreground underline hover:text-foreground">
                    Edit
                  </button>
                </div>
                <div className="border-t border-border" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">Plan</p>
                    <Badge variant="plus" className="text-[10px] px-1.5 py-0">
                      PLUS
                    </Badge>
                  </div>
                  <p className="text-sm capitalize text-muted-foreground">
                    {PLACEHOLDER_PROFILE.plan}
                  </p>
                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <p>
                      <span className="font-medium text-foreground">
                        {PLACEHOLDER_PROFILE.maxGraphs}
                      </span>{" "}
                      graphs
                    </p>
                    <p>
                      <span className="font-medium text-foreground">50</span> saved nodes
                    </p>
                    <p>
                      <span className="font-medium text-foreground">Unlimited</span> retention
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* ===== SIDEBAR PREVIEW ===== */}
          <Section title="Sidebar Preview">
            <div className="border border-border rounded-lg bg-card p-4 w-64">
              <MeSidebar />
            </div>
          </Section>

          {/* ===== HEADER PREVIEW ===== */}
          <Section title="Header Preview">
            <p className="text-sm text-muted-foreground mb-4">
              Note: Header requires auth context. This is a reference view only.
            </p>
            <div className="border border-border rounded-lg overflow-hidden">
              <Header />
            </div>
          </Section>

          {/* ===== LOADING STATES ===== */}
          <Section title="Loading States">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center justify-center p-8 border rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
              <div className="flex items-center gap-2 p-4 border rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            </div>
          </Section>

          {/* ===== EMPTY STATES ===== */}
          <Section title="Empty States">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border border-dashed border-border bg-secondary/50 p-6 text-center">
                <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
                <h3 className="mt-3 font-medium text-foreground">No files yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create your first graph to get started.
                </p>
                <Button className="mt-4" size="sm">
                  Create Graph
                </Button>
              </div>
              <div className="rounded-lg border border-dashed border-border bg-secondary/50 p-6 text-center">
                <CreditCard className="mx-auto h-8 w-8 text-muted-foreground" />
                <h3 className="mt-3 font-medium text-foreground">Upgrade to PLUS</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Get more graphs, more saved nodes, and longer retention.
                </p>
                <p className="mt-4 text-xs text-muted-foreground">Coming soon</p>
              </div>
            </div>
          </Section>

          {/* ===== UTILITY ICONS ===== */}
          <Section title="Common Icons">
            <div className="flex flex-wrap gap-4">
              {[
                { icon: User, label: "User" },
                { icon: Settings, label: "Settings" },
                { icon: Mail, label: "Mail" },
                { icon: CreditCard, label: "CreditCard" },
                { icon: Shield, label: "Shield" },
                { icon: Trash2, label: "Trash2" },
                { icon: Download, label: "Download" },
                { icon: AlertTriangle, label: "AlertTriangle" },
                { icon: Check, label: "Check" },
                { icon: Info, label: "Info" },
                { icon: Loader2, label: "Loader2" },
                { icon: FolderOpen, label: "FolderOpen" },
                { icon: FileText, label: "FileText" },
                { icon: LogOut, label: "LogOut" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1 p-2 border rounded-lg">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </TooltipProvider>
  );
}
