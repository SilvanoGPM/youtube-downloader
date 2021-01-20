const buttons = document.querySelectorAll(".header__button");

const win = require('electron')
    .remote
    .getCurrentWindow();

const minimize = () => win.minimize();

const resize = () =>
    win.isMaximized() ? win.unmaximize() : win.maximize();

const close = async () => {
    if (isDownloading) {
        const option = await dialog.showMessageBox({
            title: "Atenção",
            message: "Isso cancelará seu download, tem certeza?",
            type: "warning",
            buttons: ["Ok", "Retornar"],
        });

        if (option.response === 1) {
            return;
        }
    }

    win.close();
}

const handleControlButtons = button => {
    const controlType = button.getAttribute('data-control');
    const action = eval(controlType);
    button.addEventListener('click', action);
}

buttons.forEach(handleControlButtons);
