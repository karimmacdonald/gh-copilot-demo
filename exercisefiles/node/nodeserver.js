const http = require('http');
const url = require('url');
const colors = require('./colors.json');
const fs = require('fs');
const zlib = require('zlib');

/**
 * @param {http.IncomingMessage} req - The request object.
 * @param {http.ServerResponse} res - The response object.
 */
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const { pathname, query } = parsedUrl;

    if (handlers[pathname]) {
        handlers[pathname](query, res);
    } else {
        res.end('method not supported');
    }
});

const handlers = {
    '/get': handleGetRequest,
    '/DaysBetweenDates': handleDaysBetweenDatesRequest,
    '/ValidateSpanishDNI': handleValidateSpanishDNIRequest,
    '/ReturnColorCode': handleReturnColorCodeRequest,
    '/TellMeAJoke': handleTellMeAJokeRequest,
    '/ParseUrl': handleParseUrlRequest,
    '/ListFiles': handleListFilesRequest,
    '/GetFullTextFile': handleGetFullTextFileRequest,
    '/CalculateMemoryConsumption': handleCalculateMemoryConsumptionRequest,
    '/MakeZipFile': handleMakeZipFileRequest,
    '/RandomEuropeanCountry': handleRandomEuropeanCountryRequest,
};

/**
 * Handles the GET request.
 * @param {Object} query - The query object containing the request parameters.
 * @param {Object} res - The response object used to send the response.
 */
function handleGetRequest(query, res) {
    const key = query.key;
    if (!key) {
        res.end('key not passed');
    } else {
        res.end(`Hello, ${key}!`);
    }
}


/**
 * Handles the request to calculate the number of days between two dates.
 * @param {Object} query - The query object containing the dates.
 * @param {Object} res - The response object to send the result.
 */
function handleDaysBetweenDatesRequest(query, res) {
    const { date1, date2 } = query;
    if (!date1 || !date2) {
        res.end('Both date1 and date2 must be provided');
    } else {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        if (isNaN(d1) || isNaN(d2)) {
            res.end('Invalid date format');
        } else {
            const diffTime = Math.abs(d2 - d1);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            res.end(`The number of days between ${date1} and ${date2} is ${diffDays}`);
        }
    }
}

/**
 * Handles a request to validate a Spanish DNI.
 * @param {Object} query - The query object containing the DNI to validate.
 * @param {Object} res - The response object to send the validation result.
 */
function handleValidateSpanishDNIRequest(query, res) {
    const { dni } = query;
    if (!dni) {
        res.end('dni not passed');
    } else {
        const isValid = validateSpanishDNI(dni);
        if (isValid) {
            res.end('valid');
        } else {
            res.end('invalid');
        }
    }
}

/**
 * Validates a Spanish DNI (Documento Nacional de Identidad) number.
 * @param {string} dni - The DNI number to validate.
 * @returns {boolean} - Returns true if the DNI number is valid, false otherwise.
 */
function validateSpanishDNI(dni) {
    const dniRegex = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKET]$/i;
    return dniRegex.test(dni);
}



/**
 * Handles the return color code request.
 * @param {Object} query - The query object containing the color parameter.
 * @param {Object} res - The response object to send the color code.
 */
function handleReturnColorCodeRequest(query, res) {
    const { color } = query;
    if (!color) {
        res.end('color not passed');
    } else {
        let colorCode = null;
        for (const c of colors) {
            if (c.color === color) {
                colorCode = c.code.hex;
                break;
            }
        }
        if (colorCode) {
            res.end(colorCode);
        } else {
            res.end('Color not found');
        }
    }
}

/**
 * Handles the "Tell Me a Joke" request by fetching a random joke from an API.
 * 
 * @param {string} query - The query string for the request.
 * @param {object} res - The response object to send the joke back to the client.
 */
function handleTellMeAJokeRequest(query, res) {
    axios.get('https://api.jokes.com/random')
        .then(response => {
            const joke = response.data.joke;
            res.end(joke);
        })
        .catch(error => {
            console.error('Error fetching joke:', error);
            res.end('Failed to fetch joke');
        });
}


/**
 * Handles the parse URL request.
 * @param {Object} query - The query object containing the URL to parse.
 * @param {Object} res - The response object to send the parsed URL information.
 */
function handleParseUrlRequest(query, res) {
    const { someurl } = query;
    if (!someurl) {
        res.end('someurl not passed');
    } else {
        const parsedUrl = url.parse(someurl, true);
        const { protocol, host, port, path, query: queryString, hash } = parsedUrl;
        const parsedHost = host;

        res.end(`Protocol: ${protocol}\nHost: ${host}\nPort: ${port}\nPath: ${path}\nQuerystring: ${JSON.stringify(queryString)}\nHash: ${hash}\nParsed Host: ${parsedHost}`);
    }
}


/**
 * Handles the list files request.
 *
 * @param {Object} query - The query object.
 * @param {Object} res - The response object.
 */
function handleListFilesRequest(query, res) {
    const files = fs.readdirSync(__dirname);
    res.end(JSON.stringify(files));
}


