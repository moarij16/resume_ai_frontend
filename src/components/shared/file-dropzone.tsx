"use client"

import { FileTextIcon, UploadCloudIcon, XIcon } from "lucide-react"
import { useDropzone, type Accept, type FileRejection } from "react-dropzone"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FileDropzoneProps {
  accept: Accept
  maxSize: number
  file: File | null
  onFileChange: (file: File | null) => void
  onReject?: (message: string) => void
  hint?: string
  disabled?: boolean
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function rejectionMessage([rejection]: FileRejection[], maxSize: number) {
  const code = rejection?.errors[0]?.code
  if (code === "file-too-large") return `File is larger than ${formatBytes(maxSize)}.`
  if (code === "file-invalid-type") return "Unsupported file type."
  return rejection?.errors[0]?.message ?? "That file can't be used."
}

export function FileDropzone({
  accept,
  maxSize,
  file,
  onFileChange,
  onReject,
  hint,
  disabled,
}: FileDropzoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    maxSize,
    multiple: false,
    disabled,
    onDropAccepted: ([accepted]) => onFileChange(accepted ?? null),
    onDropRejected: (rejections) => onReject?.(rejectionMessage(rejections, maxSize)),
  })

  if (file) {
    return (
      <div className="bg-muted/40 flex items-center gap-3 rounded-lg border p-4">
        <FileTextIcon className="text-primary size-8 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{file.name}</p>
          <p className="text-muted-foreground text-xs">{formatBytes(file.size)}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Remove file"
          disabled={disabled}
          onClick={() => onFileChange(null)}
        >
          <XIcon />
        </Button>
      </div>
    )
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "focus-visible:ring-ring/50 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors outline-none focus-visible:ring-3",
        isDragActive ? "border-primary bg-primary/5" : "hover:border-primary/50 hover:bg-muted/40",
        disabled && "pointer-events-none opacity-50"
      )}
    >
      <input {...getInputProps()} />
      <UploadCloudIcon className="text-muted-foreground size-8" />
      <p className="text-sm font-medium">
        {isDragActive ? "Drop the file here" : "Drag & drop a file, or click to browse"}
      </p>
      {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
    </div>
  )
}
