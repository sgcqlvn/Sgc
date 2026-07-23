// =================================
// SGC QUẢN LÝ - APP.JS
// ĐOẠN A/3
// =================================


let currentBook = null;


// ================================
// LẤY DANH SÁCH SỔ
// ================================

function getBooks(){

    return JSON.parse(
        localStorage.getItem("SGC_BOOKS") || "[]"
    );

}



function saveBooks(data){

    localStorage.setItem(
        "SGC_BOOKS",
        JSON.stringify(data)
    );

}




// ================================
// TẠO SỔ MỚI
// ================================

function createBook(){


    let username =
    prompt("Nhập tên tài khoản:");



    if(!username)
    return;



    let password =
    prompt("Nhập mật khẩu:");



    if(!password)
    return;



    let books = getBooks();



    let check =
    books.find(
        b=>b.username===username
    );



    if(check){

        alert("Tài khoản đã tồn tại");

        return;

    }



    let book = {


        id:Date.now(),


        username:username,


        password:password,


        bookName:"SGC",


        customers:[],


        history:[]


    };



    books.push(book);



    saveBooks(books);



    alert(
        "Tạo sổ thành công"
    );

}





// ================================
// ĐĂNG NHẬP
// ================================

function login(){


    let user =
    document.getElementById(
        "loginUser"
    ).value.trim();



    let pass =
    document.getElementById(
        "loginPass"
    ).value.trim();



    let books = getBooks();



    let book =
    books.find(

        b=>

        b.username===user

        &&

        b.password===pass

    );



    if(!book){

        alert(
            "Sai tài khoản hoặc mật khẩu"
        );

        return;

    }



    currentBook = book;



    document
    .getElementById("loginBox")
    .classList.add("hidden");



    document
    .getElementById("app")
    .classList.remove("hidden");



    document
    .getElementById("bookName")
    .innerText =
    currentBook.bookName;



    renderCustomers();



    updateStats();


}





// ================================
// LƯU SỔ HIỆN TẠI
// ================================

function saveBook(){


    let books =
    getBooks();



    let index =
    books.findIndex(
        b=>b.id===currentBook.id
    );



    if(index!==-1){

        books[index]=currentBook;

        saveBooks(books);

    }

}






// ================================
// ĐĂNG XUẤT
// ================================

function logout(){


    currentBook=null;


    document
    .getElementById("app")
    .classList.add("hidden");



    document
    .getElementById("loginBox")
    .classList.remove("hidden");


}// =================================
// SGC QUẢN LÝ - APP.JS
// ĐOẠN B/3
// KHÁCH HÀNG + THU TIỀN + DỒN TIỀN
// =================================



// ================================
// CHUYỂN TAB
// ================================

function showTab(id){


    document
    .querySelectorAll("section")
    .forEach(s=>{

        s.classList.add("hidden");

    });



    document
    .getElementById(id)
    .classList.remove("hidden");


}





// ================================
// THÊM KHÁCH
// ================================

function addCustomer(){


    let name =
    prompt("Tên khách:");

    if(!name)
    return;



    let phone =
    prompt("Số điện thoại:");



    let loan =
    Number(
        prompt("Số tiền vay:")
    );



    let daily =
    Number(
        prompt("Tiền góp mỗi ngày:")
    );



    let today =
    new Date()
    .toLocaleDateString("vi-VN");



    let customer = {


        id:Date.now(),


        name:name,


        phone:phone || "",


        loan:loan,


        daily:daily || 0,


        paid:0,


        profit:0,


        loanDate:today,


        cycleDate:today,


        lastMergeDate:"",


        history:[]


    };



    currentBook.customers.push(customer);



    saveBook();


    renderCustomers();


}





// ================================
// TÌM KHÁCH
// ================================

function searchCustomer(){


    renderCustomers();

}





// ================================
// HIỂN THỊ KHÁCH
// ================================

function renderCustomers(){


    let box =
    document.getElementById(
        "customerList"
    );



    if(!box || !currentBook)
    return;



    box.innerHTML="";



    let key =
    document.getElementById(
        "searchBox"
    ).value
    .toLowerCase();



    currentBook.customers.forEach(
    (c,index)=>{



        if(
            key
            &&
            !c.name
            .toLowerCase()
            .includes(key)
        )
        return;



        let status =
        getStatus(c);



        box.innerHTML += `


        <div class="customer ${status}">


        <h4>
        ${c.name}
        </h4>


        <p>
        💰 Vay:
        ${c.loan.toLocaleString()} đ
        </p>


        <p>
        📅 Ngày mượn:
        ${c.loanDate}
        </p>


        <p>
        🔄 Dây:
        ${c.cycleDate}
        </p>


        <p>
        💵 Còn nợ:
        ${(c.loan-c.paid)
        .toLocaleString()} đ
        </p>


        <button onclick="collectMoney(${index})">
        Thu tiền
        </button>


        <button onclick="mergeMoney(${index})">
        Dồn tiền
        </button>


        <button onclick="detailCustomer(${index})">
        Chi tiết
        </button>


        <button onclick="deleteCustomer(${index})">
        Xóa khách
        </button>


        </div>


        `;


    });



}







