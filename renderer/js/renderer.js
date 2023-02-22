const form  = document.querySelector('#img-form');
const img = document.querySelector('#img');
const outputPath = document.querySelector('#output-path');
const filename = document.querySelector('#filename');
const heightInput = document.querySelector('#height');
const widthInput = document.querySelector('#width');

// console.log(versions.node());
//? FUNCTIONS
    function loadImage(e){
        const file = e.target.files[0];

        if(!isFileImage(file)){
            alertError("Please select an image");
            return
        }
        //Get original Dimensions
        const image = new Image();
        image.src = URL.createObjectURL(file);
        image.onload = function () {
            widthInput.value = this.width;
            heightInput.value = this.height;

        }


        //in the case of the select image the form in the html is showing 
        form.style.display = 'block';
        filename.innerText = file.name;
        //? call the router name 
        outputPath.innerText = path.join(os.homedir(), 'imageresizer');
    }
    //? SEND IMAGE DATA TO MAIN
    function sendImage(e){
        e.preventDefault();

        const width = widthInput.value;
        const height = heightInput.value;
        const imgPath = img.files[0].path;
        //?VALIDATIONS

        if(!img.files[0]){
            alertError('please upload image')
            return
        }
        if(width ==='' || height === ''){
            alertError('Please fill in a height and width')
            return
        }
        //? SEND TO MAIN USING ipcRenderer
        ipcRenderer.send('image:resize',{
            imgPath,
            width,
            height,
        })

        }

        //Catch the image:done event 
        ipcRenderer.on('image:done', ()=> {
            alertSucces(`Image resized to ${widthInput.value} x ${heightInput.value}`);
        })

    //Make sure file is image

    function isFileImage(file){
        const acceptedImagesTypes = ['image/gif', 'image/png', 'image/jpeg'];
        return file && acceptedImagesTypes.includes(file['type']);
    }
    function alertError(message){
        Toastify.toast({
            text: message,
            duration: 5000,
            close: false,
            style: {
                background: 'red',
                color: 'white',
                textAlign: 'center'
            }
        })
    }
    function alertSucces(message){
        Toastify.toast({
            text: message,
            duration: 5000,
            close: false,
            style: {
                background: 'green',
                color: 'white',
                textAlign: 'center'
            }
        })
    }
//* EVENTS
img.addEventListener('change', loadImage);
form.addEventListener('submit',sendImage);