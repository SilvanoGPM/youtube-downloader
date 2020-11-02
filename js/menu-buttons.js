const { remote } = require('electron');
const win = remote.getCurrentWindow();

const buttonsActions = {
    '0': minimize,
    '1': resize,
    '2': close
}

const buttons = document.querySelectorAll(".control-button");

buttons.forEach((button, action) => {
    button.addEventListener('click', buttonsActions[String(action)])
});

function minimize() {
    win.minimize();
}

function resize() {
    if (!win.isMaximized()) {
        win.maximize();
        buttons[1].innerHTML = "❐";
    } else {
        win.unmaximize();
        buttons[1].innerHTML = "□";
    }
}

function close() {
    win.close();
}