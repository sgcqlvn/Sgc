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

    username = username
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g,"");


    return username + "@sgcvn.com";

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
        alert(email);



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
        cycles:[]

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


      <h4 onclick="openCustomerDetail('${c.id}')">

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

    let c = customers.find(
        x => x.id === id
    );


    if(!c) return;

if(!c.cycles)
c.cycles=[];


c.cycles.push({

    startDate:c.cycleDate,

    endDate:date,

    totalPaid:totalPaid,

    mergeAmount:mergeAmount,

    profit:profit

});

    // Tổng tiền đã đóng trong dây hiện tại
    let totalPaid = c.paid || 0;
    c.cycleDate = date;



    if(totalPaid <= 0){

        alert("Khách chưa có tiền đóng để dồn");

        return;

    }



    let mergeAmount = Number(
        prompt(
            "Số tiền khách dồn:"
        )
    );



    if(!mergeAmount || mergeAmount > totalPaid){

        alert(
            "Số tiền dồn không hợp lệ"
        );

        return;

    }



    // Lời = tiền đã đóng - tiền dồn

    let profit =
    totalPaid - mergeAmount;



    let date =
    new Date()
    .toLocaleDateString("vi-VN");



    // Cộng lời

    c.profit =
    (c.profit || 0) + profit;



    // Lưu lịch sử dồn

    if(!c.history)
    history:[],

cycles:[];



    c.history.push({

        type:"don",

        date:date,

        oldPaid:totalPaid,

        amount:mergeAmount,

        profit:profit

    });



    // ===== LÊN DÂY MỚI =====


    c.paid = 0;


    c.cycleDate = date;


    c.lastMergeDate = date;



    await updateCustomer(
        id,
        c
    );



    alert(
        "Dồn thành công\n"+
        "Lời: "+
        profit.toLocaleString()+
        " đ\n"+
        "Đã lên dây mới"
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


};// ================================
// CHI TIẾT KHÁCH
// ================================

window.openCustomerDetail=function(id){


    let c = customers.find(
        x=>x.id===id
    );


    if(!c) return;



    document
    .getElementById("customers")
    .classList.add("hidden");


    document
    .getElementById("customerDetail")
    .classList.remove("hidden");



    let html = `

<h3>${c.name}</h3>


<p>
💰 Tiền vay:
${(c.loan||0).toLocaleString()} đ
</p>


<p>
📅 Ngày mượn:
${c.loanDate || ""}
</p>


<p>
💵 Góp mỗi ngày:
${(c.daily||0).toLocaleString()} đ
</p>


<p>
🔄 Dây hiện tại:
${c.cycleDate || ""}
</p>


<p>
⭐ Tổng lời:
${(c.profit||0).toLocaleString()} đ
</p>

`;

html += `

<hr>

<h4>
📚 Các dây cũ
</h4>

`;

(c.cycles || []).forEach((d,index)=>{


html += `

<div>

<b>Dây ${index+1}</b>

<p>
📅 Từ:
${d.startDate}
</p>


<p>
🏁 Đến:
${d.endDate}
</p>


<p>
💵 Đã đóng:
${d.totalPaid.toLocaleString()} đ
</p>


<p>
🔄 Đã dồn:
${d.mergeAmount.toLocaleString()} đ
</p>


<p>
⭐ Lời:
${d.profit.toLocaleString()} đ
</p>
<hr>

</div>

`;

});
    html += `

<hr>

<h4>
📌 Lịch sử đóng tiền
</h4>

`;
let thu=false;


(c.history||[]).forEach(h=>{

    if(h.type==="thu"){

        thu=true;

        html += `

<p>
${h.date}
<br>
Đóng:
${h.amount.toLocaleString()} đ
</p>

`;

    }

});
if(!thu){

html += "<p>Chưa có lịch sử đóng</p>";
    

}html += `

<hr>

<h4>
📌 Lịch sử dồn
</h4>

`;

let don=false;


(c.history||[]).forEach(h=>{

    if(h.type==="don"){

        don=true;

        html += `

<p>
${h.date}
<br>
Dồn:
${h.amount.toLocaleString()} đ

<br>
Lời:
${h.profit.toLocaleString()} đ
</p>

`;

    }

});


if(!don){

html += "<p>Chưa có lịch sử dồn</p>";

}document
.getElementById("detailContent")
.innerHTML=html;
    };window.closeDetail=function(){


document
.getElementById("customerDetail")
.classList.add("hidden");


document
.getElementById("customers")
.classList.remove("hidden");


};
