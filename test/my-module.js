import { Zlogger } from '../index.js';

const log = new Zlogger({ 
    name: 'MY MODULE', 
    level: 'error', 
    transports: [ 'console', 'file' ] 
});

log.level();
log.info('foo');
log.info('do something and wait… ', 'start');
log.info('finished something\n', 'end');

for (let i = 0; i < 100; i++) {
    log.info('.', 'end');
}

log.info(' DONE\n', 'end');

log.warn('oops');
log.error('uh oh!');