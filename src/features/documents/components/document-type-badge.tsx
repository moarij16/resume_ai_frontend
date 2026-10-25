import { Badge } from "@/components/ui/badge"
import type { DocumentType } from "@/types/api"

import { DOCUMENT_TYPES } from "../registry"

export function DocumentTypeBadge({ type }: { type: DocumentType }) {
  const { icon: Icon, label } = DOCUMENT_TYPES[type]
  return (
    <Badge variant="secondary">
      <Icon data-icon="inline-start" />
      {label}
    </Badge>
  )
}
