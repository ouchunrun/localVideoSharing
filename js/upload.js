let fileURL = "";
let leftV = document.getElementById('leftVideo');
let uploadFile = document.getElementById("uploadFile");

uploadFile.addEventListener("change", function () {
    trace("uploadFile is change!")
    let file = null;
    try{
        file = uploadFile.files[0];
        fileURL = window.URL.createObjectURL(file);

        let typeJudge = file.type.split("/")[0];
        if(typeJudge === "audio" || typeJudge === "video"){
            leftV.src = fileURL;
        }else if(typeJudge === "image"){
            setCanvas(fileURL);
        }else {
            console.log("please upload video/audio or image!");
        }
    }catch(e){
        console.log(e.message);
    }
});