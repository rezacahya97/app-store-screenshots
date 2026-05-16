"use client";
import * as React from "react";
import type { Device, Orientation, Slide, Theme } from "@/lib/types";
import { getCanvas } from "./slide-canvas";
import { SlideCanvas } from "./slide-canvas";

type Props = {
  slide: Slide;
  device: Device;
  orientation: Orientation;
  theme: Theme;
  appName?: string;
  appIcon?: string;
  onLabelChange: (v: string) => void;
  onHeadlineChange: (v: string) => void;
};

// Fits the full-resolution canvas inside its container by measuring the
// container and applying transform: scale().
export function PreviewStage({
  slide,
  device,
  orientation,
  theme,
  appName,
  appIcon,
  onLabelChange,
  onHeadlineChange,
}: Props) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(0.2);
  const { cW, cH } = getCanvas(device, orientation);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      // Leave a little padding
      const sx = (rect.width - 24) / cW;
      const sy = (rect.height - 24) / cH;
      setScale(Math.max(0.05, Math.min(sx, sy)));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [cW, cH]);

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-muted/40"
    >
      <div
        style={{
          width: cW,
          height: cH,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          flexShrink: 0,
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
          background: "white",
        }}
      >
        <SlideCanvas
          slide={slide}
          device={device}
          orientation={orientation}
          theme={theme}
          appName={appName}
          appIcon={appIcon}
          editable
          edit={{ onLabelChange, onHeadlineChange }}
        />
      </div>
      <div className="pointer-events-none absolute bottom-2 right-3 text-[10px] text-muted-foreground">
        {cW}×{cH} · {(scale * 100).toFixed(0)}%
      </div>
    </div>
  );
}
