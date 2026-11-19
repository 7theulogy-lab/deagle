# Deagle PDA

PWA instalable controlada por el gatillo físico de una PDA.

## Secuencia

1. Seis pulsaciones reproducen `assets/audio/disparo.wav`.
2. Las dos pulsaciones siguientes reproducen `assets/audio/vacio.wav`.
3. La siguiente pulsación reproduce `assets/audio/recarga.wav` una sola vez.
4. El gatillo queda bloqueado durante la recarga; al terminar comienza un cargador nuevo.

## Configuración del gatillo

La aplicación escucha Enter, Space, F1–F12 y algunas teclas multimedia comunes. Si la PDA entrega otro código, abre el engranaje, elige **Aprender gatillo** y pulsa el gatillo físico una vez. La selección queda guardada en el dispositivo.

Si el gatillo no produce ningún evento en el modo de aprendizaje, el servicio de escaneo de la PDA lo está interceptando. En ese caso hay que configurar el escáner como *keyboard wedge* o asignarle una tecla compatible desde la utilidad del fabricante.

## Probar localmente

Debe servirse por HTTP/HTTPS para registrar el service worker. Por ejemplo:

```powershell
npx serve .
```

