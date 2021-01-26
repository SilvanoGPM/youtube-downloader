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
            message: "Isso corromperá seu download, tem certeza?",
            type: "warning",
            buttons: ["Continuar download", "Fechar"],
        });

        if (option.response === 0) {
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
