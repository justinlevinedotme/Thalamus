import { useState, useMemo } from "react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import * as SimpleIcons from "@icons-pack/react-simple-icons";

import { Input } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import type { NodeIcon } from "../../store/graphStore";

type IconPickerProps = {
  value?: NodeIcon;
  onChange: (icon: NodeIcon) => void;
  children: React.ReactNode;
};

type EmojiData = {
  native: string;
};

// Popular/common Lucide icons for quick access
const popularLucideIcons = [
  "Star",
  "Heart",
  "Check",
  "X",
  "Plus",
  "Minus",
  "Home",
  "User",
  "Settings",
  "Search",
  "Mail",
  "Phone",
  "Calendar",
  "Clock",
  "Bell",
  "Bookmark",
  "Flag",
  "Tag",
  "Folder",
  "File",
  "FileText",
  "Image",
  "Video",
  "Music",
  "Link",
  "ExternalLink",
  "Download",
  "Upload",
  "Share",
  "Send",
  "Edit",
  "Trash",
  "Copy",
  "Clipboard",
  "Save",
  "Undo",
  "Eye",
  "EyeOff",
  "Lock",
  "Unlock",
  "Key",
  "Shield",
  "Zap",
  "Flame",
  "Sun",
  "Moon",
  "Cloud",
  "Droplet",
  "Map",
  "MapPin",
  "Navigation",
  "Compass",
  "Globe",
  "Building",
  "Car",
  "Plane",
  "Ship",
  "Bike",
  "Train",
  "Bus",
  "Gift",
  "Award",
  "Trophy",
  "Medal",
  "Crown",
  "Diamond",
  "Lightbulb",
  "Target",
  "Crosshair",
  "Focus",
  "Layers",
  "Grid",
  "BarChart",
  "PieChart",
  "TrendingUp",
  "Activity",
  "Gauge",
  "Signal",
  "Wifi",
  "Bluetooth",
  "Battery",
  "Power",
  "Cpu",
  "HardDrive",
  "Code",
  "Terminal",
  "Database",
  "Server",
  "GitBranch",
  "Github",
  "MessageCircle",
  "MessageSquare",
  "AtSign",
  "Hash",
  "Smile",
  "Frown",
  "ThumbsUp",
  "ThumbsDown",
  "AlertCircle",
  "AlertTriangle",
  "Info",
  "HelpCircle",
  "CheckCircle",
  "XCircle",
  "PlayCircle",
  "PauseCircle",
  "StopCircle",
  "SkipForward",
  "Volume",
  "VolumeX",
  "Mic",
  "MicOff",
  "Camera",
  "CameraOff",
  "Maximize",
  "Minimize",
  "Move",
  "RotateCw",
  "RefreshCw",
  "Repeat",
] as const;

// Popular Simple Icons (brand icons)
const popularSimpleIcons = [
  "SiGithub",
  "SiGoogle",
  "SiApple",
  "SiMicrosoft",
  "SiAmazon",
  "SiFacebook",
  "SiX",
  "SiInstagram",
  "SiLinkedin",
  "SiYoutube",
  "SiTiktok",
  "SiDiscord",
  "SiSlack",
  "SiNotion",
  "SiFigma",
  "SiSketch",
  "SiAdobecreativecloud",
  "SiCanva",
  "SiReact",
  "SiVuedotjs",
  "SiAngular",
  "SiSvelte",
  "SiNextdotjs",
  "SiNuxtdotjs",
  "SiTypescript",
  "SiJavascript",
  "SiPython",
  "SiRust",
  "SiGo",
  "SiSwift",
  "SiNodedotjs",
  "SiDeno",
  "SiBun",
  "SiDocker",
  "SiKubernetes",
  "SiVercel",
  "SiNetlify",
  "SiAws",
  "SiGooglecloud",
  "SiCloudflare",
  "SiFirebase",
  "SiSupabase",
  "SiMongodb",
  "SiPostgresql",
  "SiRedis",
  "SiElasticsearch",
  "SiGraphql",
  "SiPrisma",
  "SiTailwindcss",
  "SiBootstrap",
  "SiSass",
  "SiPostcss",
  "SiVite",
  "SiWebpack",
  "SiGit",
  "SiGitlab",
  "SiBitbucket",
  "SiJira",
  "SiConfluence",
  "SiTrello",
  "SiSpotify",
  "SiNetflix",
  "SiTwitch",
  "SiSteam",
  "SiPlaystation",
  "SiXbox",
  "SiNintendo",
  "SiUnity",
  "SiUnrealengine",
  "SiBlender",
  "SiAutodesk",
  "SiAdobe",
  "SiOpenai",
  "SiAnthropic",
  "SiHuggingface",
  "SiTensorflow",
  "SiPytorch",
  "SiOpencv",
  "SiStripe",
  "SiPaypal",
  "SiShopify",
  "SiSquare",
  "SiVisa",
  "SiMastercard",
  "SiUber",
  "SiLyft",
  "SiAirbnb",
  "SiBookingdotcom",
  "SiTripadvisor",
  "SiYelp",
  "SiReddit",
  "SiPinterest",
  "SiSnapchat",
  "SiWhatsapp",
  "SiTelegram",
  "SiSignal",
] as const;

// Get the Lucide icon component by name
function getLucideIconComponent(name: string): LucideIcon | null {
  const icons = LucideIcons as unknown as Record<string, LucideIcon>;
  return icons[name] || null;
}

// Get the Simple Icon component by name
function getSimpleIconComponent(
  name: string
): React.ComponentType<{ size?: number; color?: string }> | null {
  const icons = SimpleIcons as unknown as Record<
    string,
    React.ComponentType<{ size?: number; color?: string }>
  >;
  return icons[name] || null;
}

