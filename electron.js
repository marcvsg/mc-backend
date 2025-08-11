const { app, BrowserWindow } = require("electron");
const path = require("path");

let mainWindow;

function createWindow() {
  // Criar janela do navegador
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, "public", "img", "MC.png"),
    show: false,
  });

  // Carregar a aplicação
  mainWindow.loadURL("http://localhost:3000");

  // Mostrar janela quando estiver pronta
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    console.log("🚀 Aplicação Electron iniciada!");
  });

  // Fechar janela quando fechada
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// Quando o Electron terminar de inicializar
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Fechar quando todas as janelas estiverem fechadas
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
