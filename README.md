# zlogger
*a realy zimple logger*

1. import the logger class
    ```js
    import { Zlogger } from '../index.js';
    ```

2. create a new logger with options
    ```js
    const log = new Zlogger({

        // every log line gets decorated with the name.
        // there is no default value
        name: 'MAIN', 

        // log levels can be
        //  'debug', 'info', 'warn', 'error', 'fatal'
        //  'info' is the default log level
        level: 'info', 

        // transports are where the log is written
        //   'console' always exists in development
        //   'file' is optional
        transports: [ 'console', 'file' ],

        // 'dir' is optional and used when transport is 'file'
        // if no 'dir' is provided then 'logs' is used
        dir: 'path/to/logdir'
    });
    ```
3. log away
    ```js
    log.loglevel();
    log.info('foo');
    log.info('hello… ', 'start');
    log.info('done', 'end');
    log.warn('oops');
    log.error('uh oh!');
    ```
    The optional 'start' and 'end' position flags output the log message on the same line. In the example shown above, the output will be
    ```log
    log level is INFO
    2022-02-28 20:09:15.240 MAIN — INFO: foo
    2022-02-28 20:09:15.240 MAIN — INFO: hello… done
    2022-02-28 20:09:15.241 MAIN — WARN: oops
    2022-02-28 20:09:15.241 MAIN — ERROR: uh oh!
    ```
