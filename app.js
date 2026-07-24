// ===============================
// SGC QUẢN LÝ SỔ GÓP
// APP.JS PART 1
// ===============================

// FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "DÁN_API_KEY_FIREBASE",
  authDomain: "DÁN_AUTH_DOMAIN",
  projectId: "SGC-QuanLy",
  storageBucket: "DÁN_STORAGE",
  messagingSenderId: "DÁN_SENDER_ID",
  appId: "DÁN_APP_ID"
};

// Khởi tạo Firebase
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const auth = firebase.auth();


// ===============================
// BIẾN HỆ THỐNG
// ===============================

let currentUser = null;
let currentBook = null;
let customers = [];


// ===============================
// ĐĂNG NHẬP
// ===============================

function login(){

    let user = document.getElementById("username").value;
    let pass = document.getElementById("password").value;

    auth.signInWithEmailAndPassword(user, pass)
    .then((result)=>{

        currentUser = result.user;

        loadBook();

        showPage("home");

    })
    .catch((error)=>{

        alert("Sai tài khoản hoặc mật khẩu");

    });

}


// ===============================
// ĐĂNG XUẤT
// ===============================

function logout(){

    auth.signOut();

    currentUser = null;
    currentBook = null;

    showPage("login");

}


// ===============================
// KIỂM TRA ĐĂNG NHẬP
// ===============================

auth.onAuthStateChanged((user)=>{

    if(user){

        currentUser=user;

    }

});



// ===============================
// LOAD SỔ
// ===============================

function loadBook(){

db.collection("books")
.where("owner","==",currentUser.uid)
.get()
.then((snap)=>{

    snap.forEach((doc)=>{

        currentBook = doc.id;

    });


    loadCustomers();


});


}



// ===============================
// HIỂN THỊ TRANG
// ===============================

function showPage(page){

document.querySelectorAll(".page")
.forEach(p=>p.style.display="none");


let box=document.getElementById(page);

if(box){

box.style.display="block";

}

}



// ===============================
// LẤY DANH SÁCH KHÁCH
// ===============================

function loadCustomers(){

if(!currentBook)return;


db.collection("books")
.doc(currentBook)
.collection("customers")
.orderBy("created","desc")
.onSnapshot((snap)=>{


customers=[];


snap.forEach((doc)=>{

let data=doc.data();

data.id=doc.id;

customers.push(data);


});


renderCustomers();


});


}



// ===============================
// HIỂN THỊ KHÁCH HÀNG
// ===============================

function renderCustomers(){

let box=document.getElementById("customerList");

if(!box)return;


box.innerHTML="";


customers.forEach(c=>{


let status="red";


// đã góp xong
if(c.remaining<=0){

status="yellow";

}


// đã đóng hôm nay

if(c.lastPayDate==today()){

status="green";

}



box.innerHTML += `

<div class="customer ${status}"

onclick="detailCustomer('${c.id}')">


<h3>${c.name}</h3>

<p>
Nợ còn:
${formatMoney(c.remaining)}
</p>


<p>
Mỗi ngày:
${formatMoney(c.daily)}
</p>


</div>


`;

});


}


// ===============================
// TẠO KHÁCH HÀNG
// ===============================

function addCustomer(){


let name=document.getElementById("name").value;

let phone=document.getElementById("phone").value;

let loan=Number(document.getElementById("loan").value);

let daily=Number(document.getElementById("daily").value);



db.collection("books")
.doc(currentBook)
.collection("customers")
.add({

name:name,

phone:phone,

loan:loan,

remaining:loan,

daily:daily || 100,


created:Date.now(),


borrowDate:new Date()
.toLocaleDateString("vi-VN"),


historyPay:[],

historyDon:[],


lastPayDate:""



})
.then(()=>{


alert("Đã tạo khách");


loadCustomers();


});


}


// ===============================
// XEM CHI TIẾT KHÁCH
// ===============================

