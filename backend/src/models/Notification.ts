import { SupabaseClient } from '../supabase/SupabaseClient'

export class Notification {
  notifId: number
  message: string
  dateSent: Date
  status: string
  private static client = new SupabaseClientMock()

  constructor(params: { notifId: number; message: string; dateSent: Date; status: string }) {
    this.notifId = params.notifId
    this.message = params.message
    this.dateSent = params.dateSent
    this.status = params.status
  }

  async send(): Promise<{ ok: boolean }> {
    const result = await Notification.client.insert('notifications', {
      id: this.notifId,
      message: this.message,
      dateSent: this.dateSent.toISOString(),
      status: this.status
    })
    return { ok: result.ok }
  }

  async markAsRead(): Promise<{ ok: boolean; status: string }> {
    this.status = 'read'
    const result = await Notification.client.update('notifications', {
      id: this.notifId,
      status: this.status
    })
    return { ok: result.ok, status: this.status }
  }
}

