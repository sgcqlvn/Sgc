// =====================================
// SGC QUẢN LÝ ONLINE - APP.JS
// PHẦN 1/3
// FIREBASE AUTH + FIRESTORE
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
// TẠO EMAIL ẨN
// ================================

function convertEmail(username){

    return username
    .trim()
    .toLowerCase()
    .replace(/\s+/g,"")
    +"@sgc.vn";

}




// ================================
// TẠO SỔ MỚI
// ================================

window.createBook = async function(){

    let username = prompt("Tên tài khoản:");

    if(!username) return;


    let password = prompt("Mật khẩu (ít nhất 6 ký tự):");


    if(!password || password.length < 6){

        alert("Mật khẩu phải từ 6 ký tự");

        return;

    }


    try{

        let email = convertEmail(username);



        // Tạo tài khoản Firebase

        let userCredential =
        await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );


        let uid = userCredential.user.uid;



        // Tạo sổ trong Firestore

        await setDoc(

            doc(
                db,
                "books",
                uid
            ),

            {

                username: username,

                createdAt: new Date(),

                totalProfit: 0

            }

        );



        alert(
            "Tạo sổ thành công. Hãy đăng nhập!"
        );



    }
    catch(error){


        alert(error.message);


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



        loadCustomers();



    }
    catch(e){


        alert(
        "Sai tài khoản hoặc mật khẩu"
        );


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


};// =====================================
// SGC QUẢN LÝ ONLINE - APP.JS
// PHẦN 2/3
// KHÁCH HÀNG FIRESTORE
// =====================================



// ================================
// TẢI KHÁCH HÀNG
// ================================

async function loadCustomers(){


    if(!currentBookId)
    return;



    customers=[];



    let snap =
    await getDocs(

        collection(
            db,
            "books",
            currentBookId,
            "customers"
        )

    );



    snap.forEach(doc=>{


        customers.push({

            id:doc.id,

            ...doc.data()

        });


    });



    renderCustomers();


}







// ================================
// LƯU KHÁCH
// ================================

async function saveCustomer(data){


    await addDoc(

        collection(
            db,
            "books",
            currentBookId,
            "customers"
        ),

        data

    );


}






// ================================
// THÊM KHÁCH
// ================================

window.addCustomer = async function(){


    let name =
    prompt("Tên khách:");



    if(!name)
    return;



    let phone =
    prompt("Số điện thoại:");



    let loan =
    Number(
        prompt("Tiền vay:")
    );



    let daily =
    Number(
        prompt("Tiền góp mỗi ngày:")
    );



    let date =
    new Date()
    .toLocaleDateString("vi-VN");



    let customer={


        name:name,

        phone:phone || "",

        loan:loan || 0,

        daily:daily || 0,

        paid:0,

        profit:0,

        loanDate:date,

        cycleDate:date,

        lastMergeDate:"",

        history:[]

    };



    await saveCustomer(customer);



    loadCustomers();


};







// ================================
// HIỂN THỊ KHÁCH
// ================================

window.renderCustomers=function(){


    let box =
    document.getElementById(
        "customerList"
    );



    if(!box)
    return;



    box.innerHTML="";



    let search =
    document
    .getElementById(
        "searchBox"
    )
    .value
    .toLowerCase();




    customers.forEach((c,index)=>{


        if(
            search &&
            !c.name
            .toLowerCase()
            .includes(search)
        )
        return;



        box.innerHTML += `


        <div class="customer">


        <h4>
        ${c.name}
        </h4>


        <p>
        💰 Tiền vay:
        ${c.loan.toLocaleString()} đ
        </p>


        <p>
        📅 Ngày mượn:
        ${c.loanDate}
        </p>


        <p>
        💵 Đã đóng:
        ${c.paid.toLocaleString()} đ
        </p>


        <p>
        ⭐ Lời:
        ${c.profit.toLocaleString()} đ
        </p>



        <button onclick="collectMoney('${c.id}')">
        Thu tiền
        </button>



        <button onclick="mergeMoney('${c.id}')">
        Dồn tiền
        </button>



        <button onclick="deleteCustomer('${c.id}')">
        Xóa khách
        </button>



        </div>


        `;


    });


};






