# Etapa de build
FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /app

# Copia os arquivos do projeto
COPY pom.xml .
COPY src ./src

# Gera o .jar da aplicação
RUN mvn clean package -DskipTests

# Etapa de execução
FROM eclipse-temurin:21-jdk

WORKDIR /app

# Copia o .jar gerado
COPY --from=build /app/target/*.jar app.jar

# Porta usada pela Render
ENV PORT=8080

EXPOSE 8080

# Inicia a aplicação
ENTRYPOINT ["java", "-jar", "app.jar"]