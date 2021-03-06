import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
       
        const firebaseConfig = {
          apiKey: "AIzaSyC1WJuRzxe5M5wtvRx-BK6c7mOps4usdR4",
          authDomain: "long-old-live-plus-aab44.firebaseapp.com",
          projectId: "long-old-live-plus-aab44",
          storageBucket: "long-old-live-plus-aab44.appspot.com",
          messagingSenderId: "371071760445",
          appId: "1:371071760445:web:b44da528fddb82bb759254"
        };
      
        // Initialize Firebase
        const app = initializeApp(firebaseConfig);

        import { getStorage, ref as sRef, uploadBytesResumable, getDownloadURL}
        from "https://www.gstatic.com/firebasejs/9.6.10/firebase-storage.js"

        // Cloud Firestore
        import { getFirestore, doc, getDoc, setDoc, collection, addDoc}
        from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
        const clouddb = getFirestore();
        

        //variables y referencias
        var files = [];
        var reader = new FileReader();

        var namebox = document.getElementById('namebox');
        var extlab = document.getElementById('extlab');
        var myimg = document.getElementById('myimg');
        var proglab = document.getElementById('upprogress');
        var SelBtn = document.getElementById('selbtn');
        var UpBtn = document.getElementById('upbtn');
        var DownBtn = document.getElementById('downbtn');

        var input = document.createElement('input')
        input.type = 'file';

        input.onchange = e =>{
            files = e.target.files;

            var extention = GetFileExt(files[0]);
            var name = GetFileName(files[0]);

            namebox.value = name;
            extlab.innerHTML = extention;

            reader.readAsDataURL(files[0]);

        }

        reader.onload = function(){
            myimg.src = reader.result;

        }

        //seleccion

        SelBtn.onclick = function(){
            input.click();
        }

        function GetFileExt(file){
            var temp = file.name.split('.');
            var ext = temp.slice((temp.length-1),(temp.length));
            return '.' + ext[0];
        }

        function GetFileName(file){
            var temp = file.name.split('.');
            var fname = temp.slice(0,-1).join('.');
            return fname;
        }

        // upload

        async function UploadProcess(){
            var ImgToUpload = files[0];

            var ImgName = namebox.value + extlab.innerHTML;


            const metaData = {
                contentType: ImgToUpload.type
            }

            const storage = getStorage();
 
            const stroageRef = sRef(storage, 'Images/' + ImgName);

            const UploadTask = uploadBytesResumable(stroageRef,ImgToUpload,metaData);

            UploadTask.on('state-changed', 
            (snapshot)=>{
                var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                proglab.innerHTML = "Upload " + progress + "%";
            },
            (error) => {
                alert("error de subir imagen");
            },

            ()=>{
                getDownloadURL(UploadTask.snapshot.ref).then((downloadURL) => {
                    SaveURLtoFirestore(downloadURL);
                });
            }
            );
        }

        // funciones para firestore database

        async function SaveURLtoFirestore(url){
            var name = namebox.value;
            var ext = extlab.innerHTML;

            var ref = doc(clouddb, "ImageLinks/"+name);

            await setDoc(ref,{
                ImageName: (name+ext),
                ImageURL: url
            })
            console.log("se subio a firestore");
        }

        async function GetImagefromFirestore(){
            var name = namebox.value;
            var ref = doc(clouddb, "ImageLinks/"+name);

            const docSnap = await getDoc(ref);

            if(docSnap.exists()){
                myimg.src = docSnap.data().ImageURL;
            }
        }


        UpBtn.onclick = UploadProcess;
        DownBtn.onclick = GetImagefromFirestore;
