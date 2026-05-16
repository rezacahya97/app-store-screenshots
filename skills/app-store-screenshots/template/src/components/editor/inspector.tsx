"use client";
import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Slide, SlideLayout } from "@/lib/types";
import { ScreenshotPicker } from "./screenshot-picker";

const LAYOUTS: SlideLayout[] = [
  "hero",
  "device-bottom",
  "device-top",
  "two-devices",
  "no-device",
  "split-landscape",
  "feature-graphic",
];

type Props = {
  slide: Slide;
  onChange: (patch: Partial<Slide>) => void;
};

export function Inspector({ slide, onChange }: Props) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-3">
        <h2 className="text-sm font-semibold">Slide settings</h2>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Layout</Label>
          <Select value={slide.layout} onValueChange={(v) => onChange({ layout: v as SlideLayout })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LAYOUTS.map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Label (caption)</Label>
          <input
            type="text"
            value={slide.label}
            onChange={(e) => onChange({ label: e.target.value })}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="FEATURE 01"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Headline (newlines are line breaks)</Label>
          <Textarea
            value={slide.headline}
            onChange={(e) => onChange({ headline: e.target.value })}
            rows={3}
            placeholder={"One idea\nper slide."}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Tone</Label>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start"
            onClick={() => onChange({ inverted: !slide.inverted })}
          >
            {slide.inverted ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            {slide.inverted ? "Dark variant" : "Light variant"}
          </Button>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Primary screenshot</Label>
          <ScreenshotPicker
            label="Primary"
            value={slide.screenshot}
            onChange={(v) => onChange({ screenshot: v })}
          />
        </div>

        {slide.layout === "two-devices" && (
          <div className="space-y-1.5">
            <Label className="text-xs">Secondary screenshot</Label>
            <ScreenshotPicker
              label="Secondary (back layer)"
              value={slide.screenshotSecondary || ""}
              onChange={(v) => onChange({ screenshotSecondary: v })}
            />
          </div>
        )}
      </div>
    </div>
  );
}
