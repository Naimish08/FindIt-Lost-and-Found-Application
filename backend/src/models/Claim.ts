import { SupabaseClient } from '../supabase/SupabaseClient'

export class Claim {
  claimId: number
  claimDetails: string
  claimStatus: string
  dateClaimed: Date
  private static client = new SupabaseClientMock()

  constructor(params: { claimId: number; claimDetails: string; claimStatus: string; dateClaimed: Date }) {
    this.claimId = params.claimId
    this.claimDetails = params.claimDetails
    this.claimStatus = params.claimStatus
    this.dateClaimed = params.dateClaimed
  }

  async submitClaim(): Promise<boolean> {
    const result = await Claim.client.insert('claims', {
      id: this.claimId,
      details: this.claimDetails,
      status: this.claimStatus,
      dateClaimed: this.dateClaimed.toISOString()
    })
    return result.ok
  }
}

