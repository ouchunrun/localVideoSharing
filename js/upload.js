let fileURL = "";
let leftV = document.getElementById('leftVideo');
let uploadFile = document.getElementById("uploadFile");
let fileInfo = document.getElementById('fileInfo');

uploadFile.addEventListener("change", function () {
    let file = null;
    try{
        if(uploadFile.files && uploadFile.files[0] ){
            file = uploadFile.files[0];
        }else if(uploadFile.files && uploadFile.files.item(0)) {
            file = uploadFile.files.item(0);
        }
        try{
            //Firefox7.0
            fileURL =  file.getAsDataURL();
        }catch(e){
            //Firefox8.0以上
            fileURL = window.URL.createObjectURL(file);
        }

        let typeJudge = file.type.split("/")[0];
        if(typeJudge === "audio" || typeJudge === "video"){
            leftV.src = fileURL;
            printInfo(file);
        }else if(typeJudge === "image"){
            if (file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'image/gif') {
                alert('不是有效的图片文件!');
                return;
            }
            setCanvas(fileURL);     // setCanvas() is in the main.js
            printInfo(file);
        }else {
            console.log("请上传视频、音频、图片！！暂不支持别的applications");
        }
    }catch(e){
        console.log(e.message);
    }
});

// 打印上传的文件信息
function printInfo(file) {
    fileInfo.innerHTML = '文件: ' + file.name + '<br>' +
        '大小: ' + file.size + '<br>' +
        '修改: ' + file.lastModifiedDate;
}

