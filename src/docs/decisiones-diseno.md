# Decisiones de diseño

---

## Caso 1: cómo se saca un turno (patrón Facade)

### 1. Código analizado

- `src/facades/reservaTurnoFacade.ts` -> función `reservarTurno` (línea 81) y
  `cancelarTurnoDePaciente` (línea 157). Es el **Facade**.
- `src/services/turnoService.ts` -> funciones `crearTurno` (línea 6),
  `existeTurnoEnHorario` (línea 19) y `cancelarTurno` (línea 69). Es el
  service "chico" que solo habla con la base de datos.
- `src/controllers/turnoController.ts` -> `sacarTurno` (línea 40) y
  `cancelarMiTurno` (línea 86). Solo recibe el pedido y llama al Facade.
- `src/routes/turnoRoutes.ts` y `src/routes/index.ts` (línea 19) -> donde se
  publican las rutas `POST /api/turnos/me` y `PATCH /api/turnos/me/:id/cancelar`.
- `src/models/Turno.ts`, `src/models/Agenda.ts` y las relaciones en
  `src/models/index.ts` (líneas 63 a 99).

### 2. Diagnóstico

Para reservar un turno hay que hacer varias cosas juntas:

1. buscar la agenda del profesional,
2. revisar que la fecha y la hora entren en esa agenda,
3. revisar que el horario no esté ocupado,
4. recién ahí guardar el turno.

De ahí sale la idea de armar un facade, que el controller de turno se apoye
en 'reservaTurnoFacade.ts' para coordinar esas acciones.

**Qué conceptos aplicamos.**

- **Facade**: un Facade es una sola "puerta de entrada" que por dentro
  coordina varias partes. El controlador llama a una sola función y no se
  entera de los detalles.
- **Separación de responsabilidades**: el controlador valida el pedido, el
  Facade decide las reglas, el service guarda en la base.
- **Responsabilidad única**: cada función hace una sola cosa.
- **Clean Code**: nombres claros y funciones cortas.

### 3. Alternativas

- **A. Poner toda la lógica en el controlador.** Simple al principio, pero el
  controlador queda lleno de reglas y cuesta mantenerlo. La descartamos.
- **B. Un solo service** que revise reglas y además guarde en la base.
  Mezcla dos responsabilidades en el mismo lugar. La descartamos.
- **C. Facade + service** (lo que elegimos). El Facade tiene las reglas,
  el service solo guarda.
- **D. Conservar lo actual** No estaba implementado aún, asi que no había forma de
  mantener lo que teníamos, ya que quedaría incompleto.

### 4. Decisión

Elegimos la **opción C: Facade + service**.

¿Por qué?

- El controlador quedó de pocas líneas: valida el pedido y llama al Facade.
- Las reglas del turno están en un solo lugar, fáciles de encontrar.
- Se puede reusar: el mismo `reservarTurno` sirve si después el profesional o
  el admin también quieren reservar.
- Encaja con las capas que ya tenía el proyecto, sin reescribir nada.

### 5. Evidencia y trade-offs

**Enlaces al código**:

- Facade: `src/facades/reservaTurnoFacade.ts`
- Service: `src/services/turnoService.ts`
- Controlador: `src/controllers/turnoController.ts`
- Ruta publicada: `src/routes/index.ts`

**Beneficios**

- Controlador corto y fácil de leer.
- Reglas del turno centralizadas.
- Reusable y fácil de probar por separado.

**Costos (trade-offs)**

- Agregamos una capa más entre el controller y el service:
  hay que seguir el hilo Controller -> Facade -> service.
- El service es chico: casi solo pasa datos a Sequelize.

---

## Caso 2: Código duplicado (code smell).

### 1. Código analizado

- Los 6 controladores que tenían su propia copia de `validarId`:
  `src/controllers/estudioController.ts`,
  `src/controllers/pacienteController.ts`,
  `src/controllers/profesionalController.ts`,
  `src/controllers/autorizacionEstudioController.ts`,
  `src/controllers/turnoController.ts` y
  `src/controllers/usuarioController.ts`.
- `src/services/espacioService.ts`.

### 2. Diagnóstico

- **Código duplicado:** la misma función `validarId` estaba copiada en 6
  controladores. Es un **code smell**, es decir, una señal de que algo se
  puede mejorar: si hay que cambiarla, hay que acordarse de los 6 archivos.
- **Convención distinta:** casi todos los services usan exportaciones con
  nombre, pero `espacioService.ts` es el único que usa `export default`.
  No es un error, pero es distinto al resto del proyecto.

### 3. Alternativas

- **A. Extraer `validarId` a un archivo compartido** y usarlo en todos los
  controladores.
- **B. Dejarlo como estaba.**

### 4. Decisión

Elegimos la **opción A**. Movimos `validarId` a `src/utils/validarId.ts` y ahora
los 6 controladores lo importan.

¿Por qué un archivo nuevo y no `src/utils/validation.ts`? Porque
`validation.ts` tiene funciones que devuelven `true` o `false`, y `validarId`
hace otra cosa: si el id está mal, lanza un error (`AppError`). Los separamos
para que cada archivo tenga una sola responsabilidad.

También unificamos la firma en `validarId(valor, nombreCampo)`, así el mensaje
puede decir "ID del turno" o "ID del paciente" según el caso. Y agregamos un
test en `tests/unit/validarId.test.ts`.

### 5. Evidencia y trade-offs

- **Beneficio:** ahora hay **una sola** definición de `validarId`; un cambio se
  hace en un solo lugar.
- **Costo:** hubo que tocar 6 controladores, pero sin cambiar lo que hacen
  (hubo refactoring).
- **Deuda pendiente:** `espacioService.ts` sigue usando `export default`.

---

## Uso de IA

Se utilizaron herramientas de inteligencia artificial como asistencia durante el
desarrollo, principalmente para proponer ideas de implementación y agilizar la
escritura del código. Las sugerencias obtenidas fueron revisadas por el equipo
antes de su utilización.

Por ejemplo, en `reservaTurnoFacade.ts`:

1. const MILISEGUNDOS_24_HORAS -> línea 26
2. function aMinutos() -> línea 32-36
3. function construirFechaHora() -> línea 38-58
4. function diaSemanaDeFecha() -> línea 60-71
