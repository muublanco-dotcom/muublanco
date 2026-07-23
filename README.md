# Muu Blanco

Sitio web (estático, multipágina) — CV/portfolio de artista.
Estética editorial/galería (referencia: tremainecollection.org).

## Estructura
- **`index.html`** — intro a pantalla completa + página principal con retrato y accesos a las 5 secciones.
- **`conceptual.html`** — bibliografía de textos/documentos, ordenada por fecha real de creación del archivo (metadata del PDF). Datos en `data/conceptual.json`.
- **`multimedia.html`** — video embebido desde Google Drive + galería de imágenes.
- **`practicas-publicas.html`** — tarjetas con 3 Instagram, YouTube, SoundCloud y Discogs.
- **`dr-musica.html`** — alias musical, pistas de audio embebidas desde Google Drive.
- **`store.html`** — galería / tienda virtual, catálogo en vivo desde una Google Sheet (mismo motor que usaba Art Fair).
- **`about.html`** — biografía del artista.
- `css/styles.css`, `js/main.js`, `assets/`, `data/`.

## Qué falta completar (busca `TODO` y `Pendiente`)
- **`practicas-publicas.html`** — reemplaza cada `href="#"` por el link real de cada red.
- **`store.html`** — crea una Google Sheet con las columnas de `data/store-template.csv` y pega su ID en `STORE_SHEET_ID` (`js/main.js`).
- **`about.html`** — reemplaza el párrafo marcado como pendiente con la biografía real.
- **Contacto de la Galería** — actualmente usa `mailto:drmuuuusica@gmail.com`; cámbialo en `js/main.js` (`openDetail`) si prefieres otro correo.

## Conceptual — cómo agregar un nuevo texto
Google Drive no expone la fecha de creación real de un archivo a través de un link público, así que se extrae una vez y se guarda en `data/conceptual.json`:
1. Descarga el PDF y lee su metadata embebida: `strings archivo.pdf | grep CreationDate` (o el equivalente con `exiftool`/`pypdf`).
2. Agrega una entrada al array en `data/conceptual.json` con `title`, `date` (`AAAA-MM-DD`), `medium`, `summary`, `pdfId` y `imageId` (IDs de Google Drive).
3. La página ordena las entradas automáticamente por fecha, de más reciente a más antigua.

## Galería (Google Sheet)
Encabezados esperados (cualquier orden): `Título | Imagen(es) | Precio | Técnica | Tamaño | Disponible | Descripción | Fecha`.
`Imagen(es)` acepta uno o varios links de Google Drive (compartidos como "Cualquiera con el enlace").
En Sheets: **Archivo → Compartir → Publicar en la web → (hoja) → CSV**; copia el ID de la hoja (la parte de la URL entre `/d/` y `/edit`) y pégalo en `STORE_SHEET_ID` (`js/main.js`).

## Ver en local
```bash
python3 -m http.server 5178
# abre http://localhost:5178
```

## Publicar en GitHub Pages
1. Crea tu cuenta: https://github.com/signup
2. Crea un repositorio y sube estos archivos.
3. Settings → Pages → Source: rama `main`, carpeta `/root` → Save.
4. Queda en `https://TU-USUARIO.github.io/TU-REPOSITORIO/`.
