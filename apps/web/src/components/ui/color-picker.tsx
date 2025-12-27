import { Pipette } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

import { Input } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

// Type for the EyeDropper API (not in all browsers)
interface EyeDropperResult {
  sRGBHex: string;
}

interface EyeDropperConstructor {
  new (): {
    open(): Promise<EyeDropperResult>;
  };
}

declare global {
  interface Window {
    EyeDropper?: EyeDropperConstructor;
  }
}

type ColorPickerProps = {
  value: string;
  onChange: (color: string) => void;
  children: React.ReactNode;
  showAlpha?: boolean;
};

const RECENT_COLORS_KEY = "thalamus-recent-colors";
const MAX_RECENT_COLORS = 10;

// Get recently used colors from localStorage
function getRecentColors(): string[] {
  try {
    const stored = localStorage.getItem(RECENT_COLORS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed.slice(0, MAX_RECENT_COLORS);
      }
    }
  } catch {
    // Ignore parse errors
  }
  return [];
}

// Add a color to recently used
function addRecentColor(color: string): void {
  try {
    const normalized = color.toLowerCase();
    const recent = getRecentColors().filter((c) => c.toLowerCase() !== normalized);
    recent.unshift(color);
    localStorage.setItem(RECENT_COLORS_KEY, JSON.stringify(recent.slice(0, MAX_RECENT_COLORS)));
  } catch {
    // Ignore storage errors
  }
}

// Common color presets
const commonColors = [
  // Grays
  "#000000",
  "#1e293b",
  "#334155",
  "#475569",
  "#64748b",
  "#94a3b8",
  "#cbd5e1",
  "#e2e8f0",
  "#f1f5f9",
  "#ffffff",
  // Reds
  "#7f1d1d",
  "#991b1b",
  "#b91c1c",
  "#dc2626",
  "#ef4444",
  "#f87171",
  "#fca5a5",
  "#fecaca",
  "#fee2e2",
  "#fef2f2",
  // Oranges
  "#7c2d12",
  "#9a3412",
  "#c2410c",
  "#ea580c",
  "#f97316",
  "#fb923c",
  "#fdba74",
  "#fed7aa",
  "#ffedd5",
  "#fff7ed",
  // Yellows
  "#713f12",
  "#854d0e",
  "#a16207",
  "#ca8a04",
  "#eab308",
  "#facc15",
  "#fde047",
  "#fef08a",
  "#fef9c3",
  "#fefce8",
  // Greens
  "#14532d",
  "#166534",
  "#15803d",
  "#16a34a",
  "#22c55e",
  "#4ade80",
  "#86efac",
  "#bbf7d0",
  "#dcfce7",
  "#f0fdf4",
  // Teals
  "#134e4a",
  "#115e59",
  "#0f766e",
  "#0d9488",
  "#14b8a6",
  "#2dd4bf",
  "#5eead4",
  "#99f6e4",
  "#ccfbf1",
  "#f0fdfa",
  // Blues
  "#1e3a8a",
  "#1e40af",
  "#1d4ed8",
  "#2563eb",
  "#3b82f6",
  "#60a5fa",
  "#93c5fd",
  "#bfdbfe",
  "#dbeafe",
  "#eff6ff",
  // Purples
  "#4c1d95",
  "#5b21b6",
  "#6d28d9",
  "#7c3aed",
  "#8b5cf6",
  "#a78bfa",
  "#c4b5fd",
  "#ddd6fe",
  "#ede9fe",
  "#f5f3ff",
  // Pinks
  "#831843",
  "#9d174d",
  "#be185d",
  "#db2777",
  "#ec4899",
  "#f472b6",
  "#f9a8d4",
  "#fbcfe8",
  "#fce7f3",
  "#fdf2f8",
];

// Convert hex to RGBA
function hexToRgba(hex: string): { r: number; g: number; b: number; a: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(hex);
  if (result) {
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
      a: result[4] ? parseInt(result[4], 16) / 255 : 1,
    };
  }
  return { r: 0, g: 0, b: 0, a: 1 };
}

