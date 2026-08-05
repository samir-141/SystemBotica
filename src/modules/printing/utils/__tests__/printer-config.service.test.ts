import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { loadPrinterConfiguration, savePrinterConfiguration, validatePrinterConfiguration } from '../../services/printer-config.service';
import type { PrinterConfiguration } from '../../types/printer.types';

describe('printer-config.service', () => {
  const STORAGE_KEY = 'pos_printer_configuration';

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('loadPrinterConfiguration', () => {
    it('returns null when no configuration saved', () => {
      const config = loadPrinterConfiguration();
      expect(config).toBeNull();
    });

    it('returns saved configuration', () => {
      const savedConfig: PrinterConfiguration = {
        printerName: 'My Printer',
        paperWidth: '58mm',
        encoding: 'ASCII',
        autoCut: false,
        openCashDrawer: true,
        charactersPerLine: 32,
        enabled: true,
        deviceId: 'test-device',
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedConfig));

      const loaded = loadPrinterConfiguration();
      expect(loaded?.printerName).toBe('My Printer');
      expect(loaded?.paperWidth).toBe('58mm');
    });
  });

  describe('savePrinterConfiguration', () => {
    it('saves configuration to localStorage', () => {
      const config: PrinterConfiguration = {
        printerName: 'Test Printer',
        paperWidth: '80mm',
        encoding: 'UTF-8',
        autoCut: true,
        openCashDrawer: false,
        charactersPerLine: 42,
        enabled: true,
        deviceId: 'test-device',
      };
      savePrinterConfiguration(config);

      const saved = localStorage.getItem(STORAGE_KEY);
      expect(saved).toBeDefined();
      expect(JSON.parse(saved!).printerName).toBe('Test Printer');
    });
  });

  describe('validatePrinterConfiguration', () => {
    it('validates correct configuration', () => {
      const config: PrinterConfiguration = {
        printerName: 'Test Printer',
        paperWidth: '80mm',
        encoding: 'UTF-8',
        autoCut: true,
        openCashDrawer: false,
        charactersPerLine: 42,
        enabled: true,
        deviceId: 'test-device',
      };
      const result = validatePrinterConfiguration(config);
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('fails when printer name is missing', () => {
      const config: PrinterConfiguration = {
        printerName: '',
        paperWidth: '80mm',
        encoding: 'UTF-8',
        autoCut: true,
        openCashDrawer: false,
        charactersPerLine: 42,
        enabled: true,
        deviceId: 'test-device',
      };
      const result = validatePrinterConfiguration(config);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('validates 58mm paper width', () => {
      const config: PrinterConfiguration = {
        printerName: 'Test',
        paperWidth: '58mm',
        encoding: 'UTF-8',
        autoCut: true,
        openCashDrawer: false,
        charactersPerLine: 32,
        enabled: true,
        deviceId: 'test-device',
      };
      const result = validatePrinterConfiguration(config);
      expect(result.valid).toBe(true);
    });

    it('validates 80mm paper width', () => {
      const config: PrinterConfiguration = {
        printerName: 'Test',
        paperWidth: '80mm',
        encoding: 'UTF-8',
        autoCut: true,
        openCashDrawer: false,
        charactersPerLine: 42,
        enabled: true,
        deviceId: 'test-device',
      };
      const result = validatePrinterConfiguration(config);
      expect(result.valid).toBe(true);
    });
  });
});
