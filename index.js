import * as fs from 'fs';
import process from 'node:process';

const colors = {
    black : '\u001b[30m',
    red   : '\u001b[31m',
    green : '\u001b[32m',
    yellow: '\u001b[33m',
    blue  : '\u001b[34m',
    purple: '\u001b[35m',
    cyan  : '\u001b[36m',
    white : '\u001b[37m',
    reset : '\u001b[39m'
};

// set the color, write the str, reset the color
const c = (str, color) => {
    process.stdout.write(colors[color]);
    process.stdout.write(`${str} `);
    process.stdout.write(colors.reset);
}

// write the string in the defined color
const r = (str) => c(str, 'red');
const g = (str) => c(str, 'green');
const b = (str) => c(str, 'blue');
const y = (str) => c(str, 'yellow');

const levels = { LEVEL: 0, DEBUG: 10, INFO: 20, WARN: 30, ERROR: 40, FATAL: 50 };

const pad = (str, padLen, padStr) => str.length < padLen 
    ? str.padStart(padLen, padStr) 
    : str;

const formatDate = (d) => {
    const yyyy = d.getUTCFullYear();
    const mm = pad((d.getUTCMonth() + 1), 2, '0');
    const dd = pad(d.getUTCDate(), 2, '0');

    return `${yyyy}-${mm}-${dd}`;
}

const formatTime = (d) => {
    const hh = pad(d.getUTCHours(), 2, '0');
    const mm = pad(d.getUTCMinutes(), 2, '0');
    const ss = pad(d.getUTCSeconds(), 2, '0');
    const ms = d.getTime() % 1000;

    return `${hh}:${mm}:${ss}.${ms}`;
}

const formatDateTime = (d) => `${formatDate(d)} ${formatTime(d)}`;

// convert level in string to number or
// level in number to string
const convert = (input) => {
    if (typeof(input) === 'number') {
        const keys = Object.keys(levels);
        const vals = Object.values(levels);

        return keys[vals.indexOf(input)];
    }

    return levels[input];
}

const write = (logger, msg, pos, level) => {
    const d = new Date();
    const ts = formatDateTime(d);
    const str = typeof(msg) === 'object' ? JSON.stringify(msg) : msg;
    const l = level.toLowerCase();
    
    const bleached = (eol) => {
        logger.streams[l].write(`${ts} ${logger.name} ${pad(level, 5, ' ')} ${str}`);

        if (eol) {
            logger.streams[l].write('\n');
        }
    }

    const colored = (eol) => {
        b(ts);
        r(logger.name);
        g(`– ${pad(level, 5, ' ')}`);
        process.stdout.write(str);
        if (eol) console.log();
    }

    if (pos) {
        if (pos === 'start') {
            if (logger.transports.includes('console')) {
                colored();
            }

            if (logger.transports.includes('file')) {
                bleached();
            }
        }
        else if (pos === 'end') {
            if (logger.transports.includes('console')) {
                process.stdout.write(`${str}`);
            }

            if (logger.transports.includes('file')) {
                logger.streams[l].write(`${str}`);
            }
        }
    }
    else {
        if (logger.transports.includes('console')) {
            colored('\n');
        }

        if (logger.transports.includes('file')) {
            bleached('\n');
        }
    }
}

const prewrite = (logger, msg, pos, level) => {
    if (level === 0) {
        write(logger, msg, pos, convert(level));
    }
    else if (convert(logger.level) <= level) {
        write(logger, msg, pos, convert(level));
    }
}

class Zlogger {
    constructor({ name, level, transports, dir }) {
        this.logger = {
            name: name || '',
            level: level.toUpperCase() || 'INFO',
            transports: transports || [ 'console' ]
        }

        if (this.logger.transports.includes('file')) {
            const date = formatDate(new Date());
            const basedir = dir || 'logs';
            const logdir = `${basedir}/${date}`;

            if (!fs.existsSync(logdir)) {
                fs.mkdirSync(logdir, { recursive: true });
            }

            this.logger.streams = {};

            Object.keys(levels).forEach(level => {
                const logfile = `${logdir}/${date}-${level.toLowerCase()}.log`;
                const stream = fs.createWriteStream(logfile, { flags: 'a' });
                this.logger.streams[level.toLowerCase()] = stream;
            })
        }
    }

    level = () => prewrite(this.logger, this.logger.level, '', 0);
    debug = (msg, pos) => prewrite(this.logger, msg, pos, 10);
    info  = (msg, pos) => prewrite(this.logger, msg, pos, 20);
    warn  = (msg, pos) => prewrite(this.logger, msg, pos, 30);
    error = (msg, pos) => prewrite(this.logger, msg, pos, 40);
    fatal = (msg, pos) => prewrite(this.logger, msg, pos, 50);
}

export { Zlogger };