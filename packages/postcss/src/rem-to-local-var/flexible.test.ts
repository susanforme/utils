/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
import { JSDOM } from 'jsdom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flexible } from '.';

describe('flexible', () => {
  // Setup fake DOM environment
  let window: Window;
  let document: Document;
  let originalAddEventListener: any;
  let originalRemoveEventListener: any;
  let addEventListenerMock: any;
  let removeEventListenerMock: any;
  let documentElementMock: any;
  let dom: JSDOM;

  // Create a mock for style.setProperty
  const setPropertyMock = vi.fn();

  beforeEach(() => {
    // Create a new JSDOM instance
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      url: 'http://localhost/',
      pretendToBeVisual: true,
    });

    // Set up window and document
    window = dom.window as unknown as Window;
    document = window.document;

    // Save original functions if they exist
    originalAddEventListener = window.addEventListener;
    originalRemoveEventListener = window.removeEventListener;

    // Create mocks
    addEventListenerMock = vi.fn();
    removeEventListenerMock = vi.fn();

    // Mock window event listeners
    window.addEventListener = addEventListenerMock;
    window.removeEventListener = removeEventListenerMock;

    // Mock document.documentElement
    documentElementMock = {
      clientWidth: 1920,
      style: {
        setProperty: setPropertyMock,
      },
    };

    // Mock document.documentElement getter
    Object.defineProperty(document, 'documentElement', {
      get: () => documentElementMock,
      configurable: true,
    });

    // Attach window and document to global
    global.window = window as any;
    global.document = document as any;
  });

  afterEach(() => {
    // Restore original functions if they existed
    if (originalAddEventListener) {
      window.addEventListener = originalAddEventListener;
    }
    if (originalRemoveEventListener) {
      window.removeEventListener = originalRemoveEventListener;
    }

    // Clear all mocks
    vi.clearAllMocks();

    // Clean up global
    delete (global as any).window;
    delete (global as any).document;

    // Close the JSDOM instance
    dom.window.close();
  });

  it('should register event listeners on initialization', () => {
    flexible();

    // Should register all three event listeners
    expect(addEventListenerMock).toHaveBeenCalledTimes(3);
    expect(addEventListenerMock).toHaveBeenCalledWith('load', expect.any(Function));
    expect(addEventListenerMock).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(addEventListenerMock).toHaveBeenCalledWith('orientationchange', expect.any(Function));
  });

  it('should set CSS variable on the scope element with desktop width', () => {
    // Set desktop width
    documentElementMock.clientWidth = 1920;

    flexible();

    // Get the responsive function by extracting it from the addEventListener call
    const responsiveFunction = addEventListenerMock.mock.calls[0][1];

    // Call the responsive function directly
    responsiveFunction();

    // Should set property with calculated value for desktop
    // 1920 / 100 = 19.2
    expect(setPropertyMock).toHaveBeenCalledWith('--local-scope-rem', '19.2px');
  });

  it('should set CSS variable with adjusted value for mobile width', () => {
    // Set mobile width
    documentElementMock.clientWidth = 375;

    flexible({
      containers: [375, 1920],
      breakpoints: [768],
    });

    // Get the responsive function
    const responsiveFunction = addEventListenerMock.mock.calls[0][1];

    // Call the responsive function
    responsiveFunction();

    // Should set property with calculated value for mobile
    // 375 / 100 * (1920 / 375) = 3.75 * (1920 / 375) = 3.75 * 5.12 = 19.2
    expect(setPropertyMock).toHaveBeenCalledWith('--local-scope-rem', expect.stringContaining('px'));
  });

  it('should respect custom cssVarName option', () => {
    documentElementMock.clientWidth = 1920;

    flexible({
      cssVarName: '--custom-rem-unit',
    });

    // Get the responsive function
    const responsiveFunction = addEventListenerMock.mock.calls[0][1];

    // Call the responsive function
    responsiveFunction();

    // Should use custom CSS variable name
    expect(setPropertyMock).toHaveBeenCalledWith('--custom-rem-unit', '19.2px');
  });

  it('should handle multiple breakpoints correctly', () => {
    flexible({
      breakpoints: [1200, 768],
      containers: [375, 768, 1920],
    });

    // Get the responsive function
    const responsiveFunction = addEventListenerMock.mock.calls[0][1];

    // Test with width = 1000 (between 768 and 1200)
    documentElementMock.clientWidth = 1000;
    responsiveFunction();

    // Should use the first breakpoint's container (768)
    // 1000 / 100 * (1920 / 768) = 10 * 2.5 = 25
    expect(setPropertyMock).toHaveBeenLastCalledWith('--local-scope-rem', expect.stringContaining('px'));

    // Test with width = 500 (less than 768)
    documentElementMock.clientWidth = 500;
    responsiveFunction();

    // Should use the second breakpoint's container (375)
    // 500 / 100 * (1920 / 375) = 5 * 5.12 = 25.6
    expect(setPropertyMock).toHaveBeenLastCalledWith('--local-scope-rem', expect.stringContaining('px'));
  });

  it('should handle custom scope element', () => {
    const customElement = {
      style: {
        setProperty: vi.fn(),
      },
    };

    flexible({
      scopeElement: customElement as unknown as HTMLElement,
    });

    // Get the responsive function
    const responsiveFunction = addEventListenerMock.mock.calls[0][1];

    // Call the responsive function
    responsiveFunction();

    // Should set property on custom element
    expect(customElement.style.setProperty).toHaveBeenCalled();
    expect(setPropertyMock).not.toHaveBeenCalled();
  });

  it('should return a cleanup function that removes event listeners', () => {
    const cleanup = flexible();

    // Should be a function
    expect(typeof cleanup).toBe('function');

    // Call the cleanup function
    cleanup();

    // Should remove all three event listeners
    expect(removeEventListenerMock).toHaveBeenCalledTimes(3);
    expect(removeEventListenerMock).toHaveBeenCalledWith('load', expect.any(Function));
    expect(removeEventListenerMock).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(removeEventListenerMock).toHaveBeenCalledWith('orientationchange', expect.any(Function));
  });
});
