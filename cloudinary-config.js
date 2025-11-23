// cloudinary-config.js - Cloudinary configuration
// Note: These settings are meant to be public in client-side applications
// Security is handled through Cloudinary's unsigned upload presets

const cloudinaryConfig = {
    cloudName: 'dhks3difh',
    uploadPreset: 'hgshop',
    assetFolder: 'hgshoptest'
};

// Make Cloudinary config globally available
window.cloudinaryConfig = cloudinaryConfig;