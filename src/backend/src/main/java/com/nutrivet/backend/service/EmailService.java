// src/main/java/com/nutrivet/backend/service/EmailService.java
package com.nutrivet.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendPasswordResetEmail(String to, String token) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("no-reply@nutrivet.com");
            helper.setTo(to);
            helper.setSubject("Recuperación de contraseña - NutriVet");

            String htmlContent = """
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #198754; text-align: center;">NutriVet</h2>
                    <p>Hola,</p>
                    <p>Usted ha solicitado restablecer su contraseña. Usa el siguiente código para continuar:</p>
                    <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 2px; border-radius: 4px;">
                        <strong>%s</strong>
                    </div>
                    <p style="margin-top: 20px;">Este código expirará en 30 minutos. Si no solicitó este cambio, ignore este correo.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #6c757d; text-align: center;">Este es un mensaje automático, por favor no responder.</p>
                </div>
                """.formatted(token);

            helper.setText(htmlContent, true);
            mailSender.send(message);

        } catch (MessagingException e) {
            throw new RuntimeException("Error al enviar el correo de recuperación: " + e.getMessage());
        }
    }
}