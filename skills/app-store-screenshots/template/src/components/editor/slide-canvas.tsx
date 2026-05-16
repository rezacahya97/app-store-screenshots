"use client";
import * as React from "react";
import type { Device, Orientation, Slide, Theme } from "@/lib/types";
import {
  CANVAS,
  ipadW,
  phoneW,
  phoneWSmall,
  tabletLW,
  tabletPW,
} from "@/lib/constants";
import { img } from "@/lib/image-cache";
import {
  AndroidPhone,
  AndroidTabletL,
  AndroidTabletP,
  IPad,
  Phone,
} from "./device-frames";

type FrameComp = React.ComponentType<{ src: string; alt?: string; style?: React.CSSProperties }>;

export function getCanvas(device: Device, orientation: Orientation) {
  const c = CANVAS[device];
  if ((device === "android-7" || device === "android-10") && orientation === "landscape") {
    return { cW: c.wL!, cH: c.hL! };
  }
  return { cW: c.w, cH: c.h };
}

export function getFrameForDevice(device: Device, orientation: Orientation): {
  Comp: FrameComp;
  widthFn: (cW: number, cH: number) => number;
  smallWidthFn: (cW: number, cH: number) => number;
} {
  switch (device) {
    case "iphone":
      return { Comp: Phone, widthFn: phoneW, smallWidthFn: phoneWSmall };
    case "ipad":
      return { Comp: IPad, widthFn: ipadW, smallWidthFn: (cW, cH) => ipadW(cW, cH, 0.6) };
    case "android":
      return { Comp: AndroidPhone, widthFn: phoneW, smallWidthFn: phoneWSmall };
    case "android-7":
    case "android-10":
      if (orientation === "landscape") {
        return { Comp: AndroidTabletL, widthFn: tabletLW, smallWidthFn: (cW, cH) => tabletLW(cW, cH, 0.5) };
      }
      return { Comp: AndroidTabletP, widthFn: tabletPW, smallWidthFn: (cW, cH) => tabletPW(cW, cH, 0.62) };
    default:
      return { Comp: Phone, widthFn: phoneW, smallWidthFn: phoneWSmall };
  }
}

type EditHandlers = {
  onLabelChange?: (v: string) => void;
  onHeadlineChange?: (v: string) => void;
};

type Props = {
  slide: Slide;
  device: Device;
  orientation: Orientation;
  theme: Theme;
  appName?: string;
  appIcon?: string;
  editable?: boolean;
  edit?: EditHandlers;
};

// ---------- Editable text helpers ----------

function EditableText({
  value,
  editable,
  onChange,
  style,
  multiline = false,
  placeholder,
}: {
  value: string;
  editable?: boolean;
  onChange?: (v: string) => void;
  style?: React.CSSProperties;
  multiline?: boolean;
  placeholder?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  // Sync prop -> DOM when the slide changes externally, but avoid clobbering
  // the current selection while the user is typing.
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const incoming = multiline ? value.replace(/\n/g, "<br/>") : value;
    if (el.innerHTML !== incoming && document.activeElement !== el) {
      el.innerHTML = incoming || "";
    }
  }, [value, multiline]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    if (!onChange) return;
    const html = (e.currentTarget.innerHTML || "")
      .replace(/<div>/gi, "\n")
      .replace(/<\/div>/gi, "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");
    onChange(multiline ? html : html.replace(/\n/g, ""));
  };

  return (
    <div
      ref={ref}
      contentEditable={editable}
      suppressContentEditableWarning
      data-placeholder={placeholder}
      onInput={handleInput}
      style={{
        outline: "none",
        whiteSpace: multiline ? "pre-wrap" : "nowrap",
        ...style,
      }}
    />
  );
}

// ---------- Caption (label + headline) ----------

