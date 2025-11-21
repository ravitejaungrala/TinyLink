import { z } from 'zod'

export const linkSchema = z.object({
  target_url: z.string().url('Please enter a valid URL'),
  code: z.string().regex(/^[A-Za-z0-9]{6,8}$/, 'Code must be 6-8 alphanumeric characters').optional()
})

export type Link = {
  id: number
  code: string
  target_url: string
  clicks: number
  last_clicked: string | null
  created_at: string
}

export type CreateLinkInput = {
  target_url: string
  code?: string
}