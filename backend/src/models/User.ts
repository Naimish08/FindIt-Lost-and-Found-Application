import { SupabaseClientMock } from '../supabase/SupabaseClient'

export class User {
  userID: number
  username: string
  email: string
  password: string
  profilePicture: string
  private static client = new SupabaseClientMock()

  constructor(params: { userID: number; username: string; email: string; password: string; profilePicture: string }) {
    this.userID = params.userID
    this.username = params.username
    this.email = params.email
    this.password = params.password
    this.profilePicture = params.profilePicture
  }

  async register(): Promise<number> {
    await User.client.insert('users', {
      id: this.userID,
      username: this.username,
      email: this.email,
      profilePicture: this.profilePicture
    })
    return this.userID
  }

  async login(): Promise<boolean> {
    const result = await User.client.select('users', { email: this.email })
    return result.ok
  }

  async logout(): Promise<boolean> {
    return true
  }

  async updateProfile(): Promise<boolean> {
    const result = await User.client.update('users', {
      id: this.userID,
      username: this.username,
      profilePicture: this.profilePicture
    })
    return result.ok
  }
}

