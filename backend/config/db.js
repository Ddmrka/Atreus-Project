const sql = require('mssql/msnodesqlv8');
require('dotenv').config();

const connectionString =
  `Driver={${process.env.DB_DRIVER}};` +
  `Server=${process.env.DB_SERVER};` +
  `Database=${process.env.DB_NAME};` +
  `Trusted_Connection=Yes;`;

const sqlConfig = {
  connectionString,
  options: {
    trustedConnection: true,
    trustServerCertificate: true,
  },
};

const poolPromise = sql.connect(sqlConfig)
  .then((pool) => {
    console.log('Conectado a SQL Server con Windows Authentication');
    return pool;
  })
  .catch((err) => {
    console.error('Error conectando a SQL Server:');
    console.dir(err, { depth: 10 });
    if (err && err.originalError) {
      console.error('originalError:');
      console.dir(err.originalError, { depth: 10 });
    }
    throw err;
  });

module.exports = {
  sql,
  poolPromise,
};