package com.nutrivet.selenium.users;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class LoginSuccessfulTest {

    private WebDriver driver;

    //@BeforeEach
    public void setUp() {
        // WebDriverManager descarga y configura el ChromeDriver automáticamente
        WebDriverManager.chromedriver().setup();
        driver = new ChromeDriver();
        driver.manage().window().maximize();
        driver.get("http://localhost/login");
    }

    //@Test
    public void testLoginExitoso() {
        // 1. Encontrar los campos y escribir
        driver.findElement(By.cssSelector("input[type='text']")).sendKeys("admin");
        driver.findElement(By.cssSelector("input[type='password']")).sendKeys("123456");

        // 2. Hacer clic en el botón de Iniciar Sesión
        driver.findElement(By.cssSelector("button[type='submit']")).click();

        // 3. Esperar a que la URL cambie a /dashboard
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));
        wait.until(ExpectedConditions.urlContains("/dashboard"));

        // 4. Verificar que estamos en el Dashboard
        assertTrue(driver.getCurrentUrl().contains("/dashboard"), "No se redirigió al dashboard");
    }

    //@AfterEach
    public void tearDown() {
        if (driver != null) {
            driver.quit(); // Cierra el navegador
        }
    }
}