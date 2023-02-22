const path = require('path');
const os = require('os');
const fs = require('fs');
const resizeImg = require('resize-img');
const {app,BrowserWindow,Menu,ipcMain, shell} = require('electron');
const isWindows = process.platform = 'win32';
const isDev = process.env.NODE_ENV !== 'development';
let mainWindow;
let aboutWindow;
//?CREATE THE MAIN WINDOW
function createMainWindow(){
   //this is for create windows 
    mainWindow = new BrowserWindow({
    title: "Image Resizer",
    width: isDev ? 1000 :500,
    height: 600,
    //? IMPORT THE PRELOAD 
    webPreferences:{
        contextIsolation: true,
        nodeIntegration: true,
        preload: path.join(__dirname , 'preload.js')
    }
   });

   //? OPEN DEVTOOLS IF IN DEV ENV
   if(isDev){
    mainWindow.webContents.openDevTools();
   }

   mainWindow.loadFile(path.join(__dirname, './renderer/index.html')); //this is file to load 
   //dirname is the folder and the render is inside the folder
}

// ?? CREATE ABOUT WINDOW
function createAboutWindow(){
     aboutWindow = new BrowserWindow({
        title: "About Resizer",
        width: 300,
        height: 300 
       });
    
    
       aboutWindow.loadFile(path.join(__dirname, './renderer/about.html')); //this is file to load 
       //dirname is the folder and the render is inside the folder
}

//then the app is ready 
app.whenReady().then(()=>{

    createMainWindow()
    //? IMPLEMENT MENU 
    const mainMenu  = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu)

    //? Remove mainWindow from memory on close
    mainWindow.on('closed',()=>(mainWindow = null));

    
    app.on('activate', () => {
        if(BrowserWindow-getAllWindows().length === 0){
            createMainWindow();
        }
    })

} );

//* MENU TEMPLATE
const menu = [
    ...(isWindows ?
     [
        {
            label: app.name,
            submenu: [
                {
                    label: 'About',
                    click: createAboutWindow
                }
            ]
        }
    ] : []),

    {
        role: 'fileMenu',
    },
];

//? RESPOND TO ipcRender resize
ipcMain.on('image:resize', (e,options) => {

    options.dest = path.join(os.homedir(), 'imageresize')
    resizeImage(options);
})

//? RESIZE THE IMAGE FUNCTION
async function resizeImage({imgPath,width,height,dest}){
    try {
        const newPath = await resizeImg(fs.readFileSync(imgPath), {
            width: +width, // + convert to the number
            height: +height,
        });

        //get filename

        const filename = path.basename(imgPath);
        

        //Create dest folder if not exists
        if(!fs.existsSync(dest)){
            console.log("no esta la carpeta");
            console.log(dest);
            fs.mkdirSync(dest);
            console.log(dest);
        }

        //write file to dest
        fs.writeFileSync(path.join(dest,filename),newPath);

        //Send succes to render
        mainWindow.webContents.send('image:done');
        //Open dest folder
        shell.openPath(dest);

    } catch (error) {
        console.log(error);
    }
}


app.on('window-all-closed', ()=>{
    if(!isWindows){
        app.quit()
    }
})
//every process is show in documentation of electron 