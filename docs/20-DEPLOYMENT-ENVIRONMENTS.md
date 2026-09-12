# Deployment Environments

## Local
Firebase Emulator Suite, local Flutter, local Next.js and development ESP32 firmware.

## Staging
Separate Firebase project, test Cloudinary configuration and test accounts/devices.

## Production
Separate production Firebase project, production Cloudinary configuration, secret management, monitoring and release approval.

Never commit Firebase service-account keys, Cloudinary secrets, signing keys or production credentials.