function detailCustomer(id){


let c=customers.find(x=>x.id==id);


if(!c)return;



let box=document.getElementById("detail");


box.innerHTML=`

<h2>${c.name}</h2>


<p>Số điện thoại:
${c.phone}
</p>


<p>
Ngày mượn:
${c.borrowDate}
</p>


<p>
Còn nợ:
${formatMoney(c.remaining)}
</p>



<button onclick="collectMoney('${c.id}')">
Thu tiền
</button>


<button onclick="consolidate('${c.id}')">
Dồn tiền
</button>


<h3>Lịch sử đóng</h3>

${showHistory(c.historyPay)}



<h3>Lịch sử dồn</h3>

${showHistory(c.historyDon)}



`;

showPage("detail");


}



// ===============================
// HIỂN THỊ LỊCH SỬ
// ===============================

function showHistory(arr){

if(!arr || arr.length==0)

return "Chưa có";


let text="";


arr.forEach(x=>{

text +=`

<p>
${x.date} -
${formatMoney(x.money)}

</p>

`;

});


return text;

}
// ===============================
// THU TIỀN KHÁCH HÀNG
// ===============================


function collectMoney(id){


let c = customers.find(x=>x.id==id);


if(!c)return;



let money = Number(prompt(
"Nhập số tiền khách đóng:",
c.daily
));



if(!money || money<=0){

return;

}



let newRemain = c.remaining - money;



let history = c.historyPay || [];


history.push({

date:new Date()
.toLocaleDateString("vi-VN"),

money:money

});



db.collection("books")
.doc(currentBook)
.collection("customers")
.doc(id)
.update({

remaining:newRemain,

historyPay:history,

lastPayDate:today()


})
.then(()=>{


alert("Đã thu tiền");


});


}



// ===============================
// DỒN TIỀN KHÁCH HÀNG
// ===============================


function consolidate(id){


let c = customers.find(x=>x.id==id);


if(!c)return;



let money = Number(prompt(
"Nhập số tiền khách dồn:"
));



if(!money || money<=0){

return;

}



if(money > c.remaining){

alert("Số tiền dồn lớn hơn số nợ");

return;

}



// phần lời

let profit = money - c.daily;



if(profit < 0){

profit = 0;

}



let newRemain = c.remaining - money;



let history = c.historyDon || [];


history.push({

date:new Date()
.toLocaleDateString("vi-VN"),

money:money,

profit:profit

});




db.collection("books")
.doc(currentBook)
.collection("customers")
.doc(id)
.update({

remaining:newRemain,

historyDon:history,


lastDonDate:
new Date()
.toLocaleDateString("vi-VN")


})
.then(()=>{


alert(
"Dồn thành công\nLời: "
+
formatMoney(profit)
);


});



}



// ===============================
// TỔNG THU HÔM NAY
// ===============================


function totalToday(){


let total=0;



customers.forEach(c=>{


if(c.lastPayDate==today()){


total += c.daily;


}


});



return total;


}




// ===============================
// TỔNG TIỀN DỒN
// ===============================


function totalDon(){


let total=0;


customers.forEach(c=>{


(c.historyDon || [])
.forEach(x=>{


if(x.date==today()){


total += x.money;


}


});


});


return total;


}




// ===============================
// TÍNH TỔNG LỜI
// ===============================


function totalProfit(){


let profit=0;


customers.forEach(c=>{


(c.historyDon || [])
.forEach(x=>{


profit += Number(x.profit || 0);


});


});



return profit;


}





// ===============================
// HIỂN THỊ LỜI
// ===============================


function showProfit(){


let box=document.getElementById("profit");


box.innerHTML=`

<h2>Tổng lời</h2>


<h3>
${formatMoney(totalProfit())}
</h3>


<hr>


`;



customers.forEach(c=>{


let p=0;


(c.historyDon || [])
.forEach(x=>{


p+=Number(x.profit || 0);


});



box.innerHTML += `

<p>

${c.name}

:

${formatMoney(p)}

</p>


`;


});



showPage("profit");


}



// ===============================
// SỬA KHÁCH
// ===============================


