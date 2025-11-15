/**
 * Health Record Types
 *
 * TypeScript type definitions for the health_records database table.
 * Story: 3.1 - Create Health Record Database Schema
 * Date: 2025-11-15
 */

// Health record types enum
export type HealthRecordType =
  | 'vaccine'
  | 'medication'
  | 'vet_visit'
  | 'symptom'
  | 'weight_check'

// Type-specific data interfaces
export interface VaccineData {
  expiration_date?: string | null
  vet_clinic?: string | null
  dose?: string | null
}

export interface MedicationData {
  dosage?: string | null
  frequency?: string | null
  start_date?: string | null
  end_date?: string | null
}

export interface VetVisitData {
  clinic?: string | null
  vet_name?: string | null
  diagnosis?: string | null
  treatment?: string | null
  cost?: number | null
}

export interface SymptomData {
  severity?: 'mild' | 'moderate' | 'severe' | null
  observed_behaviors?: string | null
}

export interface WeightData {
  weight?: number | null
  unit?: 'kg' | 'lbs' | null
  body_condition?: string | null
}

// Base health record interface
export interface BaseHealthRecord {
  id: string
  pet_id: string
  user_id: string
  record_type: HealthRecordType
  title: string
  date: string
  notes?: string | null
  created_at: string
  updated_at: string
}

// Complete health record with all type-specific data fields
export type HealthRecord = BaseHealthRecord & {
  vaccine_data?: VaccineData
  medication_data?: MedicationData
  vet_visit_data?: VetVisitData
  symptom_data?: SymptomData
  weight_data?: WeightData
}

// Type guards for checking record type
export function isVaccineRecord(record: HealthRecord): record is HealthRecord & { vaccine_data: VaccineData } {
  return record.record_type === 'vaccine'
}

export function isMedicationRecord(record: HealthRecord): record is HealthRecord & { medication_data: MedicationData } {
  return record.record_type === 'medication'
}

export function isVetVisitRecord(record: HealthRecord): record is HealthRecord & { vet_visit_data: VetVisitData } {
  return record.record_type === 'vet_visit'
}

export function isSymptomRecord(record: HealthRecord): record is HealthRecord & { symptom_data: SymptomData } {
  return record.record_type === 'symptom'
}

export function isWeightCheckRecord(record: HealthRecord): record is HealthRecord & { weight_data: WeightData } {
  return record.record_type === 'weight_check'
}

// Database insert type (without auto-generated fields)
export type HealthRecordInsert = Omit<HealthRecord, 'id' | 'created_at' | 'updated_at'>

// Database update type (partial fields, excluding immutable fields)
export type HealthRecordUpdate = Partial<Omit<HealthRecord, 'id' | 'pet_id' | 'user_id' | 'created_at' | 'updated_at'>>
