const fs = require("fs");
const path = require('path');

const handleError = statusElt => err => {
    console.log(err);

    const logsDir = path.join(__dirname, '..', '..', 'logs',);
    const logsPath = path.join(logsDir, `error-log-${Date.now()}.txt`);

    if (!fs.existsSync(logsDir)) {
        fs.mkdir(logsDir);
    }


    fs.writeFileSync(logsPath, err);
    statusElt.innerHTML =
        `<span class="error" >Ocorreu um erro, tente novamente!<span>`;
};

exports.default = handleError;