function editCustomer(id){


let c=customers.find(x=>x.id==id);


let name=prompt(
"Tên khách:",
c.name
);



let phone=prompt(
"Số điện thoại:",
c.phone
);



db.collection("books")
.doc(currentBook)
.collection("customers")
.doc(id)
.update({

name:name,

phone:phone

});


}



// ===============================
// XÓA KHÁCH
// ===============================


function deleteCustomer(id){



if(!confirm("Xóa khách này?"))

return;



db.collection("books")
.doc(currentBook)
.collection("customers")
.doc(id)
.delete()
.then(()=>{


alert("Đã xóa");


});


}
// ===============================
// TÌM KIẾM KHÁCH HÀNG
// ===============================


function searchCustomer(){


let key=document
.getElementById("search")
.value
.toLowerCase();



let box=document.getElementById("customerList");


box.innerHTML="";



customers
.filter(c=>

c.name
.toLowerCase()
.includes(key)

||

(c.phone||"")
.includes(key)

)

.forEach(c=>{


let status="red";


if(c.remaining<=0){

status="yellow";

}


if(c.lastPayDate==today()){

status="green";

}



box.innerHTML += `

<div class="customer ${status}"

onclick="detailCustomer('${c.id}')">


<h3>${c.name}</h3>


<p>
Còn:
${formatMoney(c.remaining)}
</p>


<p>
Ngày:
${formatMoney(c.daily)}
</p>


</div>


`;

});


}



// ===============================
// THỐNG KÊ
// ===============================


function showStatistics(){


let box=document.getElementById("statistics");


let totalDebt=0;

let totalCustomer=customers.length;



customers.forEach(c=>{


totalDebt += Number(c.remaining||0);


});



box.innerHTML=`

<h2>Thống kê</h2>


<p>
Số khách:
${totalCustomer}
</p>


<p>
Tổng nợ còn:
${formatMoney(totalDebt)}
</p>


<p>
Thu hôm nay:
${formatMoney(totalToday())}
</p>


<p>
Tiền dồn hôm nay:
${formatMoney(totalDon())}
</p>


<p>
Tổng lời:
${formatMoney(totalProfit())}
</p>


`;



showPage("statistics");


}




// ===============================
// HÀM NGÀY HÔM NAY
// ===============================


function today(){


return new Date()
.toLocaleDateString("vi-VN");


}




// ===============================
// ĐỊNH DẠNG TIỀN
// ===============================


function formatMoney(number){


return Number(number || 0)
.toLocaleString("vi-VN")
+" đ";


}



// ===============================
// TỰ RESET TRẠNG THÁI MỖI NGÀY
// 12 GIỜ TRƯA
// ===============================


function autoResetDay(){



let now=new Date();


let hour=now.getHours();



if(hour==12){


customers.forEach(c=>{


db.collection("books")
.doc(currentBook)
.collection("customers")
.doc(c.id)
.update({

lastPayDate:""

});


});


}



}



setInterval(
autoResetDay,
60000
);





// ===============================
// TỰ ĐĂNG XUẤT SAU 5 PHÚT
// ===============================


let logoutTimer;



function resetLogoutTimer(){



clearTimeout(logoutTimer);



logoutTimer=setTimeout(()=>{


logout();


alert(
"Hết thời gian sử dụng"
);


},300000);



}



document.addEventListener(
"click",
resetLogoutTimer
);


document.addEventListener(
"touchstart",
resetLogoutTimer
);





// ===============================
// KIỂM TRA QUYỀN SỔ CÂY
// ===============================


function checkRole(){



db.collection("books")
.doc(currentBook)
.get()
.then(doc=>{


let role=doc.data().role;



if(role=="child"){



document
.querySelectorAll(".admin")
.forEach(x=>{


x.style.display="none";


});


}



});


}




// ===============================
// TỔNG HỢP
// ===============================


function tong(){



return {


khach:customers.length,


thuHomNay:totalToday(),


donHomNay:totalDon(),


loi:totalProfit()



};


}




console.log(
"SGC QUAN LY DA CHAY"
);
