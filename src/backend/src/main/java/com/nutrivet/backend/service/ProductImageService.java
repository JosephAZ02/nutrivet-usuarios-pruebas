package com.nutrivet.backend.service;

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import javax.imageio.ImageIO;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ProductImageService {

    private final Path uploadDirectory;

    public ProductImageService(
            @Value("${app.upload.dir:/home/uploads}") String uploadDir) {

        this.uploadDirectory = Paths.get(uploadDir)
                .toAbsolutePath()
                .normalize()
                .resolve("products")
                .normalize();
    }

    public String saveImage(MultipartFile image) {

        if (image == null || image.isEmpty()) {
            throw new RuntimeException("Debe seleccionar una imagen válida");
        }

        if (image.getSize() > 5 * 1024 * 1024) {
            throw new RuntimeException("La imagen no puede superar los 5 MB");
        }

        String contentType = image.getContentType();

        if (contentType == null ||
                (!contentType.equalsIgnoreCase("image/jpeg") &&
                        !contentType.equalsIgnoreCase("image/png") && !contentType.equalsIgnoreCase("image/webp"))) {
            throw new RuntimeException("Solo se permiten imágenes JPG, PNG o WEBP");
        }

        try {
            BufferedImage bufferedImage = ImageIO.read(image.getInputStream());

            if (bufferedImage == null) {
                throw new RuntimeException("El archivo no contiene una imagen válida");
            }

            String extension = contentType.equalsIgnoreCase("image/png")
                    ? ".png"
                    : ".jpg";

            String fileName = UUID.randomUUID() + extension;

            Files.createDirectories(uploadDirectory);

            Path destination = uploadDirectory.resolve(fileName).normalize();

            if (!destination.startsWith(uploadDirectory)) {
                throw new RuntimeException("Ruta de archivo no válida");
            }

            Files.copy(image.getInputStream(), destination);

            return "products/" + fileName;

        } catch (IOException e) {
            throw new RuntimeException(
                    "No se pudo guardar la imagen del producto", e);
        }
    }

    public void deleteImage(String photoPath) {

        if (photoPath == null || photoPath.isBlank()) {
            return;
        }

        String prefix = "products/";

        if (!photoPath.startsWith(prefix) ||
                photoPath.contains("..") ||
                photoPath.contains("\\") ||
                photoPath.substring(prefix.length()).contains("/")) {
            return;
        }

        try {
            Path file = uploadDirectory
                    .resolve(photoPath.substring(prefix.length()))
                    .normalize();

            if (file.startsWith(uploadDirectory)) {
                Files.deleteIfExists(file);
            }

        } catch (IOException e) {
            throw new RuntimeException(
                    "No se pudo eliminar la imagen anterior", e);
        }
    }
}
