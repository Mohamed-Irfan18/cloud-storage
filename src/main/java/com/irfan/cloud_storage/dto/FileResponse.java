package com.irfan.cloud_storage.dto;

import com.irfan.cloud_storage.entity.FileMetadata;

import java.time.LocalDateTime;

public record FileResponse(
        Long id,
        String fileName,
        String contentType,
        Long fileSize,
        LocalDateTime uploadedAt
) {
    public static FileResponse from(FileMetadata file) {
        return new FileResponse(
                file.getId(),
                file.getFileName(),
                file.getContentType(),
                file.getFileSize(),
                file.getUploadedAt()
        );
    }
}