export type College = {
  id: string;
  name: string;
  email_domain: string;
  is_active: boolean;
  created_at: string;
};

export type User = {
  id: string;
  college_id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string | null;
  phone: string | null;
  instagram: string | null;
  created_at: string;
  college?: College;
};

export type Category = "textbooks" | "electronics" | "furniture" | "clothes" | "other";
export type Condition = "new" | "like_new" | "good" | "used";
export type ListingStatus = "active" | "sold" | "archived" | "deleted";

export type ListingPhoto = {
  id: string;
  listing_id: string;
  storage_url: string;
  order_index: number;
};

export type Listing = {
  id: string;
  user_id: string;
  college_id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  category: Category;
  condition: Condition;
  status: ListingStatus;
  views_count: number;
  expires_at: string;
  created_at: string;
  updated_at: string;
  listing_photos?: ListingPhoto[];
  seller?: User;
  saves_count?: number;
  is_saved?: boolean;
};

export type Message = {
  id: string;
  listing_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: User;
  receiver?: User;
};

export type Conversation = {
  listing_id: string;
  listing: Listing;
  other_user: User;
  last_message: Message;
  unread_count: number;
};

export type SavedListing = {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
  listing?: Listing;
};

export type Waitlist = {
  id: string;
  email: string;
  college_name: string;
  created_at: string;
};

export type ApiResponse<T = unknown> = {
  data?: T;
  error?: string;
  message?: string;
};
