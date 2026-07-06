package com.carbontrack.service.impl;

import com.carbontrack.entity.User;
import com.carbontrack.service.EmailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

import org.springframework.context.annotation.Lazy;
import org.springframework.scheduling.annotation.Async;

@Service
@Lazy
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final String apiKey;
    private final String fromEmail;
    private final String frontendUrl;
    private final HttpClient httpClient;
    private static final String LOGO_URL = "https://res.cloudinary.com/dngurjsdw/image/upload/v1783233674/carbon_tracker_ojorhq.png";
    // For Resend HTTP API, we use the public image URL directly inside the <img> src attribute
    private static final String LOGO_CID = LOGO_URL;

    public EmailServiceImpl(@Value("${resend.api-key:}") String apiKey,
                            @Value("${resend.from-email:onboarding@resend.dev}") String fromEmail,
                            @Value("${app.frontend-url:http://localhost:5173}") String frontendUrl) {
        this.apiKey = apiKey;
        this.fromEmail = fromEmail;
        this.frontendUrl = frontendUrl;
        this.httpClient = HttpClient.newHttpClient();
        log.info("EmailServiceImpl initialized with Resend REST API. Sender: {}. Frontend: {}", fromEmail, frontendUrl);
    }

    private void sendEmailViaResend(String to, String subject, String htmlContent) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("Resend API Key is missing! Email not sent to {}. Logging content to console instead:", to);
            logEmailFallback(to, subject, htmlContent);
            return;
        }

        try {
            // Escape quotes, newlines, and backslashes in HTML content for JSON body
            String escapedHtml = htmlContent
                    .replace("\\", "\\\\")
                    .replace("\"", "\\\"")
                    .replace("\n", "\\n")
                    .replace("\r", "\\r");

            String jsonBody = "{"
                    + "\"from\":\"CarbonMitra <" + fromEmail + ">\","
                    + "\"to\":[\"" + to + "\"],"
                    + "\"subject\":\"" + subject + "\","
                    + "\"html\":\"" + escapedHtml + "\""
                    + "}";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.resend.com/emails"))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody, StandardCharsets.UTF_8))
                    .build();

            int maxRetries = 3;
            int attempt = 0;
            long delay = 1000;
            while (attempt < maxRetries) {
                try {
                    attempt++;
                    HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                    if (response.statusCode() >= 200 && response.statusCode() < 300) {
                        log.info("Email sent successfully via Resend API to {} on attempt {}. Response: {}", to, attempt, response.body());
                        return;
                    } else {
                        log.warn("Failed to send email to {} (status: {}). Attempt {} of {}.", to, response.statusCode(), attempt, maxRetries);
                    }
                } catch (Exception e) {
                    log.error("Error sending email to {} on attempt {} of {}: {}", to, attempt, maxRetries, e.getMessage());
                }
                if (attempt < maxRetries) {
                    try {
                        Thread.sleep(delay);
                        delay *= 2;
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            }
            log.error("All {} attempts to send email to {} failed. Logging fallback.", maxRetries, to);
            logEmailFallback(to, subject, htmlContent);
        } catch (Exception e) {
            log.error("Error building email via Resend API to {}: {}", to, e.getMessage(), e);
            logEmailFallback(to, subject, htmlContent);
        }
    }

    private void logEmailFallback(String to, String subject, String htmlContent) {
        log.info("\n" +
                "========================================= FALLBACK HTML EMAIL =========================================\n" +
                "To: {}\n" +
                "Subject: {}\n" +
                "Content:\n{}\n" +
                "======================================================================================================",
                to, subject, htmlContent);
    }

    @Override
    @Async("emailExecutor")
    public void sendWelcomeEmail(User user) {
        String htmlContent = buildWelcomeHtmlTemplate(user.getUsername());
        sendEmailViaResend(user.getEmail(), "Welcome to CarbonMitra! 🌍", htmlContent);
    }

    @Override
    @Async("emailExecutor")
    public void sendPasswordResetEmail(User user, String token) {
        String htmlContent = buildPasswordResetHtmlTemplate(user.getUsername(), token);
        sendEmailViaResend(user.getEmail(), "Reset Your CarbonMitra Password 🔑", htmlContent);
    }

    @Override
    @Async("emailExecutor")
    public void sendStreakWarningEmail(User user) {
        String htmlContent = buildStreakWarningHtmlTemplate(user.getUsername());
        sendEmailViaResend(user.getEmail(), "Don't lose your CarbonMitra streak! 🔥", htmlContent);
    }

    @Override
    @Async("emailExecutor")
    public void sendWeeklyDigestEmail(User user, Double weeklyCo2, Double weeklyOffset, int badgesCount) {
        String htmlContent = buildWeeklyDigestHtmlTemplate(user.getUsername(), weeklyCo2, weeklyOffset, badgesCount);
        sendEmailViaResend(user.getEmail(), "Your CarbonMitra Weekly Digest 🌿", htmlContent);
    }

    private String buildWelcomeHtmlTemplate(String username) {
        return "<!DOCTYPE html>\n" +
                "<html>\n" +
                "<head>\n" +
                "    <meta charset=\"UTF-8\">\n" +
                "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
                "    <title>Welcome to CarbonMitra</title>\n" +
                "    <style>\n" +
                "        body {\n" +
                "            font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;\n" +
                "            background-color: #f1f5f9;\n" +
                "            margin: 0;\n" +
                "            padding: 0;\n" +
                "            -webkit-font-smoothing: antialiased;\n" +
                "        }\n" +
                "        .container {\n" +
                "            max-width: 600px;\n" +
                "            margin: 40px auto;\n" +
                "            background-color: #ffffff;\n" +
                "            border-radius: 16px;\n" +
                "            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);\n" +
                "            overflow: hidden;\n" +
                "        }\n" +
                "        .header {\n" +
                "            background: linear-gradient(135deg, #10b981 0%, #059669 100%);\n" +
                "            padding: 40px 20px;\n" +
                "            text-align: center;\n" +
                "            color: #ffffff;\n" +
                "        }\n" +
                "        .header h1 {\n" +
                "            margin: 0;\n" +
                "            font-size: 28px;\n" +
                "            font-weight: 700;\n" +
                "            letter-spacing: -0.025em;\n" +
                "        }\n" +
                "        .header p {\n" +
                "            margin: 10px 0 0 0;\n" +
                "            font-size: 16px;\n" +
                "            opacity: 0.9;\n" +
                "        }\n" +
                "        .content {\n" +
                "            padding: 40px 30px;\n" +
                "            color: #334155;\n" +
                "            line-height: 1.6;\n" +
                "        }\n" +
                "        .content h2 {\n" +
                "            margin-top: 0;\n" +
                "            font-size: 20px;\n" +
                "            color: #0f172a;\n" +
                "        }\n" +
                "        .steps {\n" +
                "            margin: 30px 0;\n" +
                "            padding: 0;\n" +
                "            list-style: none;\n" +
                "        }\n" +
                "        .step-item {\n" +
                "            display: flex;\n" +
                "            align-items: flex-start;\n" +
                "            margin-bottom: 20px;\n" +
                "            background-color: #f8fafc;\n" +
                "            padding: 15px;\n" +
                "            border-radius: 12px;\n" +
                "            border-left: 4px solid #10b981;\n" +
                "        }\n" +
                "        .step-number {\n" +
                "            font-weight: bold;\n" +
                "            color: #10b981;\n" +
                "            margin-right: 15px;\n" +
                "            font-size: 18px;\n" +
                "            line-height: 1;\n" +
                "        }\n" +
                "        .step-text h3 {\n" +
                "            margin: 0 0 5px 0;\n" +
                "            font-size: 16px;\n" +
                "            color: #1f2937;\n" +
                "        }\n" +
                "        .step-text p {\n" +
                "            margin: 0;\n" +
                "            font-size: 14px;\n" +
                "            color: #4b5563;\n" +
                "        }\n" +
                "        .btn-container {\n" +
                "            text-align: center;\n" +
                "            margin: 35px 0 15px 0;\n" +
                "        }\n" +
                "        .btn {\n" +
                "            background-color: #10b981;\n" +
                "            color: #ffffff !important;\n" +
                "            text-decoration: none;\n" +
                "            padding: 14px 30px;\n" +
                "            font-weight: 600;\n" +
                "            border-radius: 10px;\n" +
                "            display: inline-block;\n" +
                "            box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2), 0 2px 4px -1px rgba(16, 185, 129, 0.1);\n" +
                "            transition: background-color 0.2s;\n" +
                "        }\n" +
                "        .btn:hover {\n" +
                "            background-color: #059669;\n" +
                "        }\n" +
                "        .footer {\n" +
                "            background-color: #f8fafc;\n" +
                "            padding: 25px 20px;\n" +
                "            text-align: center;\n" +
                "            color: #64748b;\n" +
                "            font-size: 12px;\n" +
                "            border-top: 1px solid #e2e8f0;\n" +
                "        }\n" +
                "        .footer a {\n" +
                "            color: #10b981;\n" +
                "            text-decoration: none;\n" +
                "        }\n" +
                "    </style>\n" +
                "</head>\n" +
                "<body>\n" +
                "    <div class=\"container\">\n" +
                "        <div class=\"header\">\n" +
                "            <img src=\"" + LOGO_CID + "\" alt=\"CarbonMitra Logo\" style=\"height: 50px; width: auto; margin-bottom: 12px;\" />\n" +
                "            <h1>Welcome to CarbonMitra!</h1>\n" +
                "            <p>Thank you for helping make our Earth pollution-free</p>\n" +
                "        </div>\n" +
                "        <div class=\"content\">\n" +
                "            <h2>Hello, " + username + "! 👋</h2>\n" +
                "            <p>Thank you for joining CarbonMitra and taking your first steps toward making the Earth free of pollution! We're thrilled to have you onboard. Our goal is to help you easily monitor, analyze, and reduce your carbon footprint through simple day-to-day actions.</p>" +
                "            \n" +
                "            <p>Here are a few quick steps to get you started on the platform:</p>\n" +
                "            \n" +
                "            <div class=\"steps\">\n" +
                "                <div class=\"step-item\">\n" +
                "                    <span class=\"step-number\">1</span>\n" +
                "                    <div class=\"step-text\">\n" +
                "                        <h3>Log Your First Activity</h3>\n" +
                "                        <p>Track your food choice, transport type, or energy usage in seconds.</p>\n" +
                "                    </div>\n" +
                "                </div>\n" +
                "                <div class=\"step-item\">\n" +
                "                    <span class=\"step-number\">2</span>\n" +
                "                    <div class=\"step-text\">\n" +
                "                        <h3>Set a Carbon Goal</h3>\n" +
                "                        <p>Choose an emission reduction target and view your progression path.</p>\n" +
                "                    </div>\n" +
                "                </div>\n" +
                "                <div class=\"step-item\">\n" +
                "                    <span class=\"step-number\">3</span>\n" +
                "                    <div class=\"step-text\">\n" +
                "                        <h3>Earn Badges</h3>\n" +
                "                        <p>Receive achievements and unlock milestones for maintaining streaks and reducing waste.</p>\n" +
                "                    </div>\n" +
                "                </div>\n" +
                "            </div>\n" +
                "            \n" +
                "            <div class=\"btn-container\">\n" +
                "                <a href=\"" + frontendUrl + "\" class=\"btn\">Go to Dashboard</a>\n" +
                "            </div>\n" +
                "        </div>\n" +
                "        <div class=\"footer\">\n" +
                "            <p>You received this email because you registered on CarbonMitra.</p>\n" +
                "            <p>&copy; 2026 CarbonMitra. All rights reserved.</p>\n" +
                "        </div>\n" +
                "    </div>\n" +
                "</body>\n" +
                "</html>";
    }

    private String buildPasswordResetHtmlTemplate(String username, String token) {
        String resetUrl = frontendUrl + "/reset-password?token=" + token;
        return "<!DOCTYPE html>\n" +
                "<html>\n" +
                "<head>\n" +
                "    <meta charset=\"UTF-8\">\n" +
                "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
                "    <title>Reset Your Password</title>\n" +
                "    <style>\n" +
                "        body {\n" +
                "            font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;\n" +
                "            background-color: #f1f5f9;\n" +
                "            margin: 0;\n" +
                "            padding: 0;\n" +
                "            -webkit-font-smoothing: antialiased;\n" +
                "        }\n" +
                "        .container {\n" +
                "            max-width: 600px;\n" +
                "            margin: 40px auto;\n" +
                "            background-color: #ffffff;\n" +
                "            border-radius: 16px;\n" +
                "            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);\n" +
                "            overflow: hidden;\n" +
                "        }\n" +
                "        .header {\n" +
                "            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);\n" +
                "            padding: 40px 20px;\n" +
                "            text-align: center;\n" +
                "            color: #ffffff;\n" +
                "        }\n" +
                "        .header h1 {\n" +
                "            margin: 0;\n" +
                "            font-size: 28px;\n" +
                "            font-weight: 700;\n" +
                "            letter-spacing: -0.025em;\n" +
                "        }\n" +
                "        .header p {\n" +
                "            margin: 10px 0 0 0;\n" +
                "            font-size: 16px;\n" +
                "            opacity: 0.9;\n" +
                "        }\n" +
                "        .content {\n" +
                "            padding: 40px 30px;\n" +
                "            color: #334155;\n" +
                "            line-height: 1.6;\n" +
                "        }\n" +
                "        .content h2 {\n" +
                "            margin-top: 0;\n" +
                "            font-size: 20px;\n" +
                "            color: #0f172a;\n" +
                "        }\n" +
                "        .warning-box {\n" +
                "            margin: 25px 0;\n" +
                "            background-color: #fef2f2;\n" +
                "            padding: 15px 20px;\n" +
                "            border-radius: 12px;\n" +
                "            border-left: 4px solid #ef4444;\n" +
                "            color: #991b1b;\n" +
                "            font-size: 14px;\n" +
                "        }\n" +
                "        .btn-container {\n" +
                "            text-align: center;\n" +
                "            margin: 35px 0 15px 0;\n" +
                "        }\n" +
                "        .btn {\n" +
                "            background-color: #ef4444;\n" +
                "            color: #ffffff !important;\n" +
                "            text-decoration: none;\n" +
                "            padding: 14px 30px;\n" +
                "            font-weight: 600;\n" +
                "            border-radius: 10px;\n" +
                "            display: inline-block;\n" +
                "            box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.2), 0 2px 4px -1px rgba(239, 68, 68, 0.1);\n" +
                "            transition: background-color 0.2s;\n" +
                "        }\n" +
                "        .btn:hover {\n" +
                "            background-color: #dc2626;\n" +
                "        }\n" +
                "        .footer {\n" +
                "            background-color: #f8fafc;\n" +
                "            padding: 25px 20px;\n" +
                "            text-align: center;\n" +
                "            color: #64748b;\n" +
                "            font-size: 12px;\n" +
                "            border-top: 1px solid #e2e8f0;\n" +
                "        }\n" +
                "    </style>\n" +
                "</head>\n" +
                "<body>\n" +
                "    <div class=\"container\">\n" +
                "        <div class=\"header\">\n" +
                "            <img src=\"" + LOGO_CID + "\" alt=\"CarbonMitra Logo\" style=\"height: 50px; width: auto; margin-bottom: 12px;\" />\n" +
                "            <h1>Reset Your Password</h1>\n" +
                "            <p>CarbonMitra Security Notification</p>\n" +
                "        </div>\n" +
                "        <div class=\"content\">\n" +
                "            <h2>Hello, " + username + "! 👋</h2>\n" +
                "            <p>We received a request to reset the password for your CarbonMitra account. Click the button below to choose a new password:</p>\n" +
                "            \n" +
                "            <div class=\"btn-container\">\n" +
                "                <a href=\"" + resetUrl + "\" class=\"btn\">Reset Password</a>\n" +
                "            </div>\n" +
                "            \n" +
                "            <div class=\"warning-box\">\n" +
                "                <strong>Important:</strong> This reset link is only valid for <strong>15 minutes</strong>. If you did not request this change, please ignore this email or contact support if you have concerns.\n" +
                "            </div>\n" +
                "        </div>\n" +
                "        <div class=\"footer\">\n" +
                "            <p>You received this email because a password reset was requested for your account on CarbonMitra.</p>\n" +
                "            <p>&copy; 2026 CarbonMitra. All rights reserved.</p>\n" +
                "        </div>\n" +
                "    </div>\n" +
                "</body>\n" +
                "</html>";
    }

    private String buildStreakWarningHtmlTemplate(String username) {
        return "<!DOCTYPE html>\n" +
                "<html>\n" +
                "<head>\n" +
                "    <style>\n" +
                "        body { font-family: Arial, sans-serif; background-color: #f8fafc; color: #1e293b; padding: 20px; }\n" +
                "        .card { background-color: #ffffff; border-radius: 16px; padding: 30px; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; }\n" +
                "        .header { text-align: center; font-size: 24px; color: #ef4444; font-weight: bold; margin-bottom: 20px; }\n" +
                "        .btn-container { text-align: center; margin: 25px 0; }\n" +
                "        .btn { background-color: #10b981; color: #ffffff; padding: 12px 30px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 15px; }\n" +
                "        .footer { text-align: center; color: #64748b; font-size: 11px; margin-top: 30px; }\n" +
                "    </style>\n" +
                "</head>\n" +
                "<body>\n" +
                "    <div class=\"card\">\n" +
                "        <div style=\"text-align: center; margin-bottom: 10px;\">\n" +
                "             <img src=\"" + LOGO_CID + "\" alt=\"CarbonMitra Logo\" style=\"height: 50px; width: auto;\" />\n" +
                "        </div>\n" +
                "        <div class=\"header\">Don't Lose Your Streak! 🔥</div>\n" +
                "        <p>Hello " + username + ",</p>\n" +
                "        <p>You logged your carbon activities yesterday, but you haven't logged any green choices today! To keep your daily tracking streak alive and continue unlocking special gamification badges, record an activity before midnight.</p>\n" +
                "        <div class=\"btn-container\">\n" +
                "            <a href=\"" + frontendUrl + "/log-activity\" class=\"btn\">Log Activity Now</a>\n" +
                "        </div>\n" +
                "        <p>Keep up the great work in helping make our Earth pollution-free!</p>\n" +
                "        <div class=\"footer\">\n" +
                "            <p>&copy; 2026 CarbonMitra. All rights reserved.</p>\n" +
                "        </div>\n" +
                "    </div>\n" +
                "</body>\n" +
                "</html>";
    }

    private String buildWeeklyDigestHtmlTemplate(String username, Double co2, Double offset, int badges) {
        return "<!DOCTYPE html>\n" +
                "<html>\n" +
                "<head>\n" +
                "    <style>\n" +
                "        body { font-family: Arial, sans-serif; background-color: #f8fafc; color: #1e293b; padding: 20px; }\n" +
                "        .card { background-color: #ffffff; border-radius: 16px; padding: 30px; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; }\n" +
                "        .header { text-align: center; font-size: 24px; color: #10b981; font-weight: bold; margin-bottom: 25px; }\n" +
                "        .stat-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 15px; margin: 20px 0; }\n" +
                "        .stat-box { background-color: #f1f5f9; padding: 15px; border-radius: 12px; text-align: center; }\n" +
                "        .stat-num { font-size: 20px; font-weight: bold; color: #0f172a; }\n" +
                "        .stat-label { font-size: 11px; color: #64748b; margin-top: 5px; text-transform: uppercase; }\n" +
                "        .footer { text-align: center; color: #64748b; font-size: 11px; margin-top: 30px; }\n" +
                "    </style>\n" +
                "</head>\n" +
                "<body>\n" +
                "    <div class=\"card\">\n" +
                "        <div style=\"text-align: center; margin-bottom: 10px;\">\n" +
                "             <img src=\"" + LOGO_CID + "\" alt=\"CarbonMitra Logo\" style=\"height: 50px; width: auto;\" />\n" +
                "        </div>\n" +
                "        <div class=\"header\">Your Weekly Carbon Digest 🌿</div>\n" +
                "        <p>Hello " + username + ",</p>\n" +
                "        <p>Here is your sustainability summary for the past week. Thank you for logging your choices and contributing to a greener planet!</p>\n" +
                "        \n" +
                "        <div class=\"stat-grid\">\n" +
                "            <div class=\"stat-box\">\n" +
                "                <div class=\"stat-num\">" + co2 + " kg</div>\n" +
                "                <div class=\"stat-label\">CO2e Logged</div>\n" +
                "            </div>\n" +
                "            <div class=\"stat-box\">\n" +
                "                <div class=\"stat-num\">" + offset + " kg</div>\n" +
                "                <div class=\"stat-label\">Eco Offset</div>\n" +
                "            </div>\n" +
                "        </div>\n" +
                "        \n" +
                "        <p>You also earned <strong>" + badges + "</strong> new badge(s) this week!</p>\n" +
                "        <p>Keep logging and monitoring your footprint on CarbonMitra to hit your sustainability targets.</p>\n" +
                "        \n" +
                "        <div class=\"footer\">\n" +
                "            <p>&copy; 2026 CarbonMitra. All rights reserved.</p>\n" +
                "        </div>\n" +
                "    </div>\n" +
                "</body>\n" +
                "</html>";
    }
}
