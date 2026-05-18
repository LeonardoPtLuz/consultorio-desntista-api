# 🦷 MyDental API — Consultório Odontológico

API RESTful para gestão de consultório odontológico, desenvolvida com **Java 21 + Spring Boot 4**, banco de dados **PostgreSQL** e documentação automática via **Swagger/OpenAPI**.

---
# Até a inplementação de auto-ping, para testar:

- Verificar se está hibernando: https://consultorio-desntista-api.onrender.com/
- Em seguida acessar: https://consultorio-frontend-p1e5.onrender.com
---

## 🛠️ Tecnologias

| Camada | Tecnologia |
|---|---|
| Linguagem | Java 21 |
| Framework | Spring Boot 4.0.5 |
| Banco de dados | PostgreSQL |
| ORM | Spring Data JPA / Hibernate |
| Migrations | Flyway |
| Segurança | Spring Security + JWT (jjwt 0.11.5) |
| Documentação | SpringDoc OpenAPI 3 (Swagger UI) |
| Validação | Spring Validation |
| Monitoramento | Spring Actuator |
| Build | Maven |
| IDE recomendada | IntelliJ IDEA |
| Utilitários | Lombok |

---

## ✅ Pré-requisitos

- Java 21+
- Maven 3.9+
- PostgreSQL 14+
- IntelliJ IDEA (recomendado)

---

## ⚙️ Configuração do ambiente

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/ConsultorioDentistaAPI.git
cd ConsultorioDentistaAPI
```

### 2. Configure o banco de dados PostgreSQL

Crie o banco de dados:

```sql
CREATE DATABASE consultorio_dental;
```

### 3. Configure o `application.properties` (ou `application.yml`)

```properties
# Banco de dados
spring.datasource.url=jdbc:postgresql://localhost:5432/consultorio_dental
spring.datasource.username=seu_usuario
spring.datasource.password=sua_senha
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=true

# Flyway
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration

# JWT
jwt.secret=sua_chave_secreta_aqui
jwt.expiration=86400000

# Swagger
springdoc.swagger-ui.path=/swagger-ui.html
```

> ⚠️ Nunca suba credenciais reais para o repositório. Use variáveis de ambiente ou um arquivo `.env` ignorado pelo `.gitignore`.

---

## ▶️ Rodando o projeto

### Pelo IntelliJ IDEA

1. Abra o projeto (`File > Open`)
2. Aguarde o Maven baixar as dependências
3. Localize a classe principal `ConsultorioDentistaApiApplication`
4. Clique com o botão direito → **Run**

### Pelo terminal

```bash
mvn spring-boot:run
```

### Gerando o JAR

```bash
mvn clean package
java -jar target/ConsultorioDentistaAPI-0.0.1-SNAPSHOT.jar
```

---

## 📖 Documentação da API (Swagger)

Com a aplicação rodando, acesse:

```
http://localhost:8080/swagger-ui.html
```

Todos os endpoints estão documentados e podem ser testados diretamente pela interface.

---

## 🔐 Autenticação

A API utiliza **JWT (JSON Web Token)**. Para acessar os endpoints protegidos:

1. Faça login no endpoint `POST /auth/login` com suas credenciais
2. Copie o token retornado
3. No Swagger, clique em **Authorize** e insira: `Bearer {seu_token}`

---

## 🗃️ Migrations (Flyway)

As migrations ficam em `src/main/resources/db/migration/` e são executadas automaticamente ao iniciar a aplicação. O padrão de nomenclatura é:

```
V1__descricao_da_migration.sql
V2__outra_descricao.sql
```

---

## 📦 Estrutura do projeto

```
src/
├── main/
│   ├── java/com/example/MyDentalAPI/
│   │   ├── config/          # Configurações (Security, Swagger, etc.)
│   │   ├── controller/      # Controllers REST
│   │   ├── dto/             # Objetos de transferência de dados
│   │   ├── model/           # Entidades JPA
│   │   ├── repository/      # Repositórios Spring Data
│   │   ├── service/         # Regras de negócio
│   │   └── security/        # JWT e filtros de segurança
│   └── resources/
│       ├── db/migration/    # Scripts Flyway
│       └── application.properties
└── test/
    └── java/com/example/MyDentalAPI/
```

---

## 🌐 Frontend

O frontend é desenvolvido com **React + Vite + TypeScript**

Acessor o frontend

1. Com o prompt na raíz do projeto: \ConsultorioDentistaAPI, digite cd consultorio-frontend para acessar
2. Em seguida digite pra rodar o frontend: npm run dev

---

## 🤝 Contribuindo

1. Crie uma branch: `git checkout -b feature/minha-feature`
2. Faça seus commits: `git commit -m 'feat: minha nova feature'`
3. Envie para o repositório: `git push origin feature/minha-feature`
4. Abra um Pull Request

---

## 🚧 Roadmap / Próximas melhorias

-  Auto-ping preiódico para evitar hibernação da API
-  Campo "tratamento" exibir o que foi registrado em especialidade
-  Exibir valor total do serviço na seção de pagamentos
-  Valor atualizado automaticamente conforme pagamentos realizados

---