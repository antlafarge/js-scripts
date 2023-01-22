// Script which download recursively many resources from websites
// Usage : main.js "<url>" "<downloadRegExp>" "<excludeRegExp>" <minSize> <maxSize> <deep> <delay> "<sameOrigin>" "<additionalHeadersJSON>"

import fs from 'fs/promises';
import Logger from './logger.js';

var args = process.argv.slice(2);

const dirPath = args[0] + (args[0].endsWith('/') ? '' : '/');
const matchRegExp = /^(.+)_\d+(\.\w+?)$/i;

const logLevel = Logger.LogLevel.TRACE;

const logger = new Logger(logLevel);

logger.logInfo('js-renamer', 'Settings:', { dirPath, matchRegExp });

async function main()
{
    if (! await fileStats(dirPath))
    {
        logger.logError('js-renamer', `Target directory '${dirPath}' not found`);
        return;
    }
    
    const files = await fs.readdir(dirPath);
    let noChanges = true;
    let renameCount = 0;
    let errorsCount = 0;
    for (const file of files)
    {
        const matchResult = file.match(matchRegExp);
        if (matchResult && matchResult.length >= 3)
        {
            try
            {
                const srcFilePath = `${dirPath}${file}`;
                const dstFile = `${matchResult[1]}${matchResult[2]}`;
                const dstFilePath = `${dirPath}${dstFile}`;
                logger.logInfo('js-renamer', srcFilePath);
                logger.logInfo('js-renamer', dstFilePath);
                logger.logInfo('js-renamer', '');
                await fs.rename(srcFilePath, dstFilePath);
                renameCount++;
                noChanges = false;
            }
            catch(error)
            {
                logger.logError('js-renamer', 'Rename failed:', error);
                errorsCount++;
            }
        }
    }
    
    if (noChanges)
    {
        logger.logInfo('js-renamer', 'No changes');
    }
    else
    {
        logger.logInfo('js-renamer', `${renameCount} files renamed, ${errorsCount} errors encountered`);
    }
}

main();

function fileStats(filePath, options)
{
    return fs.stat(filePath, options).then((stats) => stats).catch(() => null);
}
