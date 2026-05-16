import type { Device, ProjectState, Slide } from "./types";

let _id = 0;
const nid = () => `s_${Date.now().toString(36)}_${(_id++).toString(36)}`;

function makeStarterSlides(platform: "ios" | "android"): Slide[] {
  const folder = platform === "ios" ? "apple/iphone" : "android/phone";
  return [
    {
      id: nid(),
      layout: "hero",
      label: "MEET YOUR APP",
      headline: "Sell one\nidea per slide.",
      screenshot: `/screenshots/${folder}/en/01.png`,
    },
    {
      id: nid(),
      layout: "device-bottom",
      label: "FEATURE 01",
      headline: "Your headline\nlives here.",
      screenshot: `/screenshots/${folder}/en/02.png`,
    },
    {
      id: nid(),
      layout: "two-devices",
      label: "FEATURE 02",
      headline: "Show two\nscreens at once.",
      screenshot: `/screenshots/${folder}/en/03.png`,
      screenshotSecondary: `/screenshots/${folder}/en/04.png`,
    },
    {
      id: nid(),
      layout: "device-top",
      label: "FEATURE 03",
      headline: "Flip the contrast\nfor visual rhythm.",
      screenshot: `/screenshots/${folder}/en/05.png`,
      inverted: true,
    },
    {
      id: nid(),
      layout: "no-device",
      label: "MORE",
      headline: "And so\nmuch more.",
      screenshot: "",
    },
  ];
}

function ipadStarter(): Slide[] {
  return [
    {
      id: nid(),
      layout: "hero",
      label: "MEET YOUR APP",
      headline: "Made for\nthe big screen.",
      screenshot: "/screenshots/apple/ipad/en/01.png",
    },
  ];
}

function fgStarter(): Slide[] {
  return [
    {
      id: nid(),
      layout: "feature-graphic",
      label: "",
      headline: "Your tagline goes here.",
      screenshot: "",
    },
  ];
}

export const DEFAULT_PROJECT: ProjectState = {
  appName: "My App",
  tagline: "Your tagline here.",
  themeId: "clean-light",
  locale: "en",
  device: "iphone",
  orientation: "portrait",
  appIcon: "/app-icon.png",
  slidesByDevice: {
    iphone: makeStarterSlides("ios"),
    android: makeStarterSlides("android"),
    ipad: ipadStarter(),
    "android-7": [],
    "android-10": [],
    "feature-graphic": fgStarter(),
  },
};

export function newSlide(layout: Slide["layout"] = "device-bottom"): Slide {
  return {
    id: nid(),
    layout,
    label: "NEW",
    headline: "Edit this\nheadline.",
    screenshot: "",
  };
}

export const PLATFORM_TO_DEFAULT_DEVICE: Record<"ios" | "android", Device> = {
  ios: "iphone",
  android: "android",
};

export function detectPlatform(device: Device): "ios" | "android" {
  return device === "iphone" || device === "ipad" ? "ios" : "android";
}
