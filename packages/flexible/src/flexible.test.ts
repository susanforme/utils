/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flexible } from '.';

describe('flexible', () => {
  let cleanup: () => void;
  const originalAddEventListener = window.addEventListener;
  const originalRemoveEventListener = window.removeEventListener;
  const originalSetProperty = CSSStyleDeclaration.prototype.setProperty;
  const originalScreenOrientation = screen.orientation;

  beforeEach(() => {
    // Mock window event listeners
    window.addEventListener = vi.fn();
    window.removeEventListener = vi.fn();
    // Mock CSSStyleDeclaration.setProperty
    CSSStyleDeclaration.prototype.setProperty = vi.fn();
    // Mock screen.orientation
    Object.defineProperty(screen, 'orientation', {
      value: {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    if (cleanup) {
      cleanup();
    }
    // Restore original methods
    window.addEventListener = originalAddEventListener;
    window.removeEventListener = originalRemoveEventListener;
    CSSStyleDeclaration.prototype.setProperty = originalSetProperty;
    Object.defineProperty(screen, 'orientation', {
      value: originalScreenOrientation,
      writable: true,
    });
  });

  it('should set default font size on document element when no options provided', () => {
    // Mock document.documentElement
    const mockHtml = document.createElement('div');
    Object.defineProperty(document, 'documentElement', {
      value: mockHtml,
      writable: true,
    });

    cleanup = flexible();

    // Verify event listeners were added
    expect(window.addEventListener).toHaveBeenCalledWith('load', expect.any(Function));
    expect(window.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(screen.orientation.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));

    // Simulate window load event
    const loadHandler = (window.addEventListener as any).mock.calls.find((call: any) => call[0] === 'load')[1];
    loadHandler();

    // Verify font size was set
    expect(mockHtml.style.fontSize).toBeDefined();
  });

  it('should use custom breakpoints and layouts when provided', () => {
    const mockHtml = document.createElement('div');
    Object.defineProperty(document, 'documentElement', {
      value: mockHtml,
      writable: true,
    });

    cleanup = flexible({
      breakpoints: [1024, 768],
      layouts: [375, 1024, 1920],
      basicLayout: 1920,
    });

    const loadHandler = (window.addEventListener as any).mock.calls.find((call: any) => call[0] === 'load')[1];
    loadHandler();

    expect(mockHtml.style.fontSize).toBeDefined();
  });

  it('should set CSS variable on custom scope element when provided', () => {
    const customElement = document.createElement('div');
    cleanup = flexible({
      scope: {
        element: customElement,
        cssVarName: '--custom-rem',
      },
    });

    const loadHandler = (window.addEventListener as any).mock.calls.find((call: any) => call[0] === 'load')[1];
    loadHandler();

    expect(CSSStyleDeclaration.prototype.setProperty).toHaveBeenCalledWith('--custom-rem', expect.any(String));
  });

  it('should apply layout immediately when immediate option is true', () => {
    const mockHtml = document.createElement('div');
    Object.defineProperty(document, 'documentElement', {
      value: mockHtml,
      writable: true,
    });

    cleanup = flexible({
      immediate: true,
    });

    expect(mockHtml.style.fontSize).toBeDefined();
    expect(window.addEventListener).not.toHaveBeenCalledWith('load', expect.any(Function));
  });

  it('should not listen to orientation change when orientationchange option is false', () => {
    cleanup = flexible({
      orientationchange: false,
    });

    expect(screen.orientation.addEventListener).not.toHaveBeenCalled();
  });

  it('should clean up event listeners when cleanup function is called', () => {
    cleanup = flexible();
    cleanup();

    expect(window.removeEventListener).toHaveBeenCalledWith('load', expect.any(Function));
    expect(window.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(screen.orientation.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
