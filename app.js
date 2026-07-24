// =====================================
// SGC QUẢN LÝ ONLINE - APP.JS
// PHẦN 1/3
// AUTH + FIREBASE + TẠO SỔ + ĐĂNG NHẬP
// =====================================


import { auth, db } from "./firebase.js";


import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updatePassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


import {
    doc,
    setDoc,
    getDoc,
    collection,
    addDoc,
    getDocs,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";



// ================================
// BIẾN HỆ THỐNG
// ================================

let currentUser = null;

let currentBookId = null;

let customers = [];



// ================================
// ĐỔI TÊN ĐĂNG NHẬP THÀNH EMAIL ẨN
// ================================

function convertEmail(username){

    return username
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g,"")
    +"@sgcvn.com";

}



// ================================
// TẠO SỔ MỚI
// ================================

window.createBook = async function(){


    let username = prompt(
        "Tên tài khoản:"
    );


    if(!username)
    return;



    let password = prompt(
        "Mật khẩu (ít nhất 6 ký tự):"
    );


    if(!password || password.length < 6){

        alert(
            "Mật khẩu phải từ 6 ký tự"
        );

        return;

    }



    try{


        let result =
        await createUserWithEmailAndPassword(

            auth,

            convertEmail(username),

            password

        );



        let uid =
        result.user.uid;



        await setDoc(

            doc(
                db,
                "books",
                uid
            ),

            {

                username:username,

                createdAt:new Date(),

                totalProfit:0

            }

        );



        alert(
            "Tạo sổ thành công"
        );



    }
    catch(error){


        alert(
            error.message
        );


    }


};



// ================================
// ĐĂNG NHẬP
// ================================

window.login = async function(){


    let username =
    document
    .getElementById("loginUser")
    .value;


    let password =
    document
    .getElementById("loginPass")
    .value;



    try{


        let result =
        await signInWithEmailAndPassword(

            auth,

            convertEmail(username),

            password

        );



        currentUser =
        result.user;



        let book =
        await getDoc(

            doc(
                db,
                "books",
                currentUser.uid
            )

        );



        if(!book.exists()){


            alert(
                "Không tìm thấy sổ"
            );


            return;

        }



        currentBookId =
        currentUser.uid;



        document
        .getElementById("loginBox")
        .classList.add("hidden");



        document
        .getElementById("app")
        .classList.remove("hidden");



        document
        .getElementById("bookName")
        .innerText =
        book.data().username;



        await loadCustomers();



    }
    catch(error){


        alert(
            "Sai tài khoản hoặc mật khẩu"
        );


        console.log(error);


    }


};



// ================================
// ĐĂNG XUẤT
// ================================

window.logout = async function(){


    await signOut(auth);



    currentUser=null;

    currentBookId=null;

    customers=[];



    document
    .getElementById("app")
    .classList.add("hidden");


    document
    .getElementById("loginBox")
    .classList.remove("hidden");


};
