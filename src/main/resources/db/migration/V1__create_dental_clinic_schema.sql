-- =====================================================
-- V1__create_dental_clinic_schema.sql
-- Schema completo para consultório odontológico
-- =====================================================

-- USERS (autenticação)
CREATE TABLE users (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(150)        NOT NULL,
    email       VARCHAR(150)        NOT NULL UNIQUE,
    password    VARCHAR(255)        NOT NULL,
    role        VARCHAR(30)         NOT NULL DEFAULT 'RECEPCIONISTA',
    active      BOOLEAN             NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP           NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP           NOT NULL DEFAULT NOW()
);

-- ESPECIALIDADES
CREATE TABLE specialties (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100)        NOT NULL UNIQUE,
    description TEXT,
    active      BOOLEAN             NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP           NOT NULL DEFAULT NOW()
);

-- DENTISTAS
CREATE TABLE dentists (
    id            BIGSERIAL PRIMARY KEY,
    user_id       BIGINT              REFERENCES users(id),
    name          VARCHAR(150)        NOT NULL,
    cro           VARCHAR(20)         NOT NULL UNIQUE,
    cro_state     VARCHAR(2)          NOT NULL,
    specialty_id  BIGINT              NOT NULL REFERENCES specialties(id),
    phone         VARCHAR(20),
    email         VARCHAR(150)        NOT NULL UNIQUE,
    active        BOOLEAN             NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP           NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP           NOT NULL DEFAULT NOW()
);

-- PACIENTES
CREATE TABLE patients (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(150)        NOT NULL,
    cpf             VARCHAR(14)         NOT NULL UNIQUE,
    birth_date      DATE                NOT NULL,
    gender          VARCHAR(20)         NOT NULL,
    phone           VARCHAR(20)         NOT NULL,
    email           VARCHAR(150),
    address_street  VARCHAR(200),
    address_number  VARCHAR(20),
    address_district VARCHAR(100),
    address_city    VARCHAR(100),
    address_state   VARCHAR(2),
    address_zip     VARCHAR(9),
    health_plan     VARCHAR(100),
    health_plan_number VARCHAR(50),
    allergies       TEXT,
    observations    TEXT,
    active          BOOLEAN             NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP           NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP           NOT NULL DEFAULT NOW()
);

-- TRATAMENTOS/PROCEDIMENTOS
CREATE TABLE treatments (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(150)        NOT NULL,
    description     TEXT,
    specialty_id    BIGINT              REFERENCES specialties(id),
    default_price   DECIMAL(10,2)       NOT NULL DEFAULT 0,
    duration_minutes INT                NOT NULL DEFAULT 30,
    active          BOOLEAN             NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP           NOT NULL DEFAULT NOW()
);

-- AGENDAMENTOS
CREATE TABLE appointments (
    id              BIGSERIAL PRIMARY KEY,
    patient_id      BIGINT              NOT NULL REFERENCES patients(id),
    dentist_id      BIGINT              NOT NULL REFERENCES dentists(id),
    treatment_id    BIGINT              REFERENCES treatments(id),
    scheduled_at    TIMESTAMP           NOT NULL,
    duration_minutes INT                NOT NULL DEFAULT 30,
    status          VARCHAR(30)         NOT NULL DEFAULT 'AGENDADO',
    notes           TEXT,
    created_by      BIGINT              REFERENCES users(id),
    created_at      TIMESTAMP           NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP           NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_appointment_status
        CHECK (status IN ('AGENDADO','CONFIRMADO','EM_ATENDIMENTO','CONCLUIDO','CANCELADO','NAO_COMPARECEU'))
);

