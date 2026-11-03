
import qz from 'qz-tray';
const W = 40; // ancho de la impresora en caracteres

//comandos que le dicen a la impresora que lo que sigue es un comando 
const ESC = '\x1B';
const GS = '\x1D';//group separator

export interface ReceiptItem {// línea de detalle del ticket
  name: string;
  quantity: number;
  price: number;
}

export interface Receipt {//datos del ticket
  invoiceNumber: string;
  date: string;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  total: number;
  payment: number; // monto recibido
}
//formatea y cambia los espacios especiales por espacios normales, porque la impresora no los reconoce.
const formatNumber = (n: number) =>
  n.toLocaleString('es-CR').replace(/[\u00a0\u202f]/g, ' ');


const alignLeftRight = (a: string, b: string) =>
  a.slice(0, W - b.length - 1).padEnd(W - b.length) + b;
const separatorLine = '-'.repeat(W) + '\n';

async function connect() {
  if (!qz.websocket.isActive()) {
    await qz.websocket.connect();
  }
}

export async function listPrinters(): Promise<string[]> {
  await connect();
  return qz.printers.find();
}

export async function printReceipt(
  receipt: Receipt,
  printer = 'Generic / Text Only'
) {
  await connect();
  const config = qz.configs.create(printer, { encoding: 'CP858' });

  const data = [
    ESC + '@',            // reiniciar impresora
    ESC + 't' + '\x13',   // tabla de caracteres CP858 (tildes)
    GS + 'L' + '\x30' + '\x00', // margen izquierdo: 48 puntos (aprox. 6 mm)

    ESC + 'a' + '\x01',   // centrar
    ESC + '!' + '\x10', 'AGROVETERINARIA NUTRIVET\n', ESC + '!' + '\x00',
    'Céd. jurídica: 3-101-000000\n',
    'Tel: 8286-3345\n',
    'Limón, Pococí, Cariari, Campo 2\n',

    ESC + 'a' + '\x00',   // izquierda
    separatorLine,
    `Factura No: ${receipt.invoiceNumber}\n`,
    `Fecha: ${receipt.date}\n`,
    separatorLine,

    ...receipt.items.flatMap((item) => [
      item.name + '\n',
      alignLeftRight(`${item.quantity} x ${formatNumber(item.price)}`, formatNumber(item.quantity * item.price)) + '\n',
    ]),

    separatorLine,
    alignLeftRight('Subtotal', formatNumber(receipt.subtotal)) + '\n',
    alignLeftRight('IVA', formatNumber(receipt.tax)) + '\n',
    ESC + 'E' + '\x01', alignLeftRight('TOTAL', formatNumber(receipt.total)) + '\n', ESC + 'E' + '\x00',
    separatorLine,
    alignLeftRight('Recibido', formatNumber(receipt.payment)) + '\n',
    alignLeftRight('Vuelto', formatNumber(receipt.payment - receipt.total)) + '\n',
    separatorLine,

    ESC + 'a' + '\x01',
    'Comprobante interno, no válido como\nfactura electrónica.\n',
    'Gracias por su compra!\n',

    ESC + 'd' + '\x03',          // avanzar 3 líneas antes del corte
    GS + 'V' + '\x42' + '\x00',  // corte
  ];

  await qz.print(config, data);
}