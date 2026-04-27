// src/types/index.ts

// ==================== AUTH ====================
export interface User {
  id?: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'DENTISTA' | 'RECEPCIONISTA';
  active?: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  role: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// ==================== PATIENT ====================
export interface Patient {
  id: number;
  name: string;
  cpf: string;
  birthDate: string;           // LocalDate → string no JSON
  gender: 'MASCULINO' | 'FEMININO' | 'OUTRO' | 'NAO_INFORMADO';
  phone: string;
  email?: string;
  addressStreet?: string;
  addressNumber?: string;
  addressDistrict?: string;
  addressCity?: string;
  addressState?: string;
  addressZip?: string;
  healthPlan?: string;
  healthPlanNumber?: string;
  allergies?: string;
  observations?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ==================== DENTIST ====================
export interface Dentist {
  id: number;
  name: string;
  cro: string;
  croState: string;
  specialty: Specialty;        // ou apenas { id: number; name: string }
  phone?: string;
  email: string;
  active: boolean;
  user?: User;
  createdAt?: string;
  updatedAt?: string;
}

// ==================== SPECIALTY ====================
export interface Specialty {
  id: number;
  name: string;
  description?: string;
  active: boolean;
  createdAt?: string;
}

// ==================== TREATMENT ====================
export interface Treatment {
  id: number;
  name: string;
  description?: string;
  specialty?: Specialty;
  defaultPrice: number;
  durationMinutes: number;
  active: boolean;
  createdAt?: string;
}

// ==================== APPOINTMENT ====================
export interface Appointment {
  id: number;
  patient: Patient;
  dentist: Dentist;
  treatment?: Treatment;
  scheduledAt: string;         // LocalDateTime → string ISO
  durationMinutes: number;
  status: 'AGENDADO' | 'CONFIRMADO' | 'EM_ATENDIMENTO' | 'CONCLUIDO' | 'CANCELADO' | 'NAO_COMPARECEU';
  notes?: string;
  createdBy?: User;
  createdAt?: string;
  updatedAt?: string;
}

// ==================== MEDICAL RECORD ====================
export interface MedicalRecord {
  id: number;
  patient: Patient;
  dentist: Dentist;
  appointment?: Appointment;
  treatment?: Treatment;
  description: string;
  diagnosis?: string;
  prescription?: string;
  nextSteps?: string;
  toothNumber?: string;
  priceCharged?: number;
  createdAt?: string;
  updatedAt?: string;
}

// ==================== PAYMENT ====================
export interface Payment {
  id: number;
  patient: Patient;
  appointment?: Appointment;
  medicalRecord?: MedicalRecord;
  amount: number;
  discount: number;
  total: number;
  paymentMethod: 'DINHEIRO' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'PIX' | 'CONVENIO' | 'BOLETO';
  status: 'PENDENTE' | 'PAGO' | 'CANCELADO' | 'ESTORNADO';
  paidAt?: string;
  notes?: string;
  createdAt: string;
}

// ==================== DASHBOARD ====================
export interface DashboardSummary {
  totalPatients: number;
  activeDentists: number;
  appointmentsToday: number;
  pendingAppointments: number;
  monthlyRevenue: number;
  cancelledThisMonth: number;
  generatedAt: string;
}

// ==================== REQUESTS (para forms) ====================
export interface PatientRequest {
  name: string;
  cpf: string;
  birthDate: string;
  gender: 'MASCULINO' | 'FEMININO' | 'OUTRO' | 'NAO_INFORMADO';
  phone: string;
  email?: string;
  addressStreet?: string;
  addressNumber?: string;
  addressDistrict?: string;
  addressCity?: string;
  addressState?: string;
  addressZip?: string;
  healthPlan?: string;
  healthPlanNumber?: string;
  allergies?: string;
  observations?: string;
}

export interface AppointmentRequest {
  patientId: number;
  dentistId: number;
  treatmentId?: number;
  scheduledAt: string;
  durationMinutes?: number;
  notes?: string;
}

export interface DentistRequest {
  name: string;
  cro: string;
  croState: string;
  specialtyId: number;
  phone?: string;
  email: string;
  userId?: number;
}

export interface MedicalRecordRequest {
  patientId: number;
  dentistId: number;
  appointmentId?: number;
  treatmentId?: number;
  description: string;
  diagnosis?: string;
  prescription?: string;
  nextSteps?: string;
  toothNumber?: string;
  priceCharged?: number;
}

export interface PaymentRequest {
  patientId: number;
  appointmentId?: number;
  medicalRecordId?: number;
  amount: number;
  discount?: number;
  paymentMethod: 'DINHEIRO' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'PIX' | 'CONVENIO' | 'BOLETO';
  notes?: string;
}