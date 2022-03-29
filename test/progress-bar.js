import { Zlogger } from '../index.js';
const log = new Zlogger({ 
    name: 'PROGRESS-BAR', 
    level: 'info', 
    transports: [ 'console' ] 
});

const bar = (files) => {
    log.loglevel();

    /**************************************************************
     * 
     * update the progress bar every x% of the total num of files
     * but x% of j should not be more than 5000 because we don't 
     * want to insert more than 5K records at a time.
     * 
     **************************************************************/
    const totalFiles = files.length;
    const startingFile = 0;
    let i = startingFile;
    const batch = totalFiles < 5000 ? Math.floor(totalFiles / 10) : 5000;
    const dot = batch / 10;

    log.info(`parsing ${totalFiles} files ${batch} at a time`);

    let transactions = 0;
    let done = 0;

    log.info(`${'~'.repeat(80)}\n`, 'end')

    for (; i < totalFiles; i++) {
        if (i > 0) {
            if ((i % batch) == 0) {
                transactions++;
                done = (batch * transactions) + startingFile;
                log.info(` ${done} `, 'end');
            }
            else {
                if (i === (totalFiles - 1)) {
                    log.info(`${totalFiles} [done]\n`, 'end');
                }
            }

            if ((i % dot) == 0) {
                log.info('.', 'end');
            }
        }
    }

    log.info(`${'~'.repeat(80)}\n`, 'end');
}

export { bar };