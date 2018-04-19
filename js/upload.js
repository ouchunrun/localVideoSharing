let imgURL = "";
let leftV = document.getElementById('leftVideo');

function getFileURL(node) {
    let file = null;
    try{
        if(node.files && node.files[0] ){
            file = node.files[0];
        }else if(node.files && node.files.item(0)) {
            file = node.files.item(0);
        }

        try{
            //Firefox7.0
            imgURL =  file.getAsDataURL();
        }catch(e){
            //Firefox8.0以上
            imgRUL = window.URL.createObjectURL(file);
        }

        let spstr = file.name.split(".");
        let fileType = spstr[spstr.length-1];
        if(fileType === "mp4" || fileType === "webm" || fileType === "mp3"){
            leftV.src = window.URL.createObjectURL(file);
        }

    }catch(e){      //这里不知道怎么处理了，如果是遨游的话会报这个异常
        //支持html5的浏览器,比如高版本的firefox、chrome、ie10
        if (node.files && node.files[0]) {
            let reader = new FileReader();
            reader.onload = function (e) {
                imgURL = e.target.result;
            };
            reader.readAsDataURL(node.files[0]);
        }
    }
    creatImg(imgRUL);
    return imgURL;
}

function creatImg(imgRUL){   //图片可以在线显示
    var textHtml = "<img src='"+imgRUL+"'/>";
    $(".mark").after(textHtml);
}