// ================================
// TRẠNG THÁI KHÁCH
// ================================

function getStatus(c){


    if(c.paid>=c.loan)
    return "yellow";



    let today =
    new Date()
    .toLocaleDateString("vi-VN");



    let paidToday =
    c.history.some(
        h=>
        h.date===today
        &&
        h.type==="thu"
    );



    if(paidToday)
    return "green";



    return "red";

}







// ================================
// THU TIỀN
// ================================

function collectMoney(index){


    let c =
    currentBook.customers[index];



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



    saveBook();


    renderCustomers();


    updateStats();


}// =================================
// SGC QUẢN LÝ - APP.JS
// ĐOẠN C/3
// DỒN TIỀN + CHI TIẾT + XÓA + THỐNG KÊ + CÀI ĐẶT
// =================================





// ================================
// DỒN TIỀN
// ================================

function mergeMoney(index){


    let c =
    currentBook.customers[index];



    let money =
    Number(
        prompt(
        "Số tiền dồn trả lại khách:"
        )
    );



    if(!money)
    return;



    if(money > c.paid){

        alert(
        "Tiền dồn không được lớn hơn tiền đã đóng"
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



    c.lastMergeDate = date;


    c.cycleDate = date;



    c.history.push({

        type:"don",

        amount:money,

        profit:profit,

        date:date

    });



    currentBook.history.push({

        type:"don",

        amount:money,

        profit:profit,

        customer:c.name,

        date:date

    });



    saveBook();


    renderCustomers();


    updateStats();



}







// ================================
// CHI TIẾT KHÁCH
// ================================

function detailCustomer(index){


    let c =
    currentBook.customers[index];



    alert(

    "👤 "+c.name+

    "\n\n💰 Tiền vay: "
    +c.loan.toLocaleString()+" đ"+


    "\n💵 Đã đóng: "
    +c.paid.toLocaleString()+" đ"+


    "\n📌 Còn nợ: "
    +(c.loan-c.paid)
    .toLocaleString()+" đ"+


    "\n📅 Ngày mượn: "
    +c.loanDate+


    "\n🔄 Dây hiện tại: "
    +c.cycleDate+


    "\n⭐ Tổng lời: "
    +c.profit.toLocaleString()+" đ"

    );

}







// ================================
// XÓA KHÁCH
// ================================

function deleteCustomer(index){


    let c =
    currentBook.customers[index];



    if(
        confirm(
        "Xóa khách "+c.name+"?"
        )
    ){

        currentBook.customers.splice(
            index,
            1
        );


        saveBook();


        renderCustomers();

    }

}







// ================================
// THỐNG KÊ
// ================================

function updateStats(){


    if(!currentBook)
    return;



    let today =
    new Date()
    .toLocaleDateString("vi-VN");



    let month =
    new Date()
    .getMonth()+1;



    let year =
    new Date()
    .getFullYear();



    let thuToday=0;

    let thuMonth=0;

    let donToday=0;

    let donMonth=0;

    let profitToday=0;

    let profitMonth=0;



    currentBook.history.forEach(h=>{


        let d =
        h.date.split("/");



        if(h.type==="thu"){

            if(h.date===today)
            thuToday += h.amount;


            if(
            Number(d[1])===month
            &&
            Number(d[2])===year
            )
            thuMonth += h.amount;

        }




        if(h.type==="don"){

            if(h.date===today)
            donToday += h.amount;


            if(
            Number(d[1])===month
            &&
            Number(d[2])===year
            )
            donMonth += h.amount;



            if(h.date===today)
            profitToday += h.profit;


            if(
            Number(d[1])===month
            &&
            Number(d[2])===year
            )
            profitMonth += h.profit;

        }



    });



    todayIncome.innerText =
    thuToday.toLocaleString();



    monthIncome.innerText =
    thuMonth.toLocaleString();



    todayMerge.innerText =
    donToday.toLocaleString();



    monthMerge.innerText =
    donMonth.toLocaleString();



    todayProfit.innerText =
    profitToday.toLocaleString();



    monthProfit.innerText =
    profitMonth.toLocaleString();


}







// ================================
// ĐỔI MẬT KHẨU
// ================================

function changePassword(){


    let p =
    prompt(
    "Mật khẩu mới:"
    );



    if(!p)
    return;



    currentBook.password=p;



    saveBook();



    alert(
    "Đã đổi mật khẩu"
    );

}







// ================================
// SAO LƯU
// ================================

function backupData(){


    let data =
    JSON.stringify(
        currentBook
    );



    let blob =
    new Blob(
        [data],
        {
        type:"application/json"
        }
    );



    let a =
    document.createElement("a");



    a.href =
    URL.createObjectURL(blob);



    a.download =
    "SGC_backup.json";



    a.click();


}
