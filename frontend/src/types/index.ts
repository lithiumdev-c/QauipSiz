/* Domain types mirroring the backend Pydantic schemas exactly. */

export interface User {
  id: number
  email: string
  username: string
}

export interface AdminUser {
  id: number
  username: string
  email: string
  role: string
  created_at: string
}

export interface MeDepartment {
  id: number
  name: string
}

export interface MeOrganization {
  id: number
  name: string
  country: string
}

export interface MeMembership {
  id: number
  role: string
  status: string
  department: MeDepartment | null
}

export interface Me {
  id: number
  username: string
  email: string
  role: 'user' | 'platform_admin' | string
  organization: MeOrganization | null
  membership: MeMembership | null
  created_at: string
}

export interface LoginResponse {
  access_token: string
  token_type: 'bearer'
}

export interface Organization {
  id: number
  name: string
  country: string
}

export interface OrganizationRequestUser {
  id: number
  username: string
  email: string
}

export interface OrganizationRequest {
  id: number
  user_id: number
  name: string
  country: string
  description: string | null
  status: 'pending' | 'approved' | 'rejected' | string
  created_at: string
  user: OrganizationRequestUser | null
}

export interface OrganizationRequestCreate {
  name: string
  country: string
  description?: string | null
}

export interface OrganizationMember {
  id: number
  user_id: number
  organization_id: number
  department_id: number | null
  role: string
  status: string
}

export interface OrganizationMemberCreate {
  user_id: number
  organization_id: number
  department_id?: number | null
}

export interface Department {
  id: number
  name: string
  organization_id: number
}

export interface Case {
  id: number
  organization_id: number
  department_id: number
  created_by: number
  title: string
  description: string | null
  type: string
  status: string
}
export interface CaseCreate {
  title: string
  description?: string | null
}

export interface CaseUpdate {
  title?: string
  description?: string | null
  type?: string
  status?: string
}

export interface Person {
  id: number
  case_id: number
  name: string
  date_of_birth: string | null
  description: string | null
  photo_url: string | null
}

export interface PersonCreate {
  name: string
  date_of_birth?: string | null
  description?: string | null
}

export interface Video {
  id: number
  case_id: number
  uploaded_by: number
  file_path: string
  status: 'uploaded' | 'processing' | 'completed' | 'failed' | string
  duration: number | null
}

export interface Detection {
  id: number
  video_id: number
  timestamp: number
  confidence: number
  x1: number
  y1: number
  x2: number
  y2: number
}

export interface Match {
  id: number
  video_id: number
  person_id: number
  timestamp: number
  similarity: number
  frame_url: string
  status: 'pending_review' | 'confirmed' | 'rejected' | string
}

export interface MatchStatusUpdate {
  status: 'pending_review' | 'confirmed' | 'rejected'
}

export interface SignedUrl {
  url: string
}

export interface MsgResponse {
  msg: string
}
