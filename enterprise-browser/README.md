# Prueba en Zebra Enterprise Browser

Esta variante carga Deagle desde el almacenamiento de la PDA y usa `EB.KeyCapture.captureTrigger()` para recibir la pulsación física del gatillo, incluso cuando no se decodifica un código.

## Contenido del paquete

- `Config.xml`: configuración de Enterprise Browser que carga la aplicación e inyecta las APIs Zebra.
- `deagle/`: aplicación web completa con sus audios.

## Instalación de prueba

1. Instala y licencia Zebra Enterprise Browser en la PDA.
2. Cierra Enterprise Browser si está abierto.
3. Copia la carpeta `deagle` dentro de la carpeta de instalación de Enterprise Browser.
4. Copia `Config.xml` a `/Android/data/com.symbol.enterprisebrowser/Config.xml`.
5. Abre Enterprise Browser.
6. La parte inferior debe mostrar `Zebra Enterprise Browser: gatillo físico activo`.
7. Aprieta el gatillo: debe iniciar la secuencia sin necesidad de leer un código.

La ruta de Enterprise Browser puede variar en algunos equipos antiguos. Si no abre la aplicación, confirma el modelo, la versión de Android y la versión de Enterprise Browser.

## Diagnóstico

- Si aparece `Teclas activas...`, las librerías Zebra no fueron inyectadas: revisar `Config.xml` y reiniciar Enterprise Browser.
- Si aparece `Zebra Enterprise Browser: gatillo físico activo` pero no responde, otra aplicación podría tener reservado el gatillo (por ejemplo PTT) o el dispositivo podría reportar un valor de gatillo distinto.
- Si Enterprise Browser muestra error de licencia, la captura nativa no estará disponible hasta activar su licencia.
