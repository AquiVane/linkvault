# 🔖 LinkVault

Guardá y organizá links de TikTok, Instagram, LinkedIn, YouTube y la web. Cada usuario tiene su propia cuenta y biblioteca privada.

---

## 🚀 Cómo subir esto a internet (sin saber programar)

Seguí estos pasos en orden. Son ~20 minutos en total.

---

### PASO 1 — Crear la base de datos (Supabase)

1. Entrá a **https://supabase.com** y creá una cuenta gratuita
2. Hacé clic en **"New Project"**
3. Poné el nombre que quieras (ej: `linkvault`) y elegí una contraseña segura
4. Esperá ~2 minutos a que cargue el proyecto
5. Cuando esté listo, hacé clic en **"SQL Editor"** en el menú lateral
6. Hacé clic en **"New query"**
7. Abrí el archivo `database-setup.sql` de esta carpeta, copiá TODO el contenido y pegalo en el editor
8. Hacé clic en **"Run"** (botón verde)
9. Deberías ver el mensaje "Success. No rows returned"

**Ahora copiá tus credenciales:**
- Andá a **Settings → API** (en el menú lateral)
- Copiá la **"Project URL"** (algo como `https://abcdefg.supabase.co`)
- Copiá la **"anon public"** key (un texto largo)
- Guardalas en un bloc de notas, las vas a necesitar en el Paso 3

---

### PASO 2 — Subir el código a GitHub

1. Entrá a **https://github.com** y creá una cuenta gratuita
2. Hacé clic en **"New repository"** (botón verde o el `+`)
3. Poné nombre: `linkvault`, dejalo en **Public**, hacé clic en **"Create repository"**
4. En la página que aparece, hacé clic en **"uploading an existing file"**
5. Arrastrá TODA la carpeta `linkvault` (con todos los archivos adentro)
6. Abajo del todo hacé clic en **"Commit changes"**

---

### PASO 3 — Desplegar en Vercel (esto lo publica en internet)

1. Entrá a **https://vercel.com** y creá una cuenta gratuita (podés entrar con tu cuenta de GitHub)
2. Hacé clic en **"Add New Project"**
3. Seleccioná el repositorio `linkvault` que creaste en el Paso 2
4. Antes de hacer clic en "Deploy", buscá la sección **"Environment Variables"**
5. Agregá estas dos variables:

   | Nombre | Valor |
   |--------|-------|
   | `REACT_APP_SUPABASE_URL` | La Project URL que copiaste en el Paso 1 |
   | `REACT_APP_SUPABASE_ANON_KEY` | La anon key que copiaste en el Paso 1 |

6. Hacé clic en **"Deploy"**
7. Esperá ~2 minutos
8. ¡Listo! Vercel te va a dar una URL tipo `linkvault.vercel.app` — esa es tu app funcionando

---

### PASO 4 — (Opcional) Ponerle un dominio propio

Si querés una URL como `www.tusitio.com`:
1. Comprá un dominio en **Namecheap** (~$10/año) o **Porkbun** (~$8/año)
2. En Vercel, andá a tu proyecto → **Settings → Domains**
3. Seguí las instrucciones que te da Vercel para conectar el dominio

---

## ✅ Qué puede hacer la app

- Registro e inicio de sesión con email y contraseña
- Guardar links pegando la URL
- Detección automática de la fuente: TikTok, Instagram, LinkedIn, YouTube, Twitter/X, GitHub o web genérica
- Organizar por espacios: Redes sociales, Trabajo, Aprender, Inspiración, Herramientas, Compras, Otro
- Agregar etiquetas personalizadas
- Marcar links como leídos/sin leer
- Filtrar por fuente, espacio o estado
- Buscar en tiempo real
- Eliminar links
- Cada usuario ve solo sus propios links (privacidad total)

---

## 💸 Costos

| Servicio | Costo |
|----------|-------|
| Supabase | **Gratis** hasta 50.000 usuarios activos/mes |
| Vercel | **Gratis** para uso personal |
| Dominio .com | ~$10/año (opcional) |

**Total para empezar: $0/mes**

---

## 🤔 Problemas comunes

**"Error al guardar"** → Revisá que las variables de entorno en Vercel estén bien escritas (sin espacios)

**La app no carga** → Fijate que el build en Vercel haya terminado sin errores (debería decir "Ready")

**No puedo registrarme** → Asegurate de haber corrido el SQL en el Paso 1 correctamente
