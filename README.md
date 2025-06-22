# zlogger
*a realy zimple logger*

There are a lot of wonderful loggers that do a lot of things. This is not one of them. This is a zero-dependency, 3.9KB (135 lines), synchronous logger, basically just a wrapper around `process.stdout.write`. It has loglevels and transports and can output log in color.

1. import the logger class. If your script is in a CommonJS format, rename it with `.mjs` extension.
    ```js
    import { Zlogger } from '@punkish/zlogger';
    ```

2. create a new logger with options
    ```js
    const log = new Zlogger({

        // log levels can be
        //  'debug', 'info', 'warn', 'error', 'fatal'
        //  'info' is the default log level
        level: 'info', 

        // transports are where the log is written
        //   'console' always exists in development
        //   'file' is optional
        transports: [ 'console', 'file' ],

        // 'mode' is optional and chooses between streams and appendFile,
        // defaulting to streams if none is provided
        mode: 'streams',

        // 'dir' is optional and used when transport is 'file'
        // if no 'dir' is provided then 'logs' is used
        dir: 'path/to/logdir',

        // 'timestamp' on every log line can be 'timeonly', 'dateonly' or 
        // defaults to 'datetime'
        tsType: 'timeonly'
    });
    ```

3. log away
    ```js
    log.info(`logger level is ${log.level()}`);
    log.info('foo');
    log.info('do something and wait… ', 'start');
    log.info('finished something\n', 'end');
    log.info('no front matter\n', 'end');
    log.warn('oops');
    log.error('uh oh!');
    log.fatal('died');
    log.setLevel('error');
    log.info(`logger level is ${log.level()}`);
    log.info('foo');
    log.info('hello… ', 'start');
    log.info('done\n', 'end');
    log.warn('oops');
    log.error('log-level changed to "error" and above');
    log.fatal('died again');
    ```
    The optional 'start' and 'end' position flags output the log message on the same line (in this case, you have to add the `\n` newline explicitly when the 'pos' is 'end'). If no log invocation with 'start' is provided, but an 'end' is provided, then no front matter is printed.
    
    In the example shown above, the output will be
    ```log
    test/index.test.js:() [19] 18:34:16.291 –  INFO logger level is INFO
    test/index.test.js:() [20] 18:34:16.295 –  INFO foo
    test/index.test.js:() [21] 18:34:16.295 –  INFO do something and wait… finished something
    no front matter
    test/index.test.js:() [32] 18:34:16.295 –  WARN oops
    test/index.test.js:() [33] 18:34:16.295 – ERROR uh oh!
    test/index.test.js:() [34] 18:34:16.295 – FATAL died
    test/index.test.js:() [41] 18:34:16.295 – ERROR log-level changed to "error" and above
    test/index.test.js:() [42] 18:34:16.295 – FATAL died again
    ```
