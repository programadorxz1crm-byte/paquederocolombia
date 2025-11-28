# Generar `.ipa` de iOS en GitHub Actions

Este proyecto incluye un flujo en `.github/workflows/ios-build.yml` para construir el `.ipa` en un runner macOS.

## Requisitos

- Cuenta de Apple Developer.
- Certificado `iOS Distribution` (`.p12`) y su contraseña.
- Perfil de aprovisionamiento (`.mobileprovision`) acorde al método (development, ad-hoc o app-store).
- `Team ID` de tu cuenta (por ejemplo: `ABCDE12345`).
- `Bundle Identifier` deseado (por ejemplo: `com.etherealledger.app`).

## Configuración de secretos en GitHub

En el repositorio, crea los siguientes secrets:

- `APPLE_TEAM_ID`: Team ID (p.ej. `ABCDE12345`).
- `BUNDLE_ID`: Bundle ID (p.ej. `com.etherealledger.app`).
- `CERT_P12_BASE64`: Contenido del archivo `.p12` en Base64.
- `CERT_PASSWORD`: Contraseña del `.p12`.
- `PROVISIONING_PROFILE_BASE64`: Contenido del `.mobileprovision` en Base64.
- `PROV_PROFILE_NAME`: Nombre del perfil de aprovisionamiento (tal como aparece en Xcode/archivo).

Para generar los valores en Base64:

```bash
base64 -i certificado.p12 | pbcopy
base64 -i perfil.mobileprovision | pbcopy
```

## Ejecutar el build

1. Sube el proyecto a GitHub (incluyendo la carpeta `ios`).
2. Ve a `Actions` > `Build iOS IPA (Capacitor)` > `Run workflow`.
3. Elige `method`: `development`, `ad-hoc` o `app-store`.
4. Al terminar, descarga el artefacto `EtherealLedger-iOS-IPA` con el `.ipa` generado.

## Notas

- Si usas `ad-hoc`, asegúrate de que el perfil incluya los UDIDs de los dispositivos donde instalarás.
- Para `app-store`, el `.ipa` se sube con `Transporter` o `xcrun altool`. Este flujo solo exporta el `.ipa`.
- Puedes ajustar `PRODUCT_BUNDLE_IDENTIFIER` y `DEVELOPMENT_TEAM` definitivamente en Xcode si prefieres no pasarlos por variables.