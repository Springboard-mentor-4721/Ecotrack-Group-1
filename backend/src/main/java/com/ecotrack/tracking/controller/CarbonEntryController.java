package com.ecotrack.tracking.controller;

import com.ecotrack.tracking.dto.CarbonEntryResponse;
import com.ecotrack.tracking.dto.CarbonSummaryResponse;
import com.ecotrack.tracking.dto.CreateCarbonEntryRequest;
import com.ecotrack.tracking.dto.UpdateCarbonEntryRequest;
import com.ecotrack.tracking.service.CarbonEntryService;
import com.ecotrack.user.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@Slf4j
@RestController
@RequestMapping("/api/carbon")
@RequiredArgsConstructor
public class CarbonEntryController {

    private final CarbonEntryService carbonEntryService;
    private final UserRepository userRepository;

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @PostMapping
    public ResponseEntity<CarbonEntryResponse> createEntry(
            @Valid @RequestBody CreateCarbonEntryRequest request,
            Authentication authentication) {
        log.info("Creating carbon entry");
        Long userId = getUserId(authentication);
        CarbonEntryResponse response = carbonEntryService.createEntry(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<CarbonEntryResponse> updateEntry(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCarbonEntryRequest request,
            Authentication authentication) {
        log.info("Updating carbon entry");
        Long userId = getUserId(authentication);
        CarbonEntryResponse response = carbonEntryService.updateEntry(id, userId, request);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEntry(
            @PathVariable Long id,
            Authentication authentication) {
        log.info("Deleting carbon entry");
        Long userId = getUserId(authentication);
        carbonEntryService.deleteEntry(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<CarbonEntryResponse> getEntryById(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        CarbonEntryResponse response = carbonEntryService.getEntryById(id, userId);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping
    public ResponseEntity<Page<CarbonEntryResponse>> getUserEntries(
            @RequestParam(value = "category", required = false) Long categoryId,
            @RequestParam(value = "subCategory", required = false) Long subCategoryId,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(value = "emissionMin", required = false) java.math.BigDecimal emissionMin,
            @RequestParam(value = "emissionMax", required = false) java.math.BigDecimal emissionMax,
            @RequestParam(value = "quantityMin", required = false) java.math.BigDecimal quantityMin,
            @RequestParam(value = "quantityMax", required = false) java.math.BigDecimal quantityMax,
            Pageable pageable,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        Page<CarbonEntryResponse> response = carbonEntryService.getUserEntries(userId, categoryId, subCategoryId, search, startDate, endDate, emissionMin, emissionMax, quantityMin, quantityMax, pageable);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/summary")
    public ResponseEntity<CarbonSummaryResponse> getDashboardSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        CarbonSummaryResponse response = carbonEntryService.getDashboardSummary(userId, startDate, endDate);
        return ResponseEntity.ok(response);
    }

    /**
     * Helper method to extract the userId from the authentication principal.
     * Required because CustomUserDetailsService only populates the email in the UserDetails principal.
     */
    private Long getUserId(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"))
                .getId();
    }
}
