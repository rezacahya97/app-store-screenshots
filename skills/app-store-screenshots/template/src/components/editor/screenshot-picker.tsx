"use client";
import * as React from "react";
import { Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setImage } from "@/lib/image-cache";

type Props = {
  label: string;
  value: string;
  onChange: (v: string) => void;
};

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ScreenshotPicker({ label, value, onChange }: Props) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);

  async function handleFile(file: File) {
    const dataUrl = await fileToDataUrl(file);
    setImage(dataUrl, dataUrl);
    onChange(dataUrl);
  }

  return (
    <div
      className={`flex items-center gap-2 rounded-md border ${dragging ? "border-primary bg-accent" : "border-input"} p-2 transition-colors`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={async (e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith("image/")) await handleFile(file);
      }}
    >
      <ImageIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-xs font-medium">{label}</span>
        <span className="truncate text-[10px] text-muted-foreground">
          {value
            ? value.startsWith("data:")
              ? "uploaded image"
              : value
            : "drop or click to upload"}
        </span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) await handleFile(file);
          e.currentTarget.value = "";
        }}
      />
      <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
        Pick
      </Button>
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onChange("")}
          aria-label="Clear screenshot"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