/**
 * Handles the GET request to retrieve the full text file.
 *
 * @param {Object} query - The query parameters of the request.
 * @param {Object} res - The response object to send the result.
 */
function handleGetFullTextFileRequest(query, res) {
    const { filename } = query;
    if (!filename) {
        res.end('filename not passed');
    } else {
        const readStream = fs.createReadStream(filename, 'utf8');
        let result = '';

        readStream.on('data', (chunk) => {
            const lines = chunk.split('\n');
            for (const line of lines) {
                if (line.includes('Fusce')) {
                    result += line + '\n';
                }
            }
        });

        readStream.on('end', () => {
            res.end(result);
        });

        readStream.on('error', (error) => {
            console.error('Error reading file:', error);
            res.end('Failed to read file');
        });
    }
}



/**
 * Handles a request to calculate memory consumption.
 *
 * @param {Object} query - The query parameters of the request.
 * @param {Object} res - The response object to send the result.
 */
function handleCalculateMemoryConsumptionRequest(query, res) {
    const memoryUsage = process.memoryUsage();
    const memoryInGB = (memoryUsage.heapUsed / 1024 / 1024 / 1024).toFixed(2);
    res.end(`Memory consumption: ${memoryInGB} GB`);
}


/**
 * Handles the request to make a zip file.
 *
 * @param {Object} query - The query object containing request parameters.
 * @param {Object} res - The response object to send the result.
 */
function handleMakeZipFileRequest(query, res) {

    const inputFilePath = 'sample.txt';
    const outputFilePath = 'sample.gz';

    const readStream = fs.createReadStream(inputFilePath);
    const writeStream = fs.createWriteStream(outputFilePath);

    const gzip = zlib.createGzip();

    readStream.pipe(gzip).pipe(writeStream);

    writeStream.on('finish', () => {
        res.end('Zip file created successfully');
    });

    writeStream.on('error', (error) => {
        console.error('Error creating zip file:', error);
        res.end('Failed to create zip file');
    });
}


/**
 * Handles a request for a random European country.
 * @param {string} query - The query string of the request.
 * @param {object} res - The response object.
 */
function handleRandomEuropeanCountryRequest(query, res) {
    const europeanCountries = [
        { country: 'Albania', isoCode: 'AL' },
        { country: 'Andorra', isoCode: 'AD' },
        { country: 'Austria', isoCode: 'AT' },
        { country: 'Belarus', isoCode: 'BY' },
        { country: 'Belgium', isoCode: 'BE' },
        { country: 'Bosnia and Herzegovina', isoCode: 'BA' },
        { country: 'Bulgaria', isoCode: 'BG' },
        { country: 'Croatia', isoCode: 'HR' },
        { country: 'Cyprus', isoCode: 'CY' },
        { country: 'Czech Republic', isoCode: 'CZ' },
        { country: 'Denmark', isoCode: 'DK' },
        { country: 'Estonia', isoCode: 'EE' },
        { country: 'Finland', isoCode: 'FI' },
        { country: 'France', isoCode: 'FR' },
        { country: 'Germany', isoCode: 'DE' },
        { country: 'Greece', isoCode: 'GR' },
        { country: 'Hungary', isoCode: 'HU' },
        { country: 'Iceland', isoCode: 'IS' },
        { country: 'Ireland', isoCode: 'IE' },
        { country: 'Italy', isoCode: 'IT' },
        { country: 'Latvia', isoCode: 'LV' },
        { country: 'Liechtenstein', isoCode: 'LI' },
        { country: 'Lithuania', isoCode: 'LT' },
        { country: 'Luxembourg', isoCode: 'LU' },
        { country: 'Malta', isoCode: 'MT' },
        { country: 'Moldova', isoCode: 'MD' },
        { country: 'Monaco', isoCode: 'MC' },
        { country: 'Montenegro', isoCode: 'ME' },
        { country: 'Netherlands', isoCode: 'NL' },
        { country: 'North Macedonia', isoCode: 'MK' },
        { country: 'Norway', isoCode: 'NO' },
        { country: 'Poland', isoCode: 'PL' },
        { country: 'Portugal', isoCode: 'PT' },
        { country: 'Romania', isoCode: 'RO' },
        { country: 'Russia', isoCode: 'RU' },
        { country: 'San Marino', isoCode: 'SM' },
        { country: 'Serbia', isoCode: 'RS' },
        { country: 'Slovakia', isoCode: 'SK' },
        { country: 'Slovenia', isoCode: 'SI' },
        { country: 'Spain', isoCode: 'ES' },
        { country: 'Sweden', isoCode: 'SE' },
        { country: 'Switzerland', isoCode: 'CH' },
        { country: 'Ukraine', isoCode: 'UA' },
        { country: 'United Kingdom', isoCode: 'GB' },
        { country: 'Vatican City', isoCode: 'VA' }
    ];

    const randomIndex = Math.floor(Math.random() * europeanCountries.length);
    const randomCountry = europeanCountries[randomIndex];

    res.end(`Random European Country: ${randomCountry.country}\nISO Code: ${randomCountry.isoCode}`);
}


server.listen(3000, () => {
    console.log('server is listening on port 3000');
});