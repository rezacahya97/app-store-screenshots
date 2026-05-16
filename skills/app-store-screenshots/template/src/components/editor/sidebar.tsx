"use client";
import * as React from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Device, Orientation, Slide, SlideLayout, Theme } from "@/lib/types";
import { newSlide } from "@/lib/defaults";
import { SlideThumb } from "./slide-thumb";

const ADD_LAYOUTS: SlideLayout[] = [
  "hero",
  "device-bottom",
  "device-top",
  "two-devices",
  "no-device",
  "split-landscape",
];

type Props = {
  slides: Slide[];
  activeId: string | null;
  device: Device;
  orientation: Orientation;
  theme: Theme;
  appName?: string;
  appIcon?: string;
  onReorder: (next: Slide[]) => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: (slide: Slide) => void;
};

export function Sidebar({
  slides,
  activeId,
  device,
  orientation,
  theme,
  appName,
  appIcon,
  onReorder,
  onSelect,
  onDelete,
  onAdd,
}: Props) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = slides.findIndex((s) => s.id === active.id);
    const newIdx = slides.findIndex((s) => s.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    onReorder(arrayMove(slides, oldIdx, newIdx));
  };

  const [addLayout, setAddLayout] = React.useState<SlideLayout>("device-bottom");

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-3">
        <h2 className="text-sm font-semibold">Slides</h2>
        <p className="text-xs text-muted-foreground">{slides.length} slide{slides.length === 1 ? "" : "s"}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={slides.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-1.5">
              {slides.map((slide, i) => (
                <SlideThumb
                  key={slide.id}
                  slide={slide}
                  index={i}
                  active={slide.id === activeId}
                  device={device}
                  orientation={orientation}
                  theme={theme}
                  appName={appName}
                  appIcon={appIcon}
                  onSelect={() => onSelect(slide.id)}
                  onDelete={() => onDelete(slide.id)}
                />
              ))}
              {slides.length === 0 && (
                <p className="px-2 py-6 text-center text-xs text-muted-foreground">
                  No slides yet — add one below.
                </p>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div className="space-y-2 border-t p-3">
        <Select value={addLayout} onValueChange={(v) => setAddLayout(v as SlideLayout)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ADD_LAYOUTS.map((l) => (
              <SelectItem key={l} value={l}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          className="w-full"
          variant="default"
          onClick={() => onAdd(newSlide(addLayout))}
        >
          <Plus className="h-4 w-4" /> Add slide
        </Button>
      </div>
    </div>
  );
}
