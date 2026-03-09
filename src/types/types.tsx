// ===============================
// Global Utility Types
// ===============================

export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type WithId<T> = T & { id: string }

// ===============================
// API Response Types
// ===============================

export interface ApiResponse<T> {
  data: T
  error?: string
  status: number
}

// Example: Paginated API response
export interface Paginated<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
}

// ===============================
// Domain Models
// ===============================

export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
  createdAt: string
}

export interface Product {
  id: string
  title: string
  price: number
  description?: string
  imageUrl?: string
  inStock: boolean
}

// ===============================
// Component Props
// ===============================

export interface ButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
  variant?: "primary" | "secondary" | "danger"
}

export interface CardProps {
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
}

// ===============================
// Form Types
// ===============================

export interface LoginFormValues {
  email: string
  password: string
}

export interface RegisterFormValues extends LoginFormValues {
  name: string
}
// Allow importing image assets
declare module "*.png" {
  const value: string;
  export default value;
}

declare module "*.jpg" {
  const value: string;
  export default value;
}

declare module "*.jpeg" {
  const value: string;
  export default value;
}

declare module "*.gif" {
  const value: string;
  export default value;
}

declare module "*.svg" {
  import * as React from "react";
  const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;
  export default ReactComponent;
}
