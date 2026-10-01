package com.irfan.cloud_storage.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class SupabaseStorageService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.service-key}")
    private String serviceKey;

    @Value("${supabase.bucket}")
    private String bucket;

    private final RestClient restClient = RestClient.builder().build();

    public String uploadFile(MultipartFile file, String filePath) throws IOException {

        String url = supabaseUrl
                + "/storage/v1/object/"
                + bucket
                + "/"
                + filePath;

        System.out.println("SUPABASE UPLOAD URL = " + url);

        restClient.post()
                .uri(url)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + serviceKey)
                .header("apikey", serviceKey)
                .header("x-upsert", "false")
                .contentType(MediaType.parseMediaType(file.getContentType()))
                .body(file.getBytes())
                .retrieve()
                .toBodilessEntity();

        return filePath;
    }

    public void renameFile(String oldPath, String newPath, String contentType) {

        byte[] fileData = downloadFile(oldPath);

        String url = supabaseUrl
                + "/storage/v1/object/"
                + bucket
                + "/"
                + newPath;

        restClient.post()
                .uri(url)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + serviceKey)
                .header("apikey", serviceKey)
                .header("x-upsert", "false")
                .contentType(MediaType.parseMediaType(contentType))
                .body(fileData)
                .retrieve()
                .toBodilessEntity();

        deleteFile(oldPath);
    }
    public byte[] downloadFile(String filePath) {

        String url = supabaseUrl
                + "/storage/v1/object/"
                + bucket
                + "/"
                + filePath;

        return restClient.get()
                .uri(url)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + serviceKey)
                .header("apikey", serviceKey)
                .retrieve()
                .body(byte[].class);
    }
    public void deleteFile(String filePath) {

        String url = supabaseUrl
                + "/storage/v1/object/"
                + bucket
                + "/"
                + filePath;

        restClient.delete()
                .uri(url)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + serviceKey)
                .header("apikey", serviceKey)
                .retrieve()
                .toBodilessEntity();
    }
}