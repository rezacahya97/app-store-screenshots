"use client";
import * as React from "react";
import { toPng } from "html-to-image";
import {
  CANVAS,
  EXPORT_SIZES,
  EXPORT_SIZES_LANDSCAPE,
  THEMES,
} from "@/lib/constants";
import { preloadImages } from "@/lib/image-cache";
import { useProject } from "@/lib/storage";
import type { Device, Slide, SlideLayout, ThemeId } from "@/lib/types";
import { Inspector } from "./inspector";
import { PreviewStage } from "./preview-stage";
import { Sidebar } from "./sidebar";
import { SlideCanvas, getCanvas } from "./slide-canvas";
import { Toolbar } from "./toolbar";

export function ScreenshotEditor() {
  const { state, setState, hydrated, savedAt, reset } = useProject();
  const [activeSlideId, setActiveSlideId] = React.useState<string | null>(null);
  const [sizeIdx, setSizeIdx] = React.useState(0);
  const [exporting, setExporting] = React.useState<string | null>(null);
  const [ready, setReady] = React.useState(false);
  const exportRefs = React.useRef<Record<string, HTMLDivElement | null>>({});

  const currentSlides = state.slidesByDevice[state.device] || [];
  const activeSlide =
    currentSlides.find((s) => s.id === activeSlideId) || currentSlides[0] || null;
  const theme = THEMES[state.themeId];

  // When the active slide list changes, make sure we have a valid selection
  React.useEffect(() => {
    if (!hydrated) return;
    if (!activeSlide && currentSlides.length > 0) {
      setActiveSlideId(currentSlides[0].id);
    }
  }, [hydrated, currentSlides, activeSlide]);

  // Reset size index when device changes
  React.useEffect(() => {
    setSizeIdx(0);
  }, [state.device, state.orientation]);

  // Pre-load all images referenced by all slides across all devices
  React.useEffect(() => {
    if (!hydrated) return;
    const paths = new Set<string>();
    paths.add("/mockup.png");
    if (state.appIcon) paths.add(state.appIcon);
    for (const dev of Object.values(state.slidesByDevice)) {
      for (const s of dev) {
        if (s.screenshot && !s.screenshot.startsWith("data:")) paths.add(s.screenshot);
        if (s.screenshotSecondary && !s.screenshotSecondary.startsWith("data:"))
          paths.add(s.screenshotSecondary);
      }
    }
    preloadImages(Array.from(paths)).finally(() => setReady(true));
  }, [hydrated, state.slidesByDevice, state.appIcon]);

  // ---------- Mutations ----------

  const patchSlide = (id: string, patch: Partial<Slide>) => {
    setState((prev) => ({
      ...prev,
      slidesByDevice: {
        ...prev.slidesByDevice,
        [prev.device]: (prev.slidesByDevice[prev.device] || []).map((s) =>
          s.id === id ? { ...s, ...patch } : s,
        ),
      },
    }));
  };

  const reorderSlides = (next: Slide[]) => {
    setState((prev) => ({
      ...prev,
      slidesByDevice: { ...prev.slidesByDevice, [prev.device]: next },
    }));
  };

  const deleteSlide = (id: string) => {
    setState((prev) => {
      const next = (prev.slidesByDevice[prev.device] || []).filter((s) => s.id !== id);
      return {
        ...prev,
        slidesByDevice: { ...prev.slidesByDevice, [prev.device]: next },
      };
    });
    if (activeSlideId === id) setActiveSlideId(null);
  };

  const addSlide = (slide: Slide) => {
    setState((prev) => ({
      ...prev,
      slidesByDevice: {
        ...prev.slidesByDevice,
        [prev.device]: [...(prev.slidesByDevice[prev.device] || []), slide],
      },
    }));
    setActiveSlideId(slide.id);
  };

  // ---------- Export ----------

  const isTablet = state.device === "android-7" || state.device === "android-10";
  const currentSizes =
    isTablet && state.orientation === "landscape"
      ? EXPORT_SIZES_LANDSCAPE[state.device] || EXPORT_SIZES[state.device]
      : EXPORT_SIZES[state.device];

  async function exportAll() {
    const size = currentSizes[sizeIdx];
    if (!size) return;
    for (let i = 0; i < currentSlides.length; i++) {
      const slide = currentSlides[i];
      setExporting(`${i + 1}/${currentSlides.length}`);
      const el = exportRefs.current[slide.id];
      if (!el) continue;
      try {
        const dataUrl = await captureSlide(el, size.w, size.h);
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `${String(i + 1).padStart(2, "0")}-${slide.layout}-${state.device}-${state.locale}-${size.w}x${size.h}.png`;
        a.click();
        await new Promise((r) => setTimeout(r, 250));
      } catch (e) {
        console.error("Export failed for slide", slide.id, e);
      }
    }
    setExporting(null);
  }

  async function captureSlide(el: HTMLElement, w: number, h: number) {
    el.style.left = "0px";
    el.style.opacity = "1";
    el.style.zIndex = "-1";
    const opts = { width: w, height: h, pixelRatio: 1, cacheBust: true };
    // Double call — first warms up fonts/images, second produces clean output
    await toPng(el, opts);
    const dataUrl = await toPng(el, opts);
    el.style.left = "-9999px";
    el.style.opacity = "";
    el.style.zIndex = "";
    return dataUrl;
  }

  // ---------- Render ----------

  if (!hydrated || !ready) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading editor…</p>
      </div>
    );
  }

  const { cW, cH } = getCanvas(state.device, state.orientation);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <Toolbar
        appName={state.appName}
        setAppName={(v) => setState((p) => ({ ...p, appName: v }))}
        themeId={state.themeId}
        setThemeId={(v) => setState((p) => ({ ...p, themeId: v }))}
        locale={state.locale}
        setLocale={(v) => setState((p) => ({ ...p, locale: v }))}
        device={state.device}
        setDevice={(v) => setState((p) => ({ ...p, device: v }))}
        orientation={state.orientation}
        setOrientation={(v) => setState((p) => ({ ...p, orientation: v }))}
        sizeIdx={sizeIdx}
        setSizeIdx={setSizeIdx}
        onExport={exportAll}
        onReset={() => {
          if (confirm("Reset all slides to defaults? This will clear your edits.")) reset();
        }}
        exporting={exporting}
        savedAt={savedAt}
      />

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 shrink-0 border-r bg-card">
          <Sidebar
            slides={currentSlides}
            activeId={activeSlide?.id || null}
            device={state.device}
            orientation={state.orientation}
            theme={theme}
            appName={state.appName}
            appIcon={state.appIcon}
            onReorder={reorderSlides}
            onSelect={setActiveSlideId}
            onDelete={deleteSlide}
            onAdd={addSlide}
          />
        </aside>

        <main className="flex flex-1 items-stretch overflow-hidden">
          {activeSlide ? (
            <PreviewStage
              slide={activeSlide}
              device={state.device}
              orientation={state.orientation}
              theme={theme}
              appName={state.appName}
              appIcon={state.appIcon}
              onLabelChange={(v) => patchSlide(activeSlide.id, { label: v })}
              onHeadlineChange={(v) => patchSlide(activeSlide.id, { headline: v })}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              Add a slide to get started.
            </div>
          )}
        </main>

        <aside className="w-80 shrink-0 border-l bg-card">
          {activeSlide ? (
            <Inspector slide={activeSlide} onChange={(patch) => patchSlide(activeSlide.id, patch)} />
          ) : (
            <div className="flex h-full items-center justify-center p-4 text-sm text-muted-foreground">
              No slide selected
            </div>
          )}
        </aside>
      </div>

      {/* Off-screen export container — full-resolution canvases for html-to-image */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: -99999,
          top: 0,
          pointerEvents: "none",
          opacity: 0,
        }}
      >
        {currentSlides.map((slide) => (
          <div
            key={slide.id}
            ref={(el) => {
              exportRefs.current[slide.id] = el;
            }}
            style={{ width: cW, height: cH, position: "absolute", left: -99999, top: 0 }}
          >
            <SlideCanvas
              slide={slide}
              device={state.device}
              orientation={state.orientation}
              theme={theme}
              appName={state.appName}
              appIcon={state.appIcon}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
