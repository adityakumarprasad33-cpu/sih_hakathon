# Cloudinary Media Architecture

## Responsibility
Cloudinary handles user profile images and other approved media. Firebase Auth remains the identity provider.

```text
Firebase Auth
    uid
      |
Firebase RTDB
    media metadata
      |
Cloudinary
    actual image
```

## Profile image flow
1. User authenticates with Firebase.
2. App obtains an authorized Cloudinary upload mechanism.
3. Image is uploaded.
4. Cloudinary returns asset metadata.
5. Application stores only required `publicId`, secure URL and timestamps.
6. UI displays the approved image.

## Security
- Never ship Cloudinary API secrets in Flutter or browser code.
- Use signed/backend-controlled uploads when required.
- Validate file type, dimensions and size.
- Generate reasonable thumbnails.
- Avoid sensitive health information in filenames/folders.
- Define Cloudinary asset deletion when a user deletes their account.

Example:
```json
{
  "profileImage": {
    "provider": "cloudinary",
    "publicId": "...",
    "secureUrl": "...",
    "updatedAt": 0
  }
}
```
