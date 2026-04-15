# Memoria del Proyecto: Landing Seminario de Chocolatería

## Estado Actual y Próximos Pasos (Pendiente para arrancar la próxima sesión)

Se completó la auditoría de la landing page exitosa "Taller de Alfajores" y se extrajo su estructura, estrategia de precios y metodologías de embudo de venta para replicarlas y adaptarlas a la Masterclass de Chocolatería. 

### Información extraída del "Taller de Alfajores" que se debe replicar/adaptar

#### 1. Datos Clave del Evento
*   **Fecha de referencia:** Lunes 25 de Mayo (Debe actualizarse para el nuevo Seminario de Chocolatería).
*   **Horarios:** 14:00 a 20:00 hs.
*   **Lugar:** Cala Salón de Eventos (Dr. L.A. de Herrera 552, La Paz, Canelones).
*   **Público objetivo:** "TODOS", sin conocimientos previos requeridos.
*   **Entregables:** Recetario digital/físico, degustación y certificado de asistencia.

#### 2. Estrategias de Pricing y Venta
A replicar en el archivo de opciones de compra (`opciones.html`):
*   **Esquema de Preventas (Escasez de Tiempo):** Escalonamiento de precios. Ejemplo base: Preventa 1 ($2.900) -> Preventa 2 ($3.150) -> Precio Final ($3.400).
*   **Incentivo por Medio de Pago (Descuento Contado):** Resaltar de manera prominente ("Cash Hero") el ahorro por pagar de contado o mediante transferencia, contrastando el precio de tarjeta ($3.200) contra el de efectivo ($2.900) con la etiqueta "Ahorras $290 - 10% OFF".

#### 3. Venta Cruzada (Upselling)
*   **Bloque "Combo" u Oculto:** Al momento de hacer clic en "Reservar mi lugar", la página despliega una sección que ofrece un combo (Ej. Chocolatería + Alfajores) subrayando el ahorro total si se compran ambos, usando etiquetas como "Recomendado".

#### 4. Arquitectura de la Landing Page
La estructura del archivo `index.html` deberá incluir las siguientes áreas persuasivas, con un estilo más "premium" orientado a la estética del chocolate:
*   **Nav/Header:** Contador decreciente ("Cupos Limitados") anclado arriba.
*   **Hero Section:** Video inmersivo de chocolate de fondo, fecha y gran CTA.
*   **Dilema / Pain Point:** Texto persuasivo introductorio enfocado a la producción inteligente y rentable y el miedo típico al templado del chocolate.
*   **Temario:** Lista detallada de los ítems a enseñar.
*   **Galería Automática:** Infinite scroll con imágenes premium de los bombones/chocolates de Ariel Ferreyra.
*   **Cuándo y Dónde:** Ficha visual de las coordenadas con link a Google maps.
*   **Perfil Experto:** Sección estilo editorial hablando sobre Ariel, Flavia y Laura.
*   **Call to Action Final:** Botón gigante a ver precios.
*   **Preguntas Frecuentes (FAQ):** Acordeón desmintiendo la necesidad de materiales, experiencia y explicando devoluciones.

### Pendiente para la siguiente sesión
1. Construir la estructura completa de `index.html` adaptada a "Chocolatería" basada en el listado analizado.
2. Construir `opciones.html` incorporando lógica de preventas, incentivo por transferencia y la sección de venta cruzada (Combo).
3. Diseñar componentes visuales premium vinculados estéticamente al chocolate y repostería fina.
