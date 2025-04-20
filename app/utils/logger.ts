type LogLevel = 'debug' | 'info' | 'warn' | 'error';

type LogContext = Record<string, unknown>;

class Logger {
  private context: LogContext = {};

  constructor(private readonly defaultContext: LogContext = {}) {
    this.context = defaultContext;
  }

  withContext(context: LogContext): Logger {
    return new Logger({ ...this.context, ...context });
  }

  private log(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level,
      message,
      ...this.context,
      ...(context || {})
    };

    switch (level) {
      case 'debug':
        if (process.env.NODE_ENV !== 'production') {
          console.debug(JSON.stringify(logData));
        }
        break;
      case 'info':
        console.info(JSON.stringify(logData));
        break;
      case 'warn':
        console.warn(JSON.stringify(logData));
        break;
      case 'error':
        console.error(JSON.stringify(logData));
        break;
    }
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  error(message: string, context?: LogContext) {
    this.log('error', message, context);
  }
}

export const logger = new Logger(); 