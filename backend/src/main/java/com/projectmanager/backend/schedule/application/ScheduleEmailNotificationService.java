package com.projectmanager.backend.schedule.application;

import com.projectmanager.backend.project.domain.Project;
import com.projectmanager.backend.schedule.domain.Schedule;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class ScheduleEmailNotificationService {

    private final JavaMailSender mailSender;
    private final ScheduleEmailContentService scheduleEmailContentService;

    @Value("${app.mail.from:}")
    private String fromAddress;

    public ScheduleEmailNotificationService(
            ObjectProvider<JavaMailSender> mailSenderProvider,
            ScheduleEmailContentService scheduleEmailContentService
    ) {
        this.mailSender = mailSenderProvider.getIfAvailable();
        this.scheduleEmailContentService = scheduleEmailContentService;
    }

    public int sendScheduleCreatedEmail(Project project, Schedule schedule, List<String> recipients) {
        if (mailSender == null) {
            throw new IllegalArgumentException("메일 발송 기능이 설정되지 않았습니다. SMTP 설정을 확인해 주세요.");
        }

        if (recipients.isEmpty()) {
            throw new IllegalArgumentException("메일 수신자 목록이 비어 있습니다.");
        }

        String subject = "[%s] 일정 공유: %s".formatted(project.getTitle(), schedule.getTitle());
        String htmlBody = scheduleEmailContentService.generateScheduleCreatedHtml(project, schedule);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                    message,
                    true,
                    StandardCharsets.UTF_8.name()
            );

            if (!fromAddress.isBlank()) {
                helper.setFrom(fromAddress);
            }

            helper.setTo(recipients.toArray(String[]::new));
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            return recipients.size();
        } catch (MessagingException | MailException exception) {
            throw new IllegalArgumentException("일정 안내 메일 발송에 실패했습니다.", exception);
        }
    }
}