function Caption({
  cW,
  slide,
  theme,
  editable,
  edit,
  align = "center",
  inverted,
}: {
  cW: number;
  slide: Slide;
  theme: Theme;
  editable?: boolean;
  edit?: EditHandlers;
  align?: "center" | "left";
  inverted?: boolean;
}) {
  const fg = inverted ? theme.fgAlt : theme.fg;
  const accent = theme.accent;
  return (
    <div style={{ textAlign: align, position: "relative" }}>
      <EditableText
        value={slide.label}
        editable={editable}
        onChange={edit?.onLabelChange}
        placeholder="LABEL"
        style={{
          fontSize: cW * 0.028,
          fontWeight: 600,
          letterSpacing: cW * 0.0015,
          color: accent,
          textTransform: "uppercase",
          marginBottom: cW * 0.018,
          minHeight: cW * 0.03,
        }}
      />
      <EditableText
        value={slide.headline}
        editable={editable}
        multiline
        onChange={edit?.onHeadlineChange}
        placeholder="Headline goes here"
        style={{
          fontSize: cW * 0.092,
          fontWeight: 700,
          lineHeight: 0.96,
          letterSpacing: -cW * 0.001,
          color: fg,
        }}
      />
    </div>
  );
}

// ---------- Background ----------

function backgroundFor(theme: Theme, inverted?: boolean, layout?: string) {
  if (inverted) {
    return `linear-gradient(160deg, ${theme.bgAlt} 0%, ${shade(theme.bgAlt, -8)} 100%)`;
  }
  return `linear-gradient(160deg, ${theme.bg} 0%, ${shade(theme.bg, -6)} 100%)`;
}

function shade(hex: string, percent: number) {
  // very small darken/lighten — clamp to [0,255]
  const c = hex.replace("#", "");
  const num = parseInt(c.length === 3 ? c.split("").map((x) => x + x).join("") : c, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  const amt = Math.round((255 * percent) / 100);
  r = Math.max(0, Math.min(255, r + amt));
  g = Math.max(0, Math.min(255, g + amt));
  b = Math.max(0, Math.min(255, b + amt));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

// ---------- Decorative blob (depth without distraction) ----------

function Blob({
  cW,
  cH,
  color,
  x,
  y,
  size,
  opacity = 0.4,
}: {
  cW: number;
  cH: number;
  color: string;
  x: number;
  y: number;
  size: number;
  opacity?: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: `${size}%`,
        aspectRatio: "1 / 1",
        background: color,
        borderRadius: "50%",
        filter: `blur(${cW * 0.06}px)`,
        opacity,
        pointerEvents: "none",
      }}
    />
  );
}

// ---------- Main canvas ----------

export function SlideCanvas({
  slide,
  device,
  orientation,
  theme,
  appName,
  appIcon,
  editable,
  edit,
}: Props) {
  const { cW, cH } = getCanvas(device, orientation);
  const { Comp: Frame, widthFn, smallWidthFn } = getFrameForDevice(device, orientation);
  const inverted = !!slide.inverted;
  const bg = backgroundFor(theme, inverted, slide.layout);
  const fw = widthFn(cW, cH) * 100;
  const fwSmall = smallWidthFn(cW, cH) * 100;

  // Special: feature-graphic layout — its own composition
  if (slide.layout === "feature-graphic" || device === "feature-graphic") {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          overflow: "hidden",
          background: `linear-gradient(135deg, ${theme.bgAlt} 0%, ${shade(theme.bgAlt, -10)} 50%, ${theme.accent} 200%)`,
          display: "flex",
          alignItems: "center",
          padding: `0 ${cW * 0.06}px`,
          color: theme.fgAlt,
        }}
      >
        <Blob cW={cW} cH={cH} color={theme.accent} x={70} y={20} size={50} opacity={0.45} />
        <div style={{ display: "flex", alignItems: "center", gap: cW * 0.03, zIndex: 2 }}>
          {appIcon && (
            <img
              src={img(appIcon)}
              alt=""
              style={{
                width: cW * 0.13,
                height: cW * 0.13,
                borderRadius: cW * 0.022,
                boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
              }}
              draggable={false}
            />
          )}
          <div>
            <div style={{ fontSize: cW * 0.06, fontWeight: 800, lineHeight: 1.05 }}>{appName || "App"}</div>
            <EditableText
              value={slide.headline}
              editable={editable}
              multiline
              onChange={edit?.onHeadlineChange}
              style={{
                fontSize: cW * 0.028,
                color: "rgba(255,255,255,0.85)",
                marginTop: cW * 0.012,
                lineHeight: 1.25,
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        background: bg,
        color: inverted ? theme.fgAlt : theme.fg,
      }}
    >
      <Blob cW={cW} cH={cH} color={theme.accent} x={-15} y={-10} size={55} opacity={inverted ? 0.25 : 0.32} />
      <Blob cW={cW} cH={cH} color={theme.accent} x={70} y={75} size={45} opacity={inverted ? 0.18 : 0.25} />

      {renderLayout(slide.layout, {
        slide,
        cW,
        cH,
        Frame,
        fw,
        fwSmall,
        theme,
        editable,
        edit,
        inverted,
      })}
    </div>
  );
}

