'use strict';

import * as fs from 'fs';
import chalk from 'chalk';

const r = chalk.red;
const g = chalk.green;
const b = chalk.blue;

const levels = { debug: 10, info: 20, warn: 30, error: 40, fatal: 50 };
const pad = (val) => val < 10 ? val.toString().padStart(2, '0') : val;

const formatDate = (d) => {
    const yyyy = d.getUTCFullYear();
    const mm = pad(d.getUTCMonth());
    const dd = pad(d.getUTCDate());

    return `${yyyy}-${mm}-${dd}`;
}

const formatTime = (d) => {
    const hh = pad(d.getUTCHours());
    const mm = pad(d.getUTCMinutes());
    const ss = pad(d.getUTCSeconds());
    const ms = d.getTime() % 1000;

    return `${hh}:${mm}:${ss}.${ms}`;
}

const formatDateTime = (d) => `${formatDate(d)} ${formatTime(d)}`;

const convert = (input) => {
    if (typeof(input) === 'number') {
        const keys = Object.keys(levels);
        const vals = Object.values(levels);
        let level = keys[vals.indexOf(input)].toUpperCase();
        if (level.length < 5) level = `${level} `;

        return `— ${level}:`;
    }

    return levels[input];
}

const write = (logger, msg, position, level) => {
    const d = new Date();
    const ts = formatDateTime(d);
    
    let str = typeof(msg) === 'object' ? JSON.stringify(msg) : msg;
    const colored  = `${b(ts)} ${r(logger.name)} ${g(level)} ${str}`;
    const bleached = `${ts} ${logger.name} ${level} ${str}`;

    if (position) {
        if (position === 'start') {
            if (logger.transports.includes('console')) {
                process.stdout.write(colored);
            }

            if (logger.transports.includes('file')) {
                logger.stream.write(bleached);
            }
        }
        else if (position === 'end') {
            if (logger.transports.includes('console')) {
                process.stdout.write(str);
            }

            if (logger.transports.includes('file')) {
                logger.stream.write(`${str}\n`);
            }
        }
    }
    else {
        if (logger.transports.includes('console')) {
            console.log(colored);
        }

        if (logger.transports.includes('file')) {
            logger.stream.write(`${bleached}\n`);
        }
    }
}

const prewrite = (logger, msg, position, level) => {
    if (convert(logger.level) <= level) {
        write(logger, msg, position, convert(level));
    }
}

class Zlogger {
    constructor({ name, level, transports, dir }) {
        this.logger = {
            name: name || '',
            level: level || 'info',
            transports: transports || [ 'console' ]
        }

        if (this.logger.transports.includes('file')) {
            const d = new Date();
            const date = formatDate(d);

            const basedir = dir || 'logs';
            const logdir = `${basedir}/${date}`;

            if (!fs.existsSync(logdir)) {
                fs.mkdirSync(logdir, { recursive: true });
            }

            const logfile = `${logdir}/${date}-${this.logger.level}.log`;

            // https://stackoverflow.com/questions/3459476/how-to-append-to-a-file-in-node/43370201#43370201
            this.logger.stream = fs.createWriteStream(logfile, { flags:'a' });
        }
    }

    loglevel = () => console.log(`log level is ${this.logger.level.toUpperCase()}`);
    debug = (msg, position) => prewrite(this.logger, msg, position, 10);
    info  = (msg, position) => prewrite(this.logger, msg, position, 20);
    warn  = (msg, position) => prewrite(this.logger, msg, position, 30);
    error = (msg, position) => prewrite(this.logger, msg, position, 40);
    fatal = (msg, position) => prewrite(this.logger, msg, position, 50);
}

export { Zlogger };