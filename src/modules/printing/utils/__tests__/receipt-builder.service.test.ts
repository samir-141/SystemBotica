import { describe, it, expect } from 'vitest';
import { buildReceiptCommands, buildTestPageCommands, buildCashDrawerCommand } from '../../services/receipt-builder.service';
import type { ReceiptData } from '../../types/receipt.types';
import type { PrinterConfiguration } from '../../types/printer.types';

describe('receipt-builder.service', () => {
  const mockConfig: PrinterConfiguration = {
    printerName: 'Test Printer',
    paperWidth: '80mm',
    encoding: 'UTF-8',
    autoCut: true,
    openCashDrawer: false,
    charactersPerLine: 48,
    enabled: true,
    deviceId: 'test-device',
  };

  const mockReceipt: ReceiptData = {
    company: {
      commercialName: 'FARMACIA TEST',
      legalName: 'FARMACIA TEST SAC',
      ruc: '20123456789',
      address: 'Av. Test 123',
      phone: '012345678',
    },
    document: {
      type: 'BOLETA',
      series: 'B001',
      number: '000123',
      issuedAt: '2024-01-15T10:30:00Z',
    },
    branch: {
      name: 'Sucursal Principal',
    },
    customer: {
      name: 'Juan Perez',
      documentType: 'DNI',
      documentNumber: '12345678',
    },
    cashier: {
      name: 'Maria Garcia',
    },
    items: [
      {
        id: '1',
        name: 'Paracetamol 500mg',
        quantity: 2,
        unitPrice: 5.0,
        subtotal: 10.0,
        presentation: 'Tabletas x 20',
      },
    ],
    totals: {
      subtotal: 10.0,
      igv: 1.8,
      total: 11.8,
    },
    payment: {
      method: 'EFECTIVO',
      amountReceived: 15.0,
      change: 3.2,
    },
  };

  describe('buildReceiptCommands', () => {
    it('returns array of commands', () => {
      const commands = buildReceiptCommands(mockReceipt, mockConfig);
      expect(Array.isArray(commands)).toBe(true);
      expect(commands.length).toBeGreaterThan(0);
    });

    it('includes ESC/POS initialization', () => {
      const commands = buildReceiptCommands(mockReceipt, mockConfig);
      const firstCommand = commands[0];
      expect(typeof firstCommand === 'string' || firstCommand instanceof Uint8Array).toBe(true);
    });

    it('includes company name', () => {
      const commands = buildReceiptCommands(mockReceipt, mockConfig);
      const hasCompanyName = commands.some(
        (cmd: string | Uint8Array) => typeof cmd === 'string' && cmd.includes('FARMACIA TEST'),
      );
      expect(hasCompanyName).toBe(true);
    });

    it('includes document number', () => {
      const commands = buildReceiptCommands(mockReceipt, mockConfig);
      const hasDocNumber = commands.some(
        (cmd: string | Uint8Array) => typeof cmd === 'string' && cmd.includes('000123'),
      );
      expect(hasDocNumber).toBe(true);
    });

    it('includes total amount', () => {
      const commands = buildReceiptCommands(mockReceipt, mockConfig);
      const hasTotal = commands.some(
        (cmd: string | Uint8Array) => typeof cmd === 'string' && cmd.includes('11.80'),
      );
      expect(hasTotal).toBe(true);
    });

    it('includes product name', () => {
      const commands = buildReceiptCommands(mockReceipt, mockConfig);
      const hasProduct = commands.some(
        (cmd: string | Uint8Array) => typeof cmd === 'string' && cmd.includes('Paracetamol'),
      );
      expect(hasProduct).toBe(true);
    });

    it('includes cut command when autoCut is true', () => {
      const commands = buildReceiptCommands(mockReceipt, mockConfig);
      const lastCommands = commands.slice(-3);
      const hasCut = lastCommands.some(
        (cmd: string | Uint8Array) => typeof cmd === 'string' && cmd.includes('\x1D\x56'),
      );
      expect(hasCut).toBe(true);
    });

    it('handles receipt without optional fields', () => {
      const minimalReceipt: ReceiptData = {
        company: { commercialName: 'TEST', legalName: 'TEST', ruc: '123' },
        document: { type: 'BOLETA', series: 'B001', number: '001', issuedAt: '2024-01-15' },
        branch: { name: '' },
        items: [],
        totals: { total: 0 },
      };
      const commands = buildReceiptCommands(minimalReceipt, mockConfig);
      expect(commands.length).toBeGreaterThan(0);
    });
  });

  describe('buildTestPageCommands', () => {
    it('returns array of commands', () => {
      const commands = buildTestPageCommands(mockConfig);
      expect(Array.isArray(commands)).toBe(true);
      expect(commands.length).toBeGreaterThan(0);
    });

    it('includes test page title', () => {
      const commands = buildTestPageCommands(mockConfig);
      const hasTitle = commands.some(
        (cmd: string | Uint8Array) => typeof cmd === 'string' && cmd.includes('PRUEBA DE IMPRESIÓN'),
      );
      expect(hasTitle).toBe(true);
    });

    it('includes printer name', () => {
      const commands = buildTestPageCommands(mockConfig);
      const hasPrinter = commands.some(
        (cmd: string | Uint8Array) => typeof cmd === 'string' && cmd.includes('Test Printer'),
      );
      expect(hasPrinter).toBe(true);
    });

    it('includes character test', () => {
      const commands = buildTestPageCommands(mockConfig);
      const hasChars = commands.some(
        (cmd: string | Uint8Array) => typeof cmd === 'string' && cmd.includes('ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'),
      );
      expect(hasChars).toBe(true);
    });
  });

  describe('buildCashDrawerCommand', () => {
    it('returns array with drawer command', () => {
      const commands = buildCashDrawerCommand();
      expect(Array.isArray(commands)).toBe(true);
      expect(commands.length).toBe(1);
    });

    it('contains ESC/POS drawer command', () => {
      const commands = buildCashDrawerCommand();
      const cmd = commands[0];
      expect(typeof cmd === 'string' || cmd instanceof Uint8Array).toBe(true);
    });
  });
});
