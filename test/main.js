import { Zlogger } from '../index.js';
const log = new Zlogger({ 
    name: 'MAIN', 
    level: 'info', 
    transports: [ 'console', 'file' ] 
});

import { init } from './my-module.js';

log.loglevel();
log.info('foo');
log.info('hello… ', 'start');
log.info('done', 'end');
log.warn('oops');
log.error('uh oh!');

init();