-- PRONTUÁRIOS
CREATE TABLE medical_records (
    id              BIGSERIAL PRIMARY KEY,
    patient_id      BIGINT              NOT NULL REFERENCES patients(id),
    dentist_id      BIGINT              NOT NULL REFERENCES dentists(id),
    appointment_id  BIGINT              REFERENCES appointments(id),
    treatment_id    BIGINT              REFERENCES treatments(id),
    description     TEXT                NOT NULL,
    diagnosis       TEXT,
    prescription    TEXT,
    next_steps      TEXT,
    tooth_number    VARCHAR(10),
    price_charged   DECIMAL(10,2),
    created_at      TIMESTAMP           NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP           NOT NULL DEFAULT NOW()
);

-- PAGAMENTOS
CREATE TABLE payments (
    id                  BIGSERIAL PRIMARY KEY,
    patient_id          BIGINT              NOT NULL REFERENCES patients(id),
    appointment_id      BIGINT              REFERENCES appointments(id),
    medical_record_id   BIGINT              REFERENCES medical_records(id),
    amount              DECIMAL(10,2)       NOT NULL,
    discount            DECIMAL(10,2)       NOT NULL DEFAULT 0,
    total               DECIMAL(10,2)       NOT NULL,
    payment_method      VARCHAR(30)         NOT NULL,
    status              VARCHAR(20)         NOT NULL DEFAULT 'PENDENTE',
    paid_at             TIMESTAMP,
    notes               TEXT,
    created_at          TIMESTAMP           NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_payment_method
        CHECK (payment_method IN ('DINHEIRO','CARTAO_CREDITO','CARTAO_DEBITO','PIX','CONVENIO','BOLETO')),
    CONSTRAINT chk_payment_status
        CHECK (status IN ('PENDENTE','PAGO','CANCELADO','ESTORNADO'))
);

-- INDEXES
CREATE INDEX idx_appointments_patient   ON appointments(patient_id);
CREATE INDEX idx_appointments_dentist   ON appointments(dentist_id);
CREATE INDEX idx_appointments_date      ON appointments(scheduled_at);
CREATE INDEX idx_appointments_status    ON appointments(status);
CREATE INDEX idx_medical_records_patient ON medical_records(patient_id);
CREATE INDEX idx_medical_records_dentist ON medical_records(dentist_id);
CREATE INDEX idx_patients_cpf           ON patients(cpf);
CREATE INDEX idx_patients_name          ON patients(name);
CREATE INDEX idx_payments_patient       ON payments(patient_id);

-- SEED: Admin default user (senha: Admin@123)
INSERT INTO users (name, email, password, role)
VALUES ('Administrador', 'admin@dental.com',
        '$2a$12$YH4oFj9hHkm.xPxFQdwPxO3GQ8UUuS1xFV3O0aQVmFj2M.1WJQxMi',
        'ADMIN');

-- SEED: Especialidades básicas
INSERT INTO specialties (name, description) VALUES
    ('Clínica Geral', 'Atendimento odontológico geral'),
    ('Ortodontia', 'Correção dos dentes e maxilares'),
    ('Endodontia', 'Tratamento de canal'),
    ('Periodontia', 'Tratamento de gengiva'),
    ('Implantodontia', 'Implantes dentários'),
    ('Odontopediatria', 'Odontologia infantil'),
    ('Cirurgia Bucomaxilofacial', 'Cirurgias orais e maxilofaciais'),
    ('Estética Dental', 'Clareamento, laminados e facetas');

-- SEED: Tratamentos básicos
INSERT INTO treatments (name, specialty_id, default_price, duration_minutes) VALUES
    ('Consulta / Avaliação', 1, 150.00, 30),
    ('Limpeza (Profilaxia)', 1, 200.00, 45),
    ('Restauração Simples', 1, 300.00, 60),
    ('Extração Simples', 1, 250.00, 45),
    ('Tratamento de Canal (Molar)', 3, 1200.00, 120),
    ('Tratamento de Canal (Pré-molar)', 3, 900.00, 90),
    ('Clareamento a Laser', 8, 1500.00, 90),
    ('Aparelho Fixo (Manutenção)', 2, 250.00, 30),
    ('Implante Unitário', 5, 3500.00, 90),
    ('Raspagem Periodontal', 4, 400.00, 60);