// ================================
// TÌM KIẾM
// ================================

window.searchCustomer=function(){

    renderCustomers();

};






// ================================
// XÓA KHÁCH
// ================================

window.deleteCustomer=async function(id){


    if(
        !confirm(
        "Xóa khách này?"
        )
    )
    return;



    await deleteDoc(

        doc(

            db,

            "books",

            currentBookId,

            "customers",

            id

        )

    );



    loadCustomers();


};// =====================================
// SGC QUẢN LÝ ONLINE - APP.JS
// PHẦN 3/3
// THU TIỀN - DỒN TIỀN - THỐNG KÊ
// =====================================


// ================================
// CẬP NHẬT KHÁCH
// ================================

async function updateCustomer(id,data){


    await setDoc(

        doc(
            db,
            "books",
            currentBookId,
            "customers",
            id
        ),

        data

    );


}



// ================================
// THU TIỀN
// ================================

window.collectMoney = async function(id){


    let c =
    customers.find(
        x=>x.id===id
    );


    if(!c)
    return;



    let money =
    Number(
        prompt(
        "Số tiền khách đóng:"
        )
    );



    if(!money)
    return;



    let date =
    new Date()
    .toLocaleDateString("vi-VN");



    c.paid += money;



    c.history.push({

        type:"thu",

        amount:money,

        date:date

    });



    await updateCustomer(
        id,
        c
    );



    loadCustomers();



};







// ================================
// DỒN TIỀN
// ================================

window.mergeMoney = async function(id){


    let c =
    customers.find(
        x=>x.id===id
    );



    if(!c)
    return;



    let money =
    Number(
        prompt(
        "Số tiền dồn trả khách:"
        )
    );



    if(!money)
    return;



    if(money > c.paid){

        alert(
        "Số tiền dồn lớn hơn tiền đã đóng"
        );

        return;

    }



    let profit =
    c.paid - money;



    let date =
    new Date()
    .toLocaleDateString("vi-VN");



    c.paid -= money;



    c.profit += profit;



    c.cycleDate=date;


    c.lastMergeDate=date;



    c.history.push({

        type:"don",

        amount:money,

        profit:profit,

        date:date

    });



    await updateCustomer(
        id,
        c
    );



    loadCustomers();



};






// ================================
// THỐNG KÊ
// ================================

window.updateStats=function(){


    let today =
    new Date()
    .toLocaleDateString("vi-VN");



    let totalThu=0;

    let totalDon=0;

    let totalProfit=0;



    customers.forEach(c=>{


        c.history.forEach(h=>{


            if(h.date===today){


                if(h.type==="thu")
                totalThu+=h.amount;



                if(h.type==="don"){

                    totalDon+=h.amount;

                    totalProfit+=h.profit;

                }


            }


        });


    });



    let a =
    document.getElementById(
        "todayIncome"
    );


    let b =
    document.getElementById(
        "todayMerge"
    );


    let c =
    document.getElementById(
        "todayProfit"
    );



    if(a)
    a.innerText=
    totalThu.toLocaleString();



    if(b)
    b.innerText=
    totalDon.toLocaleString();



    if(c)
    c.innerText=
    totalProfit.toLocaleString();


};






// ================================
// ĐỔI MẬT KHẨU
// ================================

window.changePassword = async function(){


    let pass =
    prompt(
    "Nhập mật khẩu mới:"
    );



    if(!pass)
    return;



    await updatePassword(
        auth.currentUser,
        pass
    );



    alert(
    "Đổi mật khẩu thành công"
    );


};






// ================================
// SAO LƯU
// ================================

window.backupData=function(){


    let data =
    JSON.stringify(
        customers,
        null,
        2
    );



    let blob =
    new Blob(
        [data],
        {
            type:"application/json"
        }
    );



    let url =
    URL.createObjectURL(blob);



    let a =
    document.createElement("a");



    a.href=url;


    a.download=
    "SGC_backup.json";


    a.click();


};
