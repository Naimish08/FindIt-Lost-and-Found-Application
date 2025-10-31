import { SupabaseClientMock } from '../supabase/SupabaseClient'

export class LostItemPost {
  postID: number
  description: string
  location: string
  images: string[]
  datePosted: Date
  private static client = new SupabaseClientMock()

  constructor(params: { postID: number; description: string; location: string; images: string[]; datePosted: Date }) {
    this.postID = params.postID
    this.description = params.description
    this.location = params.location
    this.images = params.images
    this.datePosted = params.datePosted
  }

  createPost(): number {
    return this.postID
  }

  async editPost(): Promise<{ ok: boolean }> {
    const result = await LostItemPost.client.update('posts', {
      id: this.postID,
      description: this.description,
      location: this.location,
      images: this.images
    })
    return { ok: result.ok }
  }

  async deletePost(): Promise<boolean> {
    const result = await LostItemPost.client.delete('posts', { id: this.postID })
    return result.ok
  }

  static async searchItem(query: { q: string }): Promise<number> {
    const result = await LostItemPost.client.select('posts', query)
    return Array.isArray(result.data) ? result.data.length : 0
  }
}

