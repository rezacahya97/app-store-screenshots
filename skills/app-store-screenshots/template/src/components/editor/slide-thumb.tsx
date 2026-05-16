"use client";
import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Device, Orientation, Slide, Theme } from "@/lib/types";
import { cn } from "@/lib/utils";
import { SlideCanvas } from "./slide-canvas";

type Props = {
  slide: Slide;
  index: number;
  active: boolean;
  device: Device;
  orientation: Orientation;
  theme: Theme;
  appName?: string;
  appIcon?: string;
  onSelect: () => void;
  onDelete: () => void;
};

export function SlideThumb({
  slide,
  index,
  active,
  device,
  orientation,
  theme,
  appName,
  appIcon,
  onSelect,
  onDelete,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: slide.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex items-stretch gap-2 rounded-lg border bg-card p-1.5 transition-colors hover:bg-accent",
        active && "border-primary ring-1 ring-primary",
      )}
    >
      <button
        type="button"
        className="flex w-4 cursor-grab items-center justify-center text-muted-foreground hover:text-foreground active:cursor-grabbing"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={onSelect}
        className="flex flex-1 items-center gap-3 overflow-hidden text-left"
      >
        <div
          className={cn(
            "relative shrink-0 overflow-hidden rounded border bg-muted",
            "h-16 w-10",
          )}
        >
          <div
            style={{
              width: 200,
              height: 320,
              position: "absolute",
              top: 0,
              left: 0,
              transformOrigin: "top left",
              transform: "scale(0.2)",
              pointerEvents: "none",
            }}
          >
            <SlideCanvas
              slide={slide}
              device={device}
              orientation={orientation}
              theme={theme}
              appName={appName}
              appIcon={appIcon}
              editable={false}
            />
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-xs text-muted-foreground">Slide {index + 1}</span>
          <span className="truncate text-sm font-medium">
            {slide.headline.split("\n")[0] || "Untitled"}
          </span>
          <span className="truncate text-[10px] uppercase tracking-wide text-muted-foreground">
            {slide.layout}
          </span>
        </div>
      </button>

      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="h-7 w-7 self-center opacity-0 transition-opacity group-hover:opacity-100"
        onClick={onDelete}
        aria-label="Delete slide"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
