export interface User {
  userID?: number;
  username: string;
  email: string;
  // password is managed by Supabase Auth, not stored in database
  profilePicture?: string;
}

export interface LostItemPost {
  postID?: number;
  userID: number;
  description: string;
  location: string;
  images: string[];
  datePosted?: Date;
}

export interface Claim {
  claimID?: number;
  userID: number;
  postID: number;
  claimDetails: string;
  claimStatus: string;
  dateClaimed?: Date;
}

export interface Notification {
  notifID?: number;
  userID: number;
  message: string;
  dateSent?: Date;
  status: string;
}
