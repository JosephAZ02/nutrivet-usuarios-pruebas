package com.nutrivet.backend.util;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;

import com.nutrivet.backend.dto.ImportedInvoiceData;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.springframework.stereotype.Component;

@Component
public class XmlInvoiceParser {

    public ImportedInvoiceData parseInvoiceData(InputStream inputStream) {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();// lector del xml

        try {
            DocumentBuilder builder = factory.newDocumentBuilder();// crea un objeto DocumentBuilder para analizar el
                                                                   // XML
            Document document = builder.parse(inputStream);// Lee el contenido del InputStream y lo convierte en un
                                                           // Document

            ImportedInvoiceData data = new ImportedInvoiceData();// crear el objeto

            NodeList claveNodes = document.getElementsByTagName("Clave");// busca la etiquera con el nombre

            if (claveNodes.getLength() == 0) {
                throw new IllegalArgumentException("El XML no contiene la clave de la factura.");
            }

            String electronicKey = claveNodes.item(0).getTextContent().trim();// obtener el valor
            data.setElectronicKey(electronicKey);// guardar el valor en el objeto

            NodeList consecutiveNodes = document.getElementsByTagName("NumeroConsecutivo");

            if (consecutiveNodes.getLength() == 0) {
                throw new IllegalArgumentException(
                        "El XML no contiene el número consecutivo.");
            }

            String consecutiveNumber = consecutiveNodes.item(0)
                    .getTextContent()
                    .trim();

            data.setConsecutiveNumber(consecutiveNumber);

            NodeList emissionDateNodes = document.getElementsByTagName("FechaEmision");

            if (emissionDateNodes.getLength() == 0) {
                throw new IllegalArgumentException(
                        "El XML no contiene la fecha de emisión.");
            }

            String emissionDateText = emissionDateNodes.item(0)
                    .getTextContent()
                    .trim();

            LocalDateTime emissionDate = OffsetDateTime.parse(emissionDateText)
                    .toLocalDateTime();

            data.setEmissionDate(emissionDate);

            NodeList supplierNameNodes = document.getElementsByTagName("Nombre");

            if (supplierNameNodes.getLength() == 0) {
                throw new IllegalArgumentException(
                        "El XML no contiene el nombre del emisor.");
            }

            data.setSupplierName(supplierNameNodes.item(0).getTextContent().trim());

            NodeList identificationNodes = document.getElementsByTagName("Identificacion");

            if (identificationNodes.getLength() == 0) {
                throw new IllegalArgumentException(
                        "El XML no contiene la identificación del emisor.");
            }

            NodeList supplierNumberNodes = ((org.w3c.dom.Element) identificationNodes.item(0))
                    .getElementsByTagName("Numero");

            if (supplierNumberNodes.getLength() == 0) {
                throw new IllegalArgumentException(
                        "El XML no contiene el número de identificación del emisor.");
            }

            data.setSupplierIdentification(supplierNumberNodes.item(0).getTextContent().trim());

            NodeList supplierNodes = document.getElementsByTagName("Emisor");
            if (supplierNodes.getLength() > 0) {
                NodeList emailNodes = ((Element) supplierNodes.item(0))
                        .getElementsByTagName("CorreoElectronico");
                if (emailNodes.getLength() > 0) {
                    data.setSupplierEmail(emailNodes.item(0).getTextContent().trim());
                }
            }

            NodeList saleConditionNodes = document.getElementsByTagName("CondicionVenta");

            if (saleConditionNodes.getLength() > 0) {
                data.setSaleCondition(saleConditionNodes.item(0).getTextContent().trim());
            }

            NodeList creditTermNodes = document.getElementsByTagName("PlazoCredito");

            if (creditTermNodes.getLength() > 0) {
                data.setCreditTerm(Integer.valueOf(creditTermNodes.item(0).getTextContent().trim()));
            }

            NodeList currencyNodes = document.getElementsByTagName("CodigoTipoMoneda");

            if (currencyNodes.getLength() > 0) {
                data.setCurrency(currencyNodes.item(0).getTextContent().trim());
            }

            NodeList totalNodes = document.getElementsByTagName("TotalComprobante");

            if (totalNodes.getLength() == 0) {
                throw new IllegalArgumentException(
                        "El XML no contiene el total de la factura.");
            }

            data.setTotalAmount(Double.parseDouble(totalNodes.item(0).getTextContent().trim()));

            return data;
        } catch (Exception exception) {
            throw new IllegalArgumentException("No se pudo leer el XML.", exception);
        }
    }
}
