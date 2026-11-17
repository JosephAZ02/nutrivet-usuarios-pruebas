
package com.nutrivet.selenium.users;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.junit.jupiter.api.*;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertTrue;

@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class UsersRolesTest {

    private WebDriver driver;
    private WebDriverWait wait;
    private JavascriptExecutor js;

    private static final String TEST_USERNAME = "selenium_" + UUID.randomUUID().toString().substring(0, 5);

    @BeforeEach
    public void setUp() {
        WebDriverManager.chromedriver().setup();
        driver = new ChromeDriver();
        driver.manage().window().maximize();
        wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        js = (JavascriptExecutor) driver;

        driver.get("http://localhost/login");

        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("input[type='text']")))
                .sendKeys("admin");
        driver.findElement(By.cssSelector("input[type='password']")).sendKeys("123456");
        driver.findElement(By.cssSelector("button[type='submit']")).click();

        wait.until(ExpectedConditions.urlContains("/dashboard"));
        WebElement sidebarButton = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(., 'Roles y Usuarios')]")));
        js.executeScript("arguments[0].click();", sidebarButton);

        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(., 'Gestión de Accesos')]")));
    }

    @Test
    @Order(1)
    @DisplayName("Prueba 1: Navegación y carga de tablas")
    public void testNavigationAndTableLoading() {
        assertTrue(driver.findElement(By.xpath("//h5[contains(., 'Roles y Permisos')]")).isDisplayed());
        assertTrue(driver.findElement(By.xpath("//h5[contains(., 'Usuarios del Sistema')]")).isDisplayed());
        assertTrue(driver.findElements(By.xpath("//table//tbody/tr")).size() > 0);
    }

    @Test
    @Order(2)
    @DisplayName("Prueba 2: Crear un Nuevo Usuario exitosamente")
    public void testCreateUser() {
        WebElement createButton = wait
                .until(ExpectedConditions.elementToBeClickable(By.xpath("//button[contains(., 'Crear Usuario')]")));
        js.executeScript("arguments[0].click();", createButton);

        wait.until(ExpectedConditions
                .visibilityOfElementLocated(By.xpath("//h5[contains(., 'Registrar Nuevo Usuario')]")));

        driver.findElement(By.xpath("//label[contains(., 'Nombre Completo')]/following-sibling::input"))
                .sendKeys("Usuario de Prueba Selenium");
        driver.findElement(By.xpath("//label[contains(., 'Username')]/following-sibling::input"))
                .sendKeys(TEST_USERNAME);
        driver.findElement(By.xpath("//label[contains(., 'Contraseña')]/following-sibling::input"))
                .sendKeys("password123");
        driver.findElement(By.xpath("//label[contains(., 'Correo Electrónico')]/following-sibling::input"))
                .sendKeys("test_" + TEST_USERNAME + "@gmail.com");

        Select roleSelect = new Select(
                driver.findElement(By.xpath("//label[contains(., 'Rol')]/following-sibling::select")));
        roleSelect.selectByVisibleText("Encargado de Ventas");

        WebElement saveButton = driver.findElement(By.xpath("//button[contains(., 'Guardar')]"));
        js.executeScript("arguments[0].click();", saveButton);

        // Esperar al mensaje de éxito y hacer clic en "Aceptar"
        WebElement acceptButton = wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector(".swal2-confirm")));
        js.executeScript("arguments[0].click();", acceptButton);

        // Esperar a que el mensaje desaparezca
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.className("swal2-container")));

        // Esperar a que la tabla se actualice
        WebDriverWait longWait = new WebDriverWait(driver, Duration.ofSeconds(20));
        assertTrue(longWait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//td[contains(., '" + TEST_USERNAME + "')]"))).isDisplayed());
    }

    @Test
    @Order(3)
    @DisplayName("Prueba 3: Editar Usuario dejando contraseña en blanco")
    public void testEditUserWithBlankPassword() {
        WebElement editButton = wait.until(ExpectedConditions.presenceOfElementLocated(
                By.xpath("//tr[td[contains(., '" + TEST_USERNAME + "')]]//button[contains(., 'Editar')]")));
        js.executeScript("arguments[0].click();", editButton);

        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h5[contains(., 'Editar Usuario')]")));

        WebElement nameInput = driver
                .findElement(By.xpath("//label[contains(., 'Nombre Completo')]/following-sibling::input"));
        nameInput.clear();
        nameInput.sendKeys("Nombre Editado Selenium");

        WebElement saveButton = driver.findElement(By.xpath("//button[contains(., 'Guardar')]"));
        js.executeScript("arguments[0].click();", saveButton);

        // Acepta la confirmación 
        WebElement confirmButton = wait
                .until(ExpectedConditions.elementToBeClickable(By.cssSelector(".swal2-confirm")));
        js.executeScript("arguments[0].click();", confirmButton);

        // Acepta el mensaje de éxito 
        WebElement acceptButton = wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector(".swal2-confirm")));
        js.executeScript("arguments[0].click();", acceptButton);

        // Espera a que desaparezca
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.className("swal2-container")));

        // Esperar la recarga de la tabla
        WebDriverWait longWait = new WebDriverWait(driver, Duration.ofSeconds(20));
        assertTrue(longWait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//td[contains(., 'Nombre Editado Selenium')]"))).isDisplayed());
    }

    @Test
    @Order(4)
    @DisplayName("Prueba 4: Intentar degradar al último Administrador (Validación)")
    public void testProtectionLastAdmin() {

        // Abre el modal de edición del usuario
        WebElement editButton = wait.until(ExpectedConditions.presenceOfElementLocated(
                By.xpath("//tr[td[contains(., 'Admin NutriVet')]]//button[contains(., 'Editar')]")));
        js.executeScript("arguments[0].click();", editButton);

        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h5[contains(., 'Editar Usuario')]")));

        // Cambiar el rol a Vendedor
        Select roleSelect = new Select(
                driver.findElement(By.xpath("//label[contains(., 'Rol')]/following-sibling::select")));
        roleSelect.selectByVisibleText("Encargado de Ventas");

        // CLIC en Guardar
        WebElement saveButton = driver.findElement(By.xpath("//button[contains(., 'Guardar')]"));
        js.executeScript("arguments[0].click();", saveButton);

        // Aceptar la confirmación
        WebElement confirmButton = wait
                .until(ExpectedConditions.elementToBeClickable(By.cssSelector(".swal2-confirm")));
        js.executeScript("arguments[0].click();", confirmButton);

        // Espera a que aparezca el mensaje del error
        WebDriverWait longWait = new WebDriverWait(driver, Duration.ofSeconds(10));

        longWait.until(ExpectedConditions.textToBePresentInElementLocated(
                By.className("swal2-html-container"), "No se puede degradar al último Administrador"));

        // Verifica que el título sea "No se pudo completar"
        WebElement errorAlert = driver.findElement(By.className("swal2-popup"));
        assertTrue(errorAlert.getText().contains("No se pudo completar"),
                "No apareció el mensaje de protección del administrador.");

        // Cerrar la alerta de error
        WebElement errorAcceptButton = driver.findElement(By.cssSelector(".swal2-confirm"));
        js.executeScript("arguments[0].click();", errorAcceptButton);

        // Cerrar el modal de edición
        WebElement cancelModalButton = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(., 'Cancelar')]")));
        js.executeScript("arguments[0].click();", cancelModalButton);

        // Verificar en la tabla que el rol NO cambió
        WebElement adminRow = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//tr[td[contains(., 'Admin NutriVet')]]")));

        // Verifica que dentro de esa fila siga diciendo "ADMINISTRADOR"
        assertTrue(adminRow.getText().contains("ADMINISTRADOR"),
                "El rol del administrador cambió en la tabla, lo cual es incorrecto.");
    }

    @Test
    @Order(5)
    @DisplayName("Prueba 5: Crear un Nuevo Rol")
    public void testCreateRole() {
        WebElement createRoleButton = wait
                .until(ExpectedConditions.elementToBeClickable(By.xpath("//button[contains(., 'Crear Rol')]")));
        js.executeScript("arguments[0].click();", createRoleButton);

        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h5[contains(., 'Crear Nuevo Rol')]")));

        driver.findElement(By.xpath("//label[contains(., 'Nombre del Rol')]/following-sibling::input"))
                .sendKeys("ROLE_SELENIUM");
        driver.findElement(By.xpath("//label[contains(., 'Descripción')]/following-sibling::textarea"))
                .sendKeys("Rol creado por Selenium");

        WebElement saveButton = driver.findElement(By.xpath("//button[contains(., 'Guardar')]"));
        js.executeScript("arguments[0].click();", saveButton);

        // Aceptar el mensaje de éxito
        WebElement acceptButton = wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector(".swal2-confirm")));
        js.executeScript("arguments[0].click();", acceptButton);

        // Esperar a que desaparezca
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.className("swal2-container")));

        // Esperar la recarga de la tabla
        WebDriverWait longWait = new WebDriverWait(driver, Duration.ofSeconds(20));
        assertTrue(longWait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//td[contains(., 'ROLE_SELENIUM')]"))).isDisplayed());
    }

    @AfterEach
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }
}
