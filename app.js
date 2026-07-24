// =====================================
// SGC QUẢN LÝ ONLINE
// APP.JS PHẦN 1/5
// AUTH + FIREBASE
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
// ĐỔI TÀI KHOẢN THÀNH EMAIL ẨN
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


    let username =
    prompt("Tên tài khoản:");



    if(!username)
    return;



    let password =
    prompt("Mật khẩu (ít nhất 6 ký tự):");



    if(!password || password.length < 6){

        alert(
            "Mật khẩu phải từ 6 ký tự"
        );

        return;

    }



    try{


        let user =
        await createUserWithEmailAndPassword(

            auth,

            convertEmail(username),

            password

        );



        await setDoc(

            doc(
                db,
                "books",
                user.user.uid
            ),

            {

                username:username,

                totalProfit:0,

                createdAt:new Date()

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


        console.log(error);


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



    currentUser = null;

    currentBookId = null;

    customers = [];



    document
    .getElementById("app")
    .classList.add("hidden");



    document
    .getElementById("loginBox")
    .classList.remove("hidden");


};
// =====================================
// SGC QUẢN LÝ ONLINE
// APP.JS PHẦN 2/5
// KHÁCH HÀNG
// =====================================



// ================================
// TẢI DANH SÁCH KHÁCH
// ================================

async function loadCustomers(){


    if(!currentBookId)
    return;



    try{


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



        snap.forEach(item=>{


            customers.push({

                id:item.id,

                ...item.data()

            });


        });



        renderCustomers();


    }
    catch(error){


        console.log(error);


        alert(
            "Không tải được khách hàng"
        );


    }


}



// ================================
// LƯU KHÁCH MỚI
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
    ) || 0;



    let daily =
    Number(
        prompt("Tiền góp mỗi ngày:")
    ) || 0;



    let date =
    new Date()
    .toLocaleDateString("vi-VN");



    let customer={


        name:name,

        phone:phone || "",

        loan:loan,

        daily:daily,


        paid:0,


        profit:0,


        loanDate:date,


        cycleDate:date,


        lastMergeDate:"",



        history:[],


        cycles:[]


    };



    try{


        await saveCustomer(customer);



        await loadCustomers();



        alert(
            "Thêm khách thành công"
        );


    }
    catch(error){


        alert(
            error.message
        );


    }


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



    customers.forEach(c=>{


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
💰 Vay:
${(c.loan||0).toLocaleString()} đ
</p>


<p>
💵 Đã đóng:
${(c.paid||0).toLocaleString()} đ
</p>


<p>
⭐ Lời:
${(c.profit||0).toLocaleString()} đ
</p>



<button onclick="collectMoney('${c.id}')">

Thu tiền

</button>



<button onclick="mergeMoney('${c.id}')">

Dồn tiền

</button>



<button onclick="deleteCustomer('${c.id}')">

Xóa

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

window.deleteCustomer = async function(id){


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



    await loadCustomers();


};
// =====================================
// SGC QUẢN LÝ ONLINE
// APP.JS PHẦN 3/5
// THU TIỀN - DỒN TIỀN
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



    if(!money || money <= 0)
    return;



    let date =
    new Date()
    .toLocaleDateString("vi-VN");



    c.paid =
    (c.paid || 0) + money;



    if(!c.history)
    c.history=[];



    c.history.push({

        type:"thu",

        amount:money,

        date:date

    });



    await updateCustomer(
        id,
        c
    );



    await loadCustomers();



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



    let totalPaid =
    c.paid || 0;



    if(totalPaid <= 0){


        alert(
            "Khách chưa có tiền đóng để dồn"
        );


        return;

    }



    let mergeAmount =
    Number(
        prompt(
            "Số tiền khách dồn:"
        )
    );



    if(
        !mergeAmount ||
        mergeAmount > totalPaid
    ){


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




    // tạo mảng nếu chưa có

    if(!c.cycles)
    c.cycles=[];



    if(!c.history)
    c.history=[];




    // lưu dây cũ

    c.cycles.push({

        startDate:c.cycleDate || date,

        endDate:date,

        totalPaid:totalPaid,

        mergeAmount:mergeAmount,

        profit:profit

    });





    // lưu lịch sử dồn

    c.history.push({

        type:"don",

        date:date,

        amount:mergeAmount,

        oldPaid:totalPaid,

        profit:profit

    });





    // cộng tổng lời khách

    c.profit =
    (c.profit || 0) + profit;




    // lên dây mới

    c.paid = 0;

    c.cycleDate = date;

    c.lastMergeDate = date;




    await updateCustomer(

        id,

        c

    );



    alert(

        "Dồn thành công\n\n"+
        "Tiền dồn: "+
        mergeAmount.toLocaleString()+
        " đ\n"+
        "Lời: "+
        profit.toLocaleString()+
        " đ"

    );



    await loadCustomers();



};
// =====================================
// SGC QUẢN LÝ ONLINE
// APP.JS PHẦN 4/5
// CHI TIẾT KHÁCH
// =====================================



// ================================
// MỞ CHI TIẾT KHÁCH
// ================================

// ================================
// CHI TIẾT KHÁCH
// ================================

window.openCustomerDetail = function(id){

    let c = customers.find(x => x.id === id);

    if(!c) return;

    document.getElementById("customers").classList.add("hidden");
    document.getElementById("customerDetail").classList.remove("hidden");

    let html = `

<h2>${c.name}</h2>

<p><b>📞 Số điện thoại:</b> ${c.phone || "Chưa có"}</p>

<p><b>💰 Tiền vay:</b> ${(c.loan || 0).toLocaleString()} đ</p>

<p><b>💵 Góp mỗi ngày:</b> ${(c.daily || 0).toLocaleString()} đ</p>

<p><b>💵 Đã đóng:</b> ${(c.paid || 0).toLocaleString()} đ</p>

<p><b>⭐ Tổng lời:</b> ${(c.profit || 0).toLocaleString()} đ</p>

<p><b>📅 Ngày mượn:</b> ${c.loanDate || ""}</p>

<p><b>🔄 Dây hiện tại:</b> ${c.cycleDate || ""}</p>

<p><b>📌 Lần dồn gần nhất:</b> ${c.lastMergeDate || "Chưa có"}</p>

<hr>

<h3>📚 Các dây cũ</h3>

`;

    if((c.cycles || []).length===0){

        html += "<p>Chưa có dây cũ</p>";

    }else{

        c.cycles.forEach((d,index)=>{

            html += `

<div class="oldCycle">

<b>Dây ${index+1}</b>

<p>📅 Từ: ${d.startDate}</p>

<p>🏁 Đến: ${d.endDate}</p>

<p>💵 Đã đóng: ${(d.totalPaid||0).toLocaleString()} đ</p>

<p>🔄 Đã dồn: ${(d.mergeAmount||0).toLocaleString()} đ</p>

<p>⭐ Lời: ${(d.profit||0).toLocaleString()} đ</p>

<hr>

</div>

`;

        });

    }

    html += `

<h3>💵 Lịch sử đóng tiền</h3>

`;

    let hasThu = false;

    (c.history || []).forEach(h=>{

        if(h.type==="thu"){

            hasThu = true;

            html += `

<p>

📅 ${h.date}

<br>

Đóng: ${(h.amount||0).toLocaleString()} đ

</p>

`;

        }

    });

    if(!hasThu){

        html += "<p>Chưa có lịch sử đóng tiền</p>";

    }

    html += `

<hr>

<h3>🔄 Lịch sử dồn tiền</h3>

`;

    let hasDon = false;

    (c.history || []).forEach(h=>{

        if(h.type==="don"){

            hasDon = true;

            html += `

<p>

📅 ${h.date}

<br>

Đã đóng: ${(h.oldPaid||0).toLocaleString()} đ

<br>

Dồn: ${(h.amount||0).toLocaleString()} đ

<br>

Lời: ${(h.profit||0).toLocaleString()} đ

</p>

`;

        }

    });

    if(!hasDon){

        html += "<p>Chưa có lịch sử dồn tiền</p>";

    }

    document.getElementById("detailContent").innerHTML = html;

};

window.closeDetail = function(){

    document.getElementById("customerDetail").classList.add("hidden");

    document.getElementById("customers").classList.remove("hidden");

};
// =====================================
// SGC QUẢN LÝ ONLINE
// APP.JS PHẦN 5/5
// THỐNG KÊ - CÀI ĐẶT
// =====================================



// ================================
// THỐNG KÊ
// ================================

window.updateStats=function(){


    let today =
    new Date()
    .toLocaleDateString("vi-VN");



    let now =
    new Date();



    let month =
    now.getMonth();



    let year =
    now.getFullYear();



    let totalThuToday = 0;

    let totalDonToday = 0;

    let totalProfitToday = 0;



    let totalProfitMonth = 0;



    customers.forEach(c=>{


        (c.history || []).forEach(h=>{


            if(h.type==="thu"){


                if(h.date===today){

                    totalThuToday += h.amount;

                }


            }



            if(h.type==="don"){


                if(h.date===today){


                    totalDonToday += h.amount;

                    totalProfitToday += h.profit || 0;


                }



                // tính lời theo tháng

                let parts =
                h.date.split("/");



                if(parts.length===3){


                    let d =
                    new Date(
                        parts[2],
                        parts[1]-1,
                        parts[0]
                    );



                    if(
                        d.getMonth()===month &&
                        d.getFullYear()===year
                    ){

                        totalProfitMonth +=
                        h.profit || 0;


                    }



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



    let d =
    document.getElementById(
        "monthProfit"
    );




    if(a)
    a.innerText =
    totalThuToday.toLocaleString();



    if(b)
    b.innerText =
    totalDonToday.toLocaleString();



    if(c)
    c.innerText =
    totalProfitToday.toLocaleString();



    if(d)
    d.innerText =
    totalProfitMonth.toLocaleString();



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



    if(pass.length < 6){


        alert(
            "Mật khẩu phải từ 6 ký tự"
        );


        return;

    }



    try{


        await updatePassword(

            auth.currentUser,

            pass

        );



        alert(
            "Đổi mật khẩu thành công"
        );


    }
    catch(error){


        alert(
            error.message
        );


    }



};





// ================================
// SAO LƯU DỮ LIỆU
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



    a.download =
    "SGC_backup.json";



    a.click();



};





// ================================
// TỰ CẬP NHẬT THỐNG KÊ KHI TẢI APP
// ================================

setTimeout(()=>{

    if(customers.length){

        updateStats();

    }

},1000);
