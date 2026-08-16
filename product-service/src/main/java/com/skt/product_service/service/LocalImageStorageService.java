package com.skt.product_service.service;

import com.skt.product_service.service.category.ProductCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LocalImageStorageService implements ImageStorageService {

    private final Path uploadDir = Paths.get("uploads");
    private final ProductCategoryService productCategoryService;

    @Override
    public String upload(
            MultipartFile file,
            String skuCode,
            String categoryId
    ) throws IOException {

        if (file == null || file.isEmpty()) {
            throw new IOException("File is empty");
        }

        if (skuCode == null || skuCode.isBlank()) {
            throw new IllegalArgumentException("SKU code cannot be null or blank");
        }

        if (categoryId == null || categoryId.isBlank()) {
            throw new IllegalArgumentException("Category ID cannot be null or blank");
        }

        /*
         * Example:
         * categoryId: "gaming-laptops-id"
         * skuCode: "LAPT-90462994"
         * Result:
         * uploads/
         *   electronics/
         *     laptops/
         *       gaming laptops/
         *         LAPT-90462994/
         *           abc-uuid.jpg
         */

        Path productDir = buildProductDirectory(skuCode, categoryId);

        // Create the complete directory structure
        Files.createDirectories(productDir);

        String extension = getExtension(file.getOriginalFilename());

        String filename = UUID.randomUUID() + extension;

        Path target = productDir.resolve(filename);

        Files.copy(
                file.getInputStream(),
                target,
                StandardCopyOption.REPLACE_EXISTING
        );

        // Return URL/path relative to the application's static resource root
        return "/" + productDir
                .resolve(filename)
                .toString()
                .replace("\\", "/");
    }

    @Override
    public void delete(
            String imageUrl,
            String skuCode,
            String categoryId
    ) throws IOException {

        if (imageUrl == null || imageUrl.isBlank()) {
            return;
        }

        if (skuCode == null || skuCode.isBlank()) {
            throw new IllegalArgumentException("SKU code cannot be null or blank");
        }

        if (categoryId == null || categoryId.isBlank()) {
            throw new IllegalArgumentException("Category ID cannot be null or blank");
        }

        Path productDir = buildProductDirectory(skuCode, categoryId);

        String filename = Paths.get(imageUrl).getFileName().toString();

        Path target = productDir.resolve(filename).normalize();

        // Security check to prevent path traversal
        if (!target.startsWith(productDir.normalize())) {
            throw new IOException("Invalid image path: " + imageUrl);
        }

        Files.deleteIfExists(target);
    }

    /**
     * Loads an image from the product's directory.
     * Example:
     * loadAsResource(
     *     "abc.jpg",
     *     "LAPT-90462994",
     *     "gaming-laptops-id"
     * )
     */
    public Resource loadAsResource(
            String filename,
            String skuCode,
            String categoryId
    ) throws IOException {

        Path productDir = buildProductDirectory(skuCode, categoryId);

        Path target = productDir
                .resolve(filename)
                .normalize();

        if (!target.startsWith(productDir.normalize())
                || !Files.exists(target)
                || !Files.isReadable(target)) {

            throw new IOException("Image not found: " + filename);
        }

        try {
            return new UrlResource(target.toUri());
        } catch (MalformedURLException ex) {
            throw new IOException(
                    "Invalid image path: " + filename,
                    ex
            );
        }
    }

    /**
     * Builds:
     * uploads/
     *   electronics/
     *     laptops/
     *       business laptops/
     *         LAPT-90462994/
     */
    private Path buildProductDirectory(
            String skuCode,
            String categoryId
    ) {

        Path productDir = uploadDir;

        List<String> categoryHierarchy =
                productCategoryService.getCategoryHierarchyNames(categoryId);

        for (String category : categoryHierarchy) {
            productDir = productDir.resolve(
                    normalizeCategorySegment(category)
            );
        }

        return productDir.resolve(
                sanitizePathSegment(skuCode)
        );
    }

    private String normalizeCategorySegment(String value) {
        return sanitizePathSegment(value)
                .toLowerCase(Locale.ROOT);
    }

    /**
     * Prevents path traversal such as:
     * ../../something
     * ..
     * .
     * /etc/passwd
     */
    private String sanitizePathSegment(String value) {

        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(
                    "Path segment cannot be null or blank"
            );
        }

        String sanitized = value
                .trim()
                .replace("/", "_")
                .replace("\\", "_");

        if (sanitized.equals(".") || sanitized.equals("..")) {
            throw new IllegalArgumentException(
                    "Invalid path segment: " + value
            );
        }

        return sanitized;
    }

    private String getExtension(String filename) {

        if (filename == null || !filename.contains(".")) {
            return "";
        }

        return filename.substring(
                filename.lastIndexOf(".")
        );
    }
}