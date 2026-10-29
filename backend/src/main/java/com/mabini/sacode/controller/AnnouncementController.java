package com.mabini.sacode.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mabini.sacode.domain.Announcement;
import com.mabini.sacode.repository.AnnouncementRepository;

@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    private final AnnouncementRepository announcements;

    public AnnouncementController(AnnouncementRepository announcements) {
        this.announcements = announcements;
    }

    @GetMapping
    public List<Announcement> recent(@RequestParam(defaultValue = "5") int limit) {
        return announcements.findRecent(limit);
    }
}
