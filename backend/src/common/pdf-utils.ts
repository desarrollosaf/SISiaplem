import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

// Encabezado institucional (Congreso Edomex + SAF), extraído del PDF oficial "GUÍA SIMPLE DE ARCHIVOS.pdf" (1070x176px)
// Se reutiliza tal cual en todos los formatos institucionales (Guía Simple, Inventario General, Inventario de Transferencia).
const HEADER_LOGO_PATH = join(__dirname, '../assets/header-guia-simple.jpg');
export const HEADER_LOGO_BASE64 = existsSync(HEADER_LOGO_PATH)
  ? `data:image/jpeg;base64,${readFileSync(HEADER_LOGO_PATH).toString('base64')}`
  : null;

const CONECTORES = new Set([
  'de',
  'del',
  'la',
  'las',
  'el',
  'los',
  'y',
  'e',
  'en',
  'a',
  'al',
]);

// Los catálogos (SAF, departamentos, series) están capturados en mayúsculas; se normalizan a Mayúsculas y minúsculas para los PDFs institucionales
export function capitalizar(texto: string): string {
  return texto
    .toLocaleLowerCase('es')
    .split(' ')
    .map((palabra, i) =>
      i > 0 && CONECTORES.has(palabra)
        ? palabra
        : palabra.charAt(0).toLocaleUpperCase('es') + palabra.slice(1),
    )
    .join(' ');
}

const pad = (n: number) => String(n).padStart(2, '0');

export function formatoDDMMAAAA(
  fecha: Date | string | null | undefined,
): string {
  if (!fecha) return '';
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return '';
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export function formatoMMAAAA(fecha: Date | string | null | undefined): string {
  if (!fecha) return '';
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return '';
  return `${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

// Bloque de firmas (2 o 3 columnas) usado en los formatos que no dibujan una raya de firma
// en el PDF original (el nombre real, si se conoce, va sobre la etiqueta descriptiva).
export function bloqueFirmas(
  columnas: { etiqueta: string; nombre?: string; caption: string }[],
  fontSizeEtiqueta = 10,
): Record<string, unknown> {
  return {
    columns: columnas.map((c) => ({
      alignment: 'center' as const,
      stack: [
        { text: c.etiqueta, bold: true, fontSize: fontSizeEtiqueta },
        {
          text: c.nombre || ' ',
          bold: true,
          fontSize: 9,
          margin: [0, 10, 0, 2] as [number, number, number, number],
        },
        {
          text: c.caption,
          bold: true,
          fontSize: 7,
          margin: [0, 2, 0, 0] as [number, number, number, number],
        },
      ],
    })),
    columnGap: 20,
  };
}
