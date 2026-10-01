
package com.irfan.cloud_storage.repository;

import com.irfan.cloud_storage.entity.FileMetadata;
import com.irfan.cloud_storage.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FileRepository
        extends JpaRepository<FileMetadata, Long> {

    List<FileMetadata> findByUser(User user);

    Optional<FileMetadata> findByIdAndUser(Long id, User user);
}