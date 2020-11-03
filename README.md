<div align="center" >

# Youtube Downloader :red_circle:

 Baixador de vídeos do youtube com interface gráfica para windows.

 # Motivação :muscle:

 Eu sempre precisei usar serviços de download de vídeos, mas nunca achei um downloader desktop gratuito, há alguns online, mas existem muitos anúncios nos mesmos o que me faz desistir de usá-los. Alguns amigos passaram pelo mesmo problema, e por saber que sou desenvolvedor, me pediram para criar um downloader para nosso uso, então eu aceitei o pedido e aqui está. 

# Tecnologias usadas :rocket:

<div align="left">

## Electron-js
[Electron](https://www.electronjs.org/) é um framework de código aberto criado por Cheng Zhao, e agora desenvolvido pelo GitHub. 

## Electron packager
[Electron packager](https://www.npmjs.com/package/electron-packager) é um command line tool para distribuição de aplicações feitas com Electron-js.

## Electron wix msi
[Electron wix msi](https://www.npmjs.com/package/electron-wix-msi) é um criador de instalador MSI baseado em uma aplicação gerada com electron.

## ytdl-core

[Ytdl-core](https://www.npmjs.com/package/ytdl-core) é uma biblioteca para download de videos do youtube escrita em javascript.

</div>

# Como executar :wrench:

<div align="left">

## Requisitos

- Windows
- Node e NPM.

## Passo a Passo

1. Clone o repositório.
2. Intale as dependências: `npm install`
3. Executa o comando a seguir: `npm start`

## Criar executável :hammer:

- Execute o comando a seguir: `npm run build`
- O executável será gerado no diretório *dist*.
- Caso queira criar um instalador MSI, utilize o comando a seguir: `node build_installer.js` OBS: o passo anterior deve ser seguido para obter sucesso.
- O instalador será gerado no diretório *windows_installer*.

 </div>

# Contribuições :hearts:

Caso queria contribuir com o projeto, por favor entre em contato.

 </div>