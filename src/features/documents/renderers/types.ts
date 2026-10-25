/** Contract every document renderer implements (Liskov: any renderer can replace another). */
export interface DocumentRendererProps {
  content: string
}
