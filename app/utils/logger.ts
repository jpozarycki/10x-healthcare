type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMessage {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
}

class Logger {
  private context: Record<string, any> = {};

  constructor(context: Record<string, any> = {}) {
    this.context = context;
  }

  private log(level: LogLevel, message: string, additionalContext: Record<string, any> = {}): void {
    const logMessage: LogMessage = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: {
        ...this.context,
        ...additionalContext
      }
    };

    // In production, you might want to send logs to a service like Datadog, New Relic, etc.
    console[level](JSON.stringify(logMessage));
  }

  debug(message: string, context: Record<string, any> = {}): void {
    this.log('debug', message, context);
  }

  info(message: string, context: Record<string, any> = {}): void {
    this.log('info', message, context);
  }

  warn(message: string, context: Record<string, any> = {}): void {
    this.log('warn', message, context);
  }

  error(message: string, context: Record<string, any> = {}): void {
    this.log('error', message, context);
  }

  // Create a new logger with additional context
  withContext(additionalContext: Record<string, any>): Logger {
    return new Logger({
      ...this.context,
      ...additionalContext
    });
  }
}

// Create a default logger
export const logger = new Logger({ service: '10x-healthcare' });

// Export the Logger class for creating specific loggers
export { Logger }; 