// Convert RGBA to hex
function rgbaToHex(r: number, g: number, b: number, a: number = 1): string {
  const toHex = (n: number) => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  if (a < 1) {
    return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a * 255)}`;
  }
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Convert HSV to RGB
function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

// Convert RGB to HSV
function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
        break;
      case g:
        h = ((b - r) / d + 2) * 60;
        break;
      case b:
        h = ((r - g) / d + 4) * 60;
        break;
    }
  }

  return { h, s, v };
}

export function ColorPicker({ value, onChange, children, showAlpha = true }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const [hexInput, setHexInput] = useState(value);
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const rgba = hexToRgba(value);
  const hsv = rgbToHsv(rgba.r, rgba.g, rgba.b);

  const [hue, setHue] = useState(hsv.h);
  const [saturation, setSaturation] = useState(hsv.s);
  const [brightness, setBrightness] = useState(hsv.v);
  const [alpha, setAlpha] = useState(rgba.a);

  // Load recent colors on mount
  useEffect(() => {
    setRecentColors(getRecentColors());
  }, []);

  // Update internal state when value prop changes
  useEffect(() => {
    const newRgba = hexToRgba(value);
    const newHsv = rgbToHsv(newRgba.r, newRgba.g, newRgba.b);
    setHue(newHsv.h);
    setSaturation(newHsv.s);
    setBrightness(newHsv.v);
    setAlpha(newRgba.a);
    setHexInput(value);
  }, [value]);

  const updateColor = useCallback(
    (h: number, s: number, v: number, a: number) => {
      const rgb = hsvToRgb(h, s, v);
      const hex = rgbaToHex(rgb.r, rgb.g, rgb.b, a);
      setHexInput(hex);
      onChange(hex);
    },
    [onChange]
  );

  const handleSaturationBrightnessChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    setSaturation(x);
    setBrightness(1 - y);
    updateColor(hue, x, 1 - y, alpha);
  };

  const handleHueChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newHue = x * 360;
    setHue(newHue);
    updateColor(newHue, saturation, brightness, alpha);
  };

  const handleAlphaChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setAlpha(x);
    updateColor(hue, saturation, brightness, x);
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setHexInput(newValue);
    if (/^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(newValue)) {
      onChange(newValue);
    }
  };

  const handleRgbaChange = (channel: "r" | "g" | "b" | "a", val: string) => {
    const num = channel === "a" ? parseFloat(val) : parseInt(val, 10);
    if (isNaN(num)) return;

    const newRgba = { ...rgba };
    if (channel === "a") {
      newRgba.a = Math.max(0, Math.min(1, num));
    } else {
      newRgba[channel] = Math.max(0, Math.min(255, num));
    }

    const hex = rgbaToHex(newRgba.r, newRgba.g, newRgba.b, newRgba.a);
    onChange(hex);
  };

  const handlePresetClick = (color: string) => {
    onChange(color);
    addRecentColor(color);
    setRecentColors(getRecentColors());
    setOpen(false);
  };

  const handleEyeDropper = async () => {
    if (!window.EyeDropper) {
      return;
    }
    try {
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      onChange(result.sRGBHex);
      addRecentColor(result.sRGBHex);
      setRecentColors(getRecentColors());
    } catch {
      // User cancelled or error occurred
    }
  };

  const supportsEyeDropper = typeof window !== "undefined" && !!window.EyeDropper;

  // Save to recent colors when popover closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && value) {
      addRecentColor(value);
      setRecentColors(getRecentColors());
    }
    setOpen(newOpen);
  };

  const currentRgb = hsvToRgb(hue, saturation, brightness);
  const hueRgb = hsvToRgb(hue, 1, 1);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" side="right" align="start">
        <Tabs defaultValue="picker" className="w-full">
          <TabsList className="w-full rounded-none border-b bg-transparent p-0">
            <TabsTrigger
              value="picker"
              className="flex-1 rounded-none border-b-2 border-transparent py-2 text-xs data-[state=active]:border-slate-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Picker
            </TabsTrigger>
            <TabsTrigger
              value="presets"
              className="flex-1 rounded-none border-b-2 border-transparent py-2 text-xs data-[state=active]:border-slate-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Presets
            </TabsTrigger>
          </TabsList>

          <TabsContent value="picker" className="m-0 p-3 space-y-3">
            {/* Saturation/Brightness picker */}
            <div
              className="relative h-40 w-full cursor-crosshair rounded-md border border-slate-200"
              style={{
                background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, rgb(${hueRgb.r}, ${hueRgb.g}, ${hueRgb.b}))`,
              }}
              onMouseDown={handleSaturationBrightnessChange}
              onMouseMove={(e) => e.buttons === 1 && handleSaturationBrightnessChange(e)}
            >
              <div
                className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md"
                style={{
                  left: `${saturation * 100}%`,
                  top: `${(1 - brightness) * 100}%`,
                  backgroundColor: `rgb(${currentRgb.r}, ${currentRgb.g}, ${currentRgb.b})`,
                }}
              />
            </div>

            {/* Hue slider */}
            <div
              className="relative h-3 w-full cursor-pointer rounded-full"
              style={{
                background:
                  "linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)",
              }}
              onMouseDown={handleHueChange}
              onMouseMove={(e) => e.buttons === 1 && handleHueChange(e)}
            >
              <div
                className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md"
                style={{
                  left: `${(hue / 360) * 100}%`,
                  backgroundColor: `rgb(${hueRgb.r}, ${hueRgb.g}, ${hueRgb.b})`,
                }}
              />
            </div>

            {/* Alpha slider */}
            {showAlpha && (
              <div
                className="relative h-3 w-full cursor-pointer rounded-full"
                style={{
                  background: `linear-gradient(to right, transparent, rgb(${currentRgb.r}, ${currentRgb.g}, ${currentRgb.b})), url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Crect width='4' height='4' fill='%23ccc'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%23ccc'/%3E%3C/svg%3E")`,
                }}
                onMouseDown={handleAlphaChange}
                onMouseMove={(e) => e.buttons === 1 && handleAlphaChange(e)}
              >
                <div
                  className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md"
                  style={{
                    left: `${alpha * 100}%`,
                    backgroundColor: `rgba(${currentRgb.r}, ${currentRgb.g}, ${currentRgb.b}, ${alpha})`,
                  }}
                />
              </div>
            )}

            {/* Color preview, hex input, and eyedropper */}
            <div className="flex items-center gap-2">
              <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-md border border-slate-200 shadow-sm">
                {/* Checkerboard background for transparency */}
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Crect width='4' height='4' fill='%23ccc'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%23ccc'/%3E%3C/svg%3E")`,
                  }}
                />
                {/* Color overlay */}
                <div className="absolute inset-0" style={{ backgroundColor: value }} />
              </div>
              <Input
                type="text"
                value={hexInput}
                onChange={handleHexInputChange}
                className="h-8 flex-1 font-mono text-xs"
                placeholder="#000000"
              />
              {supportsEyeDropper && (
                <button
                  type="button"
                  onClick={handleEyeDropper}
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                  title="Pick color from screen"
                >
                  <Pipette className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* RGBA inputs */}
            <div className={`grid gap-2 ${showAlpha ? "grid-cols-4" : "grid-cols-3"}`}>
              <div>
                <label className="mb-1 block text-[10px] font-medium text-slate-500">R</label>
                <Input
                  type="number"
                  min={0}
                  max={255}
                  value={rgba.r}
                  onChange={(e) => handleRgbaChange("r", e.target.value)}
                  className="h-7 text-xs"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-medium text-slate-500">G</label>
                <Input
                  type="number"
                  min={0}
                  max={255}
                  value={rgba.g}
                  onChange={(e) => handleRgbaChange("g", e.target.value)}
                  className="h-7 text-xs"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-medium text-slate-500">B</label>
                <Input
                  type="number"
                  min={0}
                  max={255}
                  value={rgba.b}
                  onChange={(e) => handleRgbaChange("b", e.target.value)}
                  className="h-7 text-xs"
                />
              </div>
              {showAlpha && (
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-slate-500">A</label>
                  <Input
                    type="number"
                    min={0}
                    max={1}
                    step={0.01}
                    value={rgba.a.toFixed(2)}
                    onChange={(e) => handleRgbaChange("a", e.target.value)}
                    className="h-7 text-xs"
                  />
                </div>
              )}
            </div>

            {/* Recently used colors */}
            {recentColors.length > 0 && (
              <div>
                <label className="mb-2 block text-[10px] font-medium uppercase text-slate-500">
                  Recent
                </label>
                <div className="flex gap-1">
                  {recentColors.map((color, index) => (
                    <button
                      key={`${color}-${index}`}
                      type="button"
                      className="h-6 w-6 rounded-sm border border-slate-200 transition hover:scale-110 hover:border-slate-400"
                      style={{ backgroundColor: color }}
                      onClick={() => handlePresetClick(color)}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="presets" className="m-0 p-3">
            <div className="grid grid-cols-10 gap-1">
              {commonColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className="h-6 w-6 rounded-sm border border-slate-200 transition hover:scale-110 hover:border-slate-400"
                  style={{ backgroundColor: color }}
                  onClick={() => handlePresetClick(color)}
                  title={color}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}

// Simple color swatch trigger component with transparency support
export function ColorSwatch({ color, className = "" }: { color: string; className?: string }) {
  // Check if color has alpha (8-digit hex or rgba)
  const hasAlpha = /^#[0-9a-fA-F]{8}$/.test(color) || color.includes("rgba");

  return (
    <span
      className={`relative inline-block overflow-hidden rounded-full border border-slate-300 shadow-sm ${className}`}
    >
      {/* Checkerboard background for transparency */}
      {hasAlpha && (
        <span
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Crect width='4' height='4' fill='%23ccc'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%23ccc'/%3E%3C/svg%3E")`,
          }}
        />
      )}
      {/* Color overlay */}
      <span className="absolute inset-0" style={{ backgroundColor: color }} />
    </span>
  );
}
