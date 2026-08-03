package com.dashboard.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @GetMapping("/summary")
    public Map<String, Object> summary(Authentication authentication) {
        return Map.of(
                "user", authentication.getName(),
                "stats", List.of(
                        Map.of("label", "Total Users", "value", 1284),
                        Map.of("label", "Active Sessions", "value", 76),
                        Map.of("label", "Revenue (MTD)", "value", 24350),
                        Map.of("label", "Open Tickets", "value", 12)
                )
        );
    }
}
