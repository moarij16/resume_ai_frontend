"use client"

import { Loader2Icon, UploadIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, type ReactNode } from "react"
import { toast } from "sonner"

import { FileDropzone } from "@/components/shared/file-dropzone"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import { useUploadResume } from "../hooks"
import { defaultResumeName, RESUME_ACCEPT, RESUME_MAX_BYTES } from "../schemas"

export function UploadResumeDialog({ trigger }: { trigger?: ReactNode }) {
  const router = useRouter()
  const upload = useUploadResume()
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState("")

  function reset() {
    setFile(null)
    setName("")
    upload.reset()
  }

  function handleFileChange(next: File | null) {
    setFile(next)
    if (next && !name) setName(defaultResumeName(next))
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!file) return
    upload.mutate(
      { file, name },
      {
        onSuccess: ({ ats_scan }) => {
          setOpen(false)
          reset()
          router.push(`/ats/${ats_scan.id}`)
        },
      }
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (upload.isPending) return
        setOpen(next)
        if (!next) reset()
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <UploadIcon data-icon="inline-start" /> Upload resume
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>Upload a resume</DialogTitle>
            <DialogDescription>
              We&apos;ll parse it and run an ATS scan automatically.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <FileDropzone
              accept={RESUME_ACCEPT}
              maxSize={RESUME_MAX_BYTES}
              file={file}
              onFileChange={handleFileChange}
              onReject={(message) => toast.error(message)}
              hint="PDF or DOCX, up to 5 MB"
              disabled={upload.isPending}
            />
            <Field>
              <FieldLabel htmlFor="resume-name">Name</FieldLabel>
              <Input
                id="resume-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Senior Frontend – 2026"
                maxLength={255}
                disabled={upload.isPending}
              />
              <FieldDescription>Defaults to the file name.</FieldDescription>
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button type="submit" disabled={!file || upload.isPending}>
              {upload.isPending ? (
                <>
                  <Loader2Icon className="animate-spin" data-icon="inline-start" /> Analysing…
                </>
              ) : (
                "Upload & scan"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
