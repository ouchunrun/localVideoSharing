let fileURL = "";
let leftV = document.getElementById('leftVideo');
let uploadFile = document.getElementById("uploadFile");
let fileInfo = document.getElementById('fileInfo');
let textHtml = "";


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
            // 视频或音频
            leftV.src = fileURL;
        }else if(typeJudge === "image"){
            // 图片、动画等
            if (file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'image/gif') {
                alert('不是有效的图片文件!');
                return;
            }
            setCanvas(fileURL);     // setCanvas() is in the main.js
        }else if(file.type === "application/pdf" || file.type === "application/msword"){
            // word、pdf
            console.log("msword和PDF文件: " + file.type);
        }else {
            console.log("请上传视频、音频、图片、word、pdf等！！暂不支持别的applications");
        }

        // 打印上传的文件信息
        fileInfo.innerHTML = '文件: ' + file.name + '<br>' +
            '大小: ' + file.size + '<br>' +
            '修改: ' + file.lastModifiedDate;

    }catch(e){
        // 兼容问题很大，暂时不考虑兼容
        console.log(e.message);
    }
})

// 图片在线预览
function creatImg(fileURL){
    textHtml = "<img src='"+fileURL+"' />";
    $(".mark").after(textHtml);
}