// Get all Lucide icon names for search
function getAllLucideIconNames(): string[] {
  const icons = LucideIcons as unknown as Record<string, unknown>;
  return Object.keys(icons).filter(
    (key) =>
      typeof icons[key] === "object" &&
      key !== "default" &&
      key !== "createLucideIcon" &&
      key !== "icons" &&
      !key.startsWith("Lucide") &&
      key[0] === key[0].toUpperCase()
  );
}

// Get all Simple Icon names for search
function getAllSimpleIconNames(): string[] {
  const icons = SimpleIcons as unknown as Record<string, unknown>;
  return Object.keys(icons).filter(
    (key) => typeof icons[key] === "object" && key.startsWith("Si") && key !== "SiDefault"
  );
}

export function IconPicker({ value, onChange, children }: IconPickerProps) {
  const [lucideSearch, setLucideSearch] = useState("");
  const [simpleSearch, setSimpleSearch] = useState("");
  const [open, setOpen] = useState(false);

  const allLucideIcons = useMemo(() => getAllLucideIconNames(), []);
  const allSimpleIcons = useMemo(() => getAllSimpleIconNames(), []);

  const filteredLucideIcons = useMemo(() => {
    if (!lucideSearch.trim()) {
      return popularLucideIcons as unknown as string[];
    }
    const query = lucideSearch.toLowerCase();
    return allLucideIcons.filter((name) => name.toLowerCase().includes(query)).slice(0, 60);
  }, [lucideSearch, allLucideIcons]);

  const filteredSimpleIcons = useMemo(() => {
    if (!simpleSearch.trim()) {
      return popularSimpleIcons as unknown as string[];
    }
    const query = simpleSearch.toLowerCase();
    return allSimpleIcons.filter((name) => name.toLowerCase().includes(query)).slice(0, 60);
  }, [simpleSearch, allSimpleIcons]);

  const handleEmojiSelect = (emoji: EmojiData) => {
    onChange({ type: "emoji", value: emoji.native });
    setOpen(false);
  };

  const handleLucideSelect = (iconName: string) => {
    onChange({ type: "lucide", value: iconName });
    setOpen(false);
  };

  const handleSimpleSelect = (iconName: string) => {
    onChange({ type: "simple", value: iconName });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-[352px] p-0" side="right" align="start">
        <Tabs defaultValue="emoji" className="w-full">
          <TabsList className="w-full rounded-none border-b bg-transparent p-0">
            <TabsTrigger
              value="emoji"
              className="flex-1 rounded-none border-b-2 border-transparent py-2 data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Emoji
            </TabsTrigger>
            <TabsTrigger
              value="lucide"
              className="flex-1 rounded-none border-b-2 border-transparent py-2 data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Lucide
            </TabsTrigger>
            <TabsTrigger
              value="simple"
              className="flex-1 rounded-none border-b-2 border-transparent py-2 data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Brands
            </TabsTrigger>
          </TabsList>

          <TabsContent value="emoji" className="m-0">
            <Picker
              data={data}
              onEmojiSelect={handleEmojiSelect}
              theme="light"
              previewPosition="none"
              skinTonePosition="none"
              maxFrequentRows={1}
              perLine={9}
            />
          </TabsContent>

          <TabsContent value="lucide" className="m-0 p-3">
            <Input
              type="text"
              placeholder="Search icons..."
              value={lucideSearch}
              onChange={(e) => setLucideSearch(e.target.value)}
              className="mb-3 h-8"
            />
            <div className="grid max-h-[280px] grid-cols-6 gap-1 overflow-y-auto">
              {filteredLucideIcons.map((iconName) => {
                const IconComponent = getLucideIconComponent(iconName);
                if (!IconComponent) return null;
                return (
                  <button
                    key={iconName}
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-secondary"
                    onClick={() => handleLucideSelect(iconName)}
                    title={iconName}
                  >
                    <IconComponent className="h-5 w-5 text-foreground" />
                  </button>
                );
              })}
            </div>
            {filteredLucideIcons.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">No icons found</div>
            )}
          </TabsContent>

          <TabsContent value="simple" className="m-0 p-3">
            <Input
              type="text"
              placeholder="Search brands..."
              value={simpleSearch}
              onChange={(e) => setSimpleSearch(e.target.value)}
              className="mb-3 h-8"
            />
            <div className="grid max-h-[280px] grid-cols-6 gap-1 overflow-y-auto">
              {filteredSimpleIcons.map((iconName) => {
                const IconComponent = getSimpleIconComponent(iconName);
                if (!IconComponent) return null;
                return (
                  <button
                    key={iconName}
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-secondary"
                    onClick={() => handleSimpleSelect(iconName)}
                    title={iconName.replace("Si", "")}
                  >
                    <IconComponent size={20} color="currentColor" />
                  </button>
                );
              })}
            </div>
            {filteredSimpleIcons.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">No brands found</div>
            )}
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}

// Helper component to render a NodeIcon
export function NodeIconDisplay({
  icon,
  className = "h-4 w-4",
}: {
  icon: NodeIcon;
  className?: string;
}) {
  if (icon.type === "emoji") {
    return <span className={className}>{icon.value}</span>;
  }

  if (icon.type === "simple") {
    const IconComponent = getSimpleIconComponent(icon.value);
    if (!IconComponent) return null;
    // Extract size from className (e.g., "h-4 w-4" -> 16)
    const sizeMatch = className.match(/h-(\d+)/);
    const size = sizeMatch ? parseInt(sizeMatch[1]) * 4 : 16;
    return <IconComponent size={size} color="currentColor" />;
  }

  const IconComponent = getLucideIconComponent(icon.value);
  if (!IconComponent) return null;

  return <IconComponent className={className} />;
}