function renderLayout(
  layout: Slide["layout"],
  ctx: {
    slide: Slide;
    cW: number;
    cH: number;
    Frame: FrameComp;
    fw: number;
    fwSmall: number;
    theme: Theme;
    editable?: boolean;
    edit?: EditHandlers;
    inverted?: boolean;
  },
) {
  const { slide, cW, cH, Frame, fw, fwSmall, theme, editable, edit, inverted } = ctx;
  switch (layout) {
    case "hero":
      return (
        <>
          <div
            style={{
              position: "absolute",
              top: "9%",
              left: "8%",
              right: "8%",
              textAlign: "center",
              zIndex: 2,
            }}
          >
            <Caption cW={cW} slide={slide} theme={theme} editable={editable} edit={edit} inverted={inverted} />
          </div>
          <Frame
            src={slide.screenshot}
            style={{
              position: "absolute",
              bottom: 0,
              left: "50%",
              width: `${fw}%`,
              transform: "translateX(-50%) translateY(15%)",
            }}
          />
        </>
      );

    case "device-bottom":
      return (
        <>
          <div style={{ position: "absolute", top: "8%", left: "8%", right: "8%", textAlign: "center", zIndex: 2 }}>
            <Caption cW={cW} slide={slide} theme={theme} editable={editable} edit={edit} inverted={inverted} />
          </div>
          <Frame
            src={slide.screenshot}
            style={{
              position: "absolute",
              bottom: "-2%",
              left: "50%",
              width: `${fw}%`,
              transform: "translateX(-50%)",
            }}
          />
        </>
      );

    case "device-top":
      return (
        <>
          <Frame
            src={slide.screenshot}
            style={{
              position: "absolute",
              top: "-10%",
              left: "50%",
              width: `${fw}%`,
              transform: "translateX(-50%)",
            }}
          />
          <div style={{ position: "absolute", bottom: "10%", left: "8%", right: "8%", textAlign: "center", zIndex: 2 }}>
            <Caption cW={cW} slide={slide} theme={theme} editable={editable} edit={edit} inverted={inverted} />
          </div>
        </>
      );

    case "two-devices":
      return (
        <>
          <div style={{ position: "absolute", top: "8%", left: "8%", right: "8%", textAlign: "center", zIndex: 2 }}>
            <Caption cW={cW} slide={slide} theme={theme} editable={editable} edit={edit} inverted={inverted} />
          </div>
          <Frame
            src={slide.screenshotSecondary || slide.screenshot}
            style={{
              position: "absolute",
              bottom: "5%",
              left: "-6%",
              width: `${fwSmall}%`,
              transform: "rotate(-5deg)",
              opacity: 0.85,
            }}
          />
          <Frame
            src={slide.screenshot}
            style={{
              position: "absolute",
              bottom: "-2%",
              right: "-6%",
              width: `${fw * 0.9}%`,
              transform: "rotate(3deg)",
            }}
          />
        </>
      );

    case "no-device":
      return (
        <>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "10%",
              textAlign: "center",
              zIndex: 2,
            }}
          >
            <Caption cW={cW} slide={slide} theme={theme} editable={editable} edit={edit} inverted={inverted} />
          </div>
        </>
      );

    case "split-landscape":
      return (
        <>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "5%",
              width: "38%",
              transform: "translateY(-50%)",
              zIndex: 2,
            }}
          >
            <Caption cW={cW} slide={slide} theme={theme} editable={editable} edit={edit} align="left" inverted={inverted} />
          </div>
          <Frame
            src={slide.screenshot}
            style={{
              position: "absolute",
              right: "-3%",
              top: "50%",
              width: `${fw}%`,
              transform: "translateY(-50%)",
            }}
          />
        </>
      );

    default:
      return null;
  }
}
