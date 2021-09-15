import { store as storeInstance } from '../store';
import { AppViewLayout, StripeMemberTiers, RenewalPeriod, TimeInterval, Workspace, ProductPriceType } from './enums';

export interface AppConfig {
  plan: AppPlanConfig;
  fileExplorer: AppFileExplorerConfig;
  views: AppViewConfig[];
}

export interface AppPlanConfig {
  freePlanStorageLimit: number;
  maxStorageLimit: number;
  defaultFeatures: string[];
}
export interface AppFileExplorerConfig {
  recentsLimit: number;
}

export interface AppViewConfig {
  id: string;
  layout: AppViewLayout | string;
  path: string;
  exact: boolean;
  auth?: boolean;
}

type StoreType = typeof storeInstance;

export interface AppPlugin {
  install: (store: StoreType) => void;
}

export interface UserSettings {
  bucket: string;
  createdAt: Date;
  credit: number;
  email: string;
  lastname: string;
  mnemonic: string;
  name: string;
  privateKey: string;
  publicKey: string;
  registerCompleted: boolean;
  revocationKey: string;
  root_folder_id: number;
  userId: string;
  uuid: string;
  teams?: boolean;
}

export interface TeamsSettings {
  isAdmin: boolean;
  bucket: string;
  bridge_mnemonic: string;
  bridge_password: string;
  bridge_user: string;
  root_folder_id: number;
  total_members: number;
}

export interface DriveFolderData {
  bucket: string | null;
  color: string | null;
  createdAt: string;
  encrypt_version: string | null;
  icon: string | null;
  iconId: number | null;
  icon_id: number | null;
  id: number;
  isFolder: boolean;
  name: string;
  parentId: number;
  parent_id: number | null;
  updatedAt: string;
  userId: number;
  user_id: number;
}

export interface DriveFolderMetadataPayload {
  metadata: {
    itemName?: string;
    color?: string;
    icon?: string;
  };
}

export interface DriveFileData {
  bucket: string;
  createdAt: string;
  created_at: string;
  deleted: false;
  deletedAt: null;
  encrypt_version: string;
  fileId: string;
  folderId: number;
  folder_id: number;
  id: number;
  name: string;
  size: number;
  type: string;
  updatedAt: string;
}

export interface DriveFileMetadataPayload {
  metadata: { itemName?: string };
}

export type DriveItemData = DriveFileData & DriveFolderData;

export interface DriveItemPatch {
  name?: string;
}

export interface IFormValues {
  name: string;
  lastname: string;
  email: string;
  password: string;
  currentPassword: string;
  twoFactorCode: string;
  confirmPassword: string;
  acceptTerms: boolean;
  backupKey: string;
  createFolder: string;
  teamMembers: number;
}

export interface ProductMetadata {
  is_drive: boolean;
  is_teams: boolean;
  show: boolean;
  member_tier: keyof typeof StripeMemberTiers;
  simple_name: keyof typeof RenewalPeriod;
  size_bytes: string;
}

export interface ProductPriceData {
  id: string;
  name: string | null;
  amount: number;
  monthlyAmount: number;
  type: ProductPriceType;
  currency: string;
  recurring: ProductPriceRecurringData | null;
}

export interface ProductPriceRecurringData {
  aggregate_usage: string | null;
  interval: string;
  interval_count: number;
  trial_period_days: number;
  usage_type: string;
}

export interface ProductData {
  id: string;
  name: string;
  metadata: ProductMetadata;
  price: ProductPriceData;
  renewalPeriod: RenewalPeriod;
}

export type StoragePlan = {
  planId: string;
  productId: string;
  name: string;
  simpleName: string;
  paymentInterval: RenewalPeriod;
  price: string;
  isTeam: boolean;
  isLifetime: boolean;
  storageLimit: number;
};

export interface FolderPath {
  name: string;
  id: number;
}

export interface InfoInvitationsMembers {
  isMember: boolean;
  isInvitation: boolean;
  user: string;
}
