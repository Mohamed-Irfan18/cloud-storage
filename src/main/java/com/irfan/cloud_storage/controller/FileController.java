package com.irfan.cloud_storage.controller;

import com.irfan.cloud_storage.dto.FileResponse;
import com.irfan.cloud_storage.entity.FileMetadata;
import com.irfan.cloud_storage.entity.User;
import com.irfan.cloud_storage.repository.FileRepository;
import com.irfan.cloud_storage.repository.UserRepository;
import com.irfan.cloud_storage.storage.SupabaseStorageService;

import org.springframework.http.HttpHeaders;
import com.irfan.cloud_storage.dto.RenameFileRequest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/files")
public class FileController
{

    private final SupabaseStorageService storageService;
    private final FileRepository fileRepository;
    private final UserRepository userRepository;

    public FileController(
            SupabaseStorageService storageService,
            FileRepository fileRepository,
            UserRepository userRepository)
    {

        this.storageService = storageService;
        this.fileRepository = fileRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(
            @RequestParam("file") MultipartFile file,
            Authentication authentication)
    {

        try
        {
            // 1. Get logged-in username from JWT
            String username = authentication.getName();

            // 2. Find user in database
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() ->
                            new RuntimeException("User not found"));

            String fileName = file.getOriginalFilename();

            String filePath = user.getId() + "/" + fileName;

            storageService.uploadFile(file, filePath);

            // 5. Create file metadata
            FileMetadata metadata = new FileMetadata();

            metadata.setFileName(fileName);
            metadata.setS3Key(filePath);
            metadata.setContentType(file.getContentType());
            metadata.setFileSize(file.getSize());
            metadata.setUploadedAt(LocalDateTime.now());
            metadata.setUser(user);

            // 6. Save metadata in SQL Server
            fileRepository.save(metadata);

            return ResponseEntity.ok(
                    "File uploaded and metadata saved successfully: "
                            + fileName
            );

        } catch (Exception e) {

            return ResponseEntity.internalServerError()
                    .body("File upload failed: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/rename")
    public ResponseEntity<String> renameFile(
            @PathVariable Long id,
            @RequestBody RenameFileRequest request,
            Authentication authentication) {

        try {

            // 1. Get logged-in username
            String username = authentication.getName();

            // 2. Find user
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() ->
                            new RuntimeException("User not found"));

            // 3. Find file belonging to this user
            FileMetadata file = fileRepository
                    .findByIdAndUser(id, user)
                    .orElseThrow(() ->
                            new RuntimeException("File not found"));

            // 4. Get new filename
            String newFileName = request.newFileName();

            // 5. Create new user-specific path
            String newPath = user.getId() + "/" + newFileName;

            // 6. Move file in Supabase
            storageService.renameFile(
                    file.getS3Key(),
                    newPath,
                    file.getContentType()
            );

            // 7. Update SQL Server metadata
            file.setFileName(newFileName);
            file.setS3Key(newPath);

            fileRepository.save(file);

            return ResponseEntity.ok(
                    "File renamed successfully: " + newFileName
            );

        } catch (Exception e) {

            return ResponseEntity.internalServerError()
                    .body("File rename failed: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadFile(
            @PathVariable Long id,
            Authentication authentication) {

        try {

            // 1. Get logged-in username
            String username = authentication.getName();

            // 2. Find the user
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() ->
                            new RuntimeException("User not found"));

            // 3. Find file belonging to this user
            FileMetadata file = fileRepository
                    .findByIdAndUser(id, user)
                    .orElseThrow(() ->
                            new RuntimeException("File not found"));

            // 4. Download actual file from Supabase
            byte[] fileData = storageService.downloadFile(
                    file.getS3Key()
            );

            // 5. Return file to the client
            MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;

            if (file.getContentType() != null) {
                mediaType = MediaType.parseMediaType(
                        file.getContentType()
                );
            }

            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .header(
                            HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + file.getFileName() + "\""
                    )
                    .body(fileData);

        } catch (Exception e) {

            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteFile(
            @PathVariable Long id,
            Authentication authentication) {

        try {

            // 1. Get logged-in username
            String username = authentication.getName();

            // 2. Find user
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() ->
                            new RuntimeException("User not found"));

            // 3. Find file belonging to this user
            FileMetadata file = fileRepository
                    .findByIdAndUser(id, user)
                    .orElseThrow(() ->
                            new RuntimeException("File not found"));

            // 4. Delete actual file from Supabase
            storageService.deleteFile(file.getS3Key());

            // 5. Delete metadata from SQL Server
            fileRepository.delete(file);

            return ResponseEntity.ok(
                    "File deleted successfully: " + file.getFileName()
            );

        } catch (Exception e) {

            return ResponseEntity.internalServerError()
                    .body("File deletion failed: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getMyFiles(Authentication authentication) {

        String username = authentication.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        var files = fileRepository.findByUser(user)
                .stream()
                .map(FileResponse::from)
                .toList();

        return ResponseEntity.ok(files);
    }
}