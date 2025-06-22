import fs from 'fs';
import path from 'path';

const levels = { DEBUG: 10, INFO: 20, WARN: 30, ERROR: 40, FATAL: 50 };

const colors = {
    black  : '\u001b[30m',
    red    : '\u001b[31m',
    green  : '\u001b[32m',
    yellow : '\u001b[33m',
    blue   : '\u001b[34m',
    purple : '\u001b[35m',
    cyan   : '\u001b[36m',
    white  : '\u001b[37m',
    reset  : '\u001b[39m'
};

// set the color, write the str, reset the color
const c = (string, color) => process.stdout.write(
    `${colors[color]}${string}${colors.reset} `
);

// write the string in the defined color
const r = (string) => c(string, 'red');
const g = (string) => c(string, 'green');
const b = (string) => c(string, 'blue');
const y = (string) => c(string, 'yellow');

const formatDate = (d) => {
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd}`;
}

const formatTime = (d) => {
    const hh = String(d.getUTCHours()).padStart(2, '0');
    const mm = String(d.getUTCMinutes()).padStart(2, '0');
    const ss = String(d.getUTCSeconds()).padStart(2, '0');
    const ms = String(Math.round(d.getTime() % 1000)).padStart(3, '0');

    return `${hh}:${mm}:${ss}.${ms}`;
}

const formatDateTime = (d) => `${formatDate(d)} ${formatTime(d)}`;

const convert = (input) => {

    // convert level from number to string, or
    if (typeof(input) === 'number') {
        const keys = Object.keys(levels);
        const vals = Object.values(levels);

        return keys[vals.indexOf(input)];
    }

    // convert level from string to number
    return levels[ input.toUpperCase() ];
}

const bleached = ({ logger, pos, ts, str, level, eol }) => {

    // Return without doing anything for level 0
    if (!level) return;

    // we write to a file *only* if the message level is > 0
    const convertedLevel = convert(level);
    const paddedLevel = convertedLevel.padStart(5, ' ');
    const output = logger.output[ convertedLevel.toLowerCase() ];

    if (pos) {

        if (pos === 'start') {
            //str = `${ts} ${logger.name} ${paddedLevel} ${str}`;
            str = `${ts} ${paddedLevel} ${str}`;
            if (eol) str += '\n';
        }

    }
    else {
        //str = `${ts} ${logger.name} ${paddedLevel} ${str}`;
        str = `${ts} ${paddedLevel} ${str}`;
        if (eol) str += '\n';
    }

    if (logger.mode === 'streams') {
        output.write(str);
    }
    else {
        fs.appendFileSync(output, str);
    }
}

const colored = ({ logger, pos, ts, prefix, str, level, eol }) => {
    const convertedLevel = convert(level);
    const paddedLevel = convertedLevel.padStart(5, ' ');

    if (pos) {

        if (pos === 'start') {
            y(prefix);
            b(ts);
            g(`– ${paddedLevel}`);
            if (eol) str += '\n';
        }

    }
    else {
        y(prefix);
        b(ts);
        g(`– ${paddedLevel}`);
        if (eol) str += '\n';
    }

    process.stdout.write(str);
}

const write = (logger, prefix, msg, pos, level) => {    

    // convert logger.level from string to number so it can be compared
    const convertedLoggerLevel = convert(logger.level);
    
    // we output a message if the message level is 0 or if the message level 
    // is less than or equal to the loggerLevel
    if ((level === 0) || (convertedLoggerLevel <= level)) {

        let ts;
        let d = new Date();

        if (logger.tsType === 'timeonly') {
            ts = formatTime(d);
        }
        else if (logger.tsType === 'dateonly') {
            ts = formatDate(d);
        }
        else {
            ts = formatDateTime(d);
        }

        const obj = {
            logger,
            pos: pos || null,
            ts,
            prefix,
            str: typeof(msg) === 'object' ? JSON.stringify(msg) : msg,
            level,
            eol: pos ? false : true
        };

        if (logger.transports.includes('console')) {
            colored(obj);
        }
        
        if (logger.transports.includes('file')) {
            bleached(obj);
        }
    }

}

export default class Zlogger {
    constructor({ level, transports, mode, dir, tsType }) {
        this.logger = {
            level     : level ? level.toUpperCase() : 'INFO',
            transports: transports          || [ 'console' ],
            mode      : mode                || 'streams',
            tsType    : tsType              || 'timeonly'
        }

        if (this.logger.transports.includes('file')) {
            const date = formatDate(new Date());
            const basedir = dir || 'logs';
            const logdir = `${basedir}/${date}`;

            if (!fs.existsSync(logdir)) {
                fs.mkdirSync(logdir, { recursive: true });
            }

            this.logger.output = {};

            Object.keys(levels).forEach(level => {

                // create output files only for actual log levels > 0
                if (convert(level)) {
                    const l = level.toLowerCase();
                    const logfile = `${logdir}/${date}-${l}.log`;

                    this.logger.output[l] = this.logger.mode === 'streams'
                        ? fs.createWriteStream(logfile, { flags: 'a' })
                        : logfile;
                }

            });

        }
    }

    prefix = (callee) => {
        const relativeFileName = callee.getFileName()
            .replace('file://', '')
            .replace(process.cwd(), '')
            .replace('/', '');
        
        const fnName = callee.getFunctionName() ?? '';
        const lineNum = callee.getLineNumber();
        return `${relativeFileName}:${fnName}() [${lineNum}]`;
    }

    setLevel = (level) => this.logger.level = level;
    level = () => this.logger.level;
    debug = (msg, pos) => {
        const originalPrepareStackTrace = Error.prepareStackTrace;
        Error.prepareStackTrace = (_, stack) => stack;
        const callee = new Error().stack[1];
        Error.prepareStackTrace = originalPrepareStackTrace;
        const prefix = this.prefix(callee);
        write(this.logger, prefix, msg, pos, 10);
    }

    info  = (msg, pos) => {
        const originalPrepareStackTrace = Error.prepareStackTrace;
        Error.prepareStackTrace = (_, stack) => stack;
        const callee = new Error().stack[1];
        Error.prepareStackTrace = originalPrepareStackTrace;
        const prefix = this.prefix(callee);
        write(this.logger, prefix, msg, pos, 20);
    }

    warn  = (msg, pos) => {
        const originalPrepareStackTrace = Error.prepareStackTrace;
        Error.prepareStackTrace = (_, stack) => stack;
        const callee = new Error().stack[1];
        Error.prepareStackTrace = originalPrepareStackTrace;
        const prefix = this.prefix(callee);
        write(this.logger, prefix, msg, pos, 30);
    }

    error = (msg, pos) => {
        const originalPrepareStackTrace = Error.prepareStackTrace;
        Error.prepareStackTrace = (_, stack) => stack;
        const callee = new Error().stack[1];
        Error.prepareStackTrace = originalPrepareStackTrace;
        const prefix = this.prefix(callee);
        write(this.logger, prefix, msg, pos, 40);
    }

    fatal = (msg, pos) => {
        const originalPrepareStackTrace = Error.prepareStackTrace;
        Error.prepareStackTrace = (_, stack) => stack;
        const callee = new Error().stack[1];
        Error.prepareStackTrace = originalPrepareStackTrace;
        const prefix = this.prefix(callee);
        write(this.logger, prefix, msg, pos, 50)
    };
}