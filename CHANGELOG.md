# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.
Formato basado en [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased] — 2026-05-29

### Agregado

- **`OrderDetailModal`**: modal que muestra el detalle completo de un pedido (ítems, dirección, cliente, total y estado). Se abre desde la tabla de órdenes con el nuevo callback `onViewDetail`.
- **Tipos en `types.ts`**: nuevas interfaces/tipos para soportar el modal de detalle y los datos extendidos de pedidos.
- **Método en `backoffice.ts`**: nuevo método de servicio para obtener el detalle de un pedido por ID.

### Modificado

- **`OrderTable`**: se agregó prop `onViewDetail` (callback al hacer clic en un pedido para abrir el modal). Loading state reemplazado por spinner animado. Empty state mejorado con ícono SVG y mensaje secundario. Colores de acciones actualizados: `purple` → `violet`, `orange` → `amber`. Estilos de tabla refinados (shadows, hover, font-mono para ID de pedido).
- **`Sidebar`**: rediseño del sidebar del dashboard.
- **`layout.tsx` (dashboard)**: ajustes de layout de la sección protegida.
- **`globals.css`**: actualización de variables CSS del sistema de diseño del backoffice.
- **`layout.tsx` (root)**: limpieza del layout raíz.
- **`orders/page.tsx`**: integración del `OrderDetailModal` y del callback `onViewDetail`.
- **`virtualpet-openapi.yaml`**: spec actualizada con los nuevos endpoints y schemas.

---

## Historial anterior

Ver commits en la rama `develop` para cambios previos al 2026-05-29.
