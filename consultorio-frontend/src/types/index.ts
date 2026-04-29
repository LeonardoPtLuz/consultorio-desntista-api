export interface DashboardSummary {
  totalPatients: number;
  activeDentists: number;
  appointmentsToday: number;
  pendingAppointments: number;
  monthlyRevenue: number;
  cancelledThisMonth: number;
  generatedAt: string;
}

export interface Patient {
  id: number;
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
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Specialty {
  id: number;
  name: string;
  description?: string;
  active: boolean;
  createdAt: string;
}

export interface Dentist {
  id: number;
  name: string;
  cro: string;
  croState: string;
  specialty: Specialty;
  phone?: string;
  email: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Treatment {
  id: number;
  name: string;
  description?: string;
  specialty: Specialty;
  defaultPrice: number;
  durationMinutes: number;
  active: boolean;
}

export type AppointmentStatus =
  | 'AGENDADO'
  | 'CONFIRMADO'
  | 'EM_ATENDIMENTO'
  | 'CONCLUIDO'
  | 'CANCELADO'
  | 'NAO_COMPARECEU';

export interface Appointment {
  id: number;
  patient: Patient;
  dentist: Dentist;
  treatment?: Treatment;
  scheduledAt: string;
  durationMinutes: number;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type PaymentMethod =
  | 'DINHEIRO'
  | 'CARTAO_CREDITO'
  | 'CARTAO_DEBITO'
  | 'PIX'
  | 'CONVENIO'
  | 'BOLETO';

export type PaymentStatus = 'PENDENTE' | 'PAGO' | 'CANCELADO' | 'ESTORNADO';

export interface Payment {
  id: number;
  patient: Patient;
  appointment?: Appointment;
  amount: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  paidAt?: string;
  notes?: string;
  createdAt: string;
}

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
  createdAt: string;
  updatedAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}