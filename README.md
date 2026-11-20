# Centro de Demos

Sitio web 100% estático (HTML, CSS y JavaScript sin dependencias ni backend) diseñado para mostrar demostraciones interactivas a pequeños negocios en computadora y teléfono celular.

## Estructura

- `index.html`: Hub principal con filtro rápido por categoría.
- `assets/`: Hoja de estilos, script de filtrado, fuente `Onest` autoalojada e ícono SVG.
- `demos/`: Rutas individuales para cada demostración interactiva.
- `.nojekyll`: Desactiva el procesamiento Jekyll en GitHub Pages.

## Prueba local

```bash
python3 -m http.server 8080
```

Luego abre `http://localhost:8080` en el navegador.

## Despliegue en GitHub Pages

Todas las rutas son relativas (`./` y `../../`), por lo que el sitio funciona directamente tanto en dominio raíz como en subrutas del tipo `https://usuario.github.io/repositorio/`.
