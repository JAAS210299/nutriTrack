# NutriTrack — Sistema Integral de Seguimiento Nutricional

Bienvenido a la documentación oficial de **NutriTrack**, una plataforma moderna, robusta y desacoplada diseñada para la gestión personalizada de la nutrición, control calórico y seguimiento de objetivos físicos. 

Este repositorio unifica el ecosistema completo: un cliente enriquecido (Single Page Application), una API REST robusta basada en microservicios lógicos y una infraestructura completamente contenedorizada.

---

## Índice
1. [Resumen General del Proyecto](#1-resumen-general-del-proyecto)
2. [Arquitectura de Software y Stack Tecnológico](#2-arquitectura-de-software-y-stack-tecnológico)
3. [Arquitectura y Módulos del Backend (NestJS)](#3-arquitectura-y-módulos-del-backend-nestjs)
4. [Arquitectura del Frontend (Angular SPA)](#4-arquitectura-del-frontend-angular-spa)
5. [Capa de Persistencia (Base de Datos)](#5-capa-de-persistencia-base-de-datos)
6. [Estrategia de Despliegue e Infraestructura (Docker)](#6-estrategia-de-despliegue-e-infraestructura-docker)
7. [Guía del Usuario (Manual Operativo)](#7-guía-del-usuario-manual-operativo)
8. [Instalación y Puesta en Marcha](#8-instalación-y-puesta-en-marcha)

---

## 1. Resumen General del Proyecto
**NutriTrack** permite a los usuarios finales tomar el control de su salud mediante el registro meticuloso de alimentos, cálculo automatizado de macronutrientes (proteínas, carbohidratos, grasas) y ponderación de objetivos de acondicionamiento físico. 

El sistema gestiona perfiles biométricos avanzados, evalúa las tasas metabólicas basales basándose en las metas configuradas (pérdida de peso, mantenimiento o superávit calórico para ganancia muscular) y genera métricas e historiales visuales del progreso diario.

---

## 2. Arquitectura de Software y Stack Tecnológico
La solución implementa una arquitectura **Cliente-Servidor totalmente desacoplada** a través de servicios aislados en contenedores virtuales:

```
[ Capa de Presentación ]      [ Capa de Negocio ]       [ Capa de Persistencia ]
     Angular SPA                  NestJS API                 PostgreSQL
   (Puerto 80/4200)   <=======>  (Puerto 3000)   <=======>  (Puerto 5432)
          |                           |
          +---- (Proxy / Caddy) ------+
```

*   **Frontend:** `Angular` utilizando TypeScript, componentes reactivos, RxJS para el flujo de datos y arquitectura orientada a servicios.
*   **Backend:** `NestJS` sobre Node.js, implementando patrones de Inyección de Dependencias (DI), programación modular y tipado estricto.
*   **Base de Datos:** `PostgreSQL` para almacenamiento relacional, consistencia transaccional e integridad de datos.
*   **Servidor Web/Proxy:** `Caddy Server` / `Nginx` para balanceo, proxy inverso y entrega eficiente de estáticos.

---

## 3. Arquitectura y Módulos del Backend (NestJS)
El código del servidor reside en `backend/src/` y está segregado en módulos altamente cohesivos guiados por dominio:

*   **`Auth` (Autenticación):** Controla el registro de usuarios, hash de contraseñas, e inicio de sesión seguro emitiendo tokens firmados digitalmente de tipo **JWT** (`jwt.strategy.ts`, `login.dto.ts`). Protege endpoints mediante interceptores y guardias dedicados (`roles.guard.ts`).
*   **`Foods` (Alimentos):** Administra el catálogo global y personalizado de alimentos, conteniendo información nutricional detallada por porción estándar (Kcal, proteínas, carbohidratos, grasas).
*   **`Goals` (Metas):** Gestiona los hitos biométricos de cada perfil (peso objetivo, fecha límite y límites macro-nutricionales dinámicos).
*   **`Nutrition` (Registros Diarios):** El núcleo del diario nutricional. Vincula la ingesta de alimentos específicos con horas, fechas y porciones consumidas por el usuario (`daily-log.entity.ts`, `log-entry.entity.ts`).
*   **`Users` (Usuarios):** Mapea los datos del perfil del usuario, roles de acceso (`User` / `Admin`) e historial clínico/biométrico elemental.
*   **`Mail` (Notificaciones):** Servicio asíncrono para el envío de correos transaccionales (como la recuperación de claves y alertas de sistema).

---

## 4. Arquitectura del Frontend (Angular SPA)
Ubicado en `frontend/src/app/`, el cliente está estructurado de manera modular para optimizar los tiempos de carga y la separación de conceptos:

*   **Módulos de Componentes:**
    *   `auth/`: Vistas de acceso, validación de contraseñas complejas mediante formularios reactivos.
    *   `dashboard/`: Panel ejecutivo donde se consumen widgets en tiempo real con barras de progreso para las calorías y macros restantes del día.
    *   `diary/`: Agenda visual donde se seleccionan comidas (desayuno, almuerzo, cena, snacks) y se asocian alimentos del buscador.
    *   `history/`: Sección analítica orientada a desplegar gráficos temporales de peso y macronutrientes acumulados.
*   **Capa de Servicios (`services/`):** Centraliza las peticiones asíncronas vía `HttpClient` hacia los endpoints del backend (`auth.service.ts`, `nutrition.service.ts`, etc.).
*   **Seguridad Interna:**
    *   `Guards`: Bloquean de forma proactiva la navegación hacia rutas protegidas si el usuario carece de token activo (`auth.guard.ts`) o de privilegios de administrador (`admin.guard.ts`).
    *   `Interceptors`: Intercepta cada solicitud HTTP saliente para adjuntar de forma transparente el encabezado `Authorization: Bearer <token>`.

---

## 5. Capa de Persistencia (Base de Datos)
El esquema relacional se inicializa mediante `db/init.sql`. Está diseñado bajo la tercera forma normal para mitigar redundancias:
*   Relaciones robustas de integridad (`FOREIGN KEY`) que asocian registros diarios a usuarios y entradas de bitácora a alimentos base.
*   Índices optimizados en tablas de alimentos para búsquedas textuales rápidas y fluidas.
*   Restricciones de unicidad para proteger correos electrónicos e identificadores críticos.

---

## 6. Estrategia de Despliegue e Infraestructura (Docker)
El proyecto está completamente preparado para la filosofía *Infrastructure as Code (IaC)* mediante entornos Docker preconfigurados:
*   `docker-compose.yml`: Levanta un entorno local de desarrollo con hot-reload en Angular y NestJS conectado al contenedor de PostgreSQL.
*   `docker-compose.prod.yml`: Orquesta la arquitectura de producción mediante compilaciones *Multi-stage* (reduciendo el tamaño de las imágenes finales) y sirviendo el frontend de manera óptima tras un proxy Caddy/Nginx.

---

## 7. Guía del Usuario (Manual Operativo)

Esta sección describe detalladamente el flujo operativo que debe seguir un usuario final para interactuar de forma exitosa con la interfaz de **NutriTrack**.

### Paso 1: Creación de Cuenta y Autenticación
1. Acceda a la URL de la aplicación (`http://localhost` en producción o `http://localhost:4200` en desarrollo).
2. Haga clic en **"Registrarse"** si es un usuario nuevo. Complete los campos obligatorios: Nombre, Correo Electrónico y Contraseña (mínimo 8 caracteres, incluyendo una mayúscula y un número).
3. Tras registrarse, inicie sesión con sus credenciales en el formulario de **Login**. El sistema guardará de forma segura su sesión en el almacenamiento local del navegador (`localStorage`).

### Paso 2: Configuración Inicial de Biometría y Metas
Al ingresar por primera vez, el sistema le redirigirá automáticamente a la configuración de su perfil:
1. **Introduzca sus Datos Biométricos:** Ingrese su peso actual (kg), altura (cm), edad y nivel de actividad física diaria (Sedentario, Moderado, Muy Activo).
2. **Defina su Meta:** Seleccione un objetivo del menú desplegable:
   * *Perder Peso:* Resta automáticamente un porcentaje calórico (déficit) para promover la quema de grasa.
   * *Mantener Peso:* Calcula las calorías exactas para equilibrar el gasto energético diario.
   * *Ganar Masa Muscular:* Añade un superávit calórico controlado combinado con objetivos altos en proteínas.
3. El backend procesará estos datos mediante fórmulas metabólicas estándar y le asignará su **Presupuesto Calórico y de Macronutrientes Diario** (ej. 2,100 Kcal diarios distribuidos en 150g Proteína, 220g Carbohidratos, 65g Grasas).

### Paso 3: Gestión del Diario Nutricional
El **Diario** es el centro de operaciones cotidiano del usuario:
1. Diríjase a la sección **"Diario"** en el menú de navegación izquierdo.
2. Seleccione el bloque de comida que desea registrar: *Desayuno, Almuerzo, Cena o Snacks*.
3. Presione el botón **"Añadir Alimento"**. Aparecerá un buscador interactivo conectado al inventario.
4. Escriba el nombre del alimento (ej. "Pechuga de Pollo"), selecciónelo de la lista e indique la cantidad exacta consumida en gramos (g) o porciones.
5. Guarde la entrada. El panel actualizará instantáneamente el total de calorías consumidas del día.

### Paso 4: Visualización del Dashboard y Progreso Histórico
*   **Dashboard Central:** En cualquier momento puede volver al inicio para ver un medidor gráfico (anillos o barras de progreso) que muestra de forma dinámica cuántas calorías le quedan disponibles y cómo va el balance de sus macros.
*   **Módulo de Historial:** Ingrese aquí semanalmente para registrar su nuevo peso corporal. El sistema graficará su evolución lineal en el tiempo, contrastando su peso real frente a la meta trazada originalmente para asegurar que va por el camino correcto.

### Paso 5: Funcionalidades del Panel de Administrador (Solo Admins)
Si su usuario cuenta con privilegios de Administrador (configurado a través del rol en la base de datos):
*   Tendrá acceso a la ruta de **Consola de Administración**.
*   **Moderar Alimentos:** Podrá dar de alta nuevos alimentos de manera oficial en la base de datos global, corregir valores nutricionales reportados por los usuarios, o dar de baja ítems duplicados.
*   **Gestión de Usuarios:** Visualizar el volumen de usuarios registrados en la plataforma y realizar auditorías de seguridad si fuera necesario.

---

## 8. Instalación y Puesta en Marcha

Para desarrolladores o administradores de sistemas que deseen inicializar el proyecto localmente de forma inmediata:

### Prerrequisitos
*   Tener instalado **Docker** y **Docker Compose**.
*   Un gestor de variables de entorno configurado (archivo `.env`).

### Inicialización con Docker Compose (Entorno Local rápido)
1. Clone este repositorio en su máquina local.
2. Copie el archivo de entorno de ejemplo y configúrelo con sus propias claves secretas:
   ```bash
   cp backend/.env.example backend/.env
   ```
3. Ejecute el siguiente comando en la raíz del proyecto para descargar, compilar y levantar de forma integrada todos los servicios (Base de datos, Backend y Frontend):
   ```bash
   docker-compose up --build
   ```
4. Los scripts `setup-auth.sh` y `setup-entities.sh` se encargarán de estructurar las carpetas base primordiales en caso de ser la primera inicialización.
5. Abra su navegador e ingrese a `http://localhost:4200` para empezar a operar con la aplicación.
