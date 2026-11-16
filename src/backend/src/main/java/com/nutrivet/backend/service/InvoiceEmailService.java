package com.nutrivet.backend.service;

import java.util.Date;
import java.util.Properties;
import java.time.ZoneId;
import java.time.ZonedDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.nutrivet.backend.domain.SupplierInvoice;

import jakarta.mail.Flags;
import jakarta.mail.Folder;
import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.Multipart;
import jakarta.mail.Part;
import jakarta.mail.Session;
import jakarta.mail.Store;
import jakarta.mail.search.AndTerm;
import jakarta.mail.search.ComparisonTerm;
import jakarta.mail.search.FlagTerm;
import jakarta.mail.search.ReceivedDateTerm;
import java.io.IOException;
import java.io.InputStream;

@Service
public class InvoiceEmailService {
    @Value("${invoice.mail.host}")
    private String host;

    @Value("${invoice.mail.port}")
    private int port;

    @Value("${invoice.mail.username}")
    private String username;

    @Value("${invoice.mail.password}")
    private String password;

    @Autowired
    private InvoiceImportsServices invoiceImportsServices;

    public InvoiceEmailService() {
    }

    @Scheduled(fixedDelay = 6000) //  Ejecutar cada 5 minutos 300000 milisegundos 10 minutos 600000 y 30 minutos
    // 1800000
    public void readEmails() {
        Properties properties = new Properties();
        properties.put("mail.store.protocol", "imaps");// usar el protocolo IMAPS

        

        Session session = Session.getInstance(properties);// crear una sesión de correo con las propiedades configuradas

        try (Store store = session.getStore("imaps")) {
            store.connect(host, port, username, password);// conectarse al servidor

            try (Folder inbox = store.getFolder("INBOX")) {// abrir la carpeta de entrada del correo
                inbox.open(Folder.READ_WRITE);

                ZoneId costaRicaZone = ZoneId.of("America/Costa_Rica");
                ZonedDateTime nowInCostaRica = ZonedDateTime.now(costaRicaZone);
                Date startOfToday = Date.from(
                        nowInCostaRica.toLocalDate().atStartOfDay(costaRicaZone).toInstant());
                Date startOfTomorrow = Date.from(
                        nowInCostaRica.toLocalDate().plusDays(1).atStartOfDay(costaRicaZone).toInstant());

                // Busca solo correos no leido recibidos durante el día actual
                FlagTerm unreadMessages = new FlagTerm(
                        new Flags(Flags.Flag.SEEN), false);
                ReceivedDateTerm receivedToday = new ReceivedDateTerm(
                        ComparisonTerm.GE, startOfToday);
                ReceivedDateTerm receivedBeforeTomorrow = new ReceivedDateTerm(
                        ComparisonTerm.LT, startOfTomorrow);

                Message[] messages = inbox.search(new AndTerm(
                        unreadMessages,
                        new AndTerm(receivedToday, receivedBeforeTomorrow)));

                for (Message message : messages) {
                    Object content = message.getContent();// si incluye adjuntos

                    // Un correo Multipart que contiene varias cosas
                    if (content instanceof Multipart multipart) {
                        boolean processed = false;

                        // Recorre cada parte del correo para identificar archivos adjuntos
                        for (int i = 0; i < multipart.getCount(); i++) {
                            // Obtiene un aparte del correo
                            Part part = multipart.getBodyPart(i);

                            // Valida que la parte sea un adjunto y que el archivo sea un XML
                            if (Part.ATTACHMENT.equalsIgnoreCase(part.getDisposition())
                                    && part.getFileName() != null
                                    && part.getFileName().toLowerCase().endsWith(".xml")) {

                                try (InputStream inputStream = part.getInputStream()) {
                                    String[] messageIdHeaders = message.getHeader("Message-ID");
                                    String messageId = messageIdHeaders != null
                                            && messageIdHeaders.length > 0
                                                    ? messageIdHeaders[0]
                                                    : null;
                                    if (messageId == null || messageId.isBlank()) {
                                        messageId = "EMAIL-" + message.getMessageNumber();
                                    }

                                    SupplierInvoice invoice = invoiceImportsServices.importInvoice(
                                            inputStream, part.getFileName(), messageId);
                                    System.out.println("Factura importada: " + invoice.getElectronicKey());
                                    processed = true;
                                } catch (IllegalArgumentException exception) {
                                    if ("La factura ya fue importada.".equals(exception.getMessage())) {
                                        System.out.println("Factura duplicada se omite");
                                        processed = true;
                                    } else {
                                        throw exception;
                                    }
                                }
                            }
                        }

                        if (processed) {
                            message.setFlag(Flags.Flag.SEEN, true);// marcar como leído después de atenderlo
                        }
                    }

                }

                System.out.println("Correos no leídos: " + messages.length);
            }
        } catch (MessagingException exception) {
            throw new IllegalStateException(
                    "No se pudo conectar al correo", exception);
        } catch (IOException exception) {
            throw new IllegalStateException(
                    "No se pudo leer el contenido del correo", exception);
        }
    }
}