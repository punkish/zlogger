import { Zlogger } from '../index.js';
const log = new Zlogger({ 
    name: 'MAIN', 
    level: 'info', 
    transports: [ 'console', 'file' ] 
});

log.loglevel();
log.info('foo');
log.info('hello… ', 'start');
log.info('done\n', 'end');
log.warn('oops');
log.error('uh oh!');

import { init } from './my-module.js';
init();

import { bar } from './progress-bar.js';
bar([...Array(15000).keys()]);