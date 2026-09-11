# Sistema de Turnos

Sistema web para la gestión de turnos de un consultorio médico y administración interna de profesionales.

El proyecto está diseñado para facilitar la organización de las consultas médicas y automatizar la gestión de cobros de los consultorios, estructurando el acceso mediante un sistema de roles y permisos. <!-- roles/perfiles -->

Proyecto correspondiente a la materia "Metodología de Sistemas II" de la Tecnicatura Universitaria en Programación.

## Perfiles de Usuario

El sistema cuenta con tres niveles de acceso, cada uno con responsabilidades y vistas específicas:

*   **Paciente:**
    *   Acceso al portal web público.
    *   Visualización de la cartilla de profesionales, terapias ofrecidas y disponibilidad horaria.
    *   Gestión de perfil personal para visualizar sus turnos agendados (historial de turnos pasados y próximos).
    *   Cancelación de turnos de forma autónoma desde el sistema con hasta 24 horas de anticipación (las cancelaciones con menor tiempo de aviso deben derivarse a través de WhatsApp).
*   **Profesional:**
    *   Gestión de agenda personal (visualización, creación y modificación de turnos de sus pacientes).
    *   Visualización de agendas de otros colegas para facilitar la asignación de turnos.
    *   *Nota: No poseen permisos para modificar la vista pública ni los valores de las terapias.*
*   **Administrador:**
    *   Control total sobre el sistema y visión global de todos los pacientes y agendas profesionales.
    *   Modificación de la información pública de la página (horarios de los profesionales y actualización de los valores de las terapias).
    *   **Módulo de Gestión Administrativa:** Acceso exclusivo a un panel de liquidación para gestionar los cobros a los profesionales. El sistema calcula los montos a abonar en base a los módulos de horas asignadas (por ejemplo, módulos de 4 horas semanales), contabilizando la totalidad del módulo independientemente del nivel de ocupación (turnos efectivos).
## Integrantes

* Foricher Castellón, Juan.
* Franco, Adrian Emmanuel.
* Ramirez Labadie, Ignacio.
* Stallone, Ramiro.

## Tecnologías

* Node.js 24.20.0
* TypeScript
* Express
* Sequelize
* PostgreSQL

## Requisitos

Antes de comenzar, es necesario tener instalado:

* Node.js 24.20.0
* npm
* Git

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/ignaciorlabadie/sistema-de-turnos.git
```

Ingresar al proyecto:

```bash
cd sistema-de-turnos
```

Instalar las dependencias:

```bash
npm ci
```

## Ejecución

Para levantar el proyecto:

```bash
npm run dev
```

## Estructura del proyecto

```text
sistema-de-turnos/
├── src/
├── .env
├── .gitignore
├── .nvmrc
├── package.json
├── package-lock.json
└── tsconfig.json
```

## Estado del proyecto

Proyecto en desarrollo.
