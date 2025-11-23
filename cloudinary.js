// cloudinary.js - Cloudinary integration for image uploads
console.log('Cloudinary.js loaded successfully');

// Function to upload image to Cloudinary
async function uploadImageToCloudinary(file) {
    try {
        // Get Cloudinary config from global variable
        const config = window.cloudinaryConfig;
        
        // Create FormData for the upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', config.uploadPreset);
        formData.append('folder', config.assetFolder);
        
        // Upload to Cloudinary
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
            {
                method: 'POST',
                body: formData
            }
        );
        
        if (!response.ok) {
            throw new Error(`Upload failed with status ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Image uploaded to Cloudinary:', data);
        return data.secure_url; // Return the secure URL of the uploaded image
    } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
        throw error;
    }
}

// Function to handle image upload from file input
async function handleImageUpload(fileInput, previewElement) {
    try {
        if (!fileInput.files || fileInput.files.length === 0) {
            throw new Error('No file selected');
        }
        
        const file = fileInput.files[0];
        
        // Check if file is an image
        if (!file.type.startsWith('image/')) {
            throw new Error('Please select an image file');
        }
        
        // Show loading state
        if (previewElement) {
            previewElement.src = ''; // Clear current image
            previewElement.alt = 'Uploading...';
        }
        
        // Upload to Cloudinary
        const imageUrl = await uploadImageToCloudinary(file);
        
        // Update preview
        if (previewElement) {
            previewElement.src = imageUrl;
            previewElement.alt = 'Uploaded image';
        }
        
        return imageUrl;
    } catch (error) {
        console.error('Error handling image upload:', error);
        alert('Error uploading image: ' + error.message);
        return null;
    }
}

// Enhanced product image upload function
async function uploadProductImage(fileInput) {
    try {
        if (!fileInput.files || fileInput.files.length === 0) {
            throw new Error('No file selected');
        }
        
        const file = fileInput.files[0];
        
        // Check if file is an image
        if (!file.type.startsWith('image/')) {
            throw new Error('Please select an image file');
        }
        
        // Upload to Cloudinary
        const imageUrl = await uploadImageToCloudinary(file);
        return imageUrl;
    } catch (error) {
        console.error('Error uploading product image:', error);
        alert('Error uploading image: ' + error.message);
        return null;
    }
}

// Make functions globally available
window.uploadImageToCloudinary = uploadImageToCloudinary;
window.handleImageUpload = handleImageUpload;
window.uploadProductImage = uploadProductImage;

console.log('Cloudinary integration initialized successfully');