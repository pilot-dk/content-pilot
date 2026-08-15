import type { IncomingMessage, ServerResponse } from 'node:http'

// Minimal local stand-ins for @vercel/node's request/response augmentations,
// so we don't need that package (and its heavier, more vulnerable build-tool
// dependency tree) as a dependency just for two type aliases. Vercel's Node
// runtime adds these properties at runtime regardless of this package.
export interface VercelRequest extends IncomingMessage {
  query: Record<string, string | string[]>
  cookies: Record<string, string>
  body: unknown
}

export interface VercelResponse extends ServerResponse {
  status(code: number): VercelResponse
  json(body: unknown): void
  send(body: unknown): void
}
