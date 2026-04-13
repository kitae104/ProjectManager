package com.projectmanager.backend.user.application;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserRoleMigrationRunner implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        try {
            int mentorProfessorUpdated = jdbcTemplate.update(
                    "UPDATE users SET role = 'ADMIN' WHERE role IN ('MENTOR', 'PROFESSOR')"
            );
            int viewerUpdated = jdbcTemplate.update(
                    "UPDATE users SET role = 'MEMBER' WHERE role = 'VIEWER'"
            );

            if (mentorProfessorUpdated > 0 || viewerUpdated > 0) {
                log.info(
                        "Normalized legacy user roles: mentor/professor->admin={}, viewer->member={}",
                        mentorProfessorUpdated,
                        viewerUpdated
                );
            }
        } catch (Exception exception) {
            log.debug("Skipped legacy role normalization: {}", exception.getMessage());
        }
    }
}
