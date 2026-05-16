"use client";
import * as React from "react";
import { Check, Cloud, Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DEVICE_LABEL,
  EXPORT_SIZES,
  EXPORT_SIZES_LANDSCAPE,
  LOCALES,
  THEMES,
} from "@/lib/constants";
import { detectPlatform } from "@/lib/defaults";
import type { Device, Orientation, ThemeId } from "@/lib/types";

type Props = {
  appName: string;
  setAppName: (v: string) => void;
  themeId: ThemeId;
  setThemeId: (v: ThemeId) => void;
  locale: string;
  setLocale: (v: string) => void;
  device: Device;
  setDevice: (v: Device) => void;
  orientation: Orientation;
  setOrientation: (v: Orientation) => void;
  sizeIdx: number;
  setSizeIdx: (i: number) => void;
  onExport: () => void;
  onReset: () => void;
  exporting: string | null;
  savedAt: number | null;
};

export function Toolbar(props: Props) {
  const platform = detectPlatform(props.device);
  const isTablet = props.device === "android-7" || props.device === "android-10";
  const sizes =
    isTablet && props.orientation === "landscape"
      ? EXPORT_SIZES_LANDSCAPE[props.device] || EXPORT_SIZES[props.device]
      : EXPORT_SIZES[props.device];

  return (
    <div className="flex items-center gap-3 border-b bg-background px-4 py-2">
      <div className="flex shrink-0 items-center gap-2">
        <Input
          value={props.appName}
          onChange={(e) => props.setAppName(e.target.value)}
          className="h-8 w-44 text-sm font-semibold"
          placeholder="App name"
        />
      </div>

      <Tabs
        value={platform}
        onValueChange={(p) => props.setDevice(p === "ios" ? "iphone" : "android")}
      >
        <TabsList>
          <TabsTrigger value="ios"></TabsTrigger>
          <TabsTrigger value="android">Android</TabsTrigger>
        </TabsList>
      </Tabs>

      <Select value={props.device} onValueChange={(v) => props.setDevice(v as Device)}>
        <SelectTrigger className="h-8 w-40 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {platform === "ios" ? (
            <>
              <SelectItem value="iphone">iPhone</SelectItem>
              <SelectItem value="ipad">iPad</SelectItem>
            </>
          ) : (
            <>
              <SelectItem value="android">Android Phone</SelectItem>
              <SelectItem value="android-7">Android 7" Tablet</SelectItem>
              <SelectItem value="android-10">Android 10" Tablet</SelectItem>
              <SelectItem value="feature-graphic">Feature Graphic</SelectItem>
            </>
          )}
        </SelectContent>
      </Select>

      {isTablet && (
        <Select value={props.orientation} onValueChange={(v) => props.setOrientation(v as Orientation)}>
          <SelectTrigger className="h-8 w-32 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="portrait">Portrait</SelectItem>
            <SelectItem value="landscape">Landscape</SelectItem>
          </SelectContent>
        </Select>
      )}

      <Select value={props.themeId} onValueChange={(v) => props.setThemeId(v as ThemeId)}>
        <SelectTrigger className="h-8 w-36 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.values(THEMES).map((t) => (
            <SelectItem key={t.id} value={t.id}>
              {t.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={props.locale} onValueChange={props.setLocale}>
        <SelectTrigger className="h-8 w-20 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {LOCALES.map((l) => (
            <SelectItem key={l} value={l}>
              {l.toUpperCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={String(props.sizeIdx)}
        onValueChange={(v) => props.setSizeIdx(Number(v))}
      >
        <SelectTrigger className="h-8 w-44 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sizes.map((s, i) => (
            <SelectItem key={i} value={String(i)}>
              {s.label} — {s.w}×{s.h}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <SaveStatus savedAt={props.savedAt} />
        <Button variant="ghost" size="sm" onClick={props.onReset} title="Reset to defaults">
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button onClick={props.onExport} disabled={!!props.exporting} size="sm">
          <Download className="h-4 w-4" />
          {props.exporting ? `Exporting ${props.exporting}` : "Export all"}
        </Button>
      </div>
    </div>
  );
}

function SaveStatus({ savedAt }: { savedAt: number | null }) {
  const [, setTick] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 30_000);
    return () => clearInterval(t);
  }, []);

  if (!savedAt) {
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Cloud className="h-3.5 w-3.5" /> not saved yet
      </span>
    );
  }
  const seconds = Math.max(0, Math.round((Date.now() - savedAt) / 1000));
  const label =
    seconds < 5 ? "saved" : seconds < 60 ? `saved ${seconds}s ago` : `saved ${Math.round(seconds / 60)}m ago`;
  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground">
      <Check className="h-3.5 w-3.5 text-green-500" /> {label}
    </span>
  );